// src/lib/useCurrentAdmin.ts
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import type { AppUser } from "../types";

export function useCurrentAdmin() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);

  useEffect(() => onAuthStateChanged(auth, setAuthUser), []);

  useEffect(() => {
    if (!authUser) {
      setProfile(null);
      return;
    }
    const unsub = onSnapshot(doc(db, "users", authUser.uid), (snap) => {
      if (snap.exists()) {
        // Type assertion to fix the red line
        const data = snap.data() as AppUser;
        setProfile({
          ...data,
          id: snap.id,
        });
      } else {
        setProfile(null);
      }
    });
    return () => unsub();
  }, [authUser]);

  return profile;
}