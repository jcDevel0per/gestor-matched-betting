import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

// Helper to create/update user document in Firestore
const ensureUserDocument = async (user) => {
    if (!user) return;
    try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            await setDoc(userRef, {
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                createdAt: serverTimestamp()
            });
        }
    } catch (firestoreError) {
        console.warn('Could not create user document (non-blocking):', firestoreError);
    }
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    // Handle redirect result on page load
    useEffect(() => {
        const handleRedirectResult = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result?.user) {
                    console.log('Redirect login successful:', result.user.email);
                    await ensureUserDocument(result.user);
                }
            } catch (error) {
                console.error('Redirect result error:', error.code, error.message);
                setAuthError(error);
            }
        };

        handleRedirectResult();
    }, []);

    // Login with Google - try popup first, fall back to redirect
    const loginWithGoogle = async () => {
        setAuthError(null);
        try {
            // Try popup first
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            await ensureUserDocument(user);
            return user;
        } catch (popupError) {
            console.warn('Popup login failed, trying redirect...', popupError.code, popupError.message);

            // If popup was closed by user, don't fallback to redirect
            if (popupError.code === 'auth/popup-closed-by-user' ||
                popupError.code === 'auth/cancelled-popup-request') {
                throw popupError;
            }

            // For all other errors (blocked popup, cross-origin, etc.), try redirect
            try {
                await signInWithRedirect(auth, googleProvider);
                // This won't return - the page will redirect to Google
                // Result will be handled by getRedirectResult on page reload
                return null;
            } catch (redirectError) {
                console.error('Redirect login also failed:', redirectError.code, redirectError.message);
                throw redirectError;
            }
        }
    };

    // Logout
    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        loginWithGoogle,
        logout,
        loading,
        authError
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
