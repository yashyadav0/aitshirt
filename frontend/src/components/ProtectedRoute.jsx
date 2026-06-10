import {
  Navigate,
  useLocation
} from "react-router-dom";

import {
  useAuth
} from "../auth/AuthContext";

export default function ProtectedRoute({

  children

}) {

  const {
    isAuthenticated,
    loading
  } =
    useAuth();

  const location =
    useLocation();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0b0b] text-sm text-zinc-400">
        Checking session...
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location
        }}
      />
    );
  }

  return children;
}
