import { Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { ProductsPage } from "./pages/ProductsPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { MainLayout } from "./components/layout/MainLayout";
import { OrderDetailsPage } from "./pages/OrderDetailsPage";
import { OrdersPage } from "./pages/OrdersPage";
import { ProfilePage } from "./pages/ProfilePage";
import { DashboardPage } from "./pages/DashboardPage";
import { OrderManagementPage } from "./pages/OrderManagementPage";
import { OrderDetailManagementPage } from "./pages/OrderDetailManagementPage";
import { ProductManagementPage } from "./pages/ProductManagementPage";
import { StockManagementPage } from "./pages/StockManagementPage";
import { TransportManagementPage } from "./pages/TransportManagementPage";
import { LocationsManagementPage } from "./pages/LocationsManagementPage";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { useAuthStore } from "./store/authStore";
import { CartPage } from "./pages/CartPage";
import { useEffect } from "react";

function App() {
  const { isAuthenticated } = useAuthStore();

  // Add dark class to html element
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/profile" element={<ProfilePage />} />

      {/* Public Order Routes */}
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/orders/:orderId" element={<OrderDetailsPage />} />

      {/* Protected Routes with Sidebar (Dashboard) */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/orders-management" element={<OrderManagementPage />} />
        <Route
          path="/orders-management/:orderId"
          element={<OrderDetailManagementPage />}
        />
        <Route
          path="/orders-management/:orderId/edit"
          element={<OrderDetailManagementPage />}
        />
        <Route
          path="/products-management"
          element={<ProductManagementPage />}
        />
        <Route path="/stock" element={<StockManagementPage />} />
        
        <Route path="/transport" element={<TransportManagementPage />} />
        <Route path="/locations" element={<LocationsManagementPage />} />
        <Route
          path="/users"
          element={
            <div className="text-white">User Management - Coming Soon</div>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
