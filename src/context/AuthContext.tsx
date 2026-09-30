import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, CanonicalUserRole, RoleConfig } from '../types';
import { storageService } from '../services/storageService';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../services/firebase';

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  // Canonical Roles (Uppercase)
  SUPER_ADMIN: {
    id: 'SUPER_ADMIN',
    canonicalRole: 'SUPER_ADMIN',
    title: 'Super Admin',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Barcha tizim va server ma\'lumotlarini to\'liq boshqaradi'
  },
  PRACTICE_HEAD: {
    id: 'PRACTICE_HEAD',
    canonicalRole: 'PRACTICE_HEAD',
    title: 'Amaliyot bo\'limi boshlig\'i',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Amaliyot jarayonlarini to\'liq boshqaradi va nazorat qiladi'
  },
  PRACTICE_STAFF: {
    id: 'PRACTICE_STAFF',
    canonicalRole: 'PRACTICE_STAFF',
    title: 'Amaliyot bo\'limi xodimi',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    description: 'Amaliyot bo\'limining kundalik va taqsimot ishlarini bajaradi'
  },
  FACULTY_DEAN: {
    id: 'FACULTY_DEAN',
    canonicalRole: 'FACULTY_DEAN',
    title: 'Fakultet / Dekan',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: 'O\'z fakultetidagi talabalar va amaliyotlarni ko\'radi'
  },
  PRACTICE_SUPERVISOR: {
    id: 'PRACTICE_SUPERVISOR',
    canonicalRole: 'PRACTICE_SUPERVISOR',
    title: 'Amaliyot rahbari',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    description: 'O\'ziga biriktirilgan talabalarni boshqaradi va baholaydi'
  },
  CLINIC_RESPONSIBLE: {
    id: 'CLINIC_RESPONSIBLE',
    canonicalRole: 'CLINIC_RESPONSIBLE',
    title: 'Klinik / Shifoxona mas\'uli',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'O\'z klinikasiga biriktirilgan talabalarni boshqaradi'
  },
  STUDENT: {
    id: 'STUDENT',
    canonicalRole: 'STUDENT',
    title: 'Talaba',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Faqat o\'z profilini va o\'z amaliyot ma\'lumotlarini ko\'radi'
  },

  // Aliases for backward compatibility
  super_admin: {
    id: 'super_admin',
    canonicalRole: 'SUPER_ADMIN',
    title: 'Super Admin',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Barcha tizimni to\'liq boshqaradi'
  },
  dept_head: {
    id: 'dept_head',
    canonicalRole: 'PRACTICE_HEAD',
    title: 'Amaliyot bo\'limi boshlig\'i',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Amaliyot jarayonlarini to\'liq boshqaradi'
  },
  dept_staff: {
    id: 'dept_staff',
    canonicalRole: 'PRACTICE_STAFF',
    title: 'Amaliyot bo\'limi xodimi',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    description: 'Amaliyot bo\'limining kundalik ishlarini bajaradi'
  },
  dean: {
    id: 'dean',
    canonicalRole: 'FACULTY_DEAN',
    title: 'Fakultet / Dekanat',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: 'O\'z fakultetidagi talabalar va amaliyotlarni ko\'radi'
  },
  supervisor: {
    id: 'supervisor',
    canonicalRole: 'PRACTICE_SUPERVISOR',
    title: 'Universitet amaliyot rahbari',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    description: 'O\'ziga biriktirilgan talabalarni boshqaradi'
  },
  clinic_responsible: {
    id: 'clinic_responsible',
    canonicalRole: 'CLINIC_RESPONSIBLE',
    title: 'Klinik / Shifoxona mas\'uli',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'O\'z klinikasiga biriktirilgan talabalarni boshqaradi'
  },
  student: {
    id: 'student',
    canonicalRole: 'STUDENT',
    title: 'Talaba',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Faqat o\'z profilini va amaliyotini ko\'radi'
  }
};

export function toCanonicalRole(role: UserRole): CanonicalUserRole {
  return ROLE_CONFIGS[role]?.canonicalRole || 'PRACTICE_HEAD';
}

export interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  role: UserRole;
  canonicalRole: CanonicalUserRole;
  roleConfig: RoleConfig;
  loading: boolean;
  isAuthenticated: boolean;
  isFirebaseAuthenticated: boolean;
  login: (usernameOrEmail: string, password?: string) => boolean;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'tibbiyot_amaliyot_auth_user_v2';
