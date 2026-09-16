import React, { useState, useEffect } from 'react';
import { shopService } from '../../services/shopService';
import type { Shop, ShopCategory, CreateShopPayload, UpdateShopPayload } from '../../types/shop.types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { Store, MapPin, Clock, Phone, CheckCircle2, Plus } from 'lucide-react';
import { formatTimeLabel } from '../../utils/formatters';

const CATEGORIES: ShopCategory[] = [
  'GROCERY',
  'RESTAURANT',
  'PHARMACY',
  'BAKERY',
  'STATIONERY',
  'MEAT_SHOP',
  'OTHER',
];

export const ShopProfilePage: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ShopCategory>('GROCERY');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');

  // Create new shop modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newShopData, setNewShopData] = useState<CreateShopPayload>({
    name: '',
    description: '',
    category: 'GROCERY',
    address: '',
    city: '',
    phone: '',
  });

  const loadShops = async () => {
    setLoading(true);
    setError(null);
    try {
      const myShops = await shopService.getMyShops();
      setShops(myShops);
      if (myShops.length > 0) {
        const active = myShops[0];
        setSelectedShop(active);
        populateForm(active);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load shop profile.');
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (shop: Shop) => {
    setName(shop.shopName || shop.name || '');
    setDescription(shop.description || '');
    setCategory(shop.category || 'GROCERY');
    setAddress(shop.address || '');
    setCity(shop.city || '');
    setPhone(shop.phone || '');
  };

  useEffect(() => {
    loadShops();
  }, []);

  const handleSelectShop = (shop: Shop) => {
    setSelectedShop(shop);
    populateForm(shop);
    setSuccessMsg(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShop) return;

    setSaving(true);
    setSuccessMsg(null);
    try {
      const payload: UpdateShopPayload = {
        name,
        description,
        category,
        address,
        city,
        phone,
      };
      const updated = await shopService.updateShop(selectedShop.id, payload);
      setSuccessMsg('Shop profile successfully updated!');
      setShops((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setSelectedShop(updated);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update shop profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await shopService.createShop(newShopData);
      setShowCreateModal(false);
      await loadShops();
      setSelectedShop(created);
      populateForm(created);
      setSuccessMsg('New outlet registered successfully!');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to create shop.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading shop profile..." />;
  }

  if (error && shops.length === 0) {
    return <ErrorState message={error} onRetry={loadShops} />;
  }

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px 0' }}>
            Store Profile & Settings
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: 0 }}>
            Manage outlet location, category classification, and operational details
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={() => setShowCreateModal(true)}
          icon={<Plus size={16} />}
        >
          Add New Outlet
        </Button>
      </div>

      {/* Outlet Selector if multiple */}
      {shops.length > 1 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)' }}>
              Managing Outlet:
            </span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {shops.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectShop(s)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    backgroundColor:
                      selectedShop?.id === s.id ? 'var(--color-primary-deep)' : 'var(--color-surface)',
                    borderColor:
                      selectedShop?.id === s.id ? 'var(--color-primary)' : 'var(--color-border)',
                    color: selectedShop?.id === s.id ? '#fff' : 'var(--color-text-main)',
                  }}
                >
                  {s.shopName || s.name} ({s.city})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successMsg && (
        <div
          className="card"
          style={{
            borderLeft: '4px solid var(--color-success)',
            backgroundColor: 'var(--color-light-sage)',
            marginBottom: 20,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <CheckCircle2 size={18} color="var(--color-success)" />
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-primary-deep)' }}>
            {successMsg}
          </span>
        </div>
      )}

      {/* Main Profile Form */}
      {selectedShop ? (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Store size={22} color="var(--color-primary)" />
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Outlet Information</h2>
            </div>
            <Badge variant={selectedShop.status === 'ACTIVE' ? 'success' : 'warning'}>
              {selectedShop.status}
            </Badge>
          </div>

          <form onSubmit={handleUpdate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Shop Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ShopCategory)}
                  className="form-input"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Street Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Operating Hours</label>
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface-subtle)',
                    border: '1px solid var(--color-border)',
                    fontSize: 13.5,
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {selectedShop.openingTime && selectedShop.closingTime
                    ? `${formatTimeLabel(selectedShop.openingTime)} – ${formatTimeLabel(selectedShop.closingTime)}`
                    : 'Configured on server'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <Button variant="primary" size="md" type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <Store size={40} color="var(--color-text-light)" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>No registered shop outlet</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 16 }}>
            You have not registered any store outlet yet. Create your first outlet now.
          </p>
          <Button variant="primary" size="md" onClick={() => setShowCreateModal(true)} icon={<Plus size={16} />}>
            Register Store Outlet
          </Button>
        </div>
      )}

      {/* Create Outlet Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            className="card"
            style={{
              width: 500,
              maxWidth: '90%',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
              Register New Store Outlet
            </h2>
            <form onSubmit={handleCreateShop}>
              <div className="form-group">
                <label className="form-label">Shop / Outlet Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Green Grocers Downtown"
                  value={newShopData.name}
                  onChange={(e) => setNewShopData({ ...newShopData, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    value={newShopData.category}
                    onChange={(e) => setNewShopData({ ...newShopData, category: e.target.value as ShopCategory })}
                    className="form-input"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9876543210"
                    value={newShopData.phone}
                    onChange={(e) => setNewShopData({ ...newShopData, phone: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="123 Market Street"
                    value={newShopData.address}
                    onChange={(e) => setNewShopData({ ...newShopData, address: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="Chennai"
                    value={newShopData.city}
                    onChange={(e) => setNewShopData({ ...newShopData, city: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <Button variant="outline" size="md" type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit" disabled={saving}>
                  {saving ? 'Creating...' : 'Register Outlet'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
