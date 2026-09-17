import { useState, useEffect, useCallback, useMemo } from 'react';
import { adminSettingsService } from '../../../services/adminSettingsService';
import type {
  AdminSystemSettingsResponse,
  UpdateSystemSettingsRequest,
} from '../../../types/settings.types';

export const useAdminSettings = () => {
  const [data, setData] = useState<AdminSystemSettingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<UpdateSystemSettingsRequest>({
    userSuspensionThreshold: 3,
    shopSuspensionThreshold: 3,
    qrExpirationMinutes: 30,
  });

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminSettingsService.getSettings();
      setData(res);
      setFormData({
        userSuspensionThreshold: res.trustSettings.userSuspensionThreshold,
        shopSuspensionThreshold: res.trustSettings.shopSuspensionThreshold,
        qrExpirationMinutes: res.pickupSettings.qrExpirationMinutes,
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load platform system settings.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const isDirty = useMemo(() => {
    if (!data) return false;
    return (
      formData.userSuspensionThreshold !== data.trustSettings.userSuspensionThreshold ||
      formData.shopSuspensionThreshold !== data.trustSettings.shopSuspensionThreshold ||
      formData.qrExpirationMinutes !== data.pickupSettings.qrExpirationMinutes
    );
  }, [data, formData]);

  const setField = useCallback((field: keyof UpdateSystemSettingsRequest, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const resetForm = useCallback(() => {
    if (!data) return;
    setFormData({
      userSuspensionThreshold: data.trustSettings.userSuspensionThreshold,
      shopSuspensionThreshold: data.trustSettings.shopSuspensionThreshold,
      qrExpirationMinutes: data.pickupSettings.qrExpirationMinutes,
    });
    setValidationErrors({});
    setSaveSuccess(false);
  }, [data]);

  const validate = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.userSuspensionThreshold || formData.userSuspensionThreshold < 1 || formData.userSuspensionThreshold > 20) {
      errors.userSuspensionThreshold = 'User suspension threshold must be between 1 and 20';
    }
    if (!formData.shopSuspensionThreshold || formData.shopSuspensionThreshold < 1 || formData.shopSuspensionThreshold > 20) {
      errors.shopSuspensionThreshold = 'Shop suspension threshold must be between 1 and 20';
    }
    if (!formData.qrExpirationMinutes || formData.qrExpirationMinutes < 5 || formData.qrExpirationMinutes > 180) {
      errors.qrExpirationMinutes = 'QR token lifetime must be between 5 and 180 minutes';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const saveSettings = useCallback(async () => {
    if (!validate()) return;

    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const res = await adminSettingsService.updateSettings(formData);
      setData(res);
      setFormData({
        userSuspensionThreshold: res.trustSettings.userSuspensionThreshold,
        shopSuspensionThreshold: res.trustSettings.shopSuspensionThreshold,
        qrExpirationMinutes: res.pickupSettings.qrExpirationMinutes,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to update system settings.'
      );
    } finally {
      setSaving(false);
    }
  }, [formData, validate]);

  return {
    data,
    loading,
    error,
    saving,
    saveSuccess,
    formData,
    validationErrors,
    isDirty,
    setField,
    resetForm,
    saveSettings,
    refetch: fetchSettings,
  };
};
