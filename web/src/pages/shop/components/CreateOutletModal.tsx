import React, { useState } from 'react';
import { X, Store, Check, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import {
  SHOP_CATEGORIES,
  SHOP_CATEGORY_LABELS,
  type ShopCategory,
  type CreateShopPayload,
} from '../../../types/shop.types';

interface CreateOutletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateShopPayload) => Promise<boolean>;
  loading?: boolean;
}

export const CreateOutletModal: React.FC<CreateOutletModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [shopName, setShopName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ShopCategory>('GROCERY');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [latitude, setLatitude] = useState<string>('12.9716');
  const [longitude, setLongitude] = useState<string>('77.5946');
  const [openingTime, setOpeningTime] = useState('09:00');
  const [closingTime, setClosingTime] = useState('21:00');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validate = () => {
    if (!shopName.trim()) {
      setError('Shop name is required.');
      return false;
    }
    if (!phone.trim()) {
      setError('Contact phone is required.');
      return false;
    }
    if (!address.trim() || !city.trim()) {
      setError('Address and City are required.');
      return false;
    }
    if (!openingTime || !closingTime || openingTime >= closingTime) {
      setError('Opening time must be strictly before closing time.');
      return false;
    }
    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      setError('Latitude must be a valid coordinate between -90.0 and 90.0');
      return false;
    }
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      setError('Longitude must be a valid coordinate between -180.0 and 180.0');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const formattedOpen = openingTime.length === 5 ? `${openingTime}:00` : openingTime;
    const formattedClose = closingTime.length === 5 ? `${closingTime}:00` : closingTime;

    const payload: CreateShopPayload = {
      shopName: shopName.trim(),
      name: shopName.trim(),
      description: description.trim() || undefined,
      category,
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      openingTime: formattedOpen,
      closingTime: formattedClose,
    };

    const success = await onSubmit(payload);
    if (success) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="card"
        style={{
          width: 540,
          maxWidth: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-xl)',
          padding: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)',
              }}
            >
              <Store size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
                Register New Store Outlet
              </h2>
              <p style={{ fontSize: 12, color: 'var(--color-text-light)', margin: '2px 0 0 0' }}>
                Add another store branch to manage catalog and customer pickups
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-light)',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-error-bg)',
                border: '1px solid var(--color-error-border)',
                color: 'var(--color-error)',
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              <AlertCircle size={16} flex-shrink="0" />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Name & Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>
                  Shop Name <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Green Mart Indiranagar"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>
                  Category <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ShopCategory)}
                  className="form-input"
                >
                  {SHOP_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {SHOP_CATEGORY_LABELS[cat] || cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Phone & City */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>
                  Contact Phone <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>
                  City <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Bangalore"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* Address */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>
                Street Address <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="100 Feet Road, HAL 2nd Stage"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Coordinates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>
                  Latitude <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>
                  Longitude <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* Operating Hours */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>
                  Opening Time <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  type="time"
                  required
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>
                  Closing Time <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  type="time"
                  required
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>
                Description (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Brief description of the store branch..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input"
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
              marginTop: 24,
              borderTop: '1px solid var(--color-border)',
              paddingTop: 16,
            }}
          >
            <Button variant="outline" size="md" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={loading}
              icon={loading ? undefined : <Check size={16} />}
            >
              {loading ? 'Registering...' : 'Register Outlet'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
