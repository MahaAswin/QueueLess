import { useState, useEffect, useCallback, useRef } from 'react';
import { pickupOtpService } from '../../../services/pickupOtpService';
import type { CustomerPickupOtpResponse } from '../../../types/otp.types';

export const usePickupOtp = (orderId?: string, isEligible = false) => {
  const [otpData, setOtpData] = useState<CustomerPickupOtpResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState<boolean>(false);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOtp = useCallback(
    async (silent = false) => {
      if (!orderId || !isEligible) return;

      if (!silent) setLoading(true);
      setError(null);

      try {
        const data = await pickupOtpService.getCustomerOtp(orderId);
        setOtpData(data);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message || 'Failed to generate pickup OTP. Please try again.';
        setError(msg);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [orderId, isEligible]
  );

  useEffect(() => {
    if (isEligible && orderId) {
      fetchOtp();
    }
  }, [fetchOtp, isEligible, orderId]);

  // Expiration countdown
  useEffect(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    if (!otpData?.expiresAt) {
      setTimeLeft('');
      setIsExpired(false);
      return;
    }

    const updateCountdown = () => {
      const expiry = new Date(otpData.expiresAt).getTime();
      const now = new Date().getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        setIsExpired(true);
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
      } else {
        const totalSeconds = Math.max(0, Math.floor(diff / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        setTimeLeft(`${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`);
        setIsExpired(false);
      }
    };

    updateCountdown();
    countdownRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [otpData?.expiresAt]);

  return {
    otpData,
    loading,
    error,
    timeLeft,
    isExpired,
    refetchOtp: () => fetchOtp(false),
  };
};
