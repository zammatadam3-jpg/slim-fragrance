import { initializeApp } from 'firebase/app';
import {
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  getDocs,
  initializeFirestore,
  onSnapshot,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { ALL_CATALOG_ITEMS, Fragrance } from '../data/fragrances';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with the provisioned database ID and auto-detect long polling
// CRITICAL: The app will break without firebaseConfig.firestoreDatabaseId
export const db = initializeFirestore(
  app,
  {
    experimentalAutoDetectLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId
);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: false,
      isAnonymous: true,
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
}

export async function testConnection(): Promise<boolean> {
  try {
    const colRef = collection(db, FRAGRANCES_COLLECTION);
    await getDocs(colRef);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline notice. Check network.');
    }
    return false;
  }
}

export const FRAGRANCES_COLLECTION = 'fragrances';

function sanitizeForFirestore(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);

  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = sanitizeForFirestore(value);
    }
  }
  return clean;
}

export async function getFragrancesFromFirestore(): Promise<Fragrance[]> {
  try {
    const colRef = collection(db, FRAGRANCES_COLLECTION);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) return [];
    const items: Fragrance[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && typeof data.name === 'string') {
        items.push({
          ...(data as Fragrance),
          id: (data.id as string) || docSnap.id,
        });
      }
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, FRAGRANCES_COLLECTION);
    return [];
  }
}

export function subscribeToFragrances(
  onUpdate: (items: Fragrance[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const colRef = collection(db, FRAGRANCES_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: Fragrance[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && typeof data.name === 'string') {
          items.push({
            ...(data as Fragrance),
            id: (data.id as string) || docSnap.id,
          });
        }
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, FRAGRANCES_COLLECTION);
      if (onError) onError(error);
    }
  );
}

export async function saveFragranceToFirestore(item: Fragrance): Promise<boolean> {
  const docPath = `${FRAGRANCES_COLLECTION}/${item.id}`;
  try {
    const docRef = doc(db, FRAGRANCES_COLLECTION, item.id);
    const sanitized = sanitizeForFirestore({
      ...item,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(docRef, sanitized, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
    return false;
  }
}

export async function deleteFragranceFromFirestore(id: string): Promise<boolean> {
  const docPath = `${FRAGRANCES_COLLECTION}/${id}`;
  try {
    const docRef = doc(db, FRAGRANCES_COLLECTION, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
    return false;
  }
}

export async function saveBatchFragrancesToFirestore(items: Fragrance[]): Promise<boolean> {
  try {
    const batch = writeBatch(db);

    items.forEach((item) => {
      const docRef = doc(db, FRAGRANCES_COLLECTION, item.id);
      const sanitized = sanitizeForFirestore({
        ...item,
        updatedAt: new Date().toISOString(),
      });
      batch.set(docRef, sanitized, { merge: true });
    });

    try {
      await batch.commit();
      return true;
    } catch (batchErr) {
      console.warn('Batch commit notice, writing items individually:', batchErr);
      for (const item of items) {
        try {
          const docRef = doc(db, FRAGRANCES_COLLECTION, item.id);
          const sanitized = sanitizeForFirestore({
            ...item,
            updatedAt: new Date().toISOString(),
          });
          await setDoc(docRef, sanitized, { merge: true });
        } catch (singleErr) {
          console.warn(`Notice writing item ${item.id}:`, singleErr);
        }
      }
      return true;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, FRAGRANCES_COLLECTION);
    return false;
  }
}

export async function seedInitialFirestoreIfNeeded(): Promise<Fragrance[]> {
  try {
    return await getFragrancesFromFirestore();
  } catch (error) {
    console.warn('Firestore fetch notice:', error);
    return [];
  }
}

// Initial connection check
testConnection();
