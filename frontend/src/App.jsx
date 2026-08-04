import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from "react-router-dom";

import AIWorkspace
  from "./pages/AIWorkspace";

import Cart
  from "./pages/Cart";

import Wishlist
  from "./pages/Wishlist";

import Orders
  from "./pages/Orders";

import Checkout
  from "./pages/Checkout";

import Login
  from "./pages/Login";

import LandingPage
  from "./pages/LandingPage";

import History
  from "./pages/History";

import Settings
  from "./pages/Settings";

import AdminDashboard
  from "./pages/AdminDashboard";

import AdminUsers
  from "./pages/AdminUsers";

import AdminOrders
  from "./pages/AdminOrders";

import AdminProducts
  from "./pages/AdminProducts";

import AdminCoupons
  from "./pages/AdminCoupons";

import AdminPresets
  from "./pages/AdminPresets";

import Sidebar
  from "./components/Sidebar";

import AdminRoute
  from "./components/AdminRoute";

import ProtectedRoute
  from "./components/ProtectedRoute";

function AppShell() {

  return (
    <ProtectedRoute>
      <div className="flex w-full">
        <Sidebar />

        <div className="min-w-0 flex-1 md:pl-[280px]">
          <Routes>
            <Route
              path="/workspace"
              element={<AIWorkspace />}
            />

            <Route
              path="/history"
              element={<History />}
            />

            <Route
              path="/cart"
              element={<Cart />}
            />

            <Route
              path="/wishlist"
              element={<Wishlist />}
            />

            <Route
              path="/orders"
              element={<Orders />}
            />

            <Route
              path="/checkout"
              element={<Checkout />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />

            <Route
              path="/profile"
              element={<Settings />}
            />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            <Route
              path="/admin-users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />

            <Route
              path="/admin-orders"
              element={
                <AdminRoute>
                  <AdminOrders />
                </AdminRoute>
              }
            />

            <Route
              path="/admin-products"
              element={
                <AdminRoute>
                  <AdminProducts />
                </AdminRoute>
              }
            />

            <Route
              path="/admin-coupons"
              element={
                <AdminRoute>
                  <AdminCoupons />
                </AdminRoute>
              }
            />

            <Route
              path="/admin-presets"
              element={
                <AdminRoute>
                  <AdminPresets />
                </AdminRoute>
              }
            />

            <Route
              path="*"
              element={<Navigate to="/workspace" replace />}
            />
          </Routes>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function App() {

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#171717] text-white">
        <Routes>
          <Route
            path="/"
            element={<LandingPage />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/*"
            element={<AppShell />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
