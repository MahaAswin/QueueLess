import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'SHOP_OWNER'>('CUSTOMER');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async () => {
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please enter your phone number');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      const user = await register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        role,
      });

      setLoading(false);
      if (user.role === 'SHOP_OWNER') {
        router.replace('/(shop)/dashboard' as any);
      } else {
        router.replace('/(customer)' as any);
      }
    } catch (err: any) {
      setLoading(false);
      const message =
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please check backend connection.';
      setErrorMsg(message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Ionicons name="flash" size={28} color={Colors.white} />
            </View>
            <Text style={styles.title}>Join QueueLess</Text>
            <Text style={styles.subtitle}>
              Create an account to skip waiting lines & pre-order instantly.
            </Text>
          </View>

          {/* Role Toggle */}
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleTab, role === 'CUSTOMER' && styles.activeRoleTab]}
              onPress={() => setRole('CUSTOMER')}
            >
              <Ionicons
                name="person-outline"
                size={18}
                color={role === 'CUSTOMER' ? Colors.white : Colors.secondaryText}
              />
              <Text
                style={[
                  styles.roleTabText,
                  role === 'CUSTOMER' && styles.activeRoleTabText,
                ]}
              >
                Customer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleTab, role === 'SHOP_OWNER' && styles.activeRoleTab]}
              onPress={() => setRole('SHOP_OWNER')}
            >
              <Ionicons
                name="storefront-outline"
                size={18}
                color={role === 'SHOP_OWNER' ? Colors.white : Colors.secondaryText}
              />
              <Text
                style={[
                  styles.roleTabText,
                  role === 'SHOP_OWNER' && styles.activeRoleTabText,
                ]}
              >
                Shop Partner
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Banner */}
          {errorMsg && (
            <View style={styles.errorCard}>
              <Ionicons name="alert-circle-outline" size={18} color={Colors.error} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* Form */}
          <Input
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="e.g. Aswin Kumar"
            leftIcon={<Ionicons name="person-outline" size={20} color={Colors.secondaryText} />}
          />

          <Input
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="aswin@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Ionicons name="mail-outline" size={20} color={Colors.secondaryText} />}
          />

          <Input
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="+91 9876543210"
            keyboardType="phone-pad"
            leftIcon={<Ionicons name="call-outline" size={20} color={Colors.secondaryText} />}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            secureTextEntry
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={Colors.secondaryText} />}
          />

          <Button
            title={loading ? 'Creating Account...' : 'Register Account'}
            onPress={handleRegister}
            isLoading={loading}
            style={styles.registerButton}
          />

          {/* Login Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    marginBottom: Theme.spacing.lg,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: Theme.borderRadius.lg,
    backgroundColor: Colors.primaryDeep,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.secondaryText,
    lineHeight: 20,
  },
  roleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.lightSage,
    borderRadius: Theme.borderRadius.md,
    padding: 4,
    marginBottom: Theme.spacing.lg,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.xs + 4,
    borderRadius: Theme.borderRadius.sm,
  },
  activeRoleTab: {
    backgroundColor: Colors.primaryDeep,
  },
  roleTabText: {
    fontSize: Typography.fontSize.xs + 1,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.secondaryText,
    marginLeft: 6,
  },
  activeRoleTabText: {
    color: Colors.white,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.fontSize.xs + 1,
    fontFamily: Typography.fontFamily.medium,
    marginLeft: 8,
    flex: 1,
  },
  registerButton: {
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.lg,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.secondaryText,
    marginRight: 6,
  },
  loginLink: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryDeep,
  },
});
