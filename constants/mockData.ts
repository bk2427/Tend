export interface Recipe {
  id: string;
  title: string;
  cookTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  imageColor: string;
  ingredients: string[];
  steps: string[];
  healthInfo: string;
  dietTags: string[]; // matched from user's preferences
}

// ─── Demo seed recipes ────────────────────────────────────────────────────────
// Referenced by name only in AppContext seed data — not used at runtime.
export const MOCK_RECIPE_POOL: Recipe[] = [
  {
    id: '1',
    title: 'Garlic Chicken & Broccoli',
    cookTime: '25 min',
    difficulty: 'Easy',
    imageColor: '#C8E6C9',
    ingredients: [
      '2 chicken breasts',
      '2 cups broccoli florets',
      '4 cloves garlic, minced',
      '2 tbsp olive oil',
      '1 lemon, juiced',
      'Salt and pepper to taste',
    ],
    steps: [
      'Season chicken breasts with salt and pepper.',
      'Heat olive oil in a large skillet over medium-high heat.',
      'Cook chicken 6–7 min per side until golden and cooked through.',
      'Remove chicken and rest for 5 minutes.',
      'In the same pan, sauté garlic 1 minute until fragrant.',
      'Add broccoli and cook 4–5 minutes until tender-crisp.',
      'Squeeze lemon over everything and slice chicken to serve.',
    ],
    healthInfo:
      'High in lean protein and vitamin C. Supports muscle repair and immune function.',
    dietTags: ['High Protein', 'Keto', 'Gluten Free'],
  },
  {
    id: '2',
    title: 'Spinach & Tomato Frittata',
    cookTime: '20 min',
    difficulty: 'Easy',
    imageColor: '#FFF9C4',
    ingredients: [
      '6 large eggs',
      '2 cups fresh spinach',
      '1 cup cherry tomatoes, halved',
      '¼ cup parmesan, grated',
      '1 tbsp olive oil',
      'Salt and pepper to taste',
    ],
    steps: [
      'Preheat oven to 375°F (190°C).',
      'Whisk eggs with salt and pepper in a bowl.',
      'Heat olive oil in an oven-safe skillet over medium heat.',
      'Sauté spinach until wilted, about 2 minutes.',
      'Add cherry tomatoes and cook 1 minute.',
      'Pour egg mixture over vegetables.',
      'Sprinkle parmesan on top.',
      'Transfer to oven and bake 12–15 minutes until set.',
    ],
    healthInfo:
      'Rich in iron, folate, and complete protein. Supports energy and red blood cell production.',
    dietTags: ['Keto', 'High Protein', 'Gluten Free'],
  },
  {
    id: '3',
    title: 'Lemon Garlic Roasted Chicken',
    cookTime: '35 min',
    difficulty: 'Medium',
    imageColor: '#FFE0B2',
    ingredients: [
      '2 chicken breasts',
      '1 lemon, sliced',
      '4 cloves garlic, crushed',
      '3 tbsp olive oil',
      '1 tsp dried oregano',
      'Salt and pepper to taste',
    ],
    steps: [
      'Preheat oven to 425°F (220°C).',
      'Place chicken in a baking dish.',
      'Whisk together olive oil, garlic, lemon juice, and oregano.',
      'Pour marinade over chicken and top with lemon slices.',
      'Season generously with salt and pepper.',
      'Roast 25–30 minutes until juices run clear.',
      'Rest 5 minutes before serving.',
    ],
    healthInfo:
      'Lean protein with anti-inflammatory compounds from garlic and lemon. Great for heart health.',
    dietTags: ['High Protein', 'Keto', 'Gluten Free', 'Low Fat'],
  },
  {
    id: '4',
    title: 'Roasted Veggie Bowl',
    cookTime: '40 min',
    difficulty: 'Medium',
    imageColor: '#FFCCBC',
    ingredients: [
      '2 cups broccoli florets',
      '1 cup cherry tomatoes',
      '2 cups fresh spinach',
      '3 cloves garlic',
      '3 tbsp olive oil',
      'Salt, pepper, and paprika',
    ],
    steps: [
      'Preheat oven to 425°F (220°C).',
      'Toss broccoli and cherry tomatoes with olive oil, garlic, salt, pepper, and paprika.',
      'Spread on a baking sheet in a single layer.',
      'Roast 20–25 minutes, tossing halfway through.',
      'Arrange spinach in bowls.',
      'Top with roasted vegetables.',
      'Drizzle with extra olive oil and serve.',
    ],
    healthInfo:
      'Packed with fiber, vitamins A, C, and K. Anti-inflammatory and great for gut health.',
    dietTags: ['Vegan', 'Gluten Free', 'Low Fat'],
  },
  {
    id: '5',
    title: 'Chicken & Spinach Sauté',
    cookTime: '20 min',
    difficulty: 'Easy',
    imageColor: '#DCEDC8',
    ingredients: [
      '1 chicken breast, sliced thin',
      '3 cups baby spinach',
      '3 cloves garlic, minced',
      '2 tbsp olive oil',
      '½ lemon, juiced',
      'Salt and pepper to taste',
    ],
    steps: [
      'Season chicken slices with salt and pepper.',
      'Heat olive oil in a skillet over high heat.',
      'Cook chicken 3–4 minutes until golden. Remove and set aside.',
      'In the same pan, sauté garlic 30 seconds.',
      'Add spinach and toss until wilted, about 2 minutes.',
      'Return chicken to the pan.',
      'Squeeze lemon over everything and toss to combine.',
    ],
    healthInfo:
      'Quick, high-protein meal with iron-rich spinach. Ideal for managing blood sugar due to low carb content.',
    dietTags: ['High Protein', 'Keto', 'Gluten Free', 'Low Fat'],
  },
  {
    id: '6',
    title: 'Parmesan Broccoli Bake',
    cookTime: '30 min',
    difficulty: 'Easy',
    imageColor: '#B3E5FC',
    ingredients: [
      '4 cups broccoli florets',
      '½ cup parmesan, grated',
      '3 cloves garlic, minced',
      '2 tbsp olive oil',
      '1 lemon, zested',
      'Salt and pepper to taste',
    ],
    steps: [
      'Preheat oven to 400°F (200°C).',
      'Toss broccoli with olive oil, garlic, salt, and pepper.',
      'Spread on a lined baking sheet.',
      'Roast 20 minutes until edges are crispy.',
      'Remove from oven and immediately top with parmesan and lemon zest.',
      'Return to oven for 3–5 minutes until cheese melts.',
      'Serve immediately.',
    ],
    healthInfo:
      'High in vitamin C, calcium, and sulforaphane — a powerful compound linked to reduced inflammation.',
    dietTags: ['Keto', 'Gluten Free', 'Vegan'],
  },
  {
    id: '7',
    title: 'Tomato Spinach Garlic Pan',
    cookTime: '15 min',
    difficulty: 'Easy',
    imageColor: '#F8BBD0',
    ingredients: [
      '2 cups cherry tomatoes',
      '3 cups baby spinach',
      '4 cloves garlic, sliced',
      '2 tbsp olive oil',
      'Salt, pepper, and chili flakes',
    ],
    steps: [
      'Heat olive oil in a large pan over medium-high heat.',
      'Add garlic and chili flakes — cook 1 minute until fragrant.',
      'Add cherry tomatoes. Cook 5–7 minutes until they blister and burst.',
      'Add spinach and toss until wilted.',
      'Season with salt and pepper.',
      'Serve as a side or over a protein of choice.',
    ],
    healthInfo:
      'Rich in lycopene from cooked tomatoes — a powerful antioxidant particularly beneficial for heart health.',
    dietTags: ['Vegan', 'Keto', 'Gluten Free', 'Low Fat'],
  },
  {
    id: '8',
    title: 'Lemon Herb Chicken Salad',
    cookTime: '25 min',
    difficulty: 'Easy',
    imageColor: '#E8F5E9',
    ingredients: [
      '2 chicken breasts',
      '3 cups fresh spinach',
      '1 cup cherry tomatoes, halved',
      '2 tbsp olive oil',
      '1 lemon, juiced and zested',
      'Salt and pepper to taste',
    ],
    steps: [
      'Season chicken with salt, pepper, and lemon zest.',
      'Heat 1 tbsp olive oil in a pan over medium-high heat.',
      'Cook chicken 6–7 minutes per side. Rest 5 minutes, then slice.',
      'Arrange spinach and cherry tomatoes in a bowl.',
      'Whisk remaining olive oil with lemon juice for dressing.',
      'Top salad with sliced chicken.',
      'Drizzle with dressing and serve.',
    ],
    healthInfo:
      'Anti-inflammatory combination of leafy greens, lean protein, and healthy fats. Supports autoimmune protocol.',
    dietTags: ['High Protein', 'Keto', 'Gluten Free', 'Low Fat'],
  },
  {
    id: '9',
    title: 'Garlic Parmesan Spinach',
    cookTime: '10 min',
    difficulty: 'Easy',
    imageColor: '#EDE7F6',
    ingredients: [
      '4 cups fresh spinach',
      '3 cloves garlic, minced',
      '¼ cup parmesan, grated',
      '1 tbsp olive oil',
      'Salt and pepper to taste',
    ],
    steps: [
      'Heat olive oil in a large pan over medium heat.',
      'Add garlic and cook 1 minute until fragrant.',
      'Add all spinach at once — it will look like a lot but wilts quickly.',
      'Toss for 2–3 minutes until fully wilted.',
      'Season with salt and pepper.',
      'Remove from heat and top with parmesan.',
      'Serve immediately as a side.',
    ],
    healthInfo:
      'Fast, nutrient-dense side with magnesium, iron, and calcium. Particularly beneficial for heart disease management.',
    dietTags: ['Keto', 'Gluten Free', 'Low Fat'],
  },
  {
    id: '10',
    title: 'One-Pan Chicken & Tomatoes',
    cookTime: '30 min',
    difficulty: 'Medium',
    imageColor: '#FFF3E0',
    ingredients: [
      '2 chicken breasts',
      '2 cups cherry tomatoes',
      '4 cloves garlic, halved',
      '3 tbsp olive oil',
      '½ lemon, juiced',
      'Salt, pepper, and dried basil',
    ],
    steps: [
      'Preheat oven to 400°F (200°C).',
      'Place chicken in an oven-safe pan. Surround with tomatoes and garlic.',
      'Drizzle everything with olive oil and lemon juice.',
      'Season with salt, pepper, and dried basil.',
      'Roast 25–28 minutes until chicken is cooked through and tomatoes are jammy.',
      'Spoon pan juices over chicken before serving.',
    ],
    healthInfo:
      'Concentrated lycopene from roasted tomatoes combined with lean protein. Excellent for cardiovascular support.',
    dietTags: ['High Protein', 'Keto', 'Gluten Free', 'Low Fat'],
  },
];

