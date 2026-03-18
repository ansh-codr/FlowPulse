import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyDtG3UyShHnsMq99TsUOrKb0LWWIBQ7V4M",
  authDomain: "flowpulse-698a3.firebaseapp.com",
  projectId: "flowpulse-698a3",
  messagingSenderId: "641591502705",
  appId: "1:641591502705:web:0bae21ddb15c00ebbbf8d0",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const googleProvider = new GoogleAuthProvider();
