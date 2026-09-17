import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { getRoleHomeRoute } from '../utils/auth';

// Layouts
import { AuthLayout } from '../layouts/AuthLayout';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { ShopOwnerLayout } from '../layouts/ShopOwnerLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

// Customer Pages
import { CustomerHomePage } from '../pages/customer/CustomerHomePage';
import { CustomerShopsPage } from '../pages/customer/CustomerShopsPage';
import { ShopDetailsPage } from '../pages/customer/ShopDetailsPage';
import { CustomerCartPage } from '../pages/customer/CustomerCartPage';
import { CustomerCheckoutPage } from '../pages/customer/CustomerCheckoutPage';
import { CustomerOrdersPage } from '../pages/customer/CustomerOrdersPage';
import { OrderDetailPage } from '../pages/customer/OrderDetailPage';
import { CustomerProfilePage } from '../pages/customer/CustomerProfilePage';
import { CustomerNotificationsPage } from '../pages/customer/CustomerNotificationsPage';

// Shop Owner Pages
import { ShopDashboard } from '../pages/shop/ShopDashboard';
import { ShopOrdersPage } from '../pages/shop/ShopOrdersPage';
import { ShopOrderDetailPage } from '../pages/shop/ShopOrderDetailPage';
import { ShopProductsPage } from '../pages/shop/ShopProductsPage';
import { ShopPickupSlotsPage } from '../pages/shop/ShopPickupSlotsPage';
import { ShopQrScannerPage } from '../pages/shop/ShopQrScannerPage';
import { ShopComplaintsPage } from '../pages/shop/ShopComplaintsPage';
import { ShopProfilePage } from '../pages/shop/ShopProfilePage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminShopsPage } from '../pages/admin/AdminShopsPage';
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage';
import { AdminOrderDetailPage } from '../pages/admin/AdminOrderDetailPage';


// Shared Error Pages
import { ForbiddenPage } from '../pages/shared/ForbiddenPage';
import { NotFoundPage } from '../pages/shared/NotFoundPage';

// Root Redirect Handler
const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getRoleHomeRoute(user.role)} replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root Path */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected Customer Routes */}
      <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<CustomerHomePage />} />
          <Route path="shops" element={<CustomerShopsPage />} />
          <Route path="shops/:shopId" element={<ShopDetailsPage />} />
          <Route path="shop/:id" element={<ShopDetailsPage />} />
          <Route path="cart" element={<CustomerCartPage />} />
          <Route path="checkout" element={<CustomerCheckoutPage />} />
          <Route path="orders" element={<CustomerOrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="profile" element={<CustomerProfilePage />} />
          <Route path="profile/notifications" element={<CustomerNotificationsPage />} />
        </Route>
      </Route>

      {/* Protected Shop Owner Routes */}
      <Route element={<ProtectedRoute allowedRoles={['SHOP_OWNER']} />}>
        <Route path="/shop-owner" element={<ShopOwnerLayout />}>
          <Route index element={<ShopDashboard />} />
          <Route path="orders" element={<ShopOrdersPage />} />
          <Route path="orders/:id" element={<ShopOrderDetailPage />} />
          <Route path="products" element={<ShopProductsPage />} />
          <Route path="pickup-slots" element={<ShopPickupSlotsPage />} />
          <Route path="qr-pickup" element={<ShopQrScannerPage />} />
          <Route path="complaints" element={<ShopComplaintsPage />} />
          <Route path="profile" element={<ShopProfilePage />} />
        </Route>

        {/* Backward Compatibility Alias for /shop */}
        <Route path="/shop" element={<Navigate to="/shop-owner" replace />} />
        <Route path="/shop/*" element={<Navigate to="/shop-owner" replace />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="shops" element={<AdminShopsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:id" element={<AdminOrderDetailPage />} />
          <Route path="products" element={<AdminDashboard />} />
          <Route path="complaints" element={<AdminDashboard />} />
          <Route path="analytics" element={<AdminDashboard />} />
          <Route path="settings" element={<AdminDashboard />} />
        </Route>
      </Route>


      {/* Error & Fallback Routes */}
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
