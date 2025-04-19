import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  signInAnonymously,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    // Check if Firebase is properly initialized
    if (!auth) {
      console.error("Firebase auth is not initialized");
      setLoading(false);
      return;
    }

    setFirebaseInitialized(true);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setIsAnonymous(firebaseUser.isAnonymous);

          if (!firebaseUser.isAnonymous) {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            if (userDoc.exists()) {
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                ...userDoc.data(),
              });
            } else {
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                role: "guest", // Default role
              });
            }
          } else {
            setUser({
              uid: firebaseUser.uid,
              isAnonymous: true,
              role: "anonymous",
            });
          }
        } else {
          setUser(null);
          setIsAnonymous(false);
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInAnon = async () => {
    try {
      const result = await signInAnonymously(auth);
      return result.user;
    } catch (error) {
      console.error("Anonymous sign-in failed:", error);
      throw error;
    }
  };

  const signUp = async (email, password, role, displayName) => {
    if (!firebaseInitialized) {
      throw new Error("Firebase authentication is not initialized");
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const { user: firebaseUser } = userCredential;

      // Create user document in Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), {
        email: firebaseUser.email,
        role,
        displayName,
        createdAt: new Date().toISOString(),
      });

      return firebaseUser;
    } catch (error) {
      console.error("Error signing up:", error);

      // Provide more specific error messages
      if (error.code === "auth/configuration-not-found") {
        throw new Error(
          "Firebase configuration error. Please check your environment variables."
        );
      } else if (error.code === "auth/email-already-in-use") {
        throw new Error(
          "This email is already in use. Please try another email or log in."
        );
      } else if (error.code === "auth/invalid-email") {
        throw new Error(
          "Invalid email address. Please check your email and try again."
        );
      } else if (error.code === "auth/weak-password") {
        throw new Error(
          "Password is too weak. Please use a stronger password."
        );
      } else {
        throw new Error(
          error.message || "Failed to sign up. Please try again later."
        );
      }
    }
  };

  const signIn = async (email, password) => {
    if (!firebaseInitialized) {
      throw new Error("Firebase authentication is not initialized");
    }

    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error signing in:", error);

      // Provide more specific error messages
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        throw new Error("Invalid email or password. Please try again.");
      } else if (error.code === "auth/too-many-requests") {
        throw new Error(
          "Too many failed login attempts. Please try again later."
        );
      } else if (error.code === "auth/configuration-not-found") {
        throw new Error(
          "Firebase configuration error. Please check your environment variables."
        );
      } else {
        throw new Error(
          error.message || "Failed to sign in. Please try again later."
        );
      }
    }
  };

  const currentuser = () => {
    if (!firebaseInitialized) {
      throw new Error("Firebase authentication is not initialized");
    }
    return user;
  };

  const logout = async () => {
    if (!firebaseInitialized) {
      throw new Error("Firebase authentication is not initialized");
    }

    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw new Error("Failed to sign out. Please try again.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAnonymous,
        signUp,
        signIn,
        signInAnon,
        logout,
        currentuser,
        firebaseInitialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
