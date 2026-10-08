import { firestoreService } from './firestoreService';
import { PracticePlace } from '../types';
import { collection, Timestamp, doc, runTransaction, query, where, getDocs, QueryConstraint } from 'firebase/firestore';
import { db } from './firebase';
import { storageService } from './storageService';

const COLLECTION = 'organizations';

export function getNextOrganizationId(existingPlaces?: PracticePlace[]): string {
  const places = existingPlaces || storageService.getPracticePlaces();
  let maxNum = 124; // Default baseline (default places are TASH-000125, TASH-000126, etc.)

  places.forEach(p => {
    const candidates = [p.organizationId, p.organizationCode, p.id];
    candidates.forEach(cand => {
      if (!cand) return;
      const match = cand.match(/(?:TASH|ORG)[-_]?(\d+)/i) || cand.match(/(\d+)/);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum && num < 1000000) {
          maxNum = num;
        }
      }
    });
  });

  const nextNum = maxNum + 1;
  return `TASH-${String(nextNum).padStart(6, '0')}`;
}

const DEMO_PLACE_IDS = ['place-1', 'place-2', 'place-3', 'place-4'];

export const organizationService = {
  getOrganizations: async () => {
    try {
      const fsData = await firestoreService.queryDocuments(COLLECTION, []) as PracticePlace[];
      const lsData = (storageService.getPracticePlaces() || []).filter(p => p && !DEMO_PLACE_IDS.includes(p.id));
      const validFsData = (fsData || []).filter(p => 
        p && 
        !DEMO_PLACE_IDS.includes(p.id) &&
        (p as any).status !== 'INACTIVE' && 
        (p as any).status !== 'DELETED'
      );
      return mergeData(validFsData, lsData, 'id');
    } catch {
      return (storageService.getPracticePlaces() || []).filter(p => p && !DEMO_PLACE_IDS.includes(p.id));
    }
  },

  clearAllOrganizations: async () => {
    storageService.clearAllPracticePlaces();
    if (db) {
      try {
        for (const id of DEMO_PLACE_IDS) {
          await firestoreService.updateDocument(COLLECTION, id, { status: 'DELETED', updatedAt: Timestamp.now().toDate().toISOString() }).catch(() => {});
        }
      } catch (err) {
        console.warn('Firestore clearAllOrganizations warning:', err);
      }
    }
  },

  getOrganization: async (id: string) => {
    try {
      const doc = await firestoreService.getDocumentById(COLLECTION, id) as PracticePlace | null;
      if (doc) return doc;
    } catch {
      // ignore
    }
    return storageService.getPracticePlaces().find(p => p.id === id || p.organizationId === id) || null;
  },

  createOrganization: async (data: Omit<PracticePlace, 'id'>) => {
    const orgId = data.organizationId || getNextOrganizationId();
    const id = `place-${Date.now()}`;
    const newPlace: PracticePlace = {
      ...data,
      id,
      organizationId: orgId,
      organizationCode: orgId,
      createdAt: new Date().toISOString()
    };

    // Save to local storage service
    storageService.savePracticePlace(newPlace);

    if (db) {
      try {
        const firestoreDb = db;
        await runTransaction(firestoreDb, async (transaction) => {
          const colRef = collection(firestoreDb, COLLECTION);
          const newDocRef = doc(colRef, id);
          transaction.set(newDocRef, {
            ...newPlace,
            createdAt: Timestamp.now().toDate().toISOString(),
            updatedAt: Timestamp.now().toDate().toISOString(),
            status: 'ACTIVE'
          });
        });
      } catch (err) {
        console.warn('Firestore createOrganization warning:', err);
      }
    }

    return id;
  },

  updateOrganization: async (id: string, data: Partial<PracticePlace>) => {
    const existing = storageService.getPracticePlaces().find(p => p.id === id);
    if (existing) {
      storageService.savePracticePlace({ ...existing, ...data });
    }
    if (db) {
      try {
        await firestoreService.updateDocument(COLLECTION, id, { ...data, updatedAt: Timestamp.now().toDate().toISOString() });
      } catch (err) {
        console.warn('Firestore updateOrganization warning:', err);
      }
    }
  },

  softDeleteOrganization: async (id: string) => {
    storageService.deletePracticePlace(id);
    if (db) {
      try {
        await firestoreService.updateDocument(COLLECTION, id, { status: 'INACTIVE', updatedAt: Timestamp.now().toDate().toISOString() });
      } catch (err) {
        console.warn('Firestore softDeleteOrganization warning:', err);
      }
    }
  }
};

function mergeData<T extends { id: string }>(fsData: T[], lsData: T[], idField: keyof T): T[] {
    const fsMap = new Map(fsData.map(item => [item[idField], item]));
    lsData.forEach(item => {
        if (!fsMap.has(item[idField])) {
            fsMap.set(item[idField], item);
        }
    });
    return Array.from(fsMap.values());
}
