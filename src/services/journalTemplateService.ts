import { JournalTemplate, PracticeAssignment } from '../types';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';

const COLLECTION = 'journalTemplates';

const PSYCHOLOGY_TEMPLATE_DEFAULT: JournalTemplate = {
    id: 'PSYCHOLOGY_DAILY',
    name: 'Psixologiya amaliyoti elektron kundaligi',
    description: 'Psixologiya yo\'nalishi talabalarining amaliyot davomida bajarilgan ishlarini qayd etish kundaligi.',
    active: true,
    fields: [
        { key: 'observation', label: 'Kuzatuv', type: 'textarea', required: true, order: 1 },
        { key: 'studentWork', label: 'O‘quvchilar/tarbiyalanuvchilar bilan bajarilgan ishlar', type: 'textarea', required: true, order: 2 },
        { key: 'psychologicalInterview', label: 'Psixologik suhbat', type: 'textarea', required: false, order: 3 },
        { key: 'diagnostics', label: 'Psixologik diagnostika', type: 'textarea', required: false, order: 4 },
        { key: 'consultation', label: 'Konsultativ ishlar', type: 'textarea', required: false, order: 5 },
        { key: 'training', label: 'Trening yoki psixologik mashg‘ulot', type: 'textarea', required: false, order: 6 },
        { key: 'preventionActivity', label: 'Profilaktik tadbirlar', type: 'textarea', required: false, order: 7 },
        { key: 'identifiedProblems', label: 'Aniqlangan muammolar', type: 'textarea', required: false, order: 8 },
        { key: 'performedWork', label: 'Amalga oshirilgan ishlar', type: 'textarea', required: true, order: 9 },
        { key: 'dailyConclusion', label: 'Kunlik xulosa', type: 'textarea', required: true, order: 10 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

export const journalTemplateService = {
  getAllTemplates: async (): Promise<JournalTemplate[]> => {
    if (!db) return [PSYCHOLOGY_TEMPLATE_DEFAULT];
    try {
      const q = collection(db, COLLECTION);
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JournalTemplate));
      if (!list.some(t => t.id === 'PSYCHOLOGY_DAILY')) {
        list.push(PSYCHOLOGY_TEMPLATE_DEFAULT);
      }
      return list;
    } catch (error) {
      console.warn('Fetching templates from Firestore failed, using default:', error);
      return [PSYCHOLOGY_TEMPLATE_DEFAULT];
    }
  },
  
  getTemplateById: async (id: string): Promise<JournalTemplate | null> => {
    if (!db) {
      return id === 'PSYCHOLOGY_DAILY' ? PSYCHOLOGY_TEMPLATE_DEFAULT : null;
    }
    try {
      const docRef = doc(db, COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as JournalTemplate;
      }
      if (id === 'PSYCHOLOGY_DAILY') {
        return PSYCHOLOGY_TEMPLATE_DEFAULT;
      }
    } catch (error) {
      console.warn('Fetching template by ID failed, using default if psychology:', error);
      if (id === 'PSYCHOLOGY_DAILY') {
        return PSYCHOLOGY_TEMPLATE_DEFAULT;
      }
    }
    return null;
  },

  getJournalTemplateForAssignment: async (assignment: PracticeAssignment): Promise<string | undefined> => {
    if (!db) return undefined;
    try {
        if (!assignment?.directionId) return undefined;
        const directionRef = doc(db, 'directions', assignment.directionId);
        const directionSnap = await getDoc(directionRef);
        if (directionSnap.exists()) {
            const direction = directionSnap.data();
            if (direction.name === 'Psixologiya') {
                return 'PSYCHOLOGY_DAILY';
            }
        }
    } catch (error) {
        console.warn('Error fetching direction for template mapping:', error);
    }
    
    return undefined; // Legacy
  },

  seedPsixologiyaTemplate: async () => {
    if (!db) return;
    try {
        const templateRef = doc(db, COLLECTION, 'PSYCHOLOGY_DAILY');
        const templateSnap = await getDoc(templateRef);
        if (!templateSnap.exists()) {
            await setDoc(templateRef, PSYCHOLOGY_TEMPLATE_DEFAULT);
        }
    } catch (error) {
        console.warn('Error seeding psychology template to Firestore:', error);
    }
  }
};
