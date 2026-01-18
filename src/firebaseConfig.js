// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA_NuSpKgUvICwNm4KziDOlvTNZLWMcx4M",
    authDomain: "sistemagestormatchedbetting.firebaseapp.com",
    projectId: "sistemagestormatchedbetting",
    storageBucket: "sistemagestormatchedbetting.firebasestorage.app",
    messagingSenderId: "842479596505",
    appId: "1:842479596505:web:24184908c2b46276841fc8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Authentication
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
