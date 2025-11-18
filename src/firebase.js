// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCCN4DOmMsE7UJhMCo-XEZW2GieX8GGu0k",
  authDomain: "kalignappt.firebaseapp.com",
  projectId: "kalignappt",
  storageBucket: "kalignappt.appspot.com",
  messagingSenderId: "619134441180",
  appId: "1:619134441180:web:11dec6a26e9df7e4a68619"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
