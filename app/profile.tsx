import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Platform, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext, DietPreference, PantryItem, HealthGoal } from '../context/AppContext';
import { DIET_PREFERENCES, PANTRY_DEFAULTS, HEALTH_GOALS } from '../constants/mockData';
import { Colors, Radius, Shadow, Spacing, Typography } from '../constants/theme';

const FOREST = '#2B4A2B';
const SERIF = Platform.OS === 'ios' ? 'Georgia' : 'serif';

function SectionHeader({ title, emoji }: { title: string; emoji: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionEmoji}>{emoji}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function Chip({
  label, selected, onPress,
}: {
  label: string; selected: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    userName, setUserName,
    userPreferences, pantryItems, healthGoals,
    setUserPreferences, setPantryItems, setHealthGoals,
  } = useAppContext();

  const [localName, setLocalName]     = useState(userName);
  const [localPrefs, setLocalPrefs]   = useState<DietPreference[]>(userPreferences);
  const [localPantry, setLocalPantry] = useState<PantryItem[]>(pantryItems);
  const [localGoals, setLocalGoals]   = useState<HealthGoal[]>(healthGoals);

  function toggleDiet(item: DietPreference) {
    setLocalPrefs((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  }
  function togglePantry(item: PantryItem) {
    setLocalPantry((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  }
  function toggleGoal(item: HealthGoal) {
    setLocalGoals((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  }

  function handleSave() {
    try {
      setUserName(localName.trim());
      setUserPreferences(localPrefs);
      setPantryItems(localPantry);
      setHealthGoals(localGoals);
      router.canGoBack() ? router.back() : router.replace('/');
    } catch {
      Alert.alert('Error', 'Could not save your profile. Please try again.');
    }
  }

  function handleCancel() {
    router.canGoBack() ? router.back() : router.replace('/');
  }

  const initial = localName.trim().charAt(0).toUpperCase();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* ── Profile hero ──────────────────────────────── */}
      <View style={styles.hero}>
        <View style={styles.avatar}>
          {initial ? (
            <Text style={styles.avatarInitial}>{initial}</Text>
          ) : (
            <Text style={styles.avatarEmoji}>🌿</Text>
          )}
        </View>

        <TextInput
          style={styles.nameInput}
          value={localName}
          onChangeText={setLocalName}
          placeholder="Your name"
          placeholderTextColor="rgba(253,250,245,0.5)"
          maxLength={40}
          returnKeyType="done"
          autoCapitalize="words"
        />
        <Text style={styles.heroSubtitle}>Personalise your experience</Text>
      </View>

      {/* ── Settings cards ────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <SectionHeader title="Diet Preferences" emoji="🥦" />
          <Text style={styles.sectionDescription}>
            Select all that apply — recipes will be filtered to match
          </Text>
          <View style={styles.chipGrid}>
            {DIET_PREFERENCES.map((pref) => (
              <Chip
                key={pref}
                label={pref}
                selected={localPrefs.includes(pref as DietPreference)}
                onPress={() => toggleDiet(pref as DietPreference)}
              />
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <SectionHeader title="Pantry Staples" emoji="🧂" />
          <Text style={styles.sectionDescription}>
            Ingredients you always have — we'll include these in recipes
          </Text>
          <View style={styles.chipGrid}>
            {PANTRY_DEFAULTS.map((item) => (
              <Chip
                key={item}
                label={item}
                selected={localPantry.includes(item as PantryItem)}
                onPress={() => togglePantry(item as PantryItem)}
              />
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <SectionHeader title="Health Conditions" emoji="💚" />
          <Text style={styles.sectionDescription}>
            Your AI insights and recipe suggestions will be tailored accordingly
          </Text>
          <View style={styles.goalList}>
            {HEALTH_GOALS.map((goal) => {
              const selected = localGoals.includes(goal as HealthGoal);
              return (
                <TouchableOpacity
                  key={goal}
                  style={[styles.goalRow, selected && styles.goalRowSelected]}
                  onPress={() => toggleGoal(goal as HealthGoal)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.goalRadio, selected && styles.goalRadioSelected]}>
                    {selected && <View style={styles.goalRadioDot} />}
                  </View>
                  <Text style={[styles.goalText, selected && styles.goalTextSelected]}>
                    {goal}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              This app does not provide medical advice. Always consult your healthcare provider.
            </Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Bottom actions ────────────────────────────── */}
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={handleCancel}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>Save Profile</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },

  hero: {
    backgroundColor: FOREST,
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(253,250,245,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(253,250,245,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatarInitial: {
    fontFamily: SERIF,
    fontSize: 40,
    fontWeight: '700',
    color: Colors.cream,
  },
  avatarEmoji: { fontSize: 40 },
  nameInput: {
    fontFamily: SERIF,
    fontSize: 26,
    fontWeight: '700',
    color: Colors.cream,
    textAlign: 'center',
    minWidth: 160,
    paddingVertical: 4,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(253,250,245,0.4)',
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(253,250,245,0.6)',
    letterSpacing: 0.3,
    marginTop: 2,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, gap: Spacing.lg },

  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: 12,
    ...Shadow.sm,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionEmoji: { fontSize: 20 },
  sectionTitle: { ...Typography.h3, color: Colors.ink },
  sectionDescription: { fontSize: 13, color: Colors.muted, lineHeight: 19 },

  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.cream,
  },
  chipSelected: { backgroundColor: Colors.sage, borderColor: Colors.sage },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.muted },
  chipTextSelected: { color: Colors.card },

  goalList: { gap: 10 },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.cream,
  },
  goalRowSelected: {
    borderColor: Colors.sageMid,
    backgroundColor: Colors.sageLight,
  },
  goalRadio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  goalRadioSelected: { borderColor: Colors.sage },
  goalRadioDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.sage,
  },
  goalText: { fontSize: 14, fontWeight: '500', color: Colors.muted, flex: 1 },
  goalTextSelected: { color: Colors.sageDark, fontWeight: '600' },

  disclaimer: {
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    marginTop: 4,
  },
  disclaimerText: {
    fontSize: 11, color: Colors.placeholder,
    lineHeight: 16, fontStyle: 'italic',
  },

  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelBtn: {
    flex: 1, paddingVertical: 16,
    borderRadius: Radius.lg, borderWidth: 1.5,
    borderColor: Colors.border, alignItems: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: Colors.muted },
  saveBtn: {
    flex: 2, paddingVertical: 16,
    borderRadius: Radius.lg,
    backgroundColor: FOREST,
    alignItems: 'center',
    shadowColor: FOREST,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: Colors.cream },
});
