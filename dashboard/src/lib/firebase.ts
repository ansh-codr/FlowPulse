import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY ?? "AIzaSyDtG3UyShHnsMq99TsUOrKb0LWWIBQ7V4M",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? "anshyadav.tech",
  projectId: env.VITE_FIREBASE_PROJECT_ID ?? "flowpulse-698a3",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "641591502705",
  appId: env.VITE_FIREBASE_APP_ID ?? "1:641591502705:web:0bae21ddb15c00ebbbf8d0",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const googleProvider = new GoogleAuthProvider();
