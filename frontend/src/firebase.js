import { initializeApp }
  from "firebase/app";

import {
  getAuth
} from "firebase/auth";

const firebaseConfig = {

  apiKey:
    "AIzaSyDG12pBy9EEQ9IZ3MCN0cNMvRhl-D1df7I",

  authDomain:
    "aishirtmaking.firebaseapp.com",

  projectId:
    "aishirtmaking",

  storageBucket:
    "aishirtmaking.firebasestorage.app",

  messagingSenderId:
    "464155141488",

  appId:
    "1:464155141488:web:42bbb639c576fced391bb5",

  measurementId:
    "G-YC6J01HWN2"
};

const app =
  initializeApp(firebaseConfig);

export const auth =
  getAuth(app);