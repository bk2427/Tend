import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '../constants/theme';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches unhandled runtime errors in the screen tree and renders a
 * recovery screen instead of a blank white crash. The "Try Again" button
 * resets state so the user can attempt to continue without restarting.
 *
 * In production, componentDidCatch is the right place to send errors to
 * a logging service (Sentry, Datadog, etc.).
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Production: replace with your error reporting service
    console.error('[ErrorBoundary] Uncaught error:', error.message, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            An unexpected error occurred. Tap below to try again.
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReset} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
    gap: Spacing.lg,
  },
  emoji: { fontSize: 48 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.ink,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: Spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: Radius.lg,
    backgroundColor: Colors.sage,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.card,
  },
});
