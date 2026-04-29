// ==========================================
// Snitch 2.0 — Signup Screen
// Firebase Auth + Form Validation
// ==========================================

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
import {
  validateEmail,
  validatePassword,
  validateName,
  validateConfirmPassword,
} from '../../utils/validation';
import Colors from '../../constants/colors';

export default function SignupScreen() {
  const { signup, isLoading, error, clearError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleSignup = useCallback(async () => {
    clearError();
    const nameResult = validateName(name);
    const emailResult = validateEmail(email);
    const passwordResult = validatePassword(password);
    const confirmResult = validateConfirmPassword(password, confirmPassword);

    if (
      !nameResult.isValid ||
      !emailResult.isValid ||
      !passwordResult.isValid ||
      !confirmResult.isValid
    ) {
      setErrors({
        name: nameResult.error,
        email: emailResult.error,
        password: passwordResult.error,
        confirmPassword: confirmResult.error,
      });
      return;
    }

    setErrors({});
    try {
      await signup(email, password, name);
      router.replace('/(drawer)/(tabs)');
    } catch (err: any) {
      Alert.alert('Signup Failed', err.message || 'Please try again');
    }
  }, [name, email, password, confirmPassword, signup, clearError]);

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
          {/* Header */}
          <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(600)}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>
              Join Snitch and discover the latest fashion trends
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              icon="person-outline"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
              error={errors.name}
            />

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
              placeholder="Create a password"
              icon="lock-closed-outline"
              isPassword
              value={password}
              onChangeText={setPassword}
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              icon="shield-checkmark-outline"
              isPassword
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Button
              title="Create Account"
              onPress={handleSignup}
              loading={isLoading}
              size="large"
              style={styles.signupButton}
            />
          </Animated.View>

          {/* Footer */}
          <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.footer}>
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.loginLink}>Sign In</Text>
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
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  backArrow: {
    fontSize: 28,
    color: Colors.textPrimary,
    fontWeight: '300',
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
    marginBottom: 32,
    lineHeight: 22,
  },
  form: {
    marginBottom: 24,
  },
  errorText: {
    fontSize: 13,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  signupButton: {
    width: '100%',
    marginTop: 8,
  },
  footer: {
    marginTop: 'auto',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
