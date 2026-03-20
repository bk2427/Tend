// ─────────────────────────────────────────────────────────────────────────────
// Tend — Design Tokens
// Warm, calming, trustworthy. Built for people managing health through food.
// ─────────────────────────────────────────────────────────────────────────────

export const Colors = {
  // Backgrounds
  cream: '#FDFAF5',        // App background — warm, never clinical white
  card: '#FFFFFF',          // Card surfaces
  cardWarm: '#FBF8F2',     // Slightly warm card variant

  // Brand
  sage: '#5C7A5C',          // Primary — grounded, natural
  sageMid: '#7A9E7A',       // Mid sage for icons/borders
  sageLight: '#EBF2EB',     // Chip backgrounds, subtle fills
  sageDark: '#3D5C3D',      // Dark sage for pressed states

  // Accent
  terracotta: '#C4704F',    // Accent — warmth, life, highlights
  terracottaLight: '#FAF0EB', // Symptom tag backgrounds, warnings

  // Text
  ink: '#2C2416',           // Primary text — warm near-black
  muted: '#8C7E6E',         // Secondary / caption text
  placeholder: '#B8ADA0',   // Input placeholders

  // Borders & Dividers
  border: '#EDE8E0',        // Standard border
  divider: '#F0EBE3',       // Section dividers

  // Status
  reviewed: '#5C7A5C',      // Reviewed pill — sage
  pending: '#C4704F',       // Awaiting review pill — terracotta
  error: '#B94040',         // Errors

  // Tags
  tagDefault: '#F5F0E8',    // Unselected tag background
  tagDefaultText: '#6B5E4E', // Unselected tag text
  tagSymptom: '#FAF0EB',    // Symptom tag unselected bg
  tagSymptomText: '#8C5A3A', // Symptom tag text

  // Neutral
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#2C2416',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#2C2416',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#2C2416',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  sage: {
    shadowColor: '#5C7A5C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

export const Typography = {
  hero: {
    fontSize: 34,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
    lineHeight: 42,
    color: Colors.ink,
  },
  h1: {
    fontSize: 26,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    color: Colors.ink,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
    color: Colors.ink,
  },
  h3: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.ink,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
    color: Colors.ink,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: Colors.muted,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
    color: Colors.muted,
  },
} as const;
