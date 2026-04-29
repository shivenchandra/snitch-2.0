import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { validateEmail, validatePassword } from '../../utils/validation';
import Colors from '../../constants/colors';
export default function LoginScreen() {
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const handleLogin = useCallback(async () => {
    clearError();
    const emailResult = validateEmail(email);
    const passwordResult = validatePassword(password);
    if (!emailResult.isValid || !passwordResult.isValid) {
      setErrors({
        email: emailResult.error,
        password: passwordResult.error,
      });
      return;
    }
    setErrors({});
    try {
      await login(email, password);
      router.replace('/(drawer)/(tabs)');
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Please check your credentials');
    }
  }, [email, password, login, clearError]);
  const handleSkip = useCallback(() => {
    router.replace('/(drawer)/(tabs)');
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {}
          <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.header}>
            <Text style={styles.brand}>SNITCH</Text>
            <Text style={styles.brandSub}>2.0</Text>
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(200).duration(600)}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to your account to continue shopping</Text>
          </Animated.View>
          {}
          <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.form}>
            <Input
              label="Email"
              placeholder="Enter your email"
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              icon="lock-closed-outline"
              isPassword
              value={password}
              onChangeText={setPassword}
              error={errors.password}
            />
            <TouchableOpacity style={styles.forgotButton}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error}</Text>}
            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              size="large"
              style={styles.loginButton}
            />
          </Animated.View>
          {}
          <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.footer}>
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>
            <Button
              title="Skip for now"
              onPress={handleSkip}
              variant="outline"
              size="large"
              style={styles.skipButton}
            />
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 40,
  },
  brand: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 6,
  },
  brandSub: {
    fontSize: 16,
    fontWeight: '300',
    color: Colors.textTertiary,
    marginLeft: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 36,
    lineHeight: 22,
  },
  form: {
    marginBottom: 24,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -4,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  errorText: {
    fontSize: 13,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  loginButton: {
    width: '100%',
  },
  footer: {
    marginTop: 'auto',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginHorizontal: 16,
  },
  skipButton: {
    width: '100%',
    marginBottom: 24,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
