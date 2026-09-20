import React, { useRef } from 'react';
import { Store, MapPin, Phone, Tag, AlignLeft, Image as ImageIcon, Upload, Trash2 } from 'lucide-react';
import {
  SHOP_CATEGORIES,
  SHOP_CATEGORY_LABELS,
  type ShopCategory,
} from '../../../types/shop.types';
import { getShopImage } from '../../../utils/shopImageUtils';
import { ShopLocationPicker } from '../../../components/shop/ShopLocationPicker';
import { Button } from '../../../components/ui/Button';

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
  imageUrl?: string;
  onUploadImage?: (file: File) => void;
  onRemoveImage?: () => void;
  uploadingImage?: boolean;
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
  imageUrl,
  onUploadImage,
  onRemoveImage,
  uploadingImage = false,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadImage) {
      // Client-side quick validation (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please choose a smaller image.');
        return;
      }
      onUploadImage(file);
    }
  };

  const currentDisplayImage = getShopImage({ imageUrl, category });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 24 }}>
      {/* 1. Shop Image Section */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
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
            <ImageIcon size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
              Shop Image & Branding
            </h3>
            <p style={{ fontSize: 12, color: 'var(--color-text-light)', margin: '2px 0 0 0' }}>
              Upload your shop banner or use our category-specific illustration
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Image Thumbnail */}
          <div
            style={{
              width: 140,
              height: 100,
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              border: '2px solid var(--color-border)',
              position: 'relative',
              backgroundColor: 'var(--color-surface-subtle)',
              flexShrink: 0,
            }}
          >
            <img
              src={currentDisplayImage}
              alt="Shop banner"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 4,
                left: 4,
                right: 4,
                backgroundColor: 'rgba(0,0,0,0.65)',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                textAlign: 'center',
                padding: '2px 4px',
                borderRadius: 4,
              }}
            >
              {imageUrl ? 'Custom Upload' : 'Category Default'}
            </div>
          </div>

          {/* Controls */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp,image/jpg"
              style={{ display: 'none' }}
            />

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || uploadingImage}
                isLoading={uploadingImage}
                icon={<Upload size={14} />}
              >
                {imageUrl ? 'Replace Image' : 'Upload Shop Image'}
              </Button>

              {imageUrl && onRemoveImage && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onRemoveImage}
                  disabled={disabled || uploadingImage}
                  style={{ color: 'var(--color-error)', borderColor: 'rgba(220, 38, 38, 0.3)' }}
                  icon={<Trash2 size={14} />}
                >
                  Remove Custom Image
                </Button>
              )}
            </div>

            <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)' }}>
              Supports <strong>JPG, JPEG, PNG, WEBP</strong> (Max 5MB). High resolution landscape images recommended.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Outlet Information Card */}
      <div className="card" style={{ padding: '20px 24px' }}>
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
              Outlet Information
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

          {/* Row 4: Description */}
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

      {/* 3. Shop Location Card with Map Picker */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
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
            <MapPin size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
              Pinned Live Location & Coordinates
            </h3>
            <p style={{ fontSize: 12, color: 'var(--color-text-light)', margin: '2px 0 0 0' }}>
              Used for customer distance calculation and real-time turn-by-turn navigation
            </p>
          </div>
        </div>

        <ShopLocationPicker
          latitude={typeof latitude === 'number' ? latitude : undefined}
          longitude={typeof longitude === 'number' ? longitude : undefined}
          onChange={(newLat, newLng) => {
            onLatitudeChange(newLat);
            onLongitudeChange(newLng);
          }}
          height={320}
        />
      </div>
    </div>
  );
};
