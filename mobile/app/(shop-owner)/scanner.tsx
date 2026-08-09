import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';

import { ShopOwnerService } from '../../services/shopOwner.service';
import { PickupVerificationResponse } from '../../types';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';

export default function ShopOwnerScannerScreen() {
  const router = useRouter();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [result, setResult] = useState<PickupVerificationResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleBarcodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (scanned || verifying) return;
    setScanned(true);
    setVerifying(true);
    setErrorMsg(null);
    setResult(null);

    try {
      // Send opaque token string directly to backend verification API
      const response = await ShopOwnerService.verifyPickup(data.trim());
      setResult(response);
    } catch (err: any) {
      console.error('[ShopOwnerScannerScreen] QR verification error:', err);
      const msg =
        err.response?.data?.message ||
        'Invalid or unrecognized pickup QR pass. Please try scanning again.';
      setErrorMsg(msg);
    } finally {
      setVerifying(false);
    }
  };

  const handleResetScanner = () => {
    setResult(null);
    setErrorMsg(null);
    setScanned(false);
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.centeredContent}>
          <ActivityIndicator size="large" color={Colors.primaryDeep} />
          <Text style={styles.loadingText}>Initializing camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.centeredContent}>
          <Ionicons name="camera-outline" size={64} color={Colors.primaryDeep} />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionSub}>
            QueueLess requires camera access to scan customer express pickup QR passes.
          </Text>
          <Button
            title="Grant Camera Access"
            onPress={requestPermission}
            style={styles.permissionBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header Bar */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Express QR Scanner</Text>
        <Text style={styles.headerSub}>Scan customer QR code to verify pickup</Text>
      </View>

      {/* Camera View or Verification Result Box */}
      <View style={styles.cameraBoxContainer}>
        {verifying ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.primaryDeep} />
            <Text style={styles.verifyingText}>Verifying token with backend...</Text>
          </View>
        ) : result ? (
          <View style={styles.resultCard}>
            <Ionicons name="checkmark-circle" size={60} color={Colors.success} />
            <Text style={styles.resultTitle}>✓ Pickup Verified!</Text>
            <Text style={styles.resultShopName}>{result.shopName || 'Express Shop'}</Text>

            {result.orderId && (
              <Text style={styles.resultOrderText}>
                Order #{result.orderId.slice(0, 8).toUpperCase()}
              </Text>
            )}

            <Text style={styles.resultMsg}>
              {result.message || 'Customer express pickup has been verified and marked collected.'}
            </Text>

            <View style={styles.resultActionRow}>
              {result.orderId && (
                <Button
                  title="View Order Details"
                  onPress={() => router.push(`/(shop-owner)/order/${result.orderId}` as any)}
                  style={styles.resultBtn}
                />
              )}
              <Button
                title="Scan Next Code"
                variant="outline"
                onPress={handleResetScanner}
                style={styles.resultBtn}
              />
            </View>
          </View>
        ) : errorMsg ? (
          <View style={styles.errorCard}>
            <Ionicons name="close-circle-outline" size={56} color={Colors.error} />
            <Text style={styles.errorTitle}>Verification Failed</Text>
            <Text style={styles.errorSub}>{errorMsg}</Text>

            <Button
              title="Scan Again"
              onPress={handleResetScanner}
              style={styles.errorBtn}
            />
          </View>
        ) : (
          <View style={styles.cameraWrapper}>
            <CameraView
              style={styles.cameraView}
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            >
              <View style={styles.scannerOverlay}>
                <View style={styles.targetFrame} />
                <Text style={styles.targetInstruction}>
                  Align customer QR code within the frame
                </Text>
              </View>
            </CameraView>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerRow: {
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.xs,
    paddingBottom: Theme.spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  headerSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  centeredContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.lg,
  },
  loadingText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.secondaryText,
    marginTop: Theme.spacing.sm,
  },
  permissionTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginTop: Theme.spacing.md,
  },
  permissionSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginVertical: Theme.spacing.sm,
  },
  permissionBtn: {
    width: '100%',
    marginTop: Theme.spacing.md,
  },
  cameraBoxContainer: {
    flex: 1,
    margin: Theme.spacing.md,
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cameraWrapper: { flex: 1 },
  cameraView: { flex: 1 },
  scannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetFrame: {
    width: 240,
    height: 240,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 3,
    borderColor: Colors.lightSage,
    backgroundColor: 'transparent',
  },
  targetInstruction: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
    marginTop: Theme.spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
  },
  loadingOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.lg,
  },
  verifyingText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.primaryDeep,
    marginTop: Theme.spacing.md,
  },
  resultCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.lg,
    backgroundColor: Colors.white,
  },
  resultTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.success,
    marginTop: Theme.spacing.xs,
  },
  resultShopName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginTop: 4,
  },
  resultOrderText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  resultMsg: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginVertical: Theme.spacing.md,
  },
  resultActionRow: {
    width: '100%',
    gap: Theme.spacing.xs,
  },
  resultBtn: {
    width: '100%',
  },
  errorCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.lg,
    backgroundColor: Colors.white,
  },
  errorTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.error,
    marginTop: Theme.spacing.xs,
  },
  errorSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginVertical: Theme.spacing.md,
    lineHeight: Typography.lineHeight.sm,
  },
  errorBtn: {
    width: '100%',
  },
});
