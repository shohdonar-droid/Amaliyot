import { User, Student, UserRole } from '../types';
import { doc, runTransaction, Firestore } from 'firebase/firestore';

const STUDENT_SEQ_KEY = 'aide_highest_student_sequence_v1';

/**
 * Transliterates Cyrillic Uzbek text to Latin and cleans special characters
 */
export function transliterateUzbek(text: string): string {
  if (!text) return '';
  const cyrToLat: Record<string, string> = {
    'А': 'A', 'а': 'a', 'Б': 'B', 'б': 'b', 'В': 'V', 'в': 'v',
    'Г': 'G', 'г': 'g', 'Д': 'D', 'д': 'd', 'Е': 'E', 'е': 'e',
    'Ё': 'Yo', 'ё': 'yo', 'Ж': 'J', 'ж': 'j', 'З': 'Z', 'з': 'z',
    'И': 'I', 'и': 'i', 'Й': 'Y', 'й': 'y', 'К': 'K', 'к': 'k',
    'Л': 'L', 'л': 'l', 'М': 'M', 'м': 'm', 'Н': 'N', 'н': 'n',
    'О': 'O', 'о': 'o', 'П': 'P', 'п': 'p', 'Р': 'R', 'р': 'r',
    'С': 'S', 'с': 's', 'Т': 'T', 'т': 't', 'У': 'U', 'у': 'u',
    'Ф': 'F', 'ф': 'f', 'Х': 'X', 'х': 'x', 'Ц': 'Ts', 'ц': 'ts',
    'Ч': 'Ch', 'ч': 'ch', 'Ш': 'Sh', 'ш': 'sh', 'Щ': 'Sh', 'щ': 'sh',
    'Ъ': '', 'ъ': '', 'Ы': 'I', 'ы': 'i', 'Ь': '', 'ь': '',
    'Э': 'E', 'э': 'e', 'Ю': 'Yu', 'ю': 'yu', 'Я': 'Ya', 'я': 'ya',
    'Ў': 'O', 'ў': 'o', 'Ғ': 'G', 'ғ': 'g', 'Қ': 'Q', 'q': 'q',
    'Ҳ': 'H', 'ҳ': 'h'
  };

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    result += cyrToLat[char] !== undefined ? cyrToLat[char] : char;
  }
  return result;
}

/**
 * Normalizes Uzbek apostrophes and cleans non-alphanumeric chars
 */
export function cleanNamePart(part: string): string {
  const transliterated = transliterateUzbek(part);
  return transliterated
    .replace(/[‘'ʻʼ`´]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .trim();
}

/**
 * Formats student sequence number into 5-digit T-code (e.g. 1 -> T00001, 100 -> T00100)
 */
export function formatStudentCode(sequenceNum: number): string {
  const padded = String(Math.max(1, sequenceNum)).padStart(5, '0');
  return `T${padded}`;
}

/**
 * Parses numeric sequence from a student login (e.g. "T00001" -> 1)
 */
export function parseStudentCodeSequence(codeOrLogin: string): number | null {
  if (!codeOrLogin) return null;
  const match = codeOrLogin.trim().toUpperCase().match(/^T(\d{5})$/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return null;
}

let inMemoryHighestSequence = 0;

/**
 * Scans students and users to find highest assigned student sequence,
 * incorporating persistent storage so deleted student numbers are NEVER reused.
 */
export function getNextStudentLogin(existingStudents: Student[] = [], existingUsers: User[] = []): string {
  let highest = inMemoryHighestSequence;

  // 1. Read persistent highest sequence recorded so far
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STUDENT_SEQ_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > highest) {
          highest = parsed;
        }
      }
    }
  } catch {
    // ignore
  }

  // 2. Scan existing students
  for (const s of existingStudents) {
    const seqFromCode = parseStudentCodeSequence(s.studentCode || s.login || '');
    if (seqFromCode && seqFromCode > highest) {
      highest = seqFromCode;
    }
  }

  // 3. Scan existing users
  for (const u of existingUsers) {
    const seqFromUser = parseStudentCodeSequence(u.studentCode || u.login || '');
    if (seqFromUser && seqFromUser > highest) {
      highest = seqFromUser;
    }
  }

  // 4. Default minimum starts at 1 (T00001)
  const nextSeq = highest + 1;
  inMemoryHighestSequence = nextSeq;

  // 5. Persist the new highest sequence so future deletions won't cause number reuse
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STUDENT_SEQ_KEY, String(nextSeq));
    }
  } catch {
    // ignore
  }

  return formatStudentCode(nextSeq);
}

