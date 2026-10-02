import { firestoreService } from './firestoreService';
import { DailyJournal, PracticeAssignment, Attendance, AuditLog } from '../types';
import { query, where, getDocs, collection, Timestamp, doc, runTransaction, QueryConstraint, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { storageService } from './storageService';

const COLLECTION = 'dailyJournals';

export const dailyJournalService = {
  getAllJournals: async () => {
    const fsData = await firestoreService.queryDocuments(COLLECTION, []) as DailyJournal[];
    const lsData = storageService.getDailyJournals();
    return mergeData(fsData, lsData, 'id');
  },
  getJournalsByStudent: async (studentId: string) => {
    const constraints: QueryConstraint[] = [where('studentId', '==', studentId)];
    const fsData = await firestoreService.queryDocuments(COLLECTION, constraints) as DailyJournal[];
    const lsData = storageService.getDailyJournals().filter(j => j.studentId === studentId);
    return mergeData(fsData, lsData, 'id');
  },

  getJournalsByAssignment: async (assignmentId: string) => {
    const constraints: QueryConstraint[] = [where('assignmentId', '==', assignmentId)];
    const fsData = await firestoreService.queryDocuments(COLLECTION, constraints) as DailyJournal[];
    const lsData = storageService.getDailyJournals().filter(j => j.assignmentId === assignmentId);
    return mergeData(fsData, lsData, 'id');
  },

  getJournalsBySupervisor: async (supervisorId: string) => {
    const constraints: QueryConstraint[] = [where('supervisorId', '==', supervisorId)];
    const fsData = await firestoreService.queryDocuments(COLLECTION, constraints) as DailyJournal[];
    const lsData = storageService.getDailyJournals().filter(j => j.supervisorId === supervisorId);
    return mergeData(fsData, lsData, 'id');
  },

  getJournalsByGroup: async (groupId: string) => {
    const constraints: QueryConstraint[] = [where('groupId', '==', groupId)];
    const fsData = await firestoreService.queryDocuments(COLLECTION, constraints) as DailyJournal[];
    const lsData = storageService.getDailyJournals().filter(j => j.groupId === groupId);
    return mergeData(fsData, lsData, 'id');
  },

  getJournalById: async (journalId: string) => {
    return await firestoreService.getDocumentById(COLLECTION, journalId) as DailyJournal | null;
  },

  createJournal: async (data: Omit<DailyJournal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!db) {
      // Local fallback
      const newJournal: DailyJournal = {
        ...data,
        id: 'journal_' + Date.now(),
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      storageService.saveDailyJournal(newJournal);
      return newJournal.id;
    }

    try {
      const firestoreDb = db!;
      return await runTransaction(firestoreDb, async (transaction) => {
        // 1. Assignment Binding & Schedule Validation
        const assignmentRef = doc(firestoreDb, 'practiceAssignments', data.assignmentId);
        const assignmentSnap = await transaction.get(assignmentRef);
        if (assignmentSnap.exists()) {
          const assignment = assignmentSnap.data() as PracticeAssignment;
          const journalDate = new Date(data.journalDate || new Date());
          if (journalDate < new Date(assignment.startDate) || journalDate > new Date(assignment.endDate)) {
            throw new Error('Sana amaliyot muddatidan tashqarida.');
          }
        }

        // 2. Create
        const newDocRef = doc(collection(firestoreDb, COLLECTION));
        transaction.set(newDocRef, {
          ...data,
          status: 'OPEN',
          createdAt: Timestamp.now().toDate().toISOString(),
          updatedAt: Timestamp.now().toDate().toISOString(),
        });
        await createAuditLog(transaction, data.studentId, 'JOURNAL_CREATED', 'DailyJournal', newDocRef.id);
        return newDocRef.id;
      });
    } catch (e: any) {
      console.warn('Firestore createJournal failed, falling back to storageService:', e);
      const newJournal: DailyJournal = {
        ...data,
        id: 'journal_' + Date.now(),
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      storageService.saveDailyJournal(newJournal);
      return newJournal.id;
    }
  },

  submitJournal: async (journalId: string, actorUserId: string) => {
    if (!db) {
      const journals = storageService.getDailyJournals();
      const journal = journals.find(j => j.id === journalId);
      if (journal) {
        journal.status = 'SUBMITTED_TO_SUPERVISOR';
        journal.submittedAt = new Date().toISOString();
        journal.updatedAt = new Date().toISOString();
        storageService.saveDailyJournal(journal);
      }
      return;
    }

    try {
      const firestoreDb = db;
      if (!firestoreDb) throw new Error('Firebase ulanmagan');
      return await runTransaction(firestoreDb, async (transaction) => {
        const journalRef = doc(firestoreDb, COLLECTION, journalId);
        const journal = (await transaction.get(journalRef)).data() as DailyJournal;
        if (!journal) return;
        
        transaction.update(journalRef, { status: 'SUBMITTED_TO_SUPERVISOR', submittedAt: Timestamp.now().toDate().toISOString(), updatedAt: Timestamp.now().toDate().toISOString() });
        await createAuditLog(transaction, actorUserId, 'JOURNAL_SUBMITTED', 'DailyJournal', journalId);
      });
    } catch (e) {
      console.warn('Firestore submitJournal error:', e);
      const journals = storageService.getDailyJournals();
      const journal = journals.find(j => j.id === journalId);
      if (journal) {
        journal.status = 'SUBMITTED_TO_SUPERVISOR';
        journal.submittedAt = new Date().toISOString();
        journal.updatedAt = new Date().toISOString();
        storageService.saveDailyJournal(journal);
      }
    }
  },

  approveJournal: async (journalId: string, actorUserId: string) => {
    if (!db) {
      const journals = storageService.getDailyJournals();
      const journal = journals.find(j => j.id === journalId);
      if (journal) {
        journal.status = 'APPROVED_BY_SUPERVISOR';
        journal.reviewedAt = new Date().toISOString();
        journal.reviewedBy = actorUserId;
        journal.updatedAt = new Date().toISOString();
        storageService.saveDailyJournal(journal);
      }
      return;
    }

    try {
      const firestoreDb = db!;
      return await runTransaction(firestoreDb, async (transaction) => {
        const journalRef = doc(firestoreDb, COLLECTION, journalId);
        const journal = (await transaction.get(journalRef)).data() as DailyJournal;
        if (!journal) return;

        transaction.update(journalRef, { status: 'APPROVED_BY_SUPERVISOR', reviewedAt: Timestamp.now().toDate().toISOString(), reviewedBy: actorUserId, updatedAt: Timestamp.now().toDate().toISOString() });
        await createAuditLog(transaction, actorUserId, 'JOURNAL_APPROVED', 'DailyJournal', journalId);
      });
    } catch (e) {
      console.warn('Firestore approveJournal error:', e);
      const journals = storageService.getDailyJournals();
      const journal = journals.find(j => j.id === journalId);
      if (journal) {
        journal.status = 'APPROVED_BY_SUPERVISOR';
        journal.reviewedAt = new Date().toISOString();
        journal.reviewedBy = actorUserId;
        journal.updatedAt = new Date().toISOString();
        storageService.saveDailyJournal(journal);
      }
    }
  },

  returnJournal: async (journalId: string, actorUserId: string, comment: string) => {
    if (!db) {
      const journals = storageService.getDailyJournals();
      const journal = journals.find(j => j.id === journalId);
      if (journal) {
        journal.status = 'RETURNED_FOR_EDIT';
        journal.reviewComment = comment;
        journal.updatedAt = new Date().toISOString();
        storageService.saveDailyJournal(journal);
      }
      return;
    }

    try {
      const firestoreDb = db!;
      return await runTransaction(firestoreDb, async (transaction) => {
        const journalRef = doc(firestoreDb, COLLECTION, journalId);
        transaction.update(journalRef, { status: 'RETURNED_FOR_EDIT', reviewComment: comment, updatedAt: Timestamp.now().toDate().toISOString() });
        await createAuditLog(transaction, actorUserId, 'JOURNAL_RETURNED', 'DailyJournal', journalId);
      });
    } catch (e) {
      console.warn('Firestore returnJournal error:', e);
    }
  },
  
  reopenJournal: async (journalId: string, actorUserId: string, reason: string, role: string) => {
    if (!db) {
      const journals = storageService.getDailyJournals();
      const journal = journals.find(j => j.id === journalId);
      if (journal) {
        journal.status = role === 'SUPER_ADMIN' ? 'REOPENED_BY_SUPER_ADMIN' : 'REOPENED_BY_DEPARTMENT_HEAD';
        journal.reopenReason = reason;
        journal.reopenedBy = actorUserId;
        journal.reopenedAt = new Date().toISOString();
        journal.updatedAt = new Date().toISOString();
        storageService.saveDailyJournal(journal);
      }
      return;
    }

    try {
      const firestoreDb = db!;
      return await runTransaction(firestoreDb, async (transaction) => {
        const journalRef = doc(firestoreDb, COLLECTION, journalId);
        const status = role === 'SUPER_ADMIN' ? 'REOPENED_BY_SUPER_ADMIN' : 'REOPENED_BY_DEPARTMENT_HEAD';
        transaction.update(journalRef, { status, reopenReason: reason, reopenedBy: actorUserId, reopenedAt: Timestamp.now().toDate().toISOString(), updatedAt: Timestamp.now().toDate().toISOString() });
        await createAuditLog(transaction, actorUserId, 'JOURNAL_REOPENED', 'DailyJournal', journalId);
      });
    } catch (e) {
      console.warn('Firestore reopenJournal error:', e);
    }
  },

  closeExpiredJournals: async () => {
    if (!db) return;
    try {
      const firestoreDb = db!;
      const q = query(collection(firestoreDb, COLLECTION), where('status', 'in', ['OPEN', 'RETURNED_FOR_EDIT']));
      const snapshot = await getDocs(q);
      const now = new Date();
      
      const batch: any[] = [];
      snapshot.forEach(docSnap => {
          const journal = docSnap.data() as DailyJournal;
          const journalDate = new Date(journal.journalDate || new Date());
          const diffTime = Math.abs(now.getTime() - journalDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays > 3) {
              batch.push({ ref: docSnap.ref, data: { status: 'CLOSED_BY_3_DAY_TIMEOUT', updatedAt: Timestamp.now().toDate().toISOString() } });
          }
      });

      for (const item of batch) {
          await firestoreService.updateDocument(COLLECTION, item.ref.id, item.data);
      }
    } catch (e) {
      console.warn('closeExpiredJournals error:', e);
    }
  }
};

async function createAuditLog(transaction: any, actorUserId: string, action: string, entityType: string, entityId: string) {
    if (!db) return;
    try {
      const logRef = doc(collection(db, 'auditLogs'));
      transaction.set(logRef, {
          actorUserId,
          action,
          entityType,
          entityId,
          createdAt: Timestamp.now().toDate().toISOString()
      });
    } catch (e) {
      console.warn('createAuditLog error:', e);
    }
}

function mergeData<T extends { id: string }>(fsData: T[], lsData: T[], idField: keyof T): T[] {
    const fsMap = new Map(fsData.map(item => [item[idField], item]));
    lsData.forEach(item => {
        if (!fsMap.has(item[idField])) {
            fsMap.set(item[idField], item);
        }
    });
    return Array.from(fsMap.values());
}
