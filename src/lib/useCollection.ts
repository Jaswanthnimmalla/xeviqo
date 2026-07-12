// src/lib/useCollection.ts
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  QueryConstraint,
  DocumentData,
  QuerySnapshot,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

export function useCollection<T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<(T & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const ref = collection(db, collectionName);
    const q = constraints.length ? query(ref, ...constraints) : query(ref);

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        const docs = snapshot.docs.map((d) => ({ 
          id: d.id, 
          ...(d.data() as T) 
        }));
        setData(docs);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`useCollection(${collectionName}) error:`, err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, JSON.stringify(constraints.map((c) => c.type))]);

  return { data, loading, error };
}

export function toLookupMap<T extends { id: string }>(items: T[]): Record<string, T> {
  return items.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<string, T>);
}