/**
 * Concurrency-Safe Student Login Allocator using Firestore runTransaction.
 * Prevents race conditions when two or more admins create students simultaneously.
 * Document: systemCounters/studentLogin
 */
export async function allocateNextStudentLoginAtomic(
  db: Firestore | null,
  existingStudents: Student[] = [],
  existingUsers: User[] = []
): Promise<string> {
  // Compute highest from memory / localStorage as safety baseline
  let highestInMemory = inMemoryHighestSequence;
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STUDENT_SEQ_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > highestInMemory) {
          highestInMemory = parsed;
        }
      }
    }
  } catch {
    // ignore
  }

  for (const s of existingStudents) {
    const seq = parseStudentCodeSequence(s.studentCode || s.login || '');
    if (seq && seq > highestInMemory) highestInMemory = seq;
  }
  for (const u of existingUsers) {
    const seq = parseStudentCodeSequence(u.studentCode || u.login || '');
    if (seq && seq > highestInMemory) highestInMemory = seq;
  }

  // 1. Try atomic Firestore transaction if db is available
  if (db) {
    const firestoreDb = db;
    try {
      const counterRef = doc(firestoreDb, 'systemCounters', 'studentLogin');
      const allocatedCode = await runTransaction(firestoreDb, async (transaction) => {
        const counterSnap = await transaction.get(counterRef);
        let nextSeq: number;

        if (!counterSnap.exists()) {
          // Initialize counter document with migration from existing data
          nextSeq = highestInMemory + 1;
          transaction.set(counterRef, {
            type: 'STUDENT_LOGIN_COUNTER',
            lastIssuedNumber: nextSeq,
            updatedAt: new Date().toISOString()
          });
        } else {
          const data = counterSnap.data();
          const currentLast = typeof data.lastIssuedNumber === 'number' ? data.lastIssuedNumber : 0;
          const baseline = Math.max(currentLast, highestInMemory);
          nextSeq = baseline + 1;
          transaction.update(counterRef, {
            lastIssuedNumber: nextSeq,
            updatedAt: new Date().toISOString()
          });
        }

        return formatStudentCode(nextSeq);
      });

      // Synchronize local persistent cache
      const seqVal = parseStudentCodeSequence(allocatedCode);
      if (seqVal) {
        if (seqVal > inMemoryHighestSequence) {
          inMemoryHighestSequence = seqVal;
        }
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STUDENT_SEQ_KEY, String(seqVal));
          }
        } catch {
          // ignore
        }
      }

      return allocatedCode;
    } catch (txErr) {
      console.warn('Firestore counter transaction failed, falling back to local sequence:', txErr);
    }
  }

  // 2. Fallback to local persistent generator
  return getNextStudentLogin(existingStudents, existingUsers);
}

/**
 * Records that a sequence number was allocated/used.
 * Ensures the counter in Firestore and localStorage NEVER decrements on student deletion.
 */
