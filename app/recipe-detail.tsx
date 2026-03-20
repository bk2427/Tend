import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../context/AppContext';
import { MealLogEntry } from '../constants/mockData';
import { Colors, Radius, Shadow, Spacing, Typography } from '../constants/theme';

export default function RecipeDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { generatedRecipes, healthGoals, logMeal } = useAppContext();
  const [logged, setLogged] = useState(false);

  const recipe = generatedRecipes.find((r) => r.id === id) ?? generatedRecipes[0];

  if (!recipe) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Recipe not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>← Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function handleIMadeThis() {
    try {
      const entry: MealLogEntry = {
        id: `meal-${Date.now()}`,
        recipeId: recipe.id,
        recipeName: recipe.title,
        cookedAt: new Date().toISOString(),
        reviewed: false,
      };
      logMeal(entry);
      setLogged(true);
      Alert.alert(
        '🎉 Logged to your diary!',
        "Head to the Diary tab whenever you're ready to write your review.",
        [{ text: 'Great', style: 'default' }]
      );
    } catch {
      Alert.alert('Error', 'Could not log this meal. Please try again.');
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Hero colour band */}
      <View style={[styles.hero, { backgroundColor: recipe.imageColor }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.heroEmoji}>🍽️</Text>

        <View style={styles.heroMeta}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>⏱ {recipe.cookTime}</Text>
          </View>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>⚡ {recipe.difficulty}</Text>
          </View>
          {recipe.dietTags.map((tag) => (
            <View key={tag} style={[styles.heroBadge, styles.heroDietBadge]}>
              <Text style={[styles.heroBadgeText, styles.heroDietBadgeText]}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.recipeTitle}>{recipe.title}</Text>

        {/* Health insights */}
        <View style={[styles.healthBox, healthGoals.length === 0 && styles.healthBoxGeneric]}>
          <View style={styles.healthBoxHeader}>
            <Text style={styles.healthBoxEmoji}>💡</Text>
            <Text style={styles.healthBoxTitle}>
              {healthGoals.length > 0 ? 'Why This Works For You' : 'Health Insights'}
            </Text>
          </View>
          <Text style={styles.healthBoxText}>{recipe.healthInfo}</Text>
          {healthGoals.length > 0 && (
            <View style={styles.healthGoalChips}>
              {healthGoals.map((g) => (
                <View key={g} style={styles.healthGoalChip}>
                  <Text style={styles.healthGoalChipText}>✓ {g}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Ingredients */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEmoji}>🧺</Text>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{recipe.ingredients.length}</Text>
            </View>
          </View>
          <View style={styles.card}>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index}>
                <View style={styles.ingredientRow}>
                  <View style={styles.ingredientBullet} />
                  <Text style={styles.ingredientText}>{ingredient}</Text>
                </View>
                {index < recipe.ingredients.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Steps */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEmoji}>👨‍🍳</Text>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{recipe.steps.length} steps</Text>
            </View>
          </View>
          <View style={styles.stepsContainer}>
            {recipe.steps.map((step, index) => (
              <View key={index} style={styles.stepRow}>
                <View style={styles.stepNumberWrapper}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                  {index < recipe.steps.length - 1 && (
                    <View style={styles.stepConnector} />
                  )}
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Bottom actions */}
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={[styles.logBtn, logged && styles.logBtnLogged]}
          onPress={handleIMadeThis}
          activeOpacity={0.8}
          disabled={logged}
        >
          <Text style={styles.logBtnText}>
            {logged ? '✓ Added to Diary' : '🍳  I Made This'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => router.dismissAll()}
          activeOpacity={0.85}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  centered: { alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorText: { fontSize: 16, color: Colors.muted },
  backLink: { fontSize: 15, color: Colors.sage, fontWeight: '600' },

  hero: { paddingVertical: 28, alignItems: 'center', position: 'relative' },
  backButton: {
    position: 'absolute', top: 14, left: 20,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.75)',
    justifyContent: 'center', alignItems: 'center',
  },
  backButtonText: { fontSize: 18, color: Colors.ink, fontWeight: '600' },
  heroEmoji: { fontSize: 58, marginBottom: 12 },
  heroMeta: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 6,
    justifyContent: 'center', paddingHorizontal: 20,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    paddingVertical: 4, paddingHorizontal: 12, borderRadius: Radius.full,
  },
  heroBadgeText: { fontSize: 12, fontWeight: '600', color: Colors.ink },
  heroDietBadge: { backgroundColor: Colors.sageLight },
  heroDietBadgeText: { color: Colors.sage },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, gap: Spacing.lg },
  recipeTitle: { ...Typography.h1 },

  healthBox: {
    backgroundColor: Colors.sageLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.sage,
    gap: 8,
  },
  healthBoxGeneric: { backgroundColor: '#EFF6FF', borderLeftColor: '#3B82F6' },
  healthBoxHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  healthBoxEmoji: { fontSize: 16 },
  healthBoxTitle: { fontSize: 14, fontWeight: '700', color: Colors.sageDark },
  healthBoxText: { fontSize: 14, color: Colors.sage, lineHeight: 21 },
  healthGoalChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  healthGoalChip: {
    backgroundColor: Colors.card,
    paddingVertical: 3, paddingHorizontal: 10, borderRadius: 10,
  },
  healthGoalChipText: { fontSize: 11, fontWeight: '600', color: Colors.sage },

  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionEmoji: { fontSize: 18 },
  sectionTitle: { ...Typography.h2, flex: 1 },
  sectionBadge: {
    backgroundColor: Colors.tagDefault,
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3,
  },
  sectionBadgeText: { fontSize: 12, fontWeight: '600', color: Colors.muted },

  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  ingredientRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: Spacing.lg, gap: 12,
  },
  ingredientBullet: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.sage },
  ingredientText: { fontSize: 15, color: Colors.ink },
  divider: { height: 1, backgroundColor: Colors.divider, marginLeft: 36 },

  stepsContainer: { gap: 0 },
  stepRow: { flexDirection: 'row', gap: 14 },
  stepNumberWrapper: { alignItems: 'center', width: 32 },
  stepNumber: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.sage,
    textAlign: 'center', lineHeight: 32,
    fontSize: 14, fontWeight: '700', color: Colors.card, overflow: 'hidden',
  },
  stepConnector: {
    width: 2, flex: 1, backgroundColor: Colors.border,
    marginVertical: 4, minHeight: 16,
  },
  stepContent: { flex: 1, paddingTop: 6, paddingBottom: 20 },
  stepText: { fontSize: 14, color: Colors.ink, lineHeight: 21 },

  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  logBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.sage,
    alignItems: 'center',
  },
  logBtnLogged: {
    backgroundColor: Colors.sageLight,
    borderColor: Colors.sageMid,
  },
  logBtnText: { fontSize: 14, fontWeight: '700', color: Colors.sage },
  doneButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: Radius.lg,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    ...Shadow.md,
  },
  doneButtonText: { fontSize: 15, fontWeight: '700', color: Colors.card },
});
