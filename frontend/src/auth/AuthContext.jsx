import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import API from "../api";

const AuthContext =
  createContext(null);

// Local testing only: skip the login screen when the backend has DEV_LOGIN=true
const DEV_AUTOLOGIN =
  import.meta.env.DEV &&
  import.meta.env.VITE_DEV_AUTOLOGIN === "true";

async function devLogin() {

  try {

    const res =
      await API.post(
        "/auth/dev-login"
      );

    localStorage.setItem(
      "token",
      res.data.token
    );

    localStorage.setItem(
      "role",
      res.data.user.role || "user"
    );

    return res.data.token;

  } catch (error) {

    console.error(
      "Dev auto-login failed",
      error.message
    );

    return null;
  }
}

export function AuthProvider({

  children

}) {

  const [user,
    setUser] =
    useState(null);

  const [loading,
    setLoading] =
    useState(true);

  async function loadUser(allowDevRetry = true) {

    let token =
      localStorage.getItem(
        "token"
      );

    if (!token && DEV_AUTOLOGIN) {
      token = await devLogin();
    }

    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {

      const res =
        await API.get(
          "/auth/me"
        );

      setUser(
        res.data.user
      );

      // Preserve existing admin role in localStorage; only upgrade, never downgrade
      const existingRole = localStorage.getItem("role");
      const backendRole = res.data.user.role || "user";
      const roleToStore = (existingRole === "admin" || backendRole === "admin") ? "admin" : backendRole;
      localStorage.setItem("role", roleToStore);

      return res.data.user;

    } catch (error) {

      console.error(
        "JWT session validation failed",
        {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        }
      );

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "role"
      );

      setUser(null);

      // In-memory DB resets on restart, so re-create the dev session once
      if (DEV_AUTOLOGIN && allowDevRetry) {
        return loadUser(false);
      }

      return null;

    } finally {

      setLoading(false);
    }
  }

  async function refreshUser() {
    return loadUser();
  }

  useEffect(() => {

    loadUser();

  }, []);

  function saveSession(token, nextUser) {

    localStorage.setItem(
      "token",
      token
    );

    localStorage.setItem(
      "role",
      nextUser.role || "user"
    );

    setUser(
      nextUser
    );
  }

  function logout() {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "role"
    );

    setUser(null);
  }

  const value =
    useMemo(
      () => ({
        currentUser: user,
        user,
        profile: user,
        loading,
        isAuthenticated:
          Boolean(user),
        loadUser,
        logout,
        saveSession,
        refreshUser
      }),
      [
        user,
        loading
      ]
    );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {

  const context =
    useContext(
      AuthContext
    );

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
