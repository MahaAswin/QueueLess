import { useState, useEffect, useCallback, useMemo } from 'react';
import { productService } from '../../../services/productService';
import { shopService } from '../../../services/shopService';
import type {
  Product,
  ProductCategory,
  CreateProductPayload,
  UpdateProductPayload,
  ProductAvailabilityFilter,
  ProductStockFilter,
  ProductSortOption,
} from '../../../types/product.types';
import type { Shop } from '../../../types/shop.types';

export const useShopOwnerProducts = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'ALL'>('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState<ProductAvailabilityFilter>('ALL');
  const [stockFilter, setStockFilter] = useState<ProductStockFilter>('ALL');
  const [sortBy, setSortBy] = useState<ProductSortOption>('NAME_ASC');

  // Load shops on mount
  useEffect(() => {
    let isMounted = true;
    async function loadShops() {
      try {
        const myShops = await shopService.getMyShops();
        if (isMounted) {
          setShops(myShops);
          if (myShops.length > 0) {
            setSelectedShopId(myShops[0].id);
          } else {
            setLoading(false);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.response?.data?.message || err?.message || 'Failed to load shops.');
          setLoading(false);
        }
      }
    }
    loadShops();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch products for selected shop
  const fetchProducts = useCallback(async () => {
    if (!selectedShopId) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getProductsByShop(selectedShopId);
      setProducts(data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load products for this shop.');
    } finally {
      setLoading(false);
    }
  }, [selectedShopId]);

  useEffect(() => {
    if (selectedShopId) {
      fetchProducts();
    }
  }, [selectedShopId, fetchProducts]);

  const selectedShop = useMemo(
    () => shops.find((s) => s.id === selectedShopId),
    [shops, selectedShopId]
  );

  // Computed KPIs
  const kpis = useMemo(() => {
    const totalProducts = products.length;
    const availableCount = products.filter((p) => p.available && p.stockQuantity > 0).length;
    const outOfStockCount = products.filter((p) => !p.available || p.stockQuantity === 0).length;
    const lowStockCount = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 5).length;
    const distinctCategories = new Set(products.map((p) => p.category)).size;

    return {
      totalProducts,
      availableCount,
      outOfStockCount,
      lowStockCount,
      distinctCategories,
    };
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (categoryFilter !== 'ALL') {
      result = result.filter((p) => p.category === categoryFilter);
    }

    // Availability filter
    if (availabilityFilter === 'AVAILABLE') {
      result = result.filter((p) => p.available);
    } else if (availabilityFilter === 'UNAVAILABLE') {
      result = result.filter((p) => !p.available);
    }

    // Stock filter
    if (stockFilter === 'IN_STOCK') {
      result = result.filter((p) => p.stockQuantity > 0);
    } else if (stockFilter === 'LOW_STOCK') {
      result = result.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 5);
    } else if (stockFilter === 'OUT_OF_STOCK') {
      result = result.filter((p) => p.stockQuantity === 0);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'NAME_ASC':
          return a.name.localeCompare(b.name);
        case 'NAME_DESC':
          return b.name.localeCompare(a.name);
        case 'PRICE_ASC':
          return a.price - b.price;
        case 'PRICE_DESC':
          return b.price - a.price;
        case 'STOCK_ASC':
          return a.stockQuantity - b.stockQuantity;
        case 'STOCK_DESC':
          return b.stockQuantity - a.stockQuantity;
        case 'NEWEST':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [products, searchQuery, categoryFilter, availabilityFilter, stockFilter, sortBy]);

  // Actions
  const handleToggleAvailability = async (product: Product): Promise<boolean> => {
    try {
      const newStatus = !product.available;
      await productService.updateAvailability(product.id, newStatus);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, available: newStatus } : p))
      );
      return true;
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to update availability');
      return false;
    }
  };

  const handleUpdateStock = async (product: Product, newStock: number): Promise<boolean> => {
    if (newStock < 0) return false;
    try {
      await productService.updateStock(product.id, newStock);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stockQuantity: newStock } : p))
      );
      return true;
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to update stock');
      return false;
    }
  };

  const handleCreateProduct = async (payload: CreateProductPayload): Promise<boolean> => {
    if (!selectedShopId) return false;
    setActionLoading(true);
    try {
      const newProd = await productService.createProduct(selectedShopId, payload);
      setProducts((prev) => [newProd, ...prev]);
      return true;
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to create product');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProduct = async (
    productId: string,
    payload: UpdateProductPayload
  ): Promise<boolean> => {
    setActionLoading(true);
    try {
      const updated = await productService.updateProduct(productId, payload);
      setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
      return true;
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to update product');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string): Promise<boolean> => {
    setActionLoading(true);
    try {
      await productService.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      return true;
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to delete product');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('ALL');
    setAvailabilityFilter('ALL');
    setStockFilter('ALL');
    setSortBy('NAME_ASC');
  };

  return {
    shops,
    selectedShopId,
    setSelectedShopId,
    selectedShop,
    products,
    filteredProducts,
    loading,
    error,
    actionLoading,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    availabilityFilter,
    setAvailabilityFilter,
    stockFilter,
    setStockFilter,
    sortBy,
    setSortBy,
    kpis,
    refetch: fetchProducts,
    handleToggleAvailability,
    handleUpdateStock,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    clearFilters,
  };
};