export async function recordUsedStudentSequence(
  sequenceNum: number,
  db?: Firestore | null
): Promise<void> {
  if (sequenceNum <= 0) return;

  if (sequenceNum > inMemoryHighestSequence) {
    inMemoryHighestSequence = sequenceNum;
  }

  // 1. Update localStorage
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = parseInt(localStorage.getItem(STUDENT_SEQ_KEY) || '0', 10);
      if (sequenceNum > saved) {
        localStorage.setItem(STUDENT_SEQ_KEY, String(sequenceNum));
      }
    }
  } catch {
    // ignore
  }

  // 2. Update Firestore counter if higher
  if (db) {
    const firestoreDb = db;
    try {
      const counterRef = doc(firestoreDb, 'systemCounters', 'studentLogin');
      await runTransaction(firestoreDb, async (transaction) => {
        const snap = await transaction.get(counterRef);
        if (!snap.exists()) {
          transaction.set(counterRef, {
            type: 'STUDENT_LOGIN_COUNTER',
            lastIssuedNumber: sequenceNum,
            updatedAt: new Date().toISOString()
          });
        } else {
          const cur = snap.data().lastIssuedNumber || 0;
          if (sequenceNum > cur) {
            transaction.update(counterRef, {
              lastIssuedNumber: sequenceNum,
              updatedAt: new Date().toISOString()
            });
          }
        }
      });
    } catch (err) {
      console.warn('Failed to update Firestore student counter:', err);
    }
  }
}

/**
 * Generates `familyasi_ismi` login format for non-student roles.
 * Strips academic titles (Dr., Prof., Dots., PhD) and handles duplicate suffixes (Ergashev_Odil, Ergashev_Odil2, etc.)
 */
export function generateStaffLogin(fullName: string, existingLogins: string[] = []): string {
  if (!fullName || !fullName.trim()) {
    return `xodim_${Math.floor(1000 + Math.random() * 9000)}`;
  }

  // Remove common academic prefixes
  const cleaned = fullName
    .replace(/\b(Dr\.|Prof\.|Dots\.|PhD|DSc|Assistent|Dotsent|Professor|Katta o'qituvchi)\b/gi, '')
    .trim();

  // Split into parts (e.g., ["Ergashev", "Odil", "Mirzayevich"])
  const parts = cleaned.split(/\s+/).filter(Boolean);

  let surname = '';
  let firstname = '';

  if (parts.length >= 2) {
    surname = cleanNamePart(parts[0]);
    firstname = cleanNamePart(parts[1]);
  } else if (parts.length === 1) {
    surname = cleanNamePart(parts[0]);
    firstname = 'Xodim';
  } else {
    surname = 'Xodim';
    firstname = 'Masul';
  }

  // Ensure title case (First letter uppercase, rest lowercase)
  const formatCase = (s: string) => s.length > 0 ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
  const baseLogin = `${formatCase(surname)}_${formatCase(firstname)}`;

  // Lowercase map of existing logins for collision check
  const existingSet = new Set(existingLogins.map(l => l.trim().toLowerCase()));

  if (!existingSet.has(baseLogin.toLowerCase())) {
    return baseLogin;
  }

  // If collision exists, append suffix starting from 2
  let counter = 2;
  while (existingSet.has(`${baseLogin.toLowerCase()}${counter}`)) {
    counter++;
  }
  return `${baseLogin}${counter}`;
}

/**
 * Returns the technical Firebase email for a given login and role.
 * User never sees or types this technical email.
 */
export function getTechnicalEmail(login: string, role?: UserRole): string {
  const cleanLogin = login.trim();

  // If already full email
  if (cleanLogin.includes('@')) {
    return cleanLogin.toLowerCase();
  }

  // If student format T00001
  if (/^T\d{5}$/i.test(cleanLogin)) {
    return `${cleanLogin.toUpperCase()}@student.uz`;
  }

  const roleStr = String(role || '').toUpperCase();

  if (roleStr.includes('HEAD') || roleStr.includes('STAFF')) {
    return `${cleanLogin}@practice.uz`;
  }
  if (roleStr.includes('DEAN')) {
    return `${cleanLogin}@dean.uz`;
  }
  if (roleStr.includes('SUPERVISOR')) {
    return `${cleanLogin}@supervisor.uz`;
  }
  if (roleStr.includes('CLINIC')) {
    return `${cleanLogin}@clinic.uz`;
  }
  if (roleStr.includes('ADMIN')) {
    return `${cleanLogin}@system.uz`;
  }

  // Default fallback for student or general
  return `${cleanLogin}@student.uz`;
}

/**
 * Resolves user-entered login (e.g. "T00001", "Ergashev_Odil", "admin")
 * to candidate technical emails for Firebase Authentication.
 */
export function resolveLoginToCandidateEmails(login: string, knownRole?: UserRole): string[] {
  const clean = login.trim();
  if (!clean) return [];

  // If entered with @ (e.g. if an admin explicitly types an email)
  if (clean.includes('@')) {
    return [clean.toLowerCase()];
  }

  // If student pattern T00001
  if (/^T\d{5}$/i.test(clean)) {
    return [`${clean.toUpperCase()}@student.uz`];
  }

  // If known role is provided, prioritize that namespace
  if (knownRole) {
    const primary = getTechnicalEmail(clean, knownRole);
    return [primary];
  }

  // Candidate domains in logical priority order
  return [
    `${clean}@practice.uz`,
    `${clean}@dean.uz`,
    `${clean}@supervisor.uz`,
    `${clean}@clinic.uz`,
    `${clean}@system.uz`,
    `${clean}@student.uz`
  ];
}

/**
 * Generates an automatic readable yet secure password
 * Format: Prefix2026!734
 */
export function generateStrongPassword(prefix = 'Tma'): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100 + Math.random() * 900);
  const symbols = ['!', '*', '#', '$'];
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  return `${prefix}${year}${symbol}${randomNum}`;
}