const AUTH_TYPE_KEY = 'tma_auth_type';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseAuthenticated, setIsFirebaseAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    const defaultHead = storageService.getUsers().find(u => toCanonicalRole(u.role) === 'PRACTICE_HEAD') || storageService.getUsers()[1];
    return defaultHead;
  });

  // Listen for Firebase Auth state changes
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Safe development console logging as requested
        console.log('Firebase Auth: CONNECTED');
        console.log('Firebase user: YES');
        console.log('Provider: google.com');
        console.log('UID:', fbUser.uid ? 'mavjud' : 'mavjud emas');
        console.log('Email:', fbUser.email ? 'mavjud' : 'mavjud emas');

        let userProfile: User;
        if (db) {
          try {
            const userRef = doc(db, 'users', fbUser.uid);
            const snap = await getDoc(userRef);
            if (snap.exists()) {
              const data = snap.data() as Partial<User>;
              // Preserve existing assigned role from secure users collection (e.g. PRACTICE_HEAD, SUPER_ADMIN)
              userProfile = {
                id: fbUser.uid,
                uid: fbUser.uid,
                fullName: data.fullName || fbUser.displayName || 'Google Foydalanuvchisi',
                role: data.role || 'STUDENT',
                email: data.email || fbUser.email || '',
                phone: data.phone || fbUser.phoneNumber || '',
                photoURL: data.photoURL || fbUser.photoURL || undefined,
                status: data.status || 'ACTIVE',
                facultyId: data.facultyId,
                practicePlaceId: data.practicePlaceId,
                studentId: data.studentId,
                supervisorId: data.supervisorId,
                clinicResponsibleId: data.clinicResponsibleId,
                createdAt: data.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString()
              };
              updateDoc(userRef, { lastLoginAt: new Date().toISOString() }).catch(() => {});
            } else {
              // Self-registration for new Google login is strictly STUDENT role matching security rules
              userProfile = {
                id: fbUser.uid,
                uid: fbUser.uid,
                fullName: fbUser.displayName || 'Google Foydalanuvchisi',
                role: 'STUDENT',
                email: fbUser.email || '',
                phone: fbUser.phoneNumber || '',
                photoURL: fbUser.photoURL || undefined,
                status: 'ACTIVE',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString()
              };
              await setDoc(userRef, userProfile);
            }
          } catch (dbErr) {
            console.warn('Firestore load error for Google user:', dbErr);
            userProfile = {
              id: fbUser.uid,
              uid: fbUser.uid,
              fullName: fbUser.displayName || 'Google Foydalanuvchisi',
              role: 'STUDENT',
              email: fbUser.email || '',
              phone: fbUser.phoneNumber || '',
              photoURL: fbUser.photoURL || undefined,
              status: 'ACTIVE',
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString()
            };
          }
        } else {
          userProfile = {
            id: fbUser.uid,
            uid: fbUser.uid,
            fullName: fbUser.displayName || 'Google Foydalanuvchisi',
            role: 'STUDENT',
            email: fbUser.email || '',
            phone: fbUser.phoneNumber || '',
            photoURL: fbUser.photoURL || undefined,
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          };
        }

        setFirebaseUser(fbUser);
        setIsFirebaseAuthenticated(true);
        setCurrentUser(userProfile);
        localStorage.setItem(AUTH_TYPE_KEY, 'firebase');
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userProfile));
      } else {
        setFirebaseUser(null);
        const authType = localStorage.getItem(AUTH_TYPE_KEY);
        if (authType === 'firebase') {
          setIsFirebaseAuthenticated(false);
          setCurrentUser(null);
          localStorage.removeItem(CURRENT_USER_KEY);
          localStorage.removeItem(AUTH_TYPE_KEY);
        } else {
          setIsFirebaseAuthenticated(false);
          // Keep demo/local login intact if demo was used
          const saved = localStorage.getItem(CURRENT_USER_KEY);
          if (saved) {
            try {
              setCurrentUser(JSON.parse(saved));
            } catch {
              // ignore
            }
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [currentUser]);

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    if (!auth) {
      return { success: false, error: 'Firebase Auth mavjud emas' };
    }
    try {
      setLoading(true);
      const cred = await signInWithPopup(auth, googleProvider);
      const fbUser = cred.user;

      console.log('Firebase Auth: CONNECTED');
      console.log('Firebase user: YES');
      console.log('Provider: google.com');
      console.log('UID: mavjud');
      console.log('Email:', fbUser.email ? 'mavjud' : 'mavjud emas');

      let userProfile: User;
      if (db) {
        try {
          const userRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data() as Partial<User>;
            userProfile = {
              id: fbUser.uid,
              uid: fbUser.uid,
              fullName: data.fullName || fbUser.displayName || 'Google Foydalanuvchisi',
              role: data.role || 'STUDENT',
              email: data.email || fbUser.email || '',
              phone: data.phone || fbUser.phoneNumber || '',
              photoURL: data.photoURL || fbUser.photoURL || undefined,
              status: data.status || 'ACTIVE',
              facultyId: data.facultyId,
              practicePlaceId: data.practicePlaceId,
              studentId: data.studentId,
              supervisorId: data.supervisorId,
              clinicResponsibleId: data.clinicResponsibleId,
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString()
            };
            updateDoc(userRef, { lastLoginAt: new Date().toISOString() }).catch(() => {});
          } else {
            // Self-registration for new Google user is strictly STUDENT role
            userProfile = {
              id: fbUser.uid,
              uid: fbUser.uid,
              fullName: fbUser.displayName || 'Google Foydalanuvchisi',
              role: 'STUDENT',
              email: fbUser.email || '',
              phone: fbUser.phoneNumber || '',
              photoURL: fbUser.photoURL || undefined,
              status: 'ACTIVE',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString()
            };
            await setDoc(userRef, userProfile);
          }
        } catch (dbErr) {
          console.warn('Firestore load/create error on Google Login:', dbErr);
          userProfile = {
            id: fbUser.uid,
            uid: fbUser.uid,
            fullName: fbUser.displayName || 'Google Foydalanuvchisi',
            role: 'STUDENT',
            email: fbUser.email || '',
            phone: fbUser.phoneNumber || '',
            photoURL: fbUser.photoURL || undefined,
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          };
        }
      } else {
        userProfile = {
          id: fbUser.uid,
          uid: fbUser.uid,
          fullName: fbUser.displayName || 'Google Foydalanuvchisi',
          role: 'STUDENT',
          email: fbUser.email || '',
          phone: fbUser.phoneNumber || '',
          photoURL: fbUser.photoURL || undefined,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
      }

      setFirebaseUser(fbUser);
      setIsFirebaseAuthenticated(true);
      setCurrentUser(userProfile);
      localStorage.setItem(AUTH_TYPE_KEY, 'firebase');
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userProfile));

      storageService.recordAuditLog({
        userId: userProfile.uid,
        userRole: userProfile.role,
        action: 'login',
        entity: 'users',
        entityId: userProfile.uid,
        metadata: JSON.stringify({ email: userProfile.email, provider: 'google.com' })
      });

      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      const code = err?.code || '';
      const msg = err?.message || 'Google orqali kirishda xatolik yuz berdi';
      console.error('Google Sign-In Error:', code, msg);
      if (code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Google login oynasi yopildi.' };
      }
      if (code === 'auth/unauthorized-domain') {
        return { success: false, error: 'Ushbu domen Firebase Console da Authorized Domains ga kiritilmagan.' };
      }
      return { success: false, error: msg };
    }
  };

  const login = (usernameOrEmail: string, password?: string): boolean => {
    const user = storageService.authenticate(usernameOrEmail, password);
    if (user) {
      const now = new Date().toISOString();
      const updatedUser: User = {
        ...user,
        lastLoginAt: now
      };
      setCurrentUser(updatedUser);
      setIsFirebaseAuthenticated(false);
      setFirebaseUser(null);
      localStorage.setItem(AUTH_TYPE_KEY, 'demo');
      storageService.saveUser(updatedUser);
      storageService.recordAuditLog({
        userId: user.uid || user.id,
        userRole: user.role,
        action: 'login',
        entity: 'users',
        entityId: user.uid || user.id,
        metadata: JSON.stringify({ email: user.email, loginTime: now, authType: 'local_demo' })
      });
      return true;
    }
    return false;
  };

  const logout = async () => {
    if (auth && isFirebaseAuthenticated) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('SignOut error:', err);
      }
    }
    if (currentUser) {
      storageService.recordAuditLog({
        userId: currentUser.uid || currentUser.id,
        userRole: currentUser.role,
        action: 'logout',
        entity: 'users',
        entityId: currentUser.uid || currentUser.id
      });
    }
    setCurrentUser(null);
    setFirebaseUser(null);
    setIsFirebaseAuthenticated(false);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(AUTH_TYPE_KEY);
  };

  const switchRole = (newRole: UserRole) => {
    const targetCanonical = toCanonicalRole(newRole);
    const users = storageService.getUsers();
    let matchingUser = users.find(u => toCanonicalRole(u.role) === targetCanonical);

    if (!matchingUser) {
      matchingUser = {
        id: `user-${newRole.toLowerCase()}`,
        uid: `uid-${newRole.toLowerCase()}`,
        username: newRole.toLowerCase(),
        login: newRole.toLowerCase(),
        fullName: ROLE_CONFIGS[newRole].title,
        role: newRole,
        status: 'ACTIVE',
        email: `${newRole.toLowerCase()}@tma.uz`,
        phone: '+998 (71) 214-88-00',
        createdAt: new Date().toISOString()
      };
    }
    setCurrentUser(matchingUser);
  };

  const activeRole: UserRole = currentUser?.role || 'PRACTICE_HEAD';
  const canonicalRole = toCanonicalRole(activeRole);
  const roleConfig = ROLE_CONFIGS[activeRole] || ROLE_CONFIGS[canonicalRole];

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        role: activeRole,
        canonicalRole,
        roleConfig,
        loading,
        login,
        loginWithGoogle,
        logout,
        switchRole,
        isAuthenticated: !!currentUser,
        isFirebaseAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
