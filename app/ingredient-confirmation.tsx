import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../context/AppContext';
import { Colors, Radius, Shadow, Spacing } from '../constants/theme';

interface IngredientItem {
  id: string;
  name: string;
}

export default function IngredientConfirmationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { capturedImageUri, confirmedIngredients, setConfirmedIngredients } = useAppContext();

  const [ingredients, setIngredients] = useState<IngredientItem[]>(
    confirmedIngredients.map((name, i) => ({ id: String(i), name }))
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  function startEdit(item: IngredientItem) {
    setEditingId(item.id);
    setEditText(item.name);
  }

  function saveEdit(id: string) {
    setIngredients((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, name: editText.trim() || item.name } : item
      )
    );
    setEditingId(null);
  }

  function removeIngredient(id: string) {
    setIngredients((prev) => prev.filter((item) => item.id !== id));
  }

  function addIngredient() {
    const newId = String(Date.now());
    setIngredients((prev) => [...prev, { id: newId, name: '' }]);
    setEditingId(newId);
    setEditText('');
  }

  function handleConfirm() {
    try {
      const names = ingredients.map((i) => i.name).filter(Boolean);
      if (names.length === 0) {
        Alert.alert('No ingredients', 'Please add at least one ingredient before continuing.');
        return;
      }
      setConfirmedIngredients(names);
      router.push('/recipe-list');
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  }

  const renderItem = ({ item }: { item: IngredientItem }) => {
    const isEditing = editingId === item.id;
    return (
      <View style={styles.ingredientRow}>
        <View style={styles.ingredientBullet} />
        {isEditing ? (
          <TextInput
            style={styles.ingredientInput}
            value={editText}
            onChangeText={setEditText}
            onBlur={() => saveEdit(item.id)}
            onSubmitEditing={() => saveEdit(item.id)}
            autoFocus
            returnKeyType="done"
            placeholder="Ingredient name"
            placeholderTextColor={Colors.placeholder}
          />
        ) : (
          <TouchableOpacity
            style={styles.ingredientTextWrapper}
            onPress={() => startEdit(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.ingredientText}>{item.name}</Text>
            <Text style={styles.editHint}>tap to edit</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeIngredient(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.removeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Ingredients</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Captured image or placeholder */}
      {capturedImageUri ? (
        <Image source={{ uri: capturedImageUri }} style={styles.capturedImage} resizeMode="cover" />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderEmoji}>📷</Text>
          <Text style={styles.imagePlaceholderText}>Photo captured</Text>
        </View>
      )}

      {/* Count badge */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Detected Ingredients</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{ingredients.length}</Text>
        </View>
        <Text style={styles.listHint}>Tap any item to rename it</Text>
      </View>

      <FlatList
        data={ingredients}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        style={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        keyboardShouldPersistTaps="handled"
      />

      {/* Add ingredient */}
      <TouchableOpacity style={styles.addButton} onPress={addIngredient} activeOpacity={0.7}>
        <Text style={styles.addButtonText}>+ Add Ingredient</Text>
      </TouchableOpacity>

      {/* Bottom actions */}
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.retakeButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.retakeButtonText}>← Retake</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.confirmButton, ingredients.length === 0 && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          activeOpacity={0.85}
          disabled={ingredients.length === 0}
        >
          <Text style={styles.confirmButtonText}>Find Recipes →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },

  // ── Header ────────────────────────────────────────────────
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
  backButton: { width: 60 },
  backButtonText: { fontSize: 15, color: Colors.sage, fontWeight: '500' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.ink },

  // ── Photo preview ────────────────────────────────────────
  capturedImage: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    height: 180,
    borderRadius: Radius.xl,
  },
  imagePlaceholder: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    height: 140,
    borderRadius: Radius.xl,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imagePlaceholderEmoji: { fontSize: 36 },
  imagePlaceholderText: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },

  // ── List header ──────────────────────────────────────────
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: 8,
  },
  listTitle: { fontSize: 16, fontWeight: '700', color: Colors.ink },
  countBadge: {
    backgroundColor: Colors.sage,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: { fontSize: 12, fontWeight: '700', color: Colors.card },
  listHint: { flex: 1, fontSize: 11, color: Colors.muted, textAlign: 'right' },

  // ── Ingredient rows ──────────────────────────────────────
  list: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.lg, paddingBottom: 8 },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    gap: 12,
    ...Shadow.sm,
  },
  ingredientBullet: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.sage,
  },
  ingredientTextWrapper: { flex: 1 },
  ingredientText: { fontSize: 15, color: Colors.ink, fontWeight: '500' },
  editHint: { fontSize: 10, color: Colors.placeholder, marginTop: 2 },
  ingredientInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.ink,
    fontWeight: '500',
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.sage,
    paddingBottom: 2,
  },
  removeButton: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.terracottaLight,
    justifyContent: 'center', alignItems: 'center',
  },
  removeButtonText: { fontSize: 10, color: Colors.terracotta, fontWeight: '700' },

  // ── Add ingredient ───────────────────────────────────────
  addButton: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    paddingVertical: 12,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.sage,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addButtonText: { fontSize: 14, fontWeight: '600', color: Colors.sage },

  // ── Bottom actions ───────────────────────────────────────
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  retakeButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  retakeButtonText: { fontSize: 15, fontWeight: '600', color: Colors.muted },
  confirmButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: Radius.lg,
    backgroundColor: Colors.sage,
    alignItems: 'center',
    ...Shadow.sage,
  },
  confirmButtonDisabled: {
    backgroundColor: Colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: { fontSize: 15, fontWeight: '700', color: Colors.card },
});
