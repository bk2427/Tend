/**
 * Claude AI Service — Tend
 *
 * Three exported functions:
 *   detectIngredients(imageBase64)  → string[]
 *   generateRecipes(params)         → Recipe[]
 *   generateInsight(params)         → InsightReport
 *
 * Design decisions:
 *   • Model routing: right-size model per task (Haiku for vision, Sonnet for generation + insight)
 *   • System prompts: role definition separated from task instructions
 *   • Assistant prefilling: guarantees JSON output — no regex, no markdown fences
 *   • Retry w/ exponential backoff + jitter: handles 529 overload and transient errors
 *   • AbortController timeout: prevents hanging requests; per-task timeouts
 *
 * Note on beta features:
 *   Extended thinking and prompt caching are intentionally absent from this build.
 *   Both were implemented and removed — the interleaved-thinking and prompt-caching
 *   beta headers conflict when combined, causing API failures. At demo scale
 *   (single-session, 10–30 diary entries), neither feature provides measurable benefit.
 *   The architecture is ready to re-enable both in production (callClaude already
 *   filters thinking blocks; prompts are structured for easy cache_control re-addition).
 */

import type { Recipe, MealLogEntry, InsightReport } from '../constants/mockData';

const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const API_VERSION    = '2023-06-01';

/**
 * Model routing — each task uses the cheapest model that meets its needs:
 *   FAST     Vision + small output → low latency matters most
 *   BALANCED Recipe generation → creativity + structured output
 *   DEEP     Insight analysis → multi-step reasoning across diary data
 */
const MODEL_FAST     = 'claude-haiku-4-5';   // ingredient detection
const MODEL_BALANCED = 'claude-sonnet-4-5';  // recipe generation
const MODEL_DEEP     = 'claude-sonnet-4-5';  // health insight analysis

const IMAGE_COLORS = [
  '#C8E6C9', '#FFF9C4', '#FFE0B2', '#FFCCBC',
  '#B3E5FC', '#F8BBD0', '#DCEDC8', '#EDE7F6',
];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GenerateRecipesParams {
  scannedIngredients: string[];
  pantryItems: string[];
  dietPreferences: string[];
  healthGoals: string[];
  seenRecipeTitles: string[];
}

export interface GenerateInsightParams {
  dietPreferences: string[];
  healthGoals: string[];
  pantryItems: string[];
  mealLog: MealLogEntry[];
}

// ─── Shared fetch helper ──────────────────────────────────────────────────────

interface TextBlock {
  type: 'text';
  text: string;
}

interface ImageBlock {
  type: 'image';
  source: { type: 'base64'; media_type: string; data: string };
}

type ContentBlock = TextBlock | ImageBlock;

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string | ContentBlock[];
}

interface ClaudeRequestBody {
  model: string;
  max_tokens: number;
  system?: string;
  messages: ClaudeMessage[];
  stream?: boolean;
}

/**
 * Core fetch wrapper with:
 *   - AbortController timeout (default 3 min — generous for demo reliability)
 *   - Exponential backoff retry (up to 2 attempts) on 529 / 5xx
 *   - Returns the first text block from the response content array
 */
