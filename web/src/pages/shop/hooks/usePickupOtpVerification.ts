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

  // Verify OTP and Complete Handover
  const handleVerifyAndHandover = useCallback(
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

        // Mark order as COLLECTED
        await pickupOtpService.completeShopOrder(response.orderId);
        setCompleteSuccess(true);
        if (onOrderCompleted) {
          onOrderCompleted(response.orderId);
        }
      } catch (err: any) {
        const rawMsg = err?.response?.data?.message || err?.message || '';
        let msg = 'Invalid pickup OTP.';
        if (rawMsg.toLowerCase().includes('expired')) {
          msg = 'Pickup OTP has expired. Ask the customer to generate a new OTP.';
        } else if (rawMsg.toLowerCase().includes('not ready')) {
          msg = 'Order is not ready for pickup.';
        } else if (rawMsg.toLowerCase().includes('invalid') || rawMsg.toLowerCase().includes('digit') || rawMsg.toLowerCase().includes('not found')) {
          msg = 'Invalid pickup OTP.';
        } else if (rawMsg.toLowerCase().includes('authorized') || rawMsg.toLowerCase().includes('another shop')) {
          msg = 'You are not authorized to verify this order.';
        } else if (rawMsg.toLowerCase().includes('already been collected') || rawMsg.toLowerCase().includes('consumed')) {
          msg = 'Order has already been collected.';
        } else if (rawMsg) {
          msg = rawMsg;
        }
        setError(msg);
        setVerifiedOrder(null);
        setCompleteSuccess(false);
      } finally {
        setLoading(false);
      }
    },
    [otp, onOrderCompleted]
  );

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
    handleVerify: handleVerifyAndHandover,
    handleComplete: handleVerifyAndHandover,
    handleVerifyAndHandover,
    reset,
  };
};
