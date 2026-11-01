import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAi7jCBbs9ZAmWKeoj00RzVmKPJ4S-WiXg",
  authDomain: "sbms-34c40.firebaseapp.com",
  projectId: "sbms-34c40",
  storageBucket: "sbms-34c40.firebasestorage.app",
  messagingSenderId: "262827465666",
  appId: "1:262827465666:web:b7942b5170a5339022145b",
  measurementId: "G-WR1VWMZZYM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore
export const db = getFirestore(app);

export default app;
