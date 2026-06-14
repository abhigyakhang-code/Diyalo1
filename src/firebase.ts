import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB2lARv2hNJMXRSqOy5GL-d7Eq3wkn8A74",
  authDomain: "khnag-1c2c9.firebaseapp.com",
  databaseURL: "https://khnag-1c2c9-default-rtdb.firebaseio.com",
  projectId: "khnag-1c2c9",
  storageBucket: "khnag-1c2c9.firebasestorage.app",
  messagingSenderId: "161319814182",
  appId: "1:161319814182:web:438dfccdad7615751392e7",
  measurementId: "G-X3EZ1VRF3H"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

// Keep user logged in across page reloads / logout-login cycles
setPersistence(auth, browserLocalPersistence).catch(() => {
  // ignore - falls back to default persistence
});