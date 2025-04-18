// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: "G-HHJE06F27N"
};

// Initialize Firebase
let app;
try {
  // Fixed the check for existing apps
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log("Firebase client initialized successfully");
  } else {
    app = getApp();
    console.log("Using existing Firebase client app");
  }
} catch (error) {
  console.error("Error initializing Firebase client:", error);
  throw error;
}

export const auth = getAuth(app);
export const db = getFirestore(app);