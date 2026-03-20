import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../context/AppContext';
import {
  EXPERIENCE_TAGS, TASTE_TAGS, SYMPTOM_TAGS, MealReview,
} from '../constants/mockData';
import { Colors, Radius, Shadow, Spacing, Typography } from '../constants/theme';

const MAX_NOTES = 180;

function SectionLabel({ emoji, title }: { emoji: string; title: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <Text style={{ fontSize: 16 }}>{emoji}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function TagCloud({
  tags,
  selected,
  onToggle,
  variant = 'default',
}: {
  tags: readonly string[];
  selected: string[];
  onToggle: (tag: string) => void;
  variant?: 'default' | 'symptom';
}) {
  return (
    <View style={styles.tagCloud}>
      {tags.map((tag) => {
        const active = selected.includes(tag);
        const isGood = tag === 'No symptoms 🙌';
        const bgActive = variant === 'symptom' && !isGood
          ? Colors.terracottaLight : Colors.sageLight;
        const textActive = variant === 'symptom' && !isGood
          ? Colors.terracotta : Colors.sage;
        return (
          <TouchableOpacity
            key={tag}
            style={[
              styles.tag,
              active && { backgroundColor: bgActive, borderColor: 'transparent' },
            ]}
            onPress={() => onToggle(tag)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tagText, active && { color: textActive, fontWeight: '700' }]}>
              {tag}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function JournalEntryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mealId } = useLocalSearchParams<{ mealId: string }>();
  const { mealLog, updateMealReview } = useAppContext();

  const meal = mealLog.find((m) => m.id === mealId);

  const existingReview = meal?.review;
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [experienceTags, setExperienceTags] = useState<string[]>(existingReview?.experienceTags ?? []);
  const [tasteTags, setTasteTags] = useState<string[]>(existingReview?.tasteTags ?? []);
  const [symptomTags, setSymptomTags] = useState<string[]>(existingReview?.symptomTags ?? []);
  const [notes, setNotes] = useState(existingReview?.notes ?? '');

  function toggleTag(
    tag: string,
    current: string[],
    setter: (v: string[]) => void
  ) {
    setter(current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]);
  }

  function handleSave() {
    if (rating === 0) {
      Alert.alert('Star rating required', 'Please give this meal at least 1 star.');
      return;
    }
    try {
      const review: MealReview = {
        rating,
        experienceTags,
        tasteTags,
        symptomTags,
        notes: notes.trim(),
        reviewedAt: new Date().toISOString(),
      };
      updateMealReview(mealId, review);
      router.back();
    } catch {
      Alert.alert('Error', 'Could not save your review. Please try again.');
    }
  }

  if (!meal) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={styles.errorText}>Meal not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>← Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{meal.recipeName}</Text>
          <Text style={styles.headerSub}>
            {meal.reviewed ? 'Edit your review' : 'How did it go?'}
          </Text>
        </View>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Star rating */}
        <View style={styles.card}>
          <SectionLabel emoji="⭐" title="Overall Rating" />
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <TouchableOpacity key={s} onPress={() => setRating(s)} activeOpacity={0.7}>
                <Text style={[styles.star, s <= rating && styles.starActive]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingLabel}>
              {['', 'Not great', 'It was okay', 'Pretty good', 'Really liked it', 'Absolutely loved it'][rating]}
            </Text>
          )}
        </View>

        {/* Cooking experience */}
        <View style={styles.card}>
          <SectionLabel emoji="👨‍🍳" title="Cooking Experience" />
          <TagCloud
            tags={EXPERIENCE_TAGS}
            selected={experienceTags}
            onToggle={(t) => toggleTag(t, experienceTags, setExperienceTags)}
          />
        </View>

        {/* Taste */}
        <View style={styles.card}>
          <SectionLabel emoji="😋" title="How Did It Taste?" />
          <TagCloud
            tags={TASTE_TAGS}
            selected={tasteTags}
            onToggle={(t) => toggleTag(t, tasteTags, setTasteTags)}
          />
        </View>

        {/* Symptoms */}
        <View style={styles.card}>
          <SectionLabel emoji="🫀" title="How Did You Feel After?" />
          <Text style={styles.symptomHint}>
            Note any physical responses in the hours after eating.
          </Text>
          <TagCloud
            tags={SYMPTOM_TAGS}
            selected={symptomTags}
            onToggle={(t) => toggleTag(t, symptomTags, setSymptomTags)}
            variant="symptom"
          />
        </View>

        {/* Notes */}
        <View style={styles.card}>
          <SectionLabel emoji="📝" title="Anything else?" />
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={(t) => setNotes(t.slice(0, MAX_NOTES))}
            placeholder="A sentence or two about the experience…"
            placeholderTextColor={Colors.placeholder}
            multiline
            maxLength={MAX_NOTES}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{notes.length}/{MAX_NOTES}</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  errorText: { fontSize: 16, color: Colors.muted, marginBottom: 12 },
  backLink: { fontSize: 15, color: Colors.sage, fontWeight: '600' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
  },
  cancelText: { fontSize: 15, color: Colors.muted, fontWeight: '500' },
  headerTitle: { ...Typography.h3, color: Colors.ink },
  headerSub: { ...Typography.caption, marginTop: 1 },
  saveBtn: {
    backgroundColor: Colors.sage,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: Radius.full,
  },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: Colors.card },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, gap: Spacing.md },

  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  sectionTitle: { ...Typography.h3, color: Colors.ink },

  // Stars
  starRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  star: { fontSize: 34, color: Colors.border },
  starActive: { color: Colors.terracotta },
  ratingLabel: { fontSize: 13, color: Colors.muted, fontStyle: 'italic' },

  // Tags
  tagCloud: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.tagDefault,
  },
  tagText: { fontSize: 12, fontWeight: '500', color: Colors.tagDefaultText },

  // Symptoms
  symptomHint: { ...Typography.caption, marginBottom: 12 },

  // Notes
  notesInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: 14,
    color: Colors.ink,
    minHeight: 80,
    backgroundColor: Colors.cream,
    lineHeight: 22,
  },
  charCount: { ...Typography.label, textAlign: 'right', marginTop: 6 },
});
