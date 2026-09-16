import React from 'react';
import { Store, MapPin, Phone, Tag, AlignLeft, Compass } from 'lucide-react';
import {
  SHOP_CATEGORIES,
  SHOP_CATEGORY_LABELS,
  type ShopCategory,
} from '../../../types/shop.types';

interface ShopInformationFormProps {
  shopName: string;
  onShopNameChange: (val: string) => void;
  description: string;
  onDescriptionChange: (val: string) => void;
  category: ShopCategory;
  onCategoryChange: (cat: ShopCategory) => void;
  phone: string;
  onPhoneChange: (val: string) => void;
  address: string;
  onAddressChange: (val: string) => void;
  city: string;
  onCityChange: (val: string) => void;
  latitude: number | '';
  onLatitudeChange: (val: number | '') => void;
  longitude: number | '';
  onLongitudeChange: (val: number | '') => void;
  disabled?: boolean;
}

export const ShopInformationForm: React.FC<ShopInformationFormProps> = ({
  shopName,
  onShopNameChange,
  description,
  onDescriptionChange,
  category,
  onCategoryChange,
  phone,
  onPhoneChange,
  address,
  onAddressChange,
  city,
  onCityChange,
  latitude,
  onLatitudeChange,
  longitude,
  onLongitudeChange,
  disabled = false,
}) => {
  return (
    <div className="card" style={{ marginBottom: 24, padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div
          style={{
            width: 40,
            height: 40,
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
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
            Outlet Information & Location
          </h3>
          <p style={{ fontSize: 12, color: 'var(--color-text-light)', margin: '2px 0 0 0' }}>
            Public business details visible to customers on discovery and checkout
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Row 1: Shop Name & Category */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Store size={14} color="var(--color-text-light)" />
              Shop / Outlet Name <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              type="text"
              required
              disabled={disabled}
              value={shopName}
              onChange={(e) => onShopNameChange(e.target.value)}
              placeholder="e.g. Fresh Mart Central"
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Tag size={14} color="var(--color-text-light)" />
              Primary Category <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <select
              value={category}
              disabled={disabled}
              onChange={(e) => onCategoryChange(e.target.value as ShopCategory)}
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

        {/* Row 2: Phone & City */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Phone size={14} color="var(--color-text-light)" />
              Contact Phone <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              type="tel"
              required
              disabled={disabled}
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="e.g. +91 9876543210"
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={14} color="var(--color-text-light)" />
              City <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              type="text"
              required
              disabled={disabled}
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              placeholder="e.g. Bangalore, Mumbai, Chennai"
              className="form-input"
            />
          </div>
        </div>

        {/* Row 3: Street Address */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={14} color="var(--color-text-light)" />
            Street Address <span style={{ color: 'var(--color-error)' }}>*</span>
          </label>
          <input
            type="text"
            required
            disabled={disabled}
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="e.g. 42 MG Road, 2nd Cross, Indiranagar"
            className="form-input"
          />
        </div>

        {/* Row 4: Geolocation Coordinates (Latitude / Longitude) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Compass size={14} color="var(--color-text-light)" />
              Latitude (-90.0 to 90.0)
            </label>
            <input
              type="number"
              step="any"
              min="-90"
              max="90"
              disabled={disabled}
              value={latitude}
              onChange={(e) =>
                onLatitudeChange(e.target.value === '' ? '' : parseFloat(e.target.value))
              }
              placeholder="e.g. 12.9716"
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Compass size={14} color="var(--color-text-light)" />
              Longitude (-180.0 to 180.0)
            </label>
            <input
              type="number"
              step="any"
              min="-180"
              max="180"
              disabled={disabled}
              value={longitude}
              onChange={(e) =>
                onLongitudeChange(e.target.value === '' ? '' : parseFloat(e.target.value))
              }
              placeholder="e.g. 77.5946"
              className="form-input"
            />
          </div>
        </div>

        {/* Row 5: Description */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlignLeft size={14} color="var(--color-text-light)" />
            Shop Description (Optional)
          </label>
          <textarea
            rows={3}
            disabled={disabled}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Describe your outlet specialties, fresh offerings, or customer pickup instructions..."
            className="form-input"
            style={{ resize: 'vertical' }}
          />
        </div>
      </div>
    </div>
  );
};
