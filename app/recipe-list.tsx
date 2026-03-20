import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useAppContext } from '../context/AppContext';
import { generateRecipes } from '../services/claude';
import { Recipe } from '../constants/mockData';
import { Colors, Radius, Shadow, Spacing } from '../constants/theme';

const POT_VIDEO = require('../assets/bgpot.mp4');

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  Easy:   { bg: '#DCFCE7', text: '#16A34A' },
  Medium: { bg: '#FEF3C7', text: '#D97706' },
  Hard:   { bg: '#FEE2E2', text: '#DC2626' },
};

const EMOJI_MAP: Record<string, string> = {
  Easy:   '🥗',
  Medium: '🍳',
  Hard:   '👨‍🍳',
};

// ── Skeleton card shown while recipes are loading ──────────────────────────────

function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.75, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 750, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={[styles.cardImage, { backgroundColor: '#E5E7EB' }]} />
      <View style={styles.cardContent}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, { width: '55%', marginTop: 8 }]} />
        <View style={[styles.skeletonLine, { width: '35%', marginTop: 4 }]} />
      </View>
    </Animated.View>
  );
}

// ── Loading video ──────────────────────────────────────────────────────────────

function LoadingVideo() {
  const player = useVideoPlayer(POT_VIDEO, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <View style={styles.loadingVideoContainer}>
      <VideoView
        player={player}
        style={styles.loadingVideo}
        contentFit="contain"
        nativeControls={false}
      />
    </View>
  );
}

// ── Diet tag chip ──────────────────────────────────────────────────────────────

function DietTag({ label }: { label: string }) {
  return (
    <View style={styles.dietTag}>
      <Text style={styles.dietTagText}>{label}</Text>
    </View>
  );
}

// ── Recipe card ────────────────────────────────────────────────────────────────

