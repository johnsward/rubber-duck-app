// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getApp, getApps } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAbv143Xs0FfAcefxI6JSNLe_SWSj8AI2Q",
  authDomain: "rubber-duck-debugging-4e3e8.firebaseapp.com",
  projectId: "rubber-duck-debugging-4e3e8",
  storageBucket: "rubber-duck-debugging-4e3e8.firebasestorage.app",
  messagingSenderId: "613607688420",
  appId: "1:613607688420:web:a2da7ede0de6d50011c4f1",
  measurementId: "G-GH3Q7B4Y6R"
};



// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { app, analytics, db };
