import { Navigate }
  from "react-router-dom";

import {
  useAuth
} from "../auth/AuthContext";

export default function AdminRoute({

  children

}) {

  const localRole = localStorage.getItem("role");

  const {
    loading,
    profile
  } =
    useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] text-white flex items-center justify-center text-2xl">
        Loading admin access...
      </div>
    );
  }

  // Priority: localStorage (manual override) > backend profile
  const isAdmin = localRole === "admin" || profile?.role === "admin";
  if (!isAdmin) {

    return <Navigate to="/" />;
  }

  return children;
}
