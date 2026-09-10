import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

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
import { CustomerOrdersPage } from '../pages/customer/CustomerOrdersPage';
import { CustomerProfilePage } from '../pages/customer/CustomerProfilePage';

// Dashboards
import { ShopDashboard } from '../pages/shop/ShopDashboard';
import { AdminDashboard } from '../pages/admin/AdminDashboard';

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

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  if (user.role === 'SHOP_OWNER') {
    return <Navigate to="/shop" replace />;
  }

  return <Navigate to="/customer" replace />;
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
          <Route path="cart" element={<CustomerCartPage />} />
          <Route path="orders" element={<CustomerOrdersPage />} />
          <Route path="profile" element={<CustomerProfilePage />} />
        </Route>
      </Route>

      {/* Protected Shop Owner Routes */}
      <Route element={<ProtectedRoute allowedRoles={['SHOP_OWNER']} />}>
        <Route path="/shop" element={<ShopOwnerLayout />}>
          <Route index element={<ShopDashboard />} />
          <Route path="orders" element={<ShopDashboard />} />
          <Route path="products" element={<ShopDashboard />} />
          <Route path="pickup-slots" element={<ShopDashboard />} />
          <Route path="qr-pickup" element={<ShopDashboard />} />
          <Route path="complaints" element={<ShopDashboard />} />
          <Route path="profile" element={<ShopDashboard />} />
        </Route>
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminDashboard />} />
          <Route path="shops" element={<AdminDashboard />} />
          <Route path="products" element={<AdminDashboard />} />
          <Route path="orders" element={<AdminDashboard />} />
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
