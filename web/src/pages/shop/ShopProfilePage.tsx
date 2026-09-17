import React, { useState } from 'react';
import { Store, Plus, CheckCircle2, AlertCircle, Save, RotateCcw } from 'lucide-react';
import { useShopOwnerProfile } from './hooks/useShopOwnerProfile';
import { OwnerAccountCard } from './components/OwnerAccountCard';
import { ShopInformationForm } from './components/ShopInformationForm';
import { OperatingHoursCard } from './components/OperatingHoursCard';
import { CreateOutletModal } from './components/CreateOutletModal';
import { ShopProfileSkeleton } from './components/ShopProfileSkeleton';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/feedback/ErrorState';

export const ShopProfilePage: React.FC = () => {
  const {
    user,
    shops,
    selectedShopId,
    setSelectedShopId,
    loading,
    saving,
    error,
    successMsg,
    isDirty,
    formState,
    saveChanges,
    resetForm,
    createNewShop,
    refetch,
  } = useShopOwnerProfile();

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveChanges();
  };

  return (
    <div style={{ maxWidth: 920, margin: '0 auto' }}>
      {/* Top Banner & Header Actions */}
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
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px 0', color: 'var(--color-text-main)' }}>
            Shop Profile
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: 0 }}>
            Manage your shop information and operating settings.
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={() => setCreateModalOpen(true)}
          icon={<Plus size={16} />}
        >
          Add New Outlet
        </Button>
      </div>

      {/* Main View State Handling */}
      {loading ? (
        <ShopProfileSkeleton />
      ) : error && shops.length === 0 ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : shops.length === 0 ? (
        /* No Outlets Registered Yet */
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '56px 20px',
            color: 'var(--color-text-muted)',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: 'var(--color-primary)',
            }}
          >
            <Store size={28} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: 'var(--color-text-main)' }}>
            No shop associated with this account
          </h3>
          <p style={{ fontSize: 14, color: 'var(--color-text-light)', maxWidth: 440, margin: '0 auto 20px auto' }}>
            Register your store outlet to start managing your catalog, accepting customer orders, and setting pickup schedules.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => setCreateModalOpen(true)}
            icon={<Plus size={16} />}
          >
            Register Store Outlet
          </Button>
        </div>
      ) : (
        <div>
          {/* Multi-Outlet Selector */}
          {shops.length > 1 && (
            <div
              className="card"
              style={{
                marginBottom: 20,
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  Managing Outlet:
                </span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {shops.map((s) => {
                    const isSelected = selectedShopId === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedShopId(s.id)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: '1px solid',
                          backgroundColor: isSelected
                            ? 'var(--color-primary)'
                            : 'var(--color-surface)',
                          borderColor: isSelected
                            ? 'var(--color-primary)'
                            : 'var(--color-border)',
                          color: isSelected ? '#fff' : 'var(--color-text-main)',
                          transition: 'all var(--transition-fast)',
                        }}
                      >
                        {s.shopName || s.name} ({s.city})
                      </button>
                    );
                  })}
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
                backgroundColor: 'var(--color-success-bg)',
                marginBottom: 20,
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <CheckCircle2 size={18} color="var(--color-success)" />
              <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-success)' }}>
                {successMsg}
              </span>
            </div>
          )}

          {/* Error Notification */}
          {error && (
            <div
              className="card"
              style={{
                borderLeft: '4px solid var(--color-error)',
                backgroundColor: 'var(--color-error-bg)',
                marginBottom: 20,
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <AlertCircle size={18} color="var(--color-error)" />
              <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-error)' }}>
                {error}
              </span>
            </div>
          )}

          {/* Form Container */}
          <form onSubmit={handleFormSubmit}>
            {/* 1. Account Owner Information */}
            <OwnerAccountCard user={user} />

            {/* 2. Shop Details & Location */}
            <ShopInformationForm
              shopName={formState.shopName}
              onShopNameChange={formState.setShopName}
              description={formState.description}
              onDescriptionChange={formState.setDescription}
              category={formState.category}
              onCategoryChange={formState.setCategory}
              phone={formState.phone}
              onPhoneChange={formState.setPhone}
              address={formState.address}
              onAddressChange={formState.setAddress}
              city={formState.city}
              onCityChange={formState.setCity}
              latitude={formState.latitude}
              onLatitudeChange={formState.setLatitude}
              longitude={formState.longitude}
              onLongitudeChange={formState.setLongitude}
              disabled={saving}
            />

            {/* 3. Operating Hours & Status */}
            <OperatingHoursCard
              openingTime={formState.openingTime}
              onOpeningTimeChange={formState.setOpeningTime}
              closingTime={formState.closingTime}
              onClosingTimeChange={formState.setClosingTime}
              status={formState.status}
              onStatusChange={formState.setStatus}
              disabled={saving}
            />

            {/* Form Action Controls Toolbar */}
            <div
              className="card"
              style={{
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                bottom: 16,
                boxShadow: 'var(--shadow-lg)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                zIndex: 10,
              }}
            >
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                {isDirty ? (
                  <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>
                    ● Unsaved changes
                  </span>
                ) : (
                  <span>All changes saved to backend</span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <Button
                  variant="outline"
                  size="md"
                  type="button"
                  onClick={resetForm}
                  disabled={!isDirty || saving}
                  icon={<RotateCcw size={15} />}
                >
                  Reset
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={!isDirty || saving}
                  icon={saving ? undefined : <Save size={15} />}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Register New Outlet Modal */}
      <CreateOutletModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={createNewShop}
        loading={saving}
      />
    </div>
  );
};