function RecipeCard({ recipe, onPress, index }: { recipe: Recipe; onPress: () => void; index: number }) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    // Stagger each card's entrance by its position in the list
    const delay = index * 80;
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 380, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 380, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const diff = DIFFICULTY_COLORS[recipe.difficulty];

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
        <View style={[styles.cardImage, { backgroundColor: recipe.imageColor }]}>
          <Text style={styles.cardImageEmoji}>{EMOJI_MAP[recipe.difficulty] ?? '🍽️'}</Text>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>{recipe.title}</Text>

          <View style={styles.cardMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>⏱</Text>
              <Text style={styles.metaText}>{recipe.cookTime}</Text>
            </View>
            <View style={[styles.difficultyBadge, { backgroundColor: diff.bg }]}>
              <Text style={[styles.difficultyText, { color: diff.text }]}>{recipe.difficulty}</Text>
            </View>
          </View>

          {recipe.dietTags.length > 0 && (
            <View style={styles.dietTags}>
              {recipe.dietTags.slice(0, 3).map((tag) => (
                <DietTag key={tag} label={tag} />
              ))}
            </View>
          )}
        </View>

        <View style={styles.cardArrow}>
          <Text style={styles.cardArrowText}>›</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Screen ─────────────────────────────────────────────────────────────────────

export default function RecipeListScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const {
    confirmedIngredients,
    pantryItems,
    userPreferences,
    healthGoals,
    generatedRecipes,
    setGeneratedRecipes,
    seenRecipeTitles,
    addSeenRecipeTitles,
  } = useAppContext();

  const [recipes, setRecipes]     = useState<Recipe[]>(generatedRecipes);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (generatedRecipes.length === 0) {
      fetchRecipes(false);
    }
  }, []);

  async function fetchRecipes(isRefresh: boolean) {
    if (isRefresh) {
      setRecipes([]);
      setGeneratedRecipes([]);
    }
    setIsLoading(true);

    try {
      const result = await generateRecipes({
        scannedIngredients: confirmedIngredients,
        pantryItems:        pantryItems as string[],
        dietPreferences:    userPreferences,
        healthGoals:        healthGoals,
        seenRecipeTitles:   isRefresh ? seenRecipeTitles : [],
      });

      setRecipes(result);
      setGeneratedRecipes(result);
      addSeenRecipeTitles(result.map((r) => r.title));
    } catch {
      Alert.alert('Error', 'Could not generate recipes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const headerLabel =
    userPreferences.length > 0
      ? `Tailored for: ${userPreferences.slice(0, 2).join(', ')}`
      : 'Based on your ingredients';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Recipes For You</Text>
          <Text style={styles.headerSubtitle}>
            {isLoading ? 'Finding your recipes…' : headerLabel}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => fetchRecipes(true)}
          disabled={isLoading}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.sage} />
          ) : (
            <Text style={styles.refreshButtonText}>↺</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Ingredient strip ─────────────────────────────────────────────── */}
      {confirmedIngredients.length > 0 && (
        <View style={styles.ingredientRow}>
          <Text style={styles.ingredientRowLabel}>Using: </Text>
          <Text style={styles.ingredientRowText} numberOfLines={1}>
            {confirmedIngredients.join(' · ')}
          </Text>
        </View>
      )}

      {/* ── Loading state: video + 5 skeleton cards ──────────────────────── */}
      {isLoading && (
        <FlatList
          data={[1, 2, 3, 4, 5]}
          keyExtractor={(item) => String(item)}
          renderItem={() => <SkeletonCard />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListHeaderComponent={
            <View style={styles.firstLoadHint}>
              <LoadingVideo />
              <Text style={styles.firstLoadTitle}>Crafting your recipes…</Text>
            </View>
          }
        />
      )}

      {/* ── Recipe list — rendered once loading is done ───────────────────── */}
      {!isLoading && (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <RecipeCard
              recipe={item}
              index={index}
              onPress={() =>
                router.push({ pathname: '/recipe-detail', params: { id: item.id } })
              }
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListFooterComponent={
            recipes.length > 0 ? (
              <View style={{ paddingBottom: insets.bottom + 20, marginTop: 12 }}>
                <TouchableOpacity
                  style={styles.refreshFooterButton}
                  onPress={() => fetchRecipes(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.refreshFooterText}>↺  Get 5 new recipes</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },

  // ── Header ──────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: { width: 54 },
  backButtonText: { fontSize: 15, color: Colors.sage, fontWeight: '500' },
  headerCenter: { alignItems: 'center', flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.ink },
  headerSubtitle: { fontSize: 11, color: Colors.muted, marginTop: 1 },
  refreshButton: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.tagDefault,
    justifyContent: 'center', alignItems: 'center',
  },
  refreshButtonText: { fontSize: 18, color: Colors.sage, fontWeight: '600' },

  // ── Ingredient strip ─────────────────────────────────────
  ingredientRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    backgroundColor: Colors.sageLight,
    borderBottomWidth: 1, borderBottomColor: Colors.sageMid,
  },
  ingredientRowLabel: { fontSize: 12, fontWeight: '700', color: Colors.sageDark },
  ingredientRowText: { flex: 1, fontSize: 12, color: Colors.sage },

  listContent: { padding: Spacing.lg },

  // ── Loading hint ─────────────────────────────────────────
  firstLoadHint: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingVideoContainer: {
    width: 110,
    height: 110,
    borderRadius: Radius.xl,
    backgroundColor: '#2B4A2B',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingVideo: {
    // VideoView is larger than container on all sides so overflow:hidden crops the whitespace.
    // ~22% cropped left+right, ~16% cropped top+bottom — pot fills the frame.
    width: 200,
    height: 160,
  },
  firstLoadTitle: { fontSize: 16, fontWeight: '600', color: Colors.muted },

  // ── Recipe cards ─────────────────────────────────────────
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.sm,
    alignItems: 'center',
  },
  cardImage: { width: 90, height: 100, justifyContent: 'center', alignItems: 'center' },
  cardImageEmoji: { fontSize: 36 },
  cardContent: { flex: 1, padding: 14, gap: 6 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.ink, lineHeight: 20 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaIcon: { fontSize: 12 },
  metaText: { fontSize: 12, color: Colors.muted, fontWeight: '500' },
  difficultyBadge: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: 8 },
  difficultyText: { fontSize: 11, fontWeight: '700' },
  dietTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  dietTag: {
    backgroundColor: Colors.terracottaLight,
    paddingVertical: 2, paddingHorizontal: 7,
    borderRadius: 6,
  },
  dietTagText: { fontSize: 10, fontWeight: '600', color: Colors.terracotta },
  cardArrow: { paddingRight: 14 },
  cardArrowText: { fontSize: 24, color: Colors.border, fontWeight: '300' },

  // ── Skeleton ─────────────────────────────────────────────
  skeletonLine: {
    height: 14, width: '70%',
    backgroundColor: Colors.border, borderRadius: 8,
  },

  // ── Footer refresh ───────────────────────────────────────
  refreshFooterButton: {
    paddingVertical: 16, borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: Colors.sage, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  refreshFooterText: { fontSize: 14, fontWeight: '600', color: Colors.sage },
});
