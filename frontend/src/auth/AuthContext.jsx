import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  onAuthStateChanged,
  signOut
} from "firebase/auth";

import {
  doc,
  getDoc
} from "firebase/firestore";

import API from "../api";

import {
  auth,
  db
} from "../firebase";

const AuthContext =
  createContext(null);

async function syncBackendSession(firebaseUser, profile) {

  if (!firebaseUser?.phoneNumber) {
    return;
  }

  try {

    const endpoint =
      profile?.name
        ? "/auth/complete-profile"
        : "/auth/firebase-login";

    const payload =
      profile?.name
        ? {
          phone: firebaseUser.phoneNumber,
          name: profile.name,
          email: profile.email || ""
        }
        : {
          phone: firebaseUser.phoneNumber
        };

    const res =
      await API.post(
        endpoint,
        payload
      );

    localStorage.setItem(
      "token",
      res.data.token
    );

    localStorage.setItem(
      "role",
      res.data.user.role || profile?.role || "user"
    );

  } catch (error) {

    console.error(
      "Backend session sync failed after Firebase auth",
      {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      }
    );
  }
}

export function AuthProvider({

  children

}) {

  const [currentUser,
    setCurrentUser] =
    useState(null);

  const [profile,
    setProfile] =
    useState(null);

  const [loading,
    setLoading] =
    useState(true);

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (firebaseUser) => {

          setCurrentUser(
            firebaseUser
          );

          if (!firebaseUser) {
            setProfile(null);
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            setLoading(false);
            return;
          }

          try {

            const snapshot =
              await getDoc(
                doc(
                  db,
                  "users",
                  firebaseUser.uid
                )
              );

            const userProfile =
              snapshot.exists()
                ? {
                  id: snapshot.id,
                  ...snapshot.data()
                }
                : null;

            setProfile(
              userProfile
            );

            localStorage.setItem(
              "role",
              userProfile?.role || "user"
            );

            await syncBackendSession(
              firebaseUser,
              userProfile
            );

          } catch (error) {

            console.error(
              "Firebase profile load failed",
              {
                code: error.code,
                message: error.message
              }
            );

            setProfile(null);

          } finally {

            setLoading(false);
          }
        }
      );

    return unsubscribe;

  }, []);

  async function logout() {

    await signOut(
      auth
    );

    localStorage.removeItem("token");
    localStorage.removeItem("role");
  }

  const value =
    useMemo(
      () => ({
        currentUser,
        profile,
        loading,
        logout,
        isAuthenticated:
          Boolean(currentUser)
      }),
      [
        currentUser,
        profile,
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
