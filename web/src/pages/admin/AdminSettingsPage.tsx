import React from 'react';
import {
  Settings,
  ShieldCheck,
  QrCode,
  Server,
  RefreshCw,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Clock,
  Globe,
  Database,
  UserCheck,
} from 'lucide-react';
import { useAdminSettings } from './hooks/useAdminSettings';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
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

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(2, 132, 199, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284C7',
            }}
          >
            <Settings size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-main)', margin: 0 }}>
              System Settings & Governance
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13, margin: '3px 0 0 0' }}>
              Manage operational thresholds, trust & safety enforcement rules, and platform specifications
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={refetch}
            disabled={loading || saving}
            icon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccess && (
        <div
          style={{
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#065F46',
            fontSize: 13.5,
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} color="#10B981" />
          <span>System governance settings updated successfully and applied to runtime services.</span>
        </div>
      )}

      {/* Loading & Error States */}
      {loading && !data ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <RefreshCw size={28} className="animate-spin" style={{ color: 'var(--color-primary)', margin: '0 auto 12px' }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-main)' }}>
            Loading platform system settings...
          </div>
        </div>
      ) : error && !data ? (
        <ErrorState
          title="Unable to load system settings"
          message={error}
          onRetry={refetch}
        />
      ) : data ? (
        <>
          {/* Main Grid: Form Sections on Left, Specs on Right */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
            {/* Column 1: Configurable Operational Policies */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Section 1: Trust & Safety Governance */}
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#FEF2F2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#EF4444',
                    }}
                  >
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
                      Trust & Safety Governance
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                      Automated policy enforcement rules for platform disputes
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Field 1: User Suspension Threshold */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-main)' }}>
                        Customer Suspension Threshold
                      </label>
                      <Badge variant="warning">{formData.userSuspensionThreshold} Violations</Badge>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8, lineHeight: 1.4 }}>
                      Number of verified dispute infractions before a customer account is automatically suspended from ordering.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={formData.userSuspensionThreshold}
                        onChange={(e) => setField('userSuspensionThreshold', parseInt(e.target.value, 10))}
                        style={{ flex: 1, cursor: 'pointer' }}
                      />
                      <input
                        type="number"
                        min="1"
                        max="20"
                        className="input"
                        style={{ width: 70, textAlign: 'center', fontWeight: 700 }}
                        value={formData.userSuspensionThreshold}
                        onChange={(e) => setField('userSuspensionThreshold', Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 1)))}
                      />
                    </div>
                    {validationErrors.userSuspensionThreshold && (
                      <div style={{ color: '#EF4444', fontSize: 12, marginTop: 4, fontWeight: 600 }}>
                        {validationErrors.userSuspensionThreshold}
                      </div>
                    )}
                  </div>

                  <div style={{ height: 1, backgroundColor: 'var(--color-border)' }} />

                  {/* Field 2: Shop Suspension Threshold */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-main)' }}>
                        Shop Suspension Threshold
                      </label>
                      <Badge variant="error">{formData.shopSuspensionThreshold} Violations</Badge>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8, lineHeight: 1.4 }}>
                      Number of verified dispute infractions before a merchant outlet is automatically suspended from processing orders.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={formData.shopSuspensionThreshold}
                        onChange={(e) => setField('shopSuspensionThreshold', parseInt(e.target.value, 10))}
                        style={{ flex: 1, cursor: 'pointer' }}
                      />
                      <input
                        type="number"
                        min="1"
                        max="20"
                        className="input"
                        style={{ width: 70, textAlign: 'center', fontWeight: 700 }}
                        value={formData.shopSuspensionThreshold}
                        onChange={(e) => setField('shopSuspensionThreshold', Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 1)))}
                      />
                    </div>
                    {validationErrors.shopSuspensionThreshold && (
                      <div style={{ color: '#EF4444', fontSize: 12, marginTop: 4, fontWeight: 600 }}>
                        {validationErrors.shopSuspensionThreshold}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Orders & QR Pickup Operations */}
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#EFF6FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2563EB',
                    }}
                  >
                    <QrCode size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
                      QR Pickup Operations
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                      Token lifetimes for customer QR pickup verification
                    </p>
                  </div>
                </div>

                {/* Field 3: QR Expiration Minutes */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-main)' }}>
                      Pickup Token Lifetime
                    </label>
                    <Badge variant="info">{formData.qrExpirationMinutes} Minutes</Badge>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8, lineHeight: 1.4 }}>
                    Validity window for cryptographically hashed pickup QR tokens before renewal is required.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="range"
                      min="5"
                      max="180"
                      step="5"
                      value={formData.qrExpirationMinutes}
                      onChange={(e) => setField('qrExpirationMinutes', parseInt(e.target.value, 10))}
                      style={{ flex: 1, cursor: 'pointer' }}
                    />
                    <input
                      type="number"
                      min="5"
                      max="180"
                      className="input"
                      style={{ width: 70, textAlign: 'center', fontWeight: 700 }}
                      value={formData.qrExpirationMinutes}
                      onChange={(e) => setField('qrExpirationMinutes', Math.max(5, Math.min(180, parseInt(e.target.value, 10) || 5)))}
                    />
                  </div>
                  {validationErrors.qrExpirationMinutes && (
                    <div style={{ color: '#EF4444', fontSize: 12, marginTop: 4, fontWeight: 600 }}>
                      {validationErrors.qrExpirationMinutes}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div
                className="card"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: isDirty ? '#FFFBEB' : 'var(--color-surface)',
                  border: isDirty ? '1px solid #FCD34D' : '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {isDirty ? (
                    <>
                      <AlertTriangle size={16} color="#D97706" />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#92400E' }}>
                        Unsaved configuration changes
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>
                      All operational settings synchronized with backend database.
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={resetForm}
                    disabled={!isDirty || saving}
                    icon={<RotateCcw size={14} />}
                  >
                    Reset
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={saveSettings}
                    disabled={!isDirty || saving}
                    icon={<Save size={14} className={saving ? 'animate-spin' : ''} />}
                  >
                    {saving ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Column 2: Platform Infrastructure Specifications (Read-Only) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-text-main)',
                    }}
                  >
                    <Server size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
                      Platform Governance Specifications
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                      Authoritative system configuration & security parameters
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Spec 1: Protected Admin Identity */}
                  <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-subtle)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <UserCheck size={15} color="#0284C7" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        Protected System Admin
                      </span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-main)' }}>
                      {data.platformSpecs.defaultAdminEmail}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--color-text-light)', marginTop: 2 }}>
                      Single immutable root governance account
                    </div>
                  </div>

                  {/* Spec 2: JWT Security Lifespans */}
                  <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-subtle)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Lock size={15} color="#10B981" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        Authentication Lifecycles
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: 'var(--color-text-main)', marginTop: 4 }}>
                      <span>Access Token Validity:</span>
                      <strong style={{ color: '#0284C7' }}>{data.platformSpecs.accessTokenExpirationMinutes} Minutes</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: 'var(--color-text-main)', marginTop: 4 }}>
                      <span>Refresh Token Validity:</span>
                      <strong style={{ color: '#0284C7' }}>{data.platformSpecs.refreshTokenExpirationDays} Days</strong>
                    </div>
                  </div>

                  {/* Spec 3: Cross-Origin Resource Sharing */}
                  <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-subtle)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Globe size={15} color="#8B5CF6" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        CORS Allowed Origins
                      </span>
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-text-main)', wordBreak: 'break-word', fontFamily: 'monospace' }}>
                      {data.platformSpecs.corsAllowedOrigins}
                    </div>
                  </div>

                  {/* Spec 4: Database Store & Operational Scope */}
                  <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-subtle)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Database size={15} color="#F59E0B" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        Persistence & Scope
                      </span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-main)' }}>
                      {data.platformSpecs.databaseEngine}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                      Scope: {data.platformSpecs.environment}
                    </div>
                  </div>

                  {/* Spec 5: Last Settings Audit Update */}
                  {data.lastUpdatedAt && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-text-light)', padding: '0 4px' }}>
                      <Clock size={14} />
                      <span>
                        Last updated {formatDateLong(data.lastUpdatedAt)}
                        {data.lastUpdatedBy ? ` by ${data.lastUpdatedBy}` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
