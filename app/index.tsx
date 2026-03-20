import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, Image, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useAppContext } from '../context/AppContext';
import { detectIngredients } from '../services/claude';
import { Colors, Radius, Shadow, Spacing } from '../constants/theme';

// Deep forest green used for all text + buttons on this screen
const FOREST = '#2B4A2B';
const SERIF = Platform.OS === 'ios' ? 'Georgia' : 'serif';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { clearSession, setCapturedImageUri, setConfirmedIngredients, userName } = useAppContext();
  const [loading, setLoading] = useState(false);

  async function handleSnap() {
    clearSession();
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission',
        'Camera access is needed to scan your ingredients.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Choose from Library', onPress: handleLibrary },
        ]
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'], quality: 0.8,
    });
    if (result.canceled) return;
    await processImage(result.assets[0]);
  }

  async function handleLibrary() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access in Settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], quality: 0.8,
    });
    if (result.canceled) return;
    await processImage(result.assets[0]);
  }

  async function processImage(asset: ImagePicker.ImagePickerAsset) {
    setLoading(true);
    try {
      setCapturedImageUri(asset.uri);

      // Resize to max 1024px on longest edge before base64-encoding.
      // Modern phone cameras produce 4000×3000px+ images (~15 MB base64).
      // Claude Vision identifies ingredients equally well at 1024px,
      // so we shrink the payload by ~85% with no accuracy cost.
      const { width, height } = asset;
      const MAX = 1024;
      const needsResize = width > MAX || height > MAX;
      const resized = needsResize
        ? await ImageManipulator.manipulateAsync(
            asset.uri,
            [{ resize: width >= height ? { width: MAX } : { height: MAX } }],
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
          )
        : { base64: asset.base64 };

      const ingredients = await detectIngredients(resized.base64 ?? '');
      setConfirmedIngredients(ingredients);
      router.push('/ingredient-confirmation');
    } catch {
      Alert.alert('Scan failed', 'Could not read your ingredients. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Derive avatar initial from name
  const initial = userName.trim().charAt(0).toUpperCase();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* ── Top bar ─────────────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => router.push('/profile')}
          activeOpacity={0.75}
        >
          {userName ? (
            <Text style={styles.profileName}>{userName}</Text>
          ) : null}
          <View style={styles.profileAvatar}>
            {initial ? (
              <Text style={styles.profileInitial}>{initial}</Text>
            ) : (
              <Text style={styles.profileInitial}>👤</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Title ───────────────────────────────────────── */}
      <View style={styles.titleSection}>
        <Text style={styles.appName}>Tend.</Text>
        <Text style={styles.tagline}>
          Healing starts from what's{'\n'}already in your home
        </Text>
      </View>

      {/* ── Garden illustration ─────────────────────────── */}
      <View style={styles.imageWrap}>
        <Image
          source={require('../assets/garden.png')}
          style={styles.gardenImage}
          resizeMode="contain"
        />
      </View>

      {/* ── CTA buttons ─────────────────────────────────── */}
      <View style={[styles.buttons, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <TouchableOpacity
          style={[styles.mainBtn, loading && styles.btnDisabled]}
          onPress={handleSnap}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.cream} size="small" />
          ) : (
            <Text style={styles.mainBtnText}>📷   Snap your ingredients</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mainBtn}
          onPress={() => router.push('/diary')}
          activeOpacity={0.85}
          disabled={loading}
        >
          <Text style={styles.mainBtnText}>📖   View your food journal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.libraryLink}
          onPress={handleLibrary}
          activeOpacity={0.7}
          disabled={loading}
        >
          <Text style={styles.libraryLinkText}>Choose from Photo Library</Text>
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

  // ── Top bar ────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '600',
    color: FOREST,
    textDecorationLine: 'underline',
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: FOREST,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.cream,
  },

  // ── Title ──────────────────────────────────────────────
  titleSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  appName: {
    fontFamily: SERIF,
    fontSize: 72,
    fontWeight: '700',
    color: FOREST,
    letterSpacing: -1,
    lineHeight: 78,
  },
  tagline: {
    fontFamily: SERIF,
    fontSize: 20,
    color: FOREST,
    textAlign: 'center',
    lineHeight: 30,
    marginTop: Spacing.sm,
    opacity: 0.85,
  },

  // ── Garden image ───────────────────────────────────────
  imageWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  gardenImage: {
    width: '100%',
    height: '100%',
  },

  // ── Buttons ────────────────────────────────────────────
  buttons: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  mainBtn: {
    backgroundColor: FOREST,
    borderRadius: Radius.md,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  btnDisabled: { opacity: 0.65 },
  mainBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.cream,
    letterSpacing: 0.2,
  },
  libraryLink: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  libraryLinkText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.muted,
    textDecorationLine: 'underline',
  },
});
