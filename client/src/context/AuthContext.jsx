import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { getUserProfile, syncUserProfile } from '../services/firestoreService';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sbms_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('sbms_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          setToken(idToken);
          localStorage.setItem('sbms_token', idToken);

          const profile = await syncUserProfile(firebaseUser);
          const userData = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: profile?.name || firebaseUser.displayName || firebaseUser.email.split('@')[0],
            role: profile?.role || 'ADMIN',
            photoURL: firebaseUser.photoURL || null
          };
          setUser(userData);
          localStorage.setItem('sbms_user', JSON.stringify(userData));
        } catch (err) {
          console.warn('Could not sync Firestore profile:', err);
          const fallbackUser = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            role: 'ADMIN'
          };
          setUser(fallbackUser);
          localStorage.setItem('sbms_user', JSON.stringify(fallbackUser));
        }
      } else {
        // If not authenticated in Firebase and no local token exists
        const storedToken = localStorage.getItem('sbms_token');
        if (!storedToken) {
          setUser(null);
          localStorage.removeItem('sbms_user');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login with Firebase Email & Password (with REST demo fallback)
  const login = async (email, password) => {
    try {
      // 1. Attempt Firebase Authentication
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();
      setToken(idToken);
      localStorage.setItem('sbms_token', idToken);

      const profile = await syncUserProfile(cred.user);
      const userData = {
        id: cred.user.uid,
        uid: cred.user.uid,
        email: cred.user.email,
        name: profile?.name || cred.user.displayName || email.split('@')[0],
        role: profile?.role || 'ADMIN'
      };
      setUser(userData);
      localStorage.setItem('sbms_user', JSON.stringify(userData));
      return userData;
    } catch (fbErr) {
      console.warn('Firebase login attempt:', fbErr.code || fbErr.message);

      // If user doesn't exist in Firebase yet or password invalid, fallback to local backend REST API
      try {
        const res = await api.post('/auth/login', { email, password });
        if (res.data.success) {
          const { user: userData, token: jwtToken } = res.data.data;
          setUser(userData);
          setToken(jwtToken);
          localStorage.setItem('sbms_token', jwtToken);
          localStorage.setItem('sbms_user', JSON.stringify(userData));
          return userData;
        }
      } catch (backendErr) {
        // Translate Firebase common error codes into friendly messages
        if (fbErr.code === 'auth/invalid-credential' || fbErr.code === 'auth/user-not-found' || fbErr.code === 'auth/wrong-password') {
          throw new Error('Invalid email or password. If you are new, click "Create Account" below.');
        } else if (fbErr.code === 'auth/operation-not-allowed') {
          throw new Error('Email/Password sign-in is not enabled yet in your Firebase Console. Please enable it in Authentication > Sign-in method.');
        } else if (fbErr.code === 'auth/too-many-requests') {
          throw new Error('Access temporarily blocked due to many failed login attempts. Try again later.');
        }
        throw new Error(fbErr.message || 'Login failed. Please verify credentials.');
      }
    }
  };

  // Register new account with Firebase
  const signup = async (email, password, name, role = 'STAFF') => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();
      setToken(idToken);
      localStorage.setItem('sbms_token', idToken);

      const profile = await syncUserProfile(cred.user, { name, role });
      const userData = {
        id: cred.user.uid,
        uid: cred.user.uid,
        email: cred.user.email,
        name: name || cred.user.email.split('@')[0],
        role: role
      };
      setUser(userData);
      localStorage.setItem('sbms_user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('An account already exists with this email address.');
      } else if (err.code === 'auth/weak-password') {
        throw new Error('Password must be at least 6 characters.');
      } else if (err.code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password registration is not enabled yet in Firebase Console.');
      }
      throw new Error(err.message || 'Failed to create account.');
    }
  };

  // Sign In with Google
  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const idToken = await res.user.getIdToken();
      setToken(idToken);
      localStorage.setItem('sbms_token', idToken);

      const profile = await syncUserProfile(res.user);
      const userData = {
        id: res.user.uid,
        uid: res.user.uid,
        email: res.user.email,
        name: res.user.displayName || res.user.email.split('@')[0],
        role: profile?.role || 'ADMIN',
        photoURL: res.user.photoURL
      };
      setUser(userData);
      localStorage.setItem('sbms_user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        throw new Error('Google sign-in popup was closed.');
      } else if (err.code === 'auth/operation-not-allowed') {
        throw new Error('Google Sign-In is not enabled yet in your Firebase Console. Please go to Authentication > Sign-in method > Google and click Enable.');
      }
      throw new Error(err.message || 'Google sign-in failed.');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signOut error:', e);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('sbms_token');
    localStorage.removeItem('sbms_user');
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, loginWithGoogle, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