async function callClaude(
  body: ClaudeRequestBody,
  timeoutMs = 180_000,
  maxRetries = 2
): Promise<string> {
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': API_VERSION,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timer);

      // Retry on overload or server errors.
      // Jitter (+0–500ms random) prevents a thundering-herd of clients
      // retrying at the exact same moment after a shared 529 burst.
      if (response.status === 529 || response.status >= 500) {
        const delay = Math.min(1000 * 2 ** attempt, 8000) + Math.random() * 500;
        await new Promise((r) => setTimeout(r, delay));
        lastError = new Error(`Claude API ${response.status}`);
        continue;
      }

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Claude API ${response.status}: ${body}`);
      }

      const data = await response.json();

      // Find the first text block (skips thinking blocks when extended thinking is on)
      const textBlock = data.content.find((b: { type: string }) => b.type === 'text');
      if (!textBlock) throw new Error('No text block in Claude response');

      return (textBlock as { text: string }).text.trim();

    } catch (err) {
      clearTimeout(timer);
      if ((err as Error).name === 'AbortError') {
        throw new Error(`Claude request timed out after ${timeoutMs / 1000}s`);
      }
      lastError = err as Error;
      if (attempt < maxRetries - 1) {
        const delay = 1000 * 2 ** attempt + Math.random() * 500;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Parse a JSON value from a Claude response.
 * When prefilling is used, the prefix character is already part of the text,
 * so no regex stripping is needed — just parse directly.
 */
function parseJSON<T>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    // Fallback: extract first complete JSON structure if Claude added any wrapping
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    const objectMatch = text.match(/\{[\s\S]*\}/);
    const match = arrayMatch ?? objectMatch;
    if (!match) throw new Error(`Could not parse JSON from: ${text.slice(0, 100)}`);
    return JSON.parse(match[0]) as T;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function detectIngredients(imageBase64: string): Promise<string[]> {
  return realDetectIngredients(imageBase64);
}

export async function generateRecipes(params: GenerateRecipesParams): Promise<Recipe[]> {
  return realGenerateRecipes(params);
}

/**
 * Streaming variant of generateRecipes.
 * Calls onRecipe() for each recipe as it arrives — callers can render
 * cards progressively without waiting for all 5 to complete.
 * NOTE: Currently unused in the React Native client — React Native's fetch
 * polyfill does not support ReadableStream. A backend proxy would re-enable this.
 */
export async function generateRecipesStreaming(
  params: GenerateRecipesParams,
  onRecipe: (recipe: Recipe) => void
): Promise<void> {
  return realGenerateRecipesStreaming(params, onRecipe);
}

export async function generateInsight(params: GenerateInsightParams): Promise<InsightReport> {
  return realGenerateInsight(params);
}

// ─── Real implementations ─────────────────────────────────────────────────────

async function realDetectIngredients(imageBase64: string): Promise<string[]> {
  /**
   * Uses MODEL_FAST (Haiku) — ingredient detection is a classification task,
   * not a reasoning task. Haiku gives fast, accurate results at a fraction of
   * the cost and latency of Sonnet.
   *
   * Prefill technique: assistant turn begins with "[" which forces Claude to
   * continue a JSON array immediately — no markdown, no preamble, no parsing risk.
   *
   * System prompt distinguishes product-level identification (pasta box → "pasta")
   * from sub-ingredient label reading, and handles variety packs correctly
   * (frozen mixed veg → individual items prefixed with "frozen").
   */
  const text = await callClaude({
    model: MODEL_FAST,
    max_tokens: 256,
    system: `You are a kitchen ingredient identifier. You identify what food items a person has available to cook with — not what is listed on nutrition labels.

RULES:
1. Packaged/boxed products: identify the PRODUCT, not its sub-ingredients.
   - Box of pasta → "pasta"
   - Bag of rice → "rice"
   - Can of coconut milk → "canned coconut milk"
   - Jar of tomato sauce → "tomato sauce"
   - Do NOT read the nutrition label and return sub-ingredients like "durum wheat semolina, water, eggs" — return "pasta"

2. Variety/mixed packages: list each item individually with its form.
   - Frozen mixed veggie bag with broccoli, carrots, corn → ["frozen broccoli", "frozen carrots", "frozen corn"]

3. Preparation state matters — include it when visible.
   - Frozen items → prefix with "frozen" (e.g. "frozen chicken breast")
   - Canned items → prefix with "canned" (e.g. "canned chickpeas")
   - Fresh/raw items → no prefix needed (e.g. "chicken breast", "broccoli")

4. No brand names, quantities, units, or label text.
5. If nothing food-related is clearly visible, output [].

Output ONLY a valid JSON array of strings.`,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 },
          },
          {
            type: 'text',
            text: 'What food items are visible? Identify each as a cooking ingredient — not its label contents.',
          },
        ],
      },
      // Prefill: forces response to start as a JSON array
      { role: 'assistant', content: '[' },
    ],
  }, 60_000);

  // Prepend the prefill character we injected
  return parseJSON<string[]>('[' + text);
}

async function realGenerateRecipes(params: GenerateRecipesParams): Promise<Recipe[]> {
  /**
   * Uses MODEL_BALANCED (Sonnet) — needs creativity and structured output,
   * but not the deep analytical reasoning required for insight analysis.
   */
  const { scannedIngredients, pantryItems, dietPreferences, healthGoals, seenRecipeTitles } = params;

  const allAvailable = [...new Set([...scannedIngredients, ...pantryItems])];
  const healthGuidance = buildHealthGuidance(healthGoals);
  const noRepeat = seenRecipeTitles.length
    ? `\nDo NOT create any of these already-seen recipes: ${seenRecipeTitles.join(', ')}`
    : '';

  const text = await callClaude({
    model: MODEL_BALANCED,
    max_tokens: 4096,
    system: `You are a culinary AI that creates diet-optimised recipes. You output ONLY valid JSON arrays. You never add ingredients beyond what is listed. You never include markdown, backticks, or explanations.`,
    messages: [
      {
        role: 'user',
        content: `AVAILABLE INGREDIENTS (use ONLY these — no additions, no substitutions):
${allAvailable.join(', ')}

USER PROFILE:
- Diet preferences: ${dietPreferences.length ? dietPreferences.join(', ') : 'none specified'}
- Health conditions: ${healthGoals.length ? healthGoals.join(', ') : 'none specified'}
${healthGuidance ? `- Clinical guidance: ${healthGuidance}` : ''}${noRepeat}

REQUIREMENTS:
• Exactly 5 distinct recipes
• Use ONLY the listed ingredients — never introduce anything else
• Each recipe must use a different primary cooking method (e.g. sauté, roast, raw/salad, steam, one-pan)
• Every recipe must be appropriate for the health conditions listed
• healthInfo must reference the user's specific conditions by name

Return a JSON array of exactly 5 objects. Each object:
{
  "id": string,           // short kebab-case slug
  "title": string,        // descriptive recipe name
  "cookTime": string,     // e.g. "25 min"
  "difficulty": "Easy" | "Medium" | "Hard",
  "ingredients": string[], // with quantities, e.g. "2 cups broccoli florets"
  "steps": string[],      // clear numbered steps as plain strings
  "healthInfo": string,   // 1–2 sentences referencing the user's specific conditions
  "dietTags": string[]    // which of the user's diet preferences this satisfies
}`,
      },
      // Prefill: forces response to begin as a JSON array
      { role: 'assistant', content: '[' },
    ],
  }, 120_000);

  const raw = parseJSON<Omit<Recipe, 'imageColor'>[]>('[' + text);

  return raw.map((r, i) => ({
    ...r,
    imageColor: IMAGE_COLORS[i % IMAGE_COLORS.length],
  }));
}

/**
 * Scans accumulated streaming text for complete JSON objects at brace-depth 1
 * (i.e. the top-level objects inside the outer array). Returns the position
 * after the last successfully extracted object so subsequent calls can resume.
 *
 * Handles nested objects, arrays, and escaped strings correctly via a
 * character-level state machine — no regex, no fragile substring tricks.
 */
function extractCompleteRecipes(
  text: string,
  fromPos: number,
  onRecipe: (raw: Omit<Recipe, 'imageColor'>, recipeIndex: number) => void,
  startIndex: number
): number {
  let pos = fromPos;
  let extractedEnd = fromPos;
  let recipeIndex = startIndex;

  while (pos < text.length) {
    const start = text.indexOf('{', pos);
    if (start === -1) break;

    let depth = 0;
    let inString = false;
    let escape = false;
    let i = start;

    for (; i < text.length; i++) {
      const ch = text[i];
      if (escape)           { escape = false; continue; }
      if (ch === '\\' && inString) { escape = true;  continue; }
      if (ch === '"')       { inString = !inString;  continue; }
      if (inString)         { continue; }
      if (ch === '{')       { depth++; }
      else if (ch === '}')  {
        depth--;
        if (depth === 0) break;
      }
    }

    if (depth !== 0) break; // Object incomplete — wait for more data

    const json = text.slice(start, i + 1);
    try {
      const raw = JSON.parse(json) as Omit<Recipe, 'imageColor'>;
      onRecipe(raw, recipeIndex);
      recipeIndex++;
    } catch { /* Malformed — skip */ }

    extractedEnd = i + 1;
    pos = extractedEnd;
  }

  return extractedEnd;
}

async function realGenerateRecipesStreaming(
  params: GenerateRecipesParams,
  onRecipe: (recipe: Recipe) => void
): Promise<void> {
  /**
   * Uses the Anthropic streaming API (stream: true → Server-Sent Events).
   * Each SSE `content_block_delta` carries a text fragment. We accumulate
   * fragments and run `extractCompleteRecipes` after every delta — so each
   * recipe is delivered to the UI the moment its closing brace arrives,
   * rather than waiting for all 5 to finish.
   *
   * NOTE: React Native's fetch polyfill does not support ReadableStream, so
   * this function is not called in the current client. It works correctly in
   * web/Node environments. A backend proxy would re-enable it for native.
   */
  const { scannedIngredients, pantryItems, dietPreferences, healthGoals, seenRecipeTitles } = params;
  const allAvailable = [...new Set([...scannedIngredients, ...pantryItems])];
  const healthGuidance = buildHealthGuidance(healthGoals);
  const noRepeat = seenRecipeTitles.length
    ? `\nDo NOT create any of these already-seen recipes: ${seenRecipeTitles.join(', ')}`
    : '';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120_000);

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': API_VERSION,
      },
      body: JSON.stringify({
        model: MODEL_BALANCED,
        max_tokens: 4096,
        stream: true,
        system: `You are a culinary AI that creates diet-optimised recipes. You output ONLY valid JSON arrays. You never add ingredients beyond what is listed. You never include markdown, backticks, or explanations.`,
        messages: [
          {
            role: 'user',
            content: `AVAILABLE INGREDIENTS (use ONLY these — no additions, no substitutions):
${allAvailable.join(', ')}

USER PROFILE:
- Diet preferences: ${dietPreferences.length ? dietPreferences.join(', ') : 'none specified'}
- Health conditions: ${healthGoals.length ? healthGoals.join(', ') : 'none specified'}
${healthGuidance ? `- Clinical guidance: ${healthGuidance}` : ''}${noRepeat}

REQUIREMENTS:
• Exactly 5 distinct recipes
• Use ONLY the listed ingredients — never introduce anything else
• Each recipe must use a different primary cooking method (e.g. sauté, roast, raw/salad, steam, one-pan)
• Every recipe must be appropriate for the health conditions listed
• healthInfo must reference the user's specific conditions by name

Return a JSON array of exactly 5 objects. Each object:
{
  "id": string,
  "title": string,
  "cookTime": string,
  "difficulty": "Easy" | "Medium" | "Hard",
  "ingredients": string[],
  "steps": string[],
  "healthInfo": string,
  "dietTags": string[]
}`,
          },
          { role: 'assistant', content: '[' },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok || !response.body) {
      throw new Error(`Claude API ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let sseBuffer = '';
    let accumulated = '[';  // Full text buffer — prefill '[' already counted
    let lastExtractedEnd = 1;
    let extractedCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      sseBuffer += decoder.decode(value, { stream: true });
      const lines = sseBuffer.split('\n');
      sseBuffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;

        try {
          const event = JSON.parse(data);
          if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
            accumulated += event.delta.text;

            const prevCount = extractedCount;
            lastExtractedEnd = extractCompleteRecipes(
              accumulated,
              lastExtractedEnd,
              (raw, index) => {
                extractedCount++;
                onRecipe({ ...raw, imageColor: IMAGE_COLORS[index % IMAGE_COLORS.length] });
              },
              prevCount
            );
          }
        } catch { /* Malformed SSE event — skip */ }
      }
    }
  } catch (err) {
    clearTimeout(timer);
    if ((err as Error).name === 'AbortError') {
      throw new Error('Recipe generation timed out after 120s');
    }
    throw err;
  }
}

