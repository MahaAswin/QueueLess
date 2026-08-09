import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SectionHeader } from '../../components/SectionHeader';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';

export default function ShopScannerScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color={Colors.primaryDeep} />
        <Text style={styles.backText}>Back to Dashboard</Text>
      </TouchableOpacity>

      <SectionHeader title="Express Counter Scanner" subtitle="Scan customer ticket QR code to verify & complete handoff" />

      <View style={styles.scannerBox}>
        <Ionicons name="qr-code-outline" size={160} color={Colors.primaryDeep} />
        <Text style={styles.scannerPrompt}>Position QR pass inside scanner frame</Text>
      </View>

      <Button title="Simulate Successful Scan (Verify Order)" onPress={() => router.push('/(shop)/orders')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Theme.spacing.md, paddingTop: Theme.spacing.xl + 10 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: Theme.spacing.md },
  backText: { color: Colors.primaryDeep, fontFamily: Typography.fontFamily.semibold, fontSize: Typography.fontSize.sm, marginLeft: Theme.spacing.xs },
  scannerBox: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.sage,
    borderStyle: 'dashed',
    marginBottom: Theme.spacing.lg,
  },
  scannerPrompt: { fontSize: Typography.fontSize.sm, color: Colors.secondaryText, marginTop: Theme.spacing.md, fontFamily: Typography.fontFamily.medium },
});
