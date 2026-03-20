import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadow } from '../constants/theme';

const TABS = [
  { route: '/',        label: 'Cook',   icon: '🍽️'  },
  { route: '/diary',   label: 'Diary',  icon: '📖'  },
  { route: '/profile', label: 'Profile', icon: '👤' },
] as const;

interface TabBarProps {
  active: 'cook' | 'diary' | 'profile';
}

export default function TabBar({ active }: TabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const activeIndex = active === 'cook' ? 0 : active === 'diary' ? 1 : 2;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 8 }, Shadow.md]}>
      {TABS.map((tab, i) => {
        const isActive = i === activeIndex;
        return (
          <TouchableOpacity
            key={tab.route}
            style={styles.tab}
            onPress={() => {
              if (!isActive) router.replace(tab.route);
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
              <Text style={styles.icon}>{tab.icon}</Text>
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  iconWrapper: {
    width: 44,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  iconWrapperActive: {
    backgroundColor: Colors.sageLight,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.muted,
  },
  labelActive: {
    color: Colors.sage,
    fontWeight: '700',
  },
});