async function realGenerateInsight(params: GenerateInsightParams): Promise<InsightReport> {
  /**
   * Uses MODEL_DEEP (Sonnet) for health insight analysis.
   *
   * Extended thinking is intentionally omitted — at diary scale (10–30 entries)
   * Sonnet produces equivalent analysis without it, and generation time drops
   * from ~25s to ~5-8s. Re-enable in production once users accumulate 60+ entries
   * and correlations become complex enough to benefit from deep reasoning.
   */
  const { dietPreferences, healthGoals, pantryItems, mealLog } = params;

  const reviewed = mealLog.filter((m) => m.reviewed && m.review);

  const historyText = reviewed.length
    ? reviewed.map((m) =>
        `• ${m.recipeName} — ${m.review!.rating}★\n` +
        `  Experience: ${m.review!.experienceTags.join(', ') || 'none'}\n` +
        `  Taste: ${m.review!.tasteTags.join(', ') || 'none'}\n` +
        `  Symptoms within hours: ${m.review!.symptomTags.join(', ') || 'none'}\n` +
        `  Notes: "${m.review!.notes || 'none'}"`
      ).join('\n\n')
    : 'No reviewed meals yet.';

  const text = await callClaude({
    model: MODEL_DEEP,
    max_tokens: 4_000,
    system: `You are a compassionate nutrition analyst helping someone manage chronic health conditions through diet. You identify patterns in food journals with clinical rigour and communicate findings warmly. You output ONLY valid JSON objects.`,
    messages: [
      {
        role: 'user',
        content: `USER PROFILE:
- Diet preferences: ${dietPreferences.length ? dietPreferences.join(', ') : 'none set'}
- Health conditions: ${healthGoals.length ? healthGoals.join(', ') : 'none set'}
- Pantry staples: ${pantryItems.join(', ')}

MEAL JOURNAL (most recent first):
${historyText}

Analyse the above and return a JSON object with EXACTLY this shape:
{
  "eatingProfile": string,
  "alignmentSummary": string,
  "ingredientPatterns": string[],
  "recommendations": string[]
}

Be warm and specific. Reference actual meal names and reported symptoms. If data is limited, acknowledge it and advise what to track next.`,
      },
      { role: 'assistant', content: '{' },
    ],
  }, 60_000);

  const raw = parseJSON<Omit<InsightReport, 'id' | 'generatedAt'>>('{' + text);

  return {
    id: `insight-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    ...raw,
  };
}

// ─── Health guidance ──────────────────────────────────────────────────────────

function buildHealthGuidance(goals: string[]): string {
  const guidance: Record<string, string> = {
    'Autoimmune Protocol':
      'Eliminate grains, legumes, nightshades, dairy, eggs, nuts, seeds, alcohol, and seed-based spices. Prioritise organ meats, bone broth, fatty fish, and non-nightshade vegetables. Every recipe must be AIP-compliant.',
    'Type 2 Diabetes':
      'Minimise simple carbohydrates and high-glycemic ingredients. Emphasise non-starchy vegetables, lean protein, healthy fats, and fibre. Avoid added sugars entirely. Flag estimated glycemic impact in healthInfo.',
    'Heart Disease':
      'Emphasise omega-3 rich ingredients, soluble fibre, and antioxidants. Limit saturated fat, sodium, and processed fats. Prefer steaming, poaching, and roasting over frying. Note cardiovascular benefit in healthInfo.',
  };
  return goals.map((g) => guidance[g] ?? '').filter(Boolean).join(' | ');
}
