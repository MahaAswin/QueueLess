import { useState, useCallback } from 'react';
import { pickupOtpService } from '../../../services/pickupOtpService';
import type { ShopVerifiedPickupResponse } from '../../../types/otp.types';

export const usePickupOtpVerification = (onOrderCompleted?: (orderId: string) => void) => {
  const [otp, setOtp] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [verifiedOrder, setVerifiedOrder] = useState<ShopVerifiedPickupResponse | null>(null);

  const [completing, setCompleting] = useState<boolean>(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [completeSuccess, setCompleteSuccess] = useState<boolean>(false);

  // Validate & set digits only
  const handleOtpChange = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setOtp(cleaned);
    setError(null);
  }, []);

  // Verify OTP
  const handleVerify = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      if (!otp || otp.length !== 6) {
        setError('Please enter a valid 6-digit numeric OTP.');
        return;
      }

      setLoading(true);
      setError(null);
      setCompleteSuccess(false);
      setCompleteError(null);

      try {
        const response = await pickupOtpService.verifyPickupOtp(otp);
        setVerifiedOrder(response);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          'Failed to verify OTP. It may be invalid, expired, or belong to another shop.';
        setError(msg);
        setVerifiedOrder(null);
      } finally {
        setLoading(false);
      }
    },
    [otp]
  );

  // Mark Order Completed explicitly
  const handleComplete = useCallback(async () => {
    if (!verifiedOrder?.orderId) return;

    setCompleting(true);
    setCompleteError(null);

    try {
      await pickupOtpService.completeShopOrder(verifiedOrder.orderId);
      setCompleteSuccess(true);
      if (onOrderCompleted) {
        onOrderCompleted(verifiedOrder.orderId);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        'Failed to complete the order. Please try again.';
      setCompleteError(msg);
    } finally {
      setCompleting(false);
    }
  }, [verifiedOrder, onOrderCompleted]);

  const reset = useCallback(() => {
    setOtp('');
    setLoading(false);
    setError(null);
    setVerifiedOrder(null);
    setCompleting(false);
    setCompleteError(null);
    setCompleteSuccess(false);
  }, []);

  return {
    otp,
    setOtp: handleOtpChange,
    loading,
    error,
    verifiedOrder,
    completing,
    completeError,
    completeSuccess,
    handleVerify,
    handleComplete,
    reset,
  };
};
