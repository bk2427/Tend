import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../context/AppContext';
import { generateInsight } from '../services/claude';
import { Colors, Radius, Shadow, Spacing, Typography } from '../constants/theme';

type Section = 'meals' | 'insights';

function StarRow({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Text key={s} style={{ fontSize: 12, color: s <= rating ? '#C4704F' : Colors.border }}>
          ★
        </Text>
      ))}
    </View>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DiaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    mealLog, savedInsights, deleteInsight, saveInsight,
    userPreferences, healthGoals, pantryItems,
  } = useAppContext();

  const [activeSection, setActiveSection] = useState<Section>('meals');
  const [generating, setGenerating] = useState(false);

  async function handleGenerateInsight() {
    setGenerating(true);
    try {
      const report = await generateInsight({
        dietPreferences: userPreferences,
        healthGoals,
        pantryItems,
        mealLog,
      });
      router.push({ pathname: '/insight-report', params: { reportJson: JSON.stringify(report) } });
    } catch {
      Alert.alert('Could not generate insight', 'Please try again in a moment.');
    } finally {
      setGenerating(false);
    }
  }

  const sortedMeals = [...mealLog].sort(
    (a, b) => new Date(b.cookedAt).getTime() - new Date(a.cookedAt).getTime()
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backLabel}>Home</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Diary</Text>
        <Text style={styles.headerSub}>Your food journey, documented</Text>
      </View>

      {/* Section toggle */}
      <View style={styles.toggleRow}>
        {(['meals', 'insights'] as Section[]).map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.toggleBtn, activeSection === s && styles.toggleBtnActive]}
            onPress={() => setActiveSection(s)}
            activeOpacity={0.75}
          >
            <Text style={[styles.toggleText, activeSection === s && styles.toggleTextActive]}>
              {s === 'meals' ? `Cooked Meals (${mealLog.length})` : `Insights (${savedInsights.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── MEALS section ── */}
        {activeSection === 'meals' && (
          <>
            {sortedMeals.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🍳</Text>
                <Text style={styles.emptyTitle}>No meals logged yet</Text>
                <Text style={styles.emptySub}>
                  Cook a recipe and tap "I Made This" to start your diary.
                </Text>
              </View>
            ) : (
              sortedMeals.map((meal) => (
                <TouchableOpacity
                  key={meal.id}
                  style={styles.mealCard}
                  onPress={() =>
                    router.push({
                      pathname: '/journal-entry',
                      params: { mealId: meal.id },
                    })
                  }
                  activeOpacity={0.8}
                >
                  <View style={styles.mealCardLeft}>
                    <Text style={styles.mealName} numberOfLines={1}>
                      {meal.recipeName}
                    </Text>
                    <Text style={styles.mealDate}>{formatDate(meal.cookedAt)}</Text>
                    {meal.reviewed && meal.review && (
                      <StarRow rating={meal.review.rating} />
                    )}
                  </View>

                  <View style={styles.mealCardRight}>
                    <View
                      style={[
                        styles.statusPill,
                        meal.reviewed ? styles.statusReviewed : styles.statusPending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          meal.reviewed ? styles.statusTextReviewed : styles.statusTextPending,
                        ]}
                      >
                        {meal.reviewed ? '✓ Reviewed' : 'Add review'}
                      </Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}

        {/* ── INSIGHTS section ── */}
        {activeSection === 'insights' && (
          <>
            {/* Generate button */}
            <TouchableOpacity
              style={[styles.generateBtn, generating && styles.generateBtnDisabled]}
              onPress={handleGenerateInsight}
              activeOpacity={0.85}
              disabled={generating}
            >
              {generating ? (
                <>
                  <ActivityIndicator color={Colors.card} size="small" />
                  <Text style={styles.generateBtnText}>Reviewing your journey…</Text>
                </>
              ) : (
                <>
                  <Text style={styles.generateBtnIcon}>✦</Text>
                  <Text style={styles.generateBtnText}>Generate New Insight</Text>
                </>
              )}
            </TouchableOpacity>

            {savedInsights.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={styles.emptyTitle}>No insights yet</Text>
                <Text style={styles.emptySub}>
                  Log and review a few meals, then generate your first insight report.
                </Text>
              </View>
            ) : (
              savedInsights.map((insight) => (
                <View key={insight.id} style={styles.insightCard}>
                  <View style={styles.insightHeader}>
                    <View>
                      <Text style={styles.insightDate}>{formatDate(insight.generatedAt)}</Text>
                      <Text style={styles.insightTitle}>Health Insight Report</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert('Delete Insight', 'Remove this report from your diary?', [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: () => deleteInsight(insight.id),
                          },
                        ])
                      }
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.deleteBtn}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.insightPreview} numberOfLines={3}>
                    {insight.eatingProfile}
                  </Text>

                  <View style={styles.insightPatterns}>
                    {insight.ingredientPatterns.slice(0, 2).map((p, i) => (
                      <View key={i} style={styles.patternRow}>
                        <View style={styles.patternDot} />
                        <Text style={styles.patternText} numberOfLines={2}>{p}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))
            )}
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },

  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.sm,
    alignSelf: 'flex-start',
  },
  backArrow: {
    fontSize: 16,
    color: Colors.sage,
    fontWeight: '600',
  },
  backLabel: {
    fontSize: 14,
    color: Colors.sage,
    fontWeight: '600',
  },
  headerTitle: { ...Typography.h1 },
  headerSub: { ...Typography.caption, marginTop: 2 },

  toggleRow: {
    flexDirection: 'row',
    margin: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: 4,
    ...Shadow.sm,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: Colors.sage },
  toggleText: { fontSize: 13, fontWeight: '600', color: Colors.muted },
  toggleTextActive: { color: Colors.card },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xl },

  // Meal cards
  mealCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadow.sm,
  },
  mealCardLeft: { flex: 1, gap: 4 },
  mealName: { ...Typography.h3, color: Colors.ink },
  mealDate: { ...Typography.caption },
  mealCardRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusPill: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: Radius.full },
  statusReviewed: { backgroundColor: Colors.sageLight },
  statusPending: { backgroundColor: Colors.terracottaLight },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusTextReviewed: { color: Colors.sage },
  statusTextPending: { color: Colors.terracotta },
  chevron: { fontSize: 20, color: Colors.muted, marginLeft: 2 },

  // Insights
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.sage,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
    ...Shadow.sage,
  },
  generateBtnDisabled: { opacity: 0.7 },
  generateBtnIcon: { fontSize: 18, color: Colors.card },
  generateBtnText: { fontSize: 16, fontWeight: '700', color: Colors.card },

  insightCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.sage,
    ...Shadow.sm,
  },
  insightHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  insightDate: { ...Typography.label, color: Colors.muted },
  insightTitle: { ...Typography.h3, color: Colors.ink, marginTop: 2 },
  deleteBtn: { fontSize: 14, color: Colors.muted, fontWeight: '700' },
  insightPreview: { ...Typography.body, color: Colors.muted },
  insightPatterns: { gap: 6 },
  patternRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  patternDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.terracotta, marginTop: 7 },
  patternText: { flex: 1, fontSize: 12, color: Colors.ink, lineHeight: 18 },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: Spacing.sm },
  emptyEmoji: { fontSize: 44 },
  emptyTitle: { ...Typography.h3, color: Colors.ink },
  emptySub: { ...Typography.body, color: Colors.muted, textAlign: 'center', paddingHorizontal: 32 },
});
