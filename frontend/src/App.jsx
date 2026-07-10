import {
  Suspense,
  lazy,
  useEffect
} from "react";

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from "react-router-dom";

import AIWorkspace
  from "./pages/AIWorkspace";

import Login
  from "./pages/Login";

import LandingPage
  from "./pages/LandingPage";

import Sidebar
  from "./components/Sidebar";

import AdminRoute
  from "./components/AdminRoute";

import ProtectedRoute
  from "./components/ProtectedRoute";

const Cart = lazy(() => import("./pages/Cart"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Orders = lazy(() => import("./pages/Orders"));
const Checkout = lazy(() => import("./pages/Checkout"));
const History = lazy(() => import("./pages/History"));
const Settings = lazy(() => import("./pages/Settings"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const AdminProducts = lazy(() => import("./pages/AdminProducts"));
const AdminCoupons = lazy(() => import("./pages/AdminCoupons"));
const AdminPresets = lazy(() => import("./pages/AdminPresets"));

function AppShell() {

  useEffect(() => {
    // Prefetch non-critical routes after the shell is mounted.
    const prefetch = () => {
      import("./pages/Orders");
      import("./pages/Checkout");
      import("./pages/Settings");
      import("./pages/History");
    };

    if ("requestIdleCallback" in window) {
      const handle = window.requestIdleCallback(prefetch);
      return () => window.cancelIdleCallback(handle);
    }

    const timer = window.setTimeout(prefetch, 1000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex w-full">
        <Sidebar />

        <div className="min-w-0 flex-1 md:pl-[280px]">
          <Suspense fallback={
            <main className="flex min-h-[60vh] items-center justify-center text-sm text-zinc-400">
              Loading page...
            </main>
          }>
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
          </Suspense>
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