// Kept for backward compat with any screens still referencing it during transition
// ─── Diary types ──────────────────────────────────────────────────────────────

export interface MealReview {
  rating: number;           // 1–5
  experienceTags: string[];
  tasteTags: string[];
  symptomTags: string[];
  notes: string;            // max 180 chars
  reviewedAt: string;       // ISO timestamp
}

export interface MealLogEntry {
  id: string;
  recipeId: string;
  recipeName: string;
  cookedAt: string;         // ISO timestamp
  reviewed: boolean;
  review?: MealReview;
}

export interface InsightReport {
  id: string;
  generatedAt: string;      // ISO timestamp
  eatingProfile: string;    // paragraph about the user's current eating identity
  alignmentSummary: string; // are their choices matching their goals?
  ingredientPatterns: string[]; // e.g. "Garlic appears in 3 meals where you reported joint pain"
  recommendations: string[];    // 3 actionable next steps
}

// ─── Tag constants ────────────────────────────────────────────────────────────

export const EXPERIENCE_TAGS = [
  'Quick to make',
  'Time consuming',
  'Easy cleanup',
  'Messy kitchen',
  'Great for meal prep',
  'Would make again',
] as const;

export const TASTE_TAGS = [
  'Delicious',
  'Satisfying',
  'Bland',
  'Too rich',
  'Would tweak it',
  'Family approved',
] as const;

export const SYMPTOM_TAGS = [
  'No symptoms 🙌',
  'Gas',
  'Bloating',
  'Diarrhea',
  'Constipation',
  'Heartburn',
  'Nausea',
  'Fatigue',
  'Energy crash',
  'Brain fog',
  'Headache',
  'Joint pain',
  'Anxious / jittery',
  'Sweating',
  'Skin reaction',
] as const;

export const DIET_PREFERENCES = [
  'Keto',
  'High Protein',
  'Low Fat',
  'Vegan',
  'Gluten Free',
] as const;

export const PANTRY_DEFAULTS = [
  'Salt',
  'Pepper',
  'Oil',
  'Butter',
  'Flour',
  'Sugar',
  'Milk',
  'Oats',
] as const;

export const HEALTH_GOALS = [
  'Autoimmune Protocol',
  'Type 2 Diabetes',
  'Heart Disease',
] as const;
