import {
  getApp,
  getApps,
  initializeApp
} from "firebase/app";

import {
  browserLocalPersistence,
  getAuth,
  setPersistence
} from "firebase/auth";

import {
  getFirestore
} from "firebase/firestore";

export const firebaseConfig = {

  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyDG12pBy9EEQ9IZ3MCN0cNMvRhl-D1df7I",

  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "aishirtmaking.firebaseapp.com",

  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ||
    "aishirtmaking",

  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "aishirtmaking.firebasestorage.app",

  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    "464155141488",

  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:464155141488:web:42bbb639c576fced391bb5",

  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ||
    "G-YC6J01HWN2"
};

const app =
  getApps().length
    ? getApp()
    : initializeApp(firebaseConfig);

export const auth =
  getAuth(app);

auth.languageCode = "en";

setPersistence(
  auth,
  browserLocalPersistence
).catch((error) => {
  console.error(
    "Firebase auth persistence failed",
    {
      code: error.code,
      message: error.message
    }
  );
});

export const db =
  getFirestore(app);

export function logFirebaseClientDiagnostics() {

  const host =
    window.location.hostname;

  const allowedLocalHosts = [
    "localhost",
    "127.0.0.1"
  ];

  console.info(
    "Firebase client diagnostics",
    {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      currentOrigin: window.location.origin,
      localhost:
        allowedLocalHosts.includes(host),
      phoneAuthRequiredConsoleChecks: [
        "Authentication > Sign-in method > Phone must be enabled",
        "Authentication > Settings > Authorized domains must include this host",
        "Google Cloud billing must be enabled for real SMS OTP",
        "App Check enforcement for Identity Toolkit/Auth should be disabled unless configured for this web app"
      ],
      recaptchaContainer:
        Boolean(
          document.getElementById(
            "recaptcha-container"
          )
        )
    }
  );
}
