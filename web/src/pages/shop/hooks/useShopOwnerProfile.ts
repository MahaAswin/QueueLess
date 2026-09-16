import { useState, useEffect, useCallback, useMemo } from 'react';
import { shopService } from '../../../services/shopService';
import { useAuth } from '../../../context/AuthContext';
import type {
  Shop,
  ShopCategory,
  ShopStatus,
  CreateShopPayload,
  UpdateShopPayload,
} from '../../../types/shop.types';

export const useShopOwnerProfile = () => {
  const { user } = useAuth();

  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [shopName, setShopName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ShopCategory>('GROCERY');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [latitude, setLatitude] = useState<number | ''>('');
  const [longitude, setLongitude] = useState<number | ''>('');
  const [openingTime, setOpeningTime] = useState('09:00');
  const [closingTime, setClosingTime] = useState('21:00');
  const [status, setStatus] = useState<ShopStatus>('ACTIVE');

  // Load Shops on mount
  const loadShops = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await shopService.getMyShops();
      setShops(data);
      if (data.length > 0) {
        // Select either previously selected shop or first shop
        setSelectedShopId((prevId) => {
          const exists = data.some((s) => s.id === prevId);
          return exists ? prevId : data[0].id;
        });
      } else {
        setSelectedShopId('');
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || 'Failed to load store profile.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShops();
  }, [loadShops]);

  // Selected Shop object
  const selectedShop = useMemo(
    () => shops.find((s) => s.id === selectedShopId) || null,
    [shops, selectedShopId]
  );

  // Populate form fields from selected shop
  const populateForm = useCallback((shop: Shop | null) => {
    if (!shop) {
      setShopName('');
      setDescription('');
      setCategory('GROCERY');
      setPhone('');
      setAddress('');
      setCity('');
      setLatitude('');
      setLongitude('');
      setOpeningTime('09:00');
      setClosingTime('21:00');
      setStatus('ACTIVE');
      return;
    }

    setShopName(shop.shopName || shop.name || '');
    setDescription(shop.description || '');
    setCategory(shop.category || 'GROCERY');
    setPhone(shop.phone || '');
    setAddress(shop.address || '');
    setCity(shop.city || '');
    setLatitude(shop.latitude !== undefined && shop.latitude !== null ? shop.latitude : '');
    setLongitude(shop.longitude !== undefined && shop.longitude !== null ? shop.longitude : '');
    setOpeningTime(shop.openingTime ? shop.openingTime.slice(0, 5) : '09:00');
    setClosingTime(shop.closingTime ? shop.closingTime.slice(0, 5) : '21:00');
    setStatus(shop.status || 'ACTIVE');
  }, []);

  useEffect(() => {
    populateForm(selectedShop);
    setSuccessMsg(null);
  }, [selectedShop, populateForm]);

  // Dirty state tracking
  const isDirty = useMemo(() => {
    if (!selectedShop) return false;
    const initialName = selectedShop.shopName || selectedShop.name || '';
    const initialDesc = selectedShop.description || '';
    const initialCategory = selectedShop.category || 'GROCERY';
    const initialPhone = selectedShop.phone || '';
    const initialAddress = selectedShop.address || '';
    const initialCity = selectedShop.city || '';
    const initialLat = selectedShop.latitude !== undefined && selectedShop.latitude !== null ? selectedShop.latitude : '';
    const initialLng = selectedShop.longitude !== undefined && selectedShop.longitude !== null ? selectedShop.longitude : '';
    const initialOpen = selectedShop.openingTime ? selectedShop.openingTime.slice(0, 5) : '09:00';
    const initialClose = selectedShop.closingTime ? selectedShop.closingTime.slice(0, 5) : '21:00';
    const initialStatus = selectedShop.status || 'ACTIVE';

    return (
      shopName !== initialName ||
      description !== initialDesc ||
      category !== initialCategory ||
      phone !== initialPhone ||
      address !== initialAddress ||
      city !== initialCity ||
      latitude !== initialLat ||
      longitude !== initialLng ||
      openingTime !== initialOpen ||
      closingTime !== initialClose ||
      status !== initialStatus
    );
  }, [
    selectedShop,
    shopName,
    description,
    category,
    phone,
    address,
    city,
    latitude,
    longitude,
    openingTime,
    closingTime,
    status,
  ]);

  // Reset form to loaded values
  const resetForm = () => {
    populateForm(selectedShop);
    setError(null);
    setSuccessMsg(null);
  };

  // Save changes handler
  const saveChanges = async (): Promise<boolean> => {
    if (!selectedShop) return false;

    // Validate opening / closing time
    if (openingTime >= closingTime) {
      setError('Opening time must be strictly before closing time.');
      return false;
    }

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

    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const formattedOpen = openingTime.length === 5 ? `${openingTime}:00` : openingTime;
      const formattedClose = closingTime.length === 5 ? `${closingTime}:00` : closingTime;

      const payload: UpdateShopPayload = {
        shopName: shopName.trim(),
        description: description.trim() || undefined,
        category,
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        latitude: typeof latitude === 'number' ? latitude : undefined,
        longitude: typeof longitude === 'number' ? longitude : undefined,
        openingTime: formattedOpen,
        closingTime: formattedClose,
        status,
      };

      const updated = await shopService.updateShop(selectedShop.id, payload);
      setShops((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setSuccessMsg('Store profile and operating settings updated successfully!');
      return true;
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || 'Failed to update store profile.'
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Create new shop handler
  const createNewShop = async (payload: CreateShopPayload): Promise<boolean> => {
    setSaving(true);
    setError(null);
    try {
      const created = await shopService.createShop(payload);
      setShops((prev) => [...prev, created]);
      setSelectedShopId(created.id);
      setSuccessMsg(`"${created.shopName || created.name}" created successfully!`);
      return true;
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to create shop.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    user,
    shops,
    selectedShopId,
    setSelectedShopId,
    selectedShop,
    loading,
    saving,
    error,
    successMsg,
    setSuccessMsg,
    isDirty,
    formState: {
      shopName,
      setShopName,
      description,
      setDescription,
      category,
      setCategory,
      phone,
      setPhone,
      address,
      setAddress,
      city,
      setCity,
      latitude,
      setLatitude,
      longitude,
      setLongitude,
      openingTime,
      setOpeningTime,
      closingTime,
      setClosingTime,
      status,
      setStatus,
    },
    saveChanges,
    resetForm,
    createNewShop,
    refetch: loadShops,
  };
};
