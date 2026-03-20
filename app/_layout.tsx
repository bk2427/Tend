import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useAppContext } from '../context/AppContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Colors } from '../constants/theme';

/**
 * Renders a cream-coloured splash while AsyncStorage hydration completes.
 * This prevents a flash of empty/default state on launch (e.g. blank name,
 * empty diary) before persisted data has been read.
 */
function HydrationGate({ children }: { children: React.ReactNode }) {
  const { hydrated } = useAppContext();

  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.cream, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.sage} size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <HydrationGate>
          <StatusBar style="dark" />
          <ErrorBoundary>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.cream },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="diary" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="profile" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="ingredient-confirmation" />
            <Stack.Screen name="recipe-list" />
            <Stack.Screen name="recipe-detail" />
            <Stack.Screen name="journal-entry" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="insight-report" options={{ animation: 'slide_from_bottom' }} />
          </Stack>
          </ErrorBoundary>
        </HydrationGate>
      </AppProvider>
    </SafeAreaProvider>
  );
}
