import { db } from './firebase';
import { 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  Timestamp,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';

/**
 * Generic Firestore Service Layer
 * Hozircha mavjud storageService bilan parallel ishlaydi.
 * Kelajakda storageService'dagi ma'lumotlar shu orqali Firestore'ga ko'chiriladi.
 */

// Helper: String (ISO format) to Firebase Timestamp
const toTimestamp = (dateStr?: string) => (dateStr ? Timestamp.fromDate(new Date(dateStr)) : null);

// Helper: Firebase Timestamp to String (ISO format)
const fromTimestamp = (ts: any) => (ts instanceof Timestamp ? ts.toDate().toISOString() : ts);

const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    console.warn('Firestore operation failed, retrying...', error);
    // Retry on transient network/backend issues
    if (['unavailable', 'failed-precondition', 'internal'].includes(error.code) && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const firestoreService = {
  // Get document by ID
  getDocumentById: async (collectionName: string, id: string) => {
    if (!db) return null;
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await withRetry(() => getDoc(docRef));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (e) {
      console.warn(`Firestore getDocumentById (${collectionName}/${id}) error:`, e);
      return null;
    }
  },

  // Create new document
  createDocument: async (collectionName: string, data: DocumentData) => {
    if (!db) return 'local_' + Date.now();
    try {
      const colRef = collection(db, collectionName);
      const docRef = await addDoc(colRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (e) {
      console.warn(`Firestore createDocument (${collectionName}) error:`, e);
      return 'local_' + Date.now();
    }
  },

  // Update existing document
  updateDocument: async (collectionName: string, id: string, data: DocumentData) => {
    if (!db) return;
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (e) {
      console.warn(`Firestore updateDocument (${collectionName}/${id}) error:`, e);
    }
  },

  // Delete document
  deleteDocument: async (collectionName: string, id: string) => {
    if (!db) return;
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (e) {
      console.warn(`Firestore deleteDocument (${collectionName}/${id}) error:`, e);
    }
  },

  // Query documents with constraints
  queryDocuments: async (collectionName: string, constraints: QueryConstraint[]) => {
    if (!db) return [];
    try {
      const colRef = collection(db, collectionName);
      const q = query(colRef, ...constraints);
      const querySnapshot = await withRetry(() => getDocs(q));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.warn(`Firestore queryDocuments (${collectionName}) error:`, e);
      return [];
    }
  },
  
  // Export QueryConstraint for convenience
  QueryConstraint: {} as QueryConstraint
};
