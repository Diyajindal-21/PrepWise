// Import the functions you need from the SDKs you need
import { initializeApp,getApp,getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAI4Hhpoc02A6S3EOlBSlJQ9i0XEsdFA38",
  authDomain: "prepwise-a17dc.firebaseapp.com",
  projectId: "prepwise-a17dc",
  storageBucket: "prepwise-a17dc.firebasestorage.app",
  messagingSenderId: "231541033953",
  appId: "1:231541033953:web:10c09c279627d45edda0a0",
  measurementId: "G-HHJE06F27N"
};

// Initialize Firebase
const app = !getApps.length? initializeApp(firebaseConfig):getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);