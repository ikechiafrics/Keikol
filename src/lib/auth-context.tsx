import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

interface UserProfile {
  role?: "admin";
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  profileLoading: boolean;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function createUserProfile(user: User) {
  await setDoc(
    doc(db, "users", user.uid),
    {
      email: user.email,
      displayName: user.displayName ?? "",
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Kept separate from `loading` so routes that never need admin status
  // (the customer dashboard, the booking form) aren't slowed down waiting on
  // this extra fetch — only the admin guard route waits on it.
  useEffect(() => {
    // Wait until auth-state resolution itself is done — otherwise `user` is
    // `null` on the very first render (before Firebase has even checked for
    // a persisted session), and this effect would wrongly declare "resolved,
    // no profile" before the real session/profile fetch ever starts.
    if (loading) return;
    if (!user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    let cancelled = false;
    setProfileLoading(true);

    // The very first Firestore read right after sign-in can transiently
    // fail (token propagation, a slow network, etc.) — retry once after a
    // beat before failing closed, instead of permanently showing "not
    // admin" for the rest of the session until a manual refresh.
    async function loadProfile() {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const snap = await getDoc(doc(db, "users", user!.uid));
          if (cancelled) return;
          setProfile(snap.exists() ? (snap.data() as UserProfile) : null);
          return;
        } catch (err) {
          console.error(`Failed to load user profile (attempt ${attempt + 1}/2):`, err);
          if (attempt === 0) await new Promise((r) => setTimeout(r, 800));
        }
      }
      if (!cancelled) setProfile(null); // fail closed only after retrying
    }

    loadProfile().finally(() => {
      if (!cancelled) setProfileLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  async function signUpWithEmail(email: string, password: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(cred.user);
    // Google sign-in accounts are already verified by Google — only
    // email/password sign-ups need this.
    await sendEmailVerification(cred.user);
  }

  async function signInWithEmail(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signInWithGoogle() {
    const cred = await signInWithPopup(auth, new GoogleAuthProvider());
    await createUserProfile(cred.user);
  }

  async function signOutUser() {
    await signOut(auth);
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  async function resendVerificationEmail() {
    if (!auth.currentUser) return;
    await sendEmailVerification(auth.currentUser);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin: profile?.role === "admin",
        loading,
        profileLoading,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        signOutUser,
        resetPassword,
        resendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
