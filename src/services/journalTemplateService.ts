import { JournalTemplate, PracticeAssignment } from '../types';
import { db } from './firebase';
import { collection, getDocs, query, where, doc, getDoc, setDoc } from 'firebase/firestore';

const COLLECTION = 'journalTemplates';

export const journalTemplateService = {
  getAllTemplates: async (): Promise<JournalTemplate[]> => {
    const q = collection(db, COLLECTION);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JournalTemplate));
  },
  
  getTemplateById: async (id: string): Promise<JournalTemplate | null> => {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as JournalTemplate) : null;
  },

  getJournalTemplateForAssignment: async (assignment: PracticeAssignment): Promise<string | undefined> => {
    // Basic mapping logic
    // We might need to fetch the direction/practice details if not in assignment, 
    // but assignment seems to have enough for now based on requirements.
    
    // Hardcoded mapping for Psixologiya
    // In a real scenario, this would check against directions/practiceTypes
    // Assuming assignment.directionId could be used if we had access to direction mapping, 
    // but the request asked to add mapping for Psychology.
    
    // For now, if we can't reliably map, we return undefined (legacy)
    // The requirement says:
    // PSIXOLOGIYA → PSYCHOLOGY_DAILY
    
    // I need to know how to identify Psixologiya.
    // The requirement says: "getJournalTemplateForAssignment(assignment)"
    // It says: "Tizim mavjud Student -> Group -> Direction -> Practice Assignment bog'lanishidan foydalanib... Psixologiya yo'nalishidagi assignment uchun: templateId = 'PSYCHOLOGY_DAILY' ni aniqlay olishi kerak."
    
    // I will assume for now we can check the direction name if available, or just check the directionId if we knew it.
    // Since I can't know the directionId, I'll need a way to look it up or add a temporary hardcoded check if necessary, 
    // but the user said "do not hardcode in many places".
    // I will add a helper that checks the direction name by fetching it.
    
    const directionRef = doc(db, 'directions', assignment.directionId);
    const directionSnap = await getDoc(directionRef);
    if (directionSnap.exists()) {
        const direction = directionSnap.data();
        if (direction.name === 'Psixologiya') {
            return 'PSYCHOLOGY_DAILY';
        }
    }
    
    return undefined; // Legacy
  },

  seedPsixologiyaTemplate: async () => {
    const templateRef = doc(db, COLLECTION, 'PSYCHOLOGY_DAILY');
    const templateSnap = await getDoc(templateRef);
    if (!templateSnap.exists()) {
        const template: JournalTemplate = {
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
        await setDoc(templateRef, template);
    }
  }
};
