"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/firebase";
import type { AppUser } from "@/types";

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (!user) {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!firebaseUser) return;
    const unsubDoc = onSnapshot(doc(db, "users", firebaseUser.uid), (snap) => {
      setProfile(snap.exists() ? (snap.data() as AppUser) : null);
      setLoading(false);
      // Keep a lightweight role cookie so the edge middleware can let
      // admins/sub-admins bypass maintenance mode without an extra Firestore call.
      if (snap.exists()) {
        document.cookie = `zxh4_role=${(snap.data() as AppUser).role}; path=/; max-age=86400`;
      }
    });
    return () => unsubDoc();
  }, [firebaseUser]);

  return { firebaseUser, profile, loading };
}
