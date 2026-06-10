import { Navigate }
  from "react-router-dom";

import {
  useAuth
} from "../auth/AuthContext";

export default function AdminRoute({

  children

}) {

  const role =
    localStorage.getItem("role");

  const {
    loading,
    profile
  } =
    useAuth();

  if (loading) {
    return null;
  }

  if ((profile?.role || role) !== "admin") {

    return <Navigate to="/" />;
  }

  return children;
}
