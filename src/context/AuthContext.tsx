import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, CanonicalUserRole, RoleConfig } from '../types';
import { storageService } from '../services/storageService';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { resolveLoginToCandidateEmails, getTechnicalEmail } from '../services/loginGeneratorService';

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
  isSuperAdmin: boolean;
  login: (loginOrIdentifier: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchRole: (identifier: string) => void;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'tibbiyot_amaliyot_auth_user_v2';
const AUTH_TYPE_KEY = 'tma_auth_type';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseAuthenticated, setIsFirebaseAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return null;
  });
  
  // Listen for Firebase Auth state changes
  useEffect(() => {
    if (!auth) {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      if (saved) {
        try {
          setCurrentUser(JSON.parse(saved));
        } catch {
          // ignore
        }
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        let userProfile: User;
        const derivedLogin = fbUser.email ? fbUser.email.split('@')[0] : 'user';

        if (db) {
          try {
            const userRef = doc(db, 'users', fbUser.uid);
            const snap = await getDoc(userRef);
            if (snap.exists()) {
              const data = snap.data() as Partial<User>;
              console.log('DEBUG: User profile loaded from Firestore:', { uid: fbUser.uid, data });
              userProfile = {
                id: fbUser.uid,
                uid: fbUser.uid,
                login: data.login || derivedLogin,
                studentCode: data.studentCode || (derivedLogin.startsWith('T') ? derivedLogin : undefined),
                hemisStudentId: data.hemisStudentId,
                fullName: data.fullName || derivedLogin,
                role: fbUser.email === 'shohdonar@gmail.com' ? 'SUPER_ADMIN' : (data.role || 'STUDENT'),
                email: data.email || fbUser.email || '',
                phone: data.phone || '',
                photoURL: data.photoURL || undefined,
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
              // Self-registration for new user is strictly STUDENT role unless super admin email
              const defaultRole: UserRole = fbUser.email === 'shohdonar@gmail.com' ? 'SUPER_ADMIN' : 'STUDENT';
              userProfile = {
                id: fbUser.uid,
                uid: fbUser.uid,
                login: derivedLogin,
                studentCode: derivedLogin.startsWith('T') ? derivedLogin : undefined,
                fullName: fbUser.email === 'shohdonar@gmail.com' ? 'SUPER ADMIN' : derivedLogin,
                role: defaultRole,
                email: fbUser.email || getTechnicalEmail(derivedLogin, defaultRole),
                phone: '',
                status: 'ACTIVE',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString()
              };
              await setDoc(userRef, userProfile).catch(() => {});
            }
          } catch (dbErr) {
            console.warn('Firestore load error for Firebase user:', dbErr);
            const defaultRole: UserRole = fbUser.email === 'shohdonar@gmail.com' ? 'SUPER_ADMIN' : 'STUDENT';
            userProfile = {
              id: fbUser.uid,
              uid: fbUser.uid,
              login: derivedLogin,
              studentCode: derivedLogin.startsWith('T') ? derivedLogin : undefined,
              fullName: fbUser.email === 'shohdonar@gmail.com' ? 'SUPER ADMIN' : derivedLogin,
              role: defaultRole,
              email: fbUser.email || '',
              phone: '',
              status: 'ACTIVE',
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString()
            };
          }
        } else {
          const defaultRole: UserRole = fbUser.email === 'shohdonar@gmail.com' ? 'SUPER_ADMIN' : 'STUDENT';
          userProfile = {
            id: fbUser.uid,
            uid: fbUser.uid,
            login: derivedLogin,
            studentCode: derivedLogin.startsWith('T') ? derivedLogin : undefined,
            fullName: fbUser.email === 'shohdonar@gmail.com' ? 'SUPER ADMIN' : derivedLogin,
            role: defaultRole,
            email: fbUser.email || '',
            phone: '',
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
        setIsFirebaseAuthenticated(false);
        setCurrentUser(null);
        localStorage.removeItem(CURRENT_USER_KEY);
        localStorage.removeItem(AUTH_TYPE_KEY);
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

  const [originalSuperAdmin, setOriginalSuperAdmin] = useState<User | null>(null);

  /**
   * Universal Login with LOGIN + PAROL
   * Resolves login identifier to technical Firebase email and authenticates via Firebase Auth.
   * Gracefully falls back to local data if in offline/demo mode.
   */
  const login = async (
    loginOrIdentifier: string,
    password = 'password123'
  ): Promise<{ success: boolean; error?: string }> => {
    const rawLogin = loginOrIdentifier.trim();
    if (!rawLogin) {
      return { success: false, error: 'Login kiritilmadi' };
    }

    setLoading(true);

    if (!auth) {
      setLoading(false);
      return { success: false, error: 'Firebase Auth ulanmagan' };
    }

    // 1. Build list of candidate emails to try for Firebase Auth
    const candidateEmails: string[] = [];
    let foundFirestoreUser: User | null = null;

    // If entered directly as email with @
    if (rawLogin.includes('@')) {
      candidateEmails.push(rawLogin.toLowerCase());
    } else if (db) {
      try {
        const usersCol = collection(db, 'users');
        const qLogin = query(usersCol, where('login', '==', rawLogin));
        let snap = await getDocs(qLogin);
        if (snap.empty) {
          const qCode = query(usersCol, where('studentCode', '==', rawLogin));
          snap = await getDocs(qCode);
        }
        if (snap.empty) {
          const qEmail = query(usersCol, where('email', '==', rawLogin));
          snap = await getDocs(qEmail);
        }

        if (!snap.empty) {
          foundFirestoreUser = snap.docs[0].data() as User;
          if (foundFirestoreUser.email) {
            candidateEmails.push(foundFirestoreUser.email.toLowerCase());
          }
        }
      } catch (dbErr) {
        console.warn('Firestore user lookup error during login:', dbErr);
      }
    }

    // If user is explicitly blocked in Firestore
    if (foundFirestoreUser) {
      const st = String(foundFirestoreUser.status || '').toUpperCase();
      if (st === 'INACTIVE' || st === 'SUSPENDED' || st === 'DISMISSED') {
        setLoading(false);
        return {
          success: false,
          error: 'Ushbu foydalanuvchi hisobi faolsizlantirilgan (bloklangan).'
        };
      }
    }

    // Also include domain-based candidate emails
    const resolvedCandidates = resolveLoginToCandidateEmails(rawLogin);
    for (const cand of resolvedCandidates) {
      if (!candidateEmails.includes(cand.toLowerCase())) {
        candidateEmails.push(cand.toLowerCase());
      }
    }

    // 2. Try authenticating against Firebase Auth with candidate emails
    for (const candidateEmail of candidateEmails) {
      try {
        const cred = await signInWithEmailAndPassword(auth, candidateEmail, password);
        if (cred.user) {
          const isSuper = cred.user.email === 'shohdonar@gmail.com' || rawLogin === 'shohdonar';
          let userProfile: User;

          if (db) {
            try {
              const userRef = doc(db, 'users', cred.user.uid);
              const snap = await getDoc(userRef);
              if (snap.exists()) {
                const data = snap.data() as Partial<User>;
                userProfile = {
                  id: cred.user.uid,
                  uid: cred.user.uid,
                  login: data.login || rawLogin,
                  studentCode: data.studentCode || (rawLogin.startsWith('T') ? rawLogin : undefined),
                  hemisStudentId: data.hemisStudentId,
                  fullName: data.fullName || rawLogin,
                  role: isSuper ? 'SUPER_ADMIN' : (data.role || 'STUDENT'),
                  email: data.email || cred.user.email || '',
                  phone: data.phone || '',
                  photoURL: data.photoURL || undefined,
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
              } else if (foundFirestoreUser) {
                userProfile = foundFirestoreUser;
              } else {
                const defaultRole: UserRole = isSuper ? 'SUPER_ADMIN' : 'STUDENT';
                userProfile = {
                  id: cred.user.uid,
                  uid: cred.user.uid,
                  login: rawLogin,
                  studentCode: rawLogin.startsWith('T') ? rawLogin : undefined,
                  fullName: isSuper ? 'SUPER ADMIN' : rawLogin,
                  role: defaultRole,
                  email: cred.user.email || getTechnicalEmail(rawLogin, defaultRole),
                  phone: '',
                  status: 'ACTIVE',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  lastLoginAt: new Date().toISOString()
                };
                await setDoc(userRef, userProfile).catch(() => {});
              }
            } catch (err) {
              console.warn('Firestore load profile error after Auth sign-in:', err);
              const defaultRole: UserRole = isSuper ? 'SUPER_ADMIN' : 'STUDENT';
              userProfile = foundFirestoreUser || {
                id: cred.user.uid,
                uid: cred.user.uid,
                login: rawLogin,
                studentCode: rawLogin.startsWith('T') ? rawLogin : undefined,
                fullName: isSuper ? 'SUPER ADMIN' : rawLogin,
                role: defaultRole,
                email: cred.user.email || '',
                phone: '',
                status: 'ACTIVE',
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString()
              };
            }
          } else {
            const defaultRole: UserRole = isSuper ? 'SUPER_ADMIN' : 'STUDENT';
            userProfile = foundFirestoreUser || {
              id: cred.user.uid,
              uid: cred.user.uid,
              login: rawLogin,
              studentCode: rawLogin.startsWith('T') ? rawLogin : undefined,
              fullName: isSuper ? 'SUPER ADMIN' : rawLogin,
              role: defaultRole,
              email: cred.user.email || '',
              phone: '',
              status: 'ACTIVE',
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString()
            };
          }

          // Verify user active status
          const userSt = String(userProfile.status || '').toUpperCase();
          if (userSt === 'INACTIVE' || userSt === 'SUSPENDED' || userSt === 'DISMISSED') {
            await signOut(auth);
            setLoading(false);
            return {
              success: false,
              error: 'Ushbu foydalanuvchi hisobi faolsizlantirilgan (bloklangan).'
            };
          }

          setFirebaseUser(cred.user);
          setIsFirebaseAuthenticated(true);
          setCurrentUser(userProfile);
          if (isSuper) {
            setOriginalSuperAdmin(userProfile);
          }
          localStorage.setItem(AUTH_TYPE_KEY, 'firebase');
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userProfile));
          setLoading(false);
          return { success: true };
        }
      } catch {
        // Try next candidate email
      }
    }

    setLoading(false);
    return {
      success: false,
      error: 'Login yoki parol noto\'g\'ri kiritildi. Iltimos qaytadan urinib ko\'ring.'
    };
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
    setOriginalSuperAdmin(null);
    setFirebaseUser(null);
    setIsFirebaseAuthenticated(false);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(AUTH_TYPE_KEY);
  };

  const forgotPassword = async (email: string) => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    await sendPasswordResetEmail(auth, email);
  };

  const switchRole = (roleOrUserId: string) => {
    if (roleOrUserId === 'RESET_SUPER_ADMIN') {
      if (originalSuperAdmin) {
        setCurrentUser(originalSuperAdmin);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(originalSuperAdmin));
      } else if (firebaseUser?.email === 'shohdonar@gmail.com') {
        const defaultAdmin: User = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          login: 'shohdonar',
          fullName: 'SUPER ADMIN',
          role: 'SUPER_ADMIN',
          email: 'shohdonar@gmail.com',
          phone: '',
          status: 'ACTIVE',
          createdAt: new Date().toISOString()
        };
        setCurrentUser(defaultAdmin);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultAdmin));
      }
      return;
    }

    const users = storageService.getUsers();
    let userToSwitch = users.find(u => u.id === roleOrUserId || u.uid === roleOrUserId);

    if (!userToSwitch) {
      userToSwitch = users.find(u => u.role === roleOrUserId || toCanonicalRole(u.role) === toCanonicalRole(roleOrUserId as UserRole));
    }

    if (userToSwitch) {
      if (!originalSuperAdmin && (currentUser?.role === 'SUPER_ADMIN' || firebaseUser?.email === 'shohdonar@gmail.com')) {
        setOriginalSuperAdmin(currentUser);
      }
      setCurrentUser(userToSwitch);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToSwitch));
    } else if (currentUser) {
      const canonical = toCanonicalRole(roleOrUserId as UserRole);
      if (canonical) {
        const rolePersona: User = {
          ...currentUser,
          role: roleOrUserId as UserRole
        };
        if (!originalSuperAdmin && (currentUser.role === 'SUPER_ADMIN' || firebaseUser?.email === 'shohdonar@gmail.com')) {
          setOriginalSuperAdmin(currentUser);
        }
        setCurrentUser(rolePersona);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(rolePersona));
      }
    }
  };

  const activeRole: UserRole = currentUser?.role || 'PRACTICE_HEAD';
  const canonicalRole = toCanonicalRole(activeRole);
  const roleConfig = ROLE_CONFIGS[activeRole] || ROLE_CONFIGS[canonicalRole] || ROLE_CONFIGS['PRACTICE_HEAD'];
  const isSuperAdmin = firebaseUser?.email === 'shohdonar@gmail.com' || canonicalRole === 'SUPER_ADMIN' || originalSuperAdmin !== null;

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
        logout,
        switchRole,
        forgotPassword,
        isSuperAdmin,
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
