import React, {
  createContext, useContext, useState,
  useEffect, useCallback, ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe, MealLogEntry, InsightReport } from '../constants/mockData';

export type DietPreference = 'Keto' | 'High Protein' | 'Low Fat' | 'Vegan' | 'Gluten Free';
export type HealthGoal = 'Autoimmune Protocol' | 'Type 2 Diabetes' | 'Heart Disease';
export type PantryItem =
  | 'Salt' | 'Pepper' | 'Oil' | 'Butter'
  | 'Flour' | 'Sugar' | 'Milk' | 'Oats';

// ─── Storage keys ─────────────────────────────────────────────────────────────
// Namespaced with 'tend:' to avoid any future collisions.
// Session state (scan, recipes) is intentionally excluded — it's ephemeral.
const STORAGE_KEYS = {
  userName:        'tend:userName',
  userPreferences: 'tend:userPreferences',
  pantryItems:     'tend:pantryItems',
  healthGoals:     'tend:healthGoals',
  mealLog:         'tend:mealLog',
  savedInsights:   'tend:savedInsights',
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function loadItem<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function saveItem(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage write failures are non-fatal — app continues to work in-memory
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppState {
  // ── Loading ───────────────────────────────────────────────────────────────
  hydrated: boolean;  // true once AsyncStorage has been read on launch

  // ── User profile ──────────────────────────────────────────────────────────
  userName: string;
  setUserName: (name: string) => void;
  userPreferences: DietPreference[];
  pantryItems: PantryItem[];
  healthGoals: HealthGoal[];
  setUserPreferences: (prefs: DietPreference[]) => void;
  setPantryItems: (items: PantryItem[]) => void;
  setHealthGoals: (goals: HealthGoal[]) => void;

  // ── Active scan session ───────────────────────────────────────────────────
  capturedImageUri: string | null;
  setCapturedImageUri: (uri: string | null) => void;
  confirmedIngredients: string[];
  setConfirmedIngredients: (items: string[]) => void;
  generatedRecipes: Recipe[];
  setGeneratedRecipes: (recipes: Recipe[]) => void;
  seenRecipeTitles: string[];
  addSeenRecipeTitles: (titles: string[]) => void;
  clearSession: () => void;

  // ── Diary — cooked meals ──────────────────────────────────────────────────
  mealLog: MealLogEntry[];
  logMeal: (entry: MealLogEntry) => void;
  updateMealReview: (id: string, review: MealLogEntry['review']) => void;

  // ── Diary — insights ─────────────────────────────────────────────────────
  savedInsights: InsightReport[];
  saveInsight: (report: InsightReport) => void;
  deleteInsight: (id: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

// ─── Seed data ────────────────────────────────────────────────────────────────
// Only used on first launch (when AsyncStorage has no mealLog key yet).
const SEED_MEAL_LOG: MealLogEntry[] = [
  {
    id: 'seed-1',
    recipeId: '1',
    recipeName: 'Garlic Chicken & Broccoli',
    cookedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    reviewed: true,
    review: {
      rating: 4,
      experienceTags: ['Quick to make', 'Easy cleanup'],
      tasteTags: ['Delicious', 'Satisfying'],
      symptomTags: ['Joint pain', 'Fatigue'],
      notes: 'Loved the flavour but noticed some joint stiffness a few hours later.',
      reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
    },
  },
  {
    id: 'seed-2',
    recipeId: '4',
    recipeName: 'Roasted Veggie Bowl',
    cookedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    reviewed: true,
    review: {
      rating: 5,
      experienceTags: ['Great for meal prep'],
      tasteTags: ['Delicious', 'Satisfying'],
      symptomTags: ['No symptoms 🙌'],
      notes: 'Felt great all evening. Will definitely make again.',
      reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 7200000).toISOString(),
    },
  },
  {
    id: 'seed-3',
    recipeId: '2',
    recipeName: 'Spinach & Tomato Frittata',
    cookedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    reviewed: false,
  },
];

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  // Tracks whether the initial AsyncStorage read has completed
  const [hydrated, setHydrated] = useState(false);

  // Profile
  const [userName, _setUserName]             = useState<string>('');
  const [userPreferences, _setUserPreferences] = useState<DietPreference[]>([]);
  const [pantryItems, _setPantryItems]         = useState<PantryItem[]>(['Salt', 'Pepper', 'Oil']);
  const [healthGoals, _setHealthGoals]         = useState<HealthGoal[]>([]);

  // Session (not persisted — ephemeral per scan)
  const [capturedImageUri, setCapturedImageUri]   = useState<string | null>(null);
  const [confirmedIngredients, setConfirmedIngredients] = useState<string[]>([]);
  const [generatedRecipes, setGeneratedRecipes]   = useState<Recipe[]>([]);
  const [seenRecipeTitles, setSeenRecipeTitles]   = useState<string[]>([]);

  // Diary
  const [mealLog, _setMealLog]           = useState<MealLogEntry[]>([]);
  const [savedInsights, _setSavedInsights] = useState<InsightReport[]>([]);

  // ── Hydration: read persisted data on first mount ───────────────────────
  useEffect(() => {
    async function hydrate() {
      const [name, prefs, pantry, goals, meals, insights] = await Promise.all([
        loadItem<string>(STORAGE_KEYS.userName, ''),
        loadItem<DietPreference[]>(STORAGE_KEYS.userPreferences, []),
        loadItem<PantryItem[]>(STORAGE_KEYS.pantryItems, ['Salt', 'Pepper', 'Oil']),
        loadItem<HealthGoal[]>(STORAGE_KEYS.healthGoals, []),
        loadItem<MealLogEntry[]>(STORAGE_KEYS.mealLog, SEED_MEAL_LOG),
        loadItem<InsightReport[]>(STORAGE_KEYS.savedInsights, []),
      ]);

      _setUserName(name);
      _setUserPreferences(prefs);
      _setPantryItems(pantry);
      _setHealthGoals(goals);
      _setMealLog(meals);
      _setSavedInsights(insights);
      setHydrated(true);
    }

    hydrate();
  }, []);

  // ── Setters: update state + immediately write to storage ─────────────────

  const setUserName = useCallback((name: string) => {
    _setUserName(name);
    saveItem(STORAGE_KEYS.userName, name);
  }, []);

  const setUserPreferences = useCallback((prefs: DietPreference[]) => {
    _setUserPreferences(prefs);
    saveItem(STORAGE_KEYS.userPreferences, prefs);
  }, []);

  const setPantryItems = useCallback((items: PantryItem[]) => {
    _setPantryItems(items);
    saveItem(STORAGE_KEYS.pantryItems, items);
  }, []);

  const setHealthGoals = useCallback((goals: HealthGoal[]) => {
    _setHealthGoals(goals);
    saveItem(STORAGE_KEYS.healthGoals, goals);
  }, []);

  const logMeal = useCallback((entry: MealLogEntry) => {
    _setMealLog((prev) => {
      const next = [entry, ...prev];
      saveItem(STORAGE_KEYS.mealLog, next);
      return next;
    });
  }, []);

  const updateMealReview = useCallback((id: string, review: MealLogEntry['review']) => {
    _setMealLog((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, reviewed: true, review } : e));
      saveItem(STORAGE_KEYS.mealLog, next);
      return next;
    });
  }, []);

  const saveInsight = useCallback((report: InsightReport) => {
    _setSavedInsights((prev) => {
      const next = [report, ...prev];
      saveItem(STORAGE_KEYS.savedInsights, next);
      return next;
    });
  }, []);

  const deleteInsight = useCallback((id: string) => {
    _setSavedInsights((prev) => {
      const next = prev.filter((r) => r.id !== id);
      saveItem(STORAGE_KEYS.savedInsights, next);
      return next;
    });
  }, []);

  // Session helpers (no persistence — intentional)
  const addSeenRecipeTitles = useCallback((titles: string[]) => {
    setSeenRecipeTitles((prev) => [...new Set([...prev, ...titles])]);
  }, []);

  const clearSession = useCallback(() => {
    setCapturedImageUri(null);
    setConfirmedIngredients([]);
    setGeneratedRecipes([]);
    setSeenRecipeTitles([]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        hydrated,
        userName, setUserName,
        userPreferences, setUserPreferences,
        pantryItems, setPantryItems,
        healthGoals, setHealthGoals,
        capturedImageUri, setCapturedImageUri,
        confirmedIngredients, setConfirmedIngredients,
        generatedRecipes, setGeneratedRecipes,
        seenRecipeTitles, addSeenRecipeTitles,
        clearSession,
        mealLog, logMeal, updateMealReview,
        savedInsights, saveInsight, deleteInsight,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