/**
 * Generates official institutional email (e.g. ism.familiya@tma.uz) with duplicate resolution
 */
export function generateAutoStaffEmail(fullName: string, existingEmails: string[] = []): string {
  if (!fullName || !fullName.trim()) {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `xodim.${rand}@tma.uz`;
  }

  const cleaned = fullName
    .replace(/\b(Dr\.|Prof\.|Dots\.|PhD|DSc|Assistent|Dotsent|Professor|Katta o'qituvchi)\b/gi, '')
    .trim();

  const parts = cleaned.split(/\s+/).filter(Boolean);
  let surname = '';
  let firstname = '';

  if (parts.length >= 2) {
    surname = cleanNamePart(parts[0]).toLowerCase();
    firstname = cleanNamePart(parts[1]).toLowerCase();
  } else if (parts.length === 1) {
    surname = cleanNamePart(parts[0]).toLowerCase();
    firstname = 'xodim';
  } else {
    surname = 'xodim';
    firstname = 'masul';
  }

  const baseEmail = `${firstname}.${surname}@tma.uz`;
  const existingSet = new Set(existingEmails.map(e => e.trim().toLowerCase()));

  if (!existingSet.has(baseEmail)) {
    return baseEmail;
  }

  let counter = 2;
  while (existingSet.has(`${firstname}.${surname}${counter}@tma.uz`)) {
    counter++;
  }
  return `${firstname}.${surname}${counter}@tma.uz`;
}

export interface AutoGeneratedCredentials {
  login: string;
  email: string;
  password: string;
}

/**
 * Automatically creates full credentials (Login, Email, Password) for any user or student
 */
export function generateAutoUserCredentials(
  fullName: string,
  role: UserRole,
  existingUsers: User[] = [],
  existingStudents: Student[] = []
): AutoGeneratedCredentials {
  const isStudent = String(role).toUpperCase() === 'STUDENT';
  const existingEmails = existingUsers.map(u => u.email || '').concat(existingStudents.map(s => s.email || ''));
  const existingLogins = existingUsers.map(u => u.login || u.username || '');

  if (isStudent) {
    const studentLogin = getNextStudentLogin(existingStudents, existingUsers);
    const studentEmail = `${studentLogin.toLowerCase()}@student.tma.uz`;
    const studentPassword = generateStrongPassword('Std');
    return {
      login: studentLogin,
      email: studentEmail,
      password: studentPassword
    };
  }

  const staffLogin = generateStaffLogin(fullName, existingLogins);
  const staffEmail = generateAutoStaffEmail(fullName, existingEmails);
  const staffPassword = generateStrongPassword('Tma');

  return {
    login: staffLogin,
    email: staffEmail,
    password: staffPassword
  };
}

