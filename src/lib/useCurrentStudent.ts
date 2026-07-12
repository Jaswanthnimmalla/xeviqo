// src/lib/useCurrentStudent.ts
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

export interface Student {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  role: string;
  status: string;
  profileImage?: string;
  bio?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  completedCourses?: string[];
  enrolledCourses?: string[];
  certificates?: string[];
  totalHours?: number;
  achievements?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export const useCurrentStudent = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setStudent({ uid: user.uid, ...docSnap.data() } as Student);
          } else {
            setStudent(null);
          }
        } catch (err) {
          setError(err as Error);
          setStudent(null);
        }
      } else {
        setUid(null);
        setStudent(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { student, uid, loading, error };
};