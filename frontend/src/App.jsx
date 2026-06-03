import {
  BrowserRouter,
  Routes,
  Route
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


// 👑 Admin
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


// 🧩 Components
import Sidebar
  from "./components/Sidebar";

import AdminRoute
  from "./components/AdminRoute";


export default function App() {

  return (

    <BrowserRouter>

      <div
        className="
          flex
          bg-[#171717]
          text-white
          min-h-screen
        "
      >

        <Routes>

          {/* 🌍 Landing */}
          <Route
            path="/"
            element={<LandingPage />}
          />


          {/* 🔐 Login */}
          <Route
            path="/login"
            element={<Login />}
          />


          {/* 📦 Main App */}
          <Route
            path="/*"
            element={

              <div className="flex w-full">

                <Sidebar />

                <div className="flex-1">

                  <Routes>

                    {/* 🎨 Workspace */}
                    <Route
                      path="/workspace"
                      element={<AIWorkspace />}
                    />


                    {/* 🕘 History */}
                    <Route
                      path="/history"
                      element={<History />}
                    />


                    {/* 🛒 Cart */}
                    <Route
                      path="/cart"
                      element={<Cart />}
                    />


                    {/* ❤️ Wishlist */}
                    <Route
                      path="/wishlist"
                      element={<Wishlist />}
                    />


                    {/* 📦 Orders */}
                    <Route
                      path="/orders"
                      element={<Orders />}
                    />


                    {/* 💳 Checkout */}
                    <Route
                      path="/checkout"
                      element={<Checkout />}
                    />


                    {/* 👑 Admin */}
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

                  </Routes>

                </div>

              </div>
            }
          />

        </Routes>

      </div>

    </BrowserRouter>
  );
}