import React from 'react';
import {
  Settings,
  ShieldCheck,
  QrCode,
  RefreshCw,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  Sparkles,
  Sliders,
  ShieldAlert,
  Flame,
} from 'lucide-react';
import { useAdminSettings } from './hooks/useAdminSettings';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/feedback/ErrorState';
import { formatDateLong } from '../../utils/formatters';

export const AdminSettingsPage: React.FC = () => {
  const {
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
    refetch,
  } = useAdminSettings();

  // One-click Governance Profiles
  const applyProfile = (userThresh: number, shopThresh: number, qrExp: number) => {
    setField('userSuspensionThreshold', userThresh);
    setField('shopSuspensionThreshold', shopThresh);
    setField('qrExpirationMinutes', qrExp);
  };

  const isCurrentProfile = (userThresh: number, shopThresh: number, qrExp: number) => {
    return (
      formData.userSuspensionThreshold === userThresh &&
      formData.shopSuspensionThreshold === shopThresh &&
      formData.qrExpirationMinutes === qrExp
    );
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md, 8px)',
              backgroundColor: 'var(--color-tint, #F0FDF4)',
              border: '1px solid #BBF7D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary, #0F5132)',
            }}
          >
            <Settings size={22} />
          </div>
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: 'var(--color-text-main, #1F2937)',
                margin: 0,
                letterSpacing: '-0.3px',
              }}
            >
              System Settings & Governance
            </h1>
            <p
              style={{
                color: 'var(--color-text-muted, #6B7280)',
                fontSize: 13,
                margin: '3px 0 0 0',
              }}
            >
              Configure trust & safety thresholds, automated dispute penalties, and express QR operations
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={refetch}
            disabled={loading || saving}
            icon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
          >
            Refresh
          </Button>

          {isDirty && (
            <Button
              variant="secondary"
              size="sm"
              onClick={resetForm}
              disabled={saving}
              icon={<RotateCcw size={14} />}
            >
              Reset
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={saveSettings}
            disabled={!isDirty || saving}
            icon={<Save size={14} className={saving ? 'animate-spin' : ''} />}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccess && (
        <div
          style={{
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: 'var(--radius-md, 8px)',
            padding: '12px 18px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: 'var(--color-primary, #0F5132)',
            fontSize: 13.5,
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} color="#16A34A" />
          <span>Governance thresholds successfully updated and synchronized across all runtime services.</span>
        </div>
      )}

      {/* Unsaved Changes Banner */}
      {isDirty && !saveSuccess && (
        <div
          style={{
            backgroundColor: '#FFFBEB',
            border: '1px solid #FCD34D',
            borderRadius: 'var(--radius-md, 8px)',
            padding: '12px 18px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={18} color="#D97706" />
            <span style={{ fontSize: 13, color: '#92400E', fontWeight: 600 }}>
              You have unsaved configuration changes. Click "Save Changes" to apply them to runtime services.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button variant="secondary" size="sm" onClick={resetForm} disabled={saving}>
              Discard
            </Button>
            <Button variant="primary" size="sm" onClick={saveSettings} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}

      {/* Loading & Error States */}
      {loading && !data ? (
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <RefreshCw
            size={32}
            className="animate-spin"
            style={{ color: 'var(--color-primary, #0F5132)', margin: '0 auto 14px' }}
          />
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-main, #1F2937)' }}>
            Loading platform governance configuration...
          </div>
        </div>
      ) : error && !data ? (
        <ErrorState
          title="Unable to load system settings"
          message={error}
          onRetry={refetch}
        />
      ) : data ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.55fr) minmax(320px, 1fr)',
            gap: 24,
            alignItems: 'start',
          }}
        >
          {/* Left Column: Configurable Policies & Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Card 1: Trust & Safety Governance */}
            <div
              className="card"
              style={{
                padding: '24px',
                borderRadius: 'var(--radius-lg, 12px)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface, #FFFFFF)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    backgroundColor: 'var(--color-tint, #F0FDF4)',
                    border: '1px solid #BBF7D0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary, #0F5132)',
                  }}
                >
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      margin: 0,
                      color: 'var(--color-text-main, #1F2937)',
                    }}
                  >
                    Trust & Safety Governance
                  </h3>
                  <p
                    style={{
                      fontSize: 12,
                      color: 'var(--color-text-muted, #6B7280)',
                      margin: '2px 0 0 0',
                    }}
                  >
                    Automated suspension rules triggered by verified dispute infractions
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Control 1: Customer Suspension Threshold */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 6,
                    }}
                  >
                    <div>
                      <label
                        style={{
                          fontSize: 13.5,
                          fontWeight: 700,
                          color: 'var(--color-text-main, #1F2937)',
                        }}
                      >
                        Customer Suspension Threshold
                      </label>
                      <p
                        style={{
                          fontSize: 12,
                          color: 'var(--color-text-muted, #6B7280)',
                          margin: '2px 0 0 0',
                        }}
                      >
                        Verified infractions before a customer account is locked from placing orders
                      </p>
                    </div>

                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'var(--color-primary, #0F5132)',
                        backgroundColor: 'var(--color-tint, #F0FDF4)',
                        border: '1px solid #BBF7D0',
                        padding: '3px 10px',
                        borderRadius: 6,
                      }}
                    >
                      {formData.userSuspensionThreshold} Violations
                    </span>
                  </div>

                  {/* Slider with input */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginTop: 10,
                    }}
                  >
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.userSuspensionThreshold}
                      onChange={(e) =>
                        setField('userSuspensionThreshold', parseInt(e.target.value, 10))
                      }
                      style={{
                        flex: 1,
                        cursor: 'pointer',
                        accentColor: 'var(--color-primary, #0F5132)',
                        height: 6,
                      }}
                    />
                    <div
                      style={{
                        width: 50,
                        textAlign: 'center',
                        fontSize: 14,
                        fontWeight: 800,
                        color: 'var(--color-primary, #0F5132)',
                        backgroundColor: 'var(--color-surface-subtle, #F3F4F6)',
                        padding: '5px 8px',
                        borderRadius: 6,
                        border: '1px solid var(--color-border, #E5E7EB)',
                      }}
                    >
                      {formData.userSuspensionThreshold}
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginTop: 8,
                    }}
                  >
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted, #6B7280)', fontWeight: 600 }}>
                      Quick Set:
                    </span>
                    {[
                      { label: 'Strict (2)', val: 2 },
                      { label: 'Standard (3)', val: 3 },
                      { label: 'Lenient (5)', val: 5 },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => setField('userSuspensionThreshold', preset.val)}
                        style={{
                          fontSize: 11,
                          fontWeight: formData.userSuspensionThreshold === preset.val ? 700 : 500,
                          padding: '3px 8px',
                          borderRadius: 4,
                          border: '1px solid',
                          borderColor:
                            formData.userSuspensionThreshold === preset.val
                              ? 'var(--color-primary, #0F5132)'
                              : 'var(--color-border, #E5E7EB)',
                          backgroundColor:
                            formData.userSuspensionThreshold === preset.val
                              ? 'var(--color-tint, #F0FDF4)'
                              : 'transparent',
                          color:
                            formData.userSuspensionThreshold === preset.val
                              ? 'var(--color-primary, #0F5132)'
                              : 'var(--color-text-muted, #6B7280)',
                          cursor: 'pointer',
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {validationErrors.userSuspensionThreshold && (
                    <div style={{ color: '#EF4444', fontSize: 12, marginTop: 4, fontWeight: 600 }}>
                      {validationErrors.userSuspensionThreshold}
                    </div>
                  )}
                </div>

                <div style={{ height: 1, backgroundColor: 'var(--color-border, #E5E7EB)' }} />

                {/* Control 2: Shop Suspension Threshold */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 6,
                    }}
                  >
                    <div>
                      <label
                        style={{
                          fontSize: 13.5,
                          fontWeight: 700,
                          color: 'var(--color-text-main, #1F2937)',
                        }}
                      >
                        Merchant Outlet Suspension Threshold
                      </label>
                      <p
                        style={{
                          fontSize: 12,
                          color: 'var(--color-text-muted, #6B7280)',
                          margin: '2px 0 0 0',
                        }}
                      >
                        Verified infractions before a store is automatically suspended and delisted
                      </p>
                    </div>

                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#DC2626',
                        backgroundColor: '#FEE2E2',
                        border: '1px solid #FECACA',
                        padding: '3px 10px',
                        borderRadius: 6,
                      }}
                    >
                      {formData.shopSuspensionThreshold} Violations
                    </span>
                  </div>

                  {/* Slider with input */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginTop: 10,
                    }}
                  >
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.shopSuspensionThreshold}
                      onChange={(e) =>
                        setField('shopSuspensionThreshold', parseInt(e.target.value, 10))
                      }
                      style={{
                        flex: 1,
                        cursor: 'pointer',
                        accentColor: '#DC2626',
                        height: 6,
                      }}
                    />
                    <div
                      style={{
                        width: 50,
                        textAlign: 'center',
                        fontSize: 14,
                        fontWeight: 800,
                        color: '#DC2626',
                        backgroundColor: 'var(--color-surface-subtle, #F3F4F6)',
                        padding: '5px 8px',
                        borderRadius: 6,
                        border: '1px solid var(--color-border, #E5E7EB)',
                      }}
                    >
                      {formData.shopSuspensionThreshold}
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginTop: 8,
                    }}
                  >
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted, #6B7280)', fontWeight: 600 }}>
                      Quick Set:
                    </span>
                    {[
                      { label: 'Strict (2)', val: 2 },
                      { label: 'Standard (3)', val: 3 },
                      { label: 'Lenient (5)', val: 5 },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => setField('shopSuspensionThreshold', preset.val)}
                        style={{
                          fontSize: 11,
                          fontWeight: formData.shopSuspensionThreshold === preset.val ? 700 : 500,
                          padding: '3px 8px',
                          borderRadius: 4,
                          border: '1px solid',
                          borderColor:
                            formData.shopSuspensionThreshold === preset.val
                              ? '#DC2626'
                              : 'var(--color-border, #E5E7EB)',
                          backgroundColor:
                            formData.shopSuspensionThreshold === preset.val
                              ? '#FEE2E2'
                              : 'transparent',
                          color:
                            formData.shopSuspensionThreshold === preset.val
                              ? '#DC2626'
                              : 'var(--color-text-muted, #6B7280)',
                          cursor: 'pointer',
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {validationErrors.shopSuspensionThreshold && (
                    <div style={{ color: '#EF4444', fontSize: 12, marginTop: 4, fontWeight: 600 }}>
                      {validationErrors.shopSuspensionThreshold}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card 2: Express QR Pickup Lifetime */}
            <div
              className="card"
              style={{
                padding: '24px',
                borderRadius: 'var(--radius-lg, 12px)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface, #FFFFFF)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    backgroundColor: 'var(--color-tint, #F0FDF4)',
                    border: '1px solid #BBF7D0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary, #0F5132)',
                  }}
                >
                  <QrCode size={18} />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      margin: 0,
                      color: 'var(--color-text-main, #1F2937)',
                    }}
                  >
                    Express QR Pickup Operations
                  </h3>
                  <p
                    style={{
                      fontSize: 12,
                      color: 'var(--color-text-muted, #6B7280)',
                      margin: '2px 0 0 0',
                    }}
                  >
                    Customer pickup verification token security parameters
                  </p>
                </div>
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 6,
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: 'var(--color-text-main, #1F2937)',
                      }}
                    >
                      Pickup Token Lifetime
                    </label>
                    <p
                      style={{
                        fontSize: 12,
                        color: 'var(--color-text-muted, #6B7280)',
                        margin: '2px 0 0 0',
                      }}
                    >
                      Duration before a generated pickup QR code expires and requires renewal
                    </p>
                  </div>

                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--color-primary, #0F5132)',
                      backgroundColor: 'var(--color-tint, #F0FDF4)',
                      border: '1px solid #BBF7D0',
                      padding: '3px 10px',
                      borderRadius: 6,
                    }}
                  >
                    {formData.qrExpirationMinutes} Minutes
                  </span>
                </div>

                {/* Slider */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginTop: 10,
                  }}
                >
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={formData.qrExpirationMinutes}
                    onChange={(e) =>
                      setField('qrExpirationMinutes', parseInt(e.target.value, 10))
                    }
                    style={{
                      flex: 1,
                      cursor: 'pointer',
                      accentColor: 'var(--color-primary, #0F5132)',
                      height: 6,
                    }}
                  />
                  <div
                    style={{
                      width: 50,
                      textAlign: 'center',
                      fontSize: 14,
                      fontWeight: 800,
                      color: 'var(--color-primary, #0F5132)',
                      backgroundColor: 'var(--color-surface-subtle, #F3F4F6)',
                      padding: '5px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--color-border, #E5E7EB)',
                    }}
                  >
                    {formData.qrExpirationMinutes}m
                  </div>
                </div>

                {/* Quick Presets */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 8,
                  }}
                >
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted, #6B7280)', fontWeight: 600 }}>
                    Quick Set:
                  </span>
                  {[
                    { label: '15 min', val: 15 },
                    { label: '30 min (Default)', val: 30 },
                    { label: '45 min', val: 45 },
                    { label: '60 min', val: 60 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setField('qrExpirationMinutes', preset.val)}
                      style={{
                        fontSize: 11,
                        fontWeight: formData.qrExpirationMinutes === preset.val ? 700 : 500,
                        padding: '3px 8px',
                        borderRadius: 4,
                        border: '1px solid',
                        borderColor:
                          formData.qrExpirationMinutes === preset.val
                            ? 'var(--color-primary, #0F5132)'
                            : 'var(--color-border, #E5E7EB)',
                        backgroundColor:
                          formData.qrExpirationMinutes === preset.val
                            ? 'var(--color-tint, #F0FDF4)'
                            : 'transparent',
                        color:
                          formData.qrExpirationMinutes === preset.val
                            ? 'var(--color-primary, #0F5132)'
                            : 'var(--color-text-muted, #6B7280)',
                        cursor: 'pointer',
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {validationErrors.qrExpirationMinutes && (
                  <div style={{ color: '#EF4444', fontSize: 12, marginTop: 4, fontWeight: 600 }}>
                    {validationErrors.qrExpirationMinutes}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: One-Click Governance Profiles & Policy Protection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Card 1: One-Click Governance Profiles */}
            <div
              className="card"
              style={{
                padding: '24px',
                borderRadius: 'var(--radius-lg, 12px)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface, #FFFFFF)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    backgroundColor: 'var(--color-tint, #F0FDF4)',
                    border: '1px solid #BBF7D0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary, #0F5132)',
                  }}
                >
                  <Sliders size={18} />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      margin: 0,
                      color: 'var(--color-text-main, #1F2937)',
                    }}
                  >
                    Quick Governance Profiles
                  </h3>
                  <p
                    style={{
                      fontSize: 12,
                      color: 'var(--color-text-muted, #6B7280)',
                      margin: '2px 0 0 0',
                    }}
                  >
                    Apply pre-calibrated operational rules in one click
                  </p>
                </div>
              </div>

              {/* Profiles list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Profile A: Standard Security */}
                <div
                  onClick={() => applyProfile(3, 3, 30)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 8,
                    border: '1.5px solid',
                    borderColor: isCurrentProfile(3, 3, 30)
                      ? 'var(--color-primary, #0F5132)'
                      : 'var(--color-border, #E5E7EB)',
                    backgroundColor: isCurrentProfile(3, 3, 30)
                      ? 'var(--color-tint, #F0FDF4)'
                      : 'var(--color-surface, #FFFFFF)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 4,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Sparkles size={15} color="var(--color-primary, #0F5132)" />
                      <strong
                        style={{
                          fontSize: 13,
                          color: 'var(--color-text-main, #1F2937)',
                        }}
                      >
                        Standard Protection
                      </strong>
                    </div>
                    {isCurrentProfile(3, 3, 30) ? (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: 'var(--color-primary, #0F5132)',
                          backgroundColor: '#DCFCE7',
                          padding: '2px 8px',
                          borderRadius: 10,
                        }}
                      >
                        Active
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: 11,
                          color: 'var(--color-primary, #0F5132)',
                          fontWeight: 600,
                        }}
                      >
                        Apply Profile
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      color: 'var(--color-text-muted, #6B7280)',
                      margin: '0 0 6px 0',
                    }}
                  >
                    Balanced rule set recommended for standard daily campus operations.
                  </p>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--color-text-main, #374151)',
                    }}
                  >
                    3 strikes • 3 outlet strikes • 30m QR lifespan
                  </div>
                </div>

                {/* Profile B: Strict Security */}
                <div
                  onClick={() => applyProfile(2, 2, 15)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 8,
                    border: '1.5px solid',
                    borderColor: isCurrentProfile(2, 2, 15)
                      ? 'var(--color-primary, #0F5132)'
                      : 'var(--color-border, #E5E7EB)',
                    backgroundColor: isCurrentProfile(2, 2, 15)
                      ? 'var(--color-tint, #F0FDF4)'
                      : 'var(--color-surface, #FFFFFF)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 4,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ShieldAlert size={15} color="#DC2626" />
                      <strong
                        style={{
                          fontSize: 13,
                          color: 'var(--color-text-main, #1F2937)',
                        }}
                      >
                        Strict Enforcement
                      </strong>
                    </div>
                    {isCurrentProfile(2, 2, 15) ? (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: 'var(--color-primary, #0F5132)',
                          backgroundColor: '#DCFCE7',
                          padding: '2px 8px',
                          borderRadius: 10,
                        }}
                      >
                        Active
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: 11,
                          color: 'var(--color-primary, #0F5132)',
                          fontWeight: 600,
                        }}
                      >
                        Apply Profile
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      color: 'var(--color-text-muted, #6B7280)',
                      margin: '0 0 6px 0',
                    }}
                  >
                    Heightened fraud deterrence with fast token expiry and tighter infraction ceilings.
                  </p>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--color-text-main, #374151)',
                    }}
                  >
                    2 strikes • 2 outlet strikes • 15m QR lifespan
                  </div>
                </div>

                {/* Profile C: High-Volume Event Mode */}
                <div
                  onClick={() => applyProfile(5, 5, 60)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 8,
                    border: '1.5px solid',
                    borderColor: isCurrentProfile(5, 5, 60)
                      ? 'var(--color-primary, #0F5132)'
                      : 'var(--color-border, #E5E7EB)',
                    backgroundColor: isCurrentProfile(5, 5, 60)
                      ? 'var(--color-tint, #F0FDF4)'
                      : 'var(--color-surface, #FFFFFF)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 4,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Flame size={15} color="#D97706" />
                      <strong
                        style={{
                          fontSize: 13,
                          color: 'var(--color-text-main, #1F2937)',
                        }}
                      >
                        Campus Rush & Events
                      </strong>
                    </div>
                    {isCurrentProfile(5, 5, 60) ? (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: 'var(--color-primary, #0F5132)',
                          backgroundColor: '#DCFCE7',
                          padding: '2px 8px',
                          borderRadius: 10,
                        }}
                      >
                        Active
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: 11,
                          color: 'var(--color-primary, #0F5132)',
                          fontWeight: 600,
                        }}
                      >
                        Apply Profile
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      color: 'var(--color-text-muted, #6B7280)',
                      margin: '0 0 6px 0',
                    }}
                  >
                    Expanded validity buffers for peak lunch queues and campus fest crowds.
                  </p>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--color-text-main, #374151)',
                    }}
                  >
                    5 strikes • 5 outlet strikes • 60m QR lifespan
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Automated Enforcement Policy Rules */}
            <div
              className="card"
              style={{
                padding: '24px',
                borderRadius: 'var(--radius-lg, 12px)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface, #FFFFFF)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    backgroundColor: 'var(--color-tint, #F0FDF4)',
                    border: '1px solid #BBF7D0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary, #0F5132)',
                  }}
                >
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      margin: 0,
                      color: 'var(--color-text-main, #1F2937)',
                    }}
                  >
                    Automated Policy Safeguards
                  </h3>
                  <p
                    style={{
                      fontSize: 12,
                      color: 'var(--color-text-muted, #6B7280)',
                      margin: '2px 0 0 0',
                    }}
                  >
                    Active runtime protection protocols
                  </p>
                </div>
              </div>

              {/* Safeguards checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5 }}>
                  <CheckCircle2 size={15} color="#16A34A" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ color: 'var(--color-text-main, #374151)', lineHeight: 1.4 }}>
                    <strong>Automated User Lock:</strong> Customer ordering capability is immediately suspended when verified infractions reach threshold.
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5 }}>
                  <CheckCircle2 size={15} color="#16A34A" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ color: 'var(--color-text-main, #374151)', lineHeight: 1.4 }}>
                    <strong>Merchant Delisting:</strong> Outlets exceeding the infraction ceiling are automatically marked suspended and hidden from search.
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5 }}>
                  <CheckCircle2 size={15} color="#16A34A" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ color: 'var(--color-text-main, #374151)', lineHeight: 1.4 }}>
                    <strong>Cryptographic QR Verification:</strong> Pickup tokens use SHA-256 hash digests with zero replay capability.
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5 }}>
                  <CheckCircle2 size={15} color="#16A34A" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ color: 'var(--color-text-main, #374151)', lineHeight: 1.4 }}>
                    <strong>Immutable Admin Protection:</strong> System root administrators are permanently shielded from automated policy locks.
                  </span>
                </div>
              </div>

              {/* Admin identity & audit timestamp footer */}
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 12,
                  borderTop: '1px solid var(--color-border, #E5E7EB)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8,
                  fontSize: 11.5,
                  color: 'var(--color-text-muted, #6B7280)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <UserCheck size={13} color="var(--color-primary, #0F5132)" />
                  <span>
                    Admin: <strong>{data.platformSpecs.defaultAdminEmail}</strong>
                  </span>
                </div>

                {data.lastUpdatedAt && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Clock size={12} />
                    <span>Sync: {formatDateLong(data.lastUpdatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
