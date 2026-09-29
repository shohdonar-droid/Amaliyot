import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, CanonicalUserRole, RoleConfig } from '../types';
import { storageService } from '../services/storageService';

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

interface AuthContextType {
  currentUser: User | null;
  role: UserRole;
  canonicalRole: CanonicalUserRole;
  roleConfig: RoleConfig;
  login: (usernameOrEmail: string, password?: string) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'tibbiyot_amaliyot_auth_user_v2';

export function AuthProvider({ children }: { children: ReactNode }) {
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

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [currentUser]);

  const login = (usernameOrEmail: string, password?: string): boolean => {
    const user = storageService.authenticate(usernameOrEmail, password);
    if (user) {
      const now = new Date().toISOString();
      const updatedUser: User = {
        ...user,
        lastLoginAt: now
      };
      setCurrentUser(updatedUser);
      storageService.saveUser(updatedUser);
      storageService.recordAuditLog({
        userId: user.uid || user.id,
        userRole: user.role,
        action: 'login',
        entity: 'users',
        entityId: user.uid || user.id,
        metadata: JSON.stringify({ email: user.email, loginTime: now })
      });
      return true;
    }
    return false;
  };

  const logout = () => {
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
        role: activeRole,
        canonicalRole,
        roleConfig,
        login,
        logout,
        switchRole,
        isAuthenticated: !!currentUser
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
