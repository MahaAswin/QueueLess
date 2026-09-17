import React, { useState } from 'react';
import { pickupService } from '../../services/pickupService';
import type { PickupVerificationResponse } from '../../types/slot.types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { QrCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDateLong } from '../../utils/formatters';

export const ShopQrScannerPage: React.FC = () => {
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PickupVerificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await pickupService.verifyPickup({ pickupToken: tokenInput.trim() });
      setResult(res);
      setTokenInput('');
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to verify pickup token. Token may be invalid, expired, or already used.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--color-primary-subtle)',
            color: 'var(--color-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}
        >
          <QrCode size={30} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px 0' }}>
          Scan Express QR Token
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: 0 }}>
          Verify the customer&apos;s digital pickup token at the express collection counter
        </p>
      </div>

      {/* Verification Card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label className="form-label">Pickup Token String / QR Payload</label>
            <input
              type="text"
              required
              placeholder="e.g. QLP:a8b3f12..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="form-input"
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 14,
                padding: '12px 14px',
              }}
              autoFocus
            />
            <span style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 4, display: 'block' }}>
              Format begins with <code style={{ fontSize: 11 }}>QLP:</code>
            </span>
          </div>

          <Button
            variant="primary"
            size="lg"
            type="submit"
            disabled={loading || !tokenInput.trim()}
            style={{ width: '100%', marginTop: 8 }}
            icon={<CheckCircle2 size={18} />}
          >
            {loading ? 'Verifying...' : 'Verify & Handover Order'}
          </Button>
        </form>
      </div>

      {/* Success Result */}
      {result && (
        <div
          className="card"
          style={{
            borderLeft: '4px solid var(--color-success)',
            backgroundColor: 'var(--color-light-sage)',
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <CheckCircle2 size={28} color="var(--color-success)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-primary-deep)', margin: '0 0 4px 0' }}>
                Pickup Successfully Verified!
              </h3>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 10px 0' }}>
                {result.message}
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 12.5 }}>
                <span>Order ID: <strong>#{result.orderId.slice(0, 8)}</strong></span>
                <span>•</span>
                <span>Status: <Badge variant="success">{result.status}</Badge></span>
                {result.collectedAt && (
                  <>
                    <span>•</span>
                    <span>Collected: {formatDateLong(result.collectedAt)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Result */}
      {error && (
        <div
          className="card"
          style={{
            borderLeft: '4px solid var(--color-error)',
            backgroundColor: 'var(--color-error-bg)',
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <AlertCircle size={24} color="var(--color-error)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-error)', margin: '0 0 4px 0' }}>
                Verification Failed
              </h3>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
                {error}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
