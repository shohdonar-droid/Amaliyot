import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  LogIn,
  Building,
  GraduationCap,
  Phone,
  Mail,
  Lock,
  CheckCircle2,
  XCircle,
  Shield,
  User as UserIcon,
  Sparkles,
  Briefcase,
  Hospital,
  Copy,
  RefreshCw,
  Key
} from 'lucide-react';
import { User, UserRole, CanonicalUserRole } from '../../../types';
import { storageService } from '../../../services/storageService';
import {
  generateStaffLogin,
  getNextStudentLogin,
  generateAutoUserCredentials,
  generateStrongPassword,
  generateAutoStaffEmail
} from '../../../services/loginGeneratorService';
import { userService } from '../../../services/userService';
import { studentService } from '../../../services/studentService';
import { supervisorService } from '../../../services/supervisorService';
import { useAuth, ROLE_CONFIGS } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { Modal } from '../../common/Modal';
import { ConfirmDialog } from '../../common/ConfirmDialog';

export function UsersModule() {
  const { currentUser, role: activeUserRole, isSuperAdmin, switchRole } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userToView, setUserToView] = useState<User | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isClearStaffDialogOpen, setIsClearStaffDialogOpen] = useState(false);

  // Success dialog after creating a user with auto-generated email, login, and password
  const [createdCredentialsModal, setCreatedCredentialsModal] = useState<{
    user: User;
    rawPassword?: string;
  } | null>(null);

  const handleClearAllStaffConfirm = () => {
    storageService.clearAllStaffUsers();
    loadUsers();
    setIsClearStaffDialogOpen(false);
    showToast('info', 'Xodimlar tozalandi', 'Barcha xodimlar hisoblari tizimdan o\'chirildi.');
  };

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    login: '',
    password: '',
    email: '',
    phone: '',
    role: 'PRACTICE_STAFF' as UserRole,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    facultyId: '',
    practicePlaceId: ''
  });

  const faculties = storageService.getFaculties();
  const practicePlaces = storageService.getPracticePlaces();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const list = await userService.getUsers();
    setUsers(list);
  };

  const handleToggleUserStatus = async (targetUser: User) => {
    const newStatus: 'ACTIVE' | 'INACTIVE' = targetUser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await userService.updateUser(targetUser.id, { status: newStatus });
      await loadUsers();
      showToast(
        newStatus === 'ACTIVE' ? 'success' : 'warning',
        newStatus === 'ACTIVE' ? 'Foydalanuvchi faollashtirildi' : 'Foydalanuvchi bloklandi',
        `${targetUser.fullName} hisobi ${newStatus === 'ACTIVE' ? 'faol holatga keltirildi' : 'bloklandi (nofaol qilindi)'}.`
      );
    } catch (err: any) {
      showToast('error', 'Xatolik', 'Statusni o\'zgartirishda xatolik: ' + (err.message || 'Noma\'lum xatolik'));
    }
  };

  // Roles assignable based on logged-in user permissions
  // Super Admin: All roles
  // Practice Head: All roles EXCEPT SUPER_ADMIN and PRACTICE_HEAD
  const assignableRoles: { id: UserRole; title: string; category: string }[] = [
    ...(isSuperAdmin
      ? [
          { id: 'SUPER_ADMIN' as UserRole, title: 'Super Admin', category: 'Tizim boshqaruvi' },
          { id: 'PRACTICE_HEAD' as UserRole, title: 'Amaliyot bo\'limi boshlig\'i', category: 'Amaliyot bo\'limi' }
        ]
      : []),
    { id: 'FACULTY_DEAN' as UserRole, title: 'Dekan (Fakultet rahbari)', category: 'Dekanat' },
    { id: 'PRACTICE_STAFF' as UserRole, title: 'Amaliyot bo\'limi xodimi', category: 'Amaliyot bo\'limi' },
    { id: 'PRACTICE_SUPERVISOR' as UserRole, title: 'Amaliyot rahbari (Universitet)', category: 'O\'qituvchilar' },
    { id: 'CLINIC_RESPONSIBLE' as UserRole, title: 'Klinik (ped) rahbar / Mas\'ul', category: 'Klinik bazalar' },
    { id: 'STUDENT' as UserRole, title: 'Talaba', category: 'Talabalar' }
  ];

  const handleOpenCreateModal = () => {
    const defaultRole = (isSuperAdmin ? 'PRACTICE_HEAD' : 'FACULTY_DEAN') as UserRole;
    const creds = generateAutoUserCredentials('', defaultRole, storageService.getUsers(), storageService.getStudents());
    setFormData({
      fullName: '',
      login: creds.login,
      password: creds.password,
      email: creds.email,
      phone: '',
      role: defaultRole,
      status: 'ACTIVE',
      facultyId: faculties[0]?.id || '',
      practicePlaceId: practicePlaces[0]?.id || ''
    });
    setIsCreateModalOpen(true);
  };

  const handleRegenerateCredentials = (name?: string, role?: UserRole) => {
    const targetName = name !== undefined ? name : formData.fullName;
    const targetRole = role !== undefined ? role : formData.role;
    const creds = generateAutoUserCredentials(
      targetName,
      targetRole,
      storageService.getUsers(),
      storageService.getStudents()
    );
    setFormData(prev => ({
      ...prev,
      login: creds.login,
      email: creds.email,
      password: creds.password
    }));
    showToast('info', 'Yangi hisob ma\'lumotlari generatsiya qilindi', `Login: ${creds.login}`);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      showToast('warning', 'Ma\'lumotlar yetarli emas', 'F.I.SH (Familiya Ism Sharif) kiritilishi shart');
      return;
    }

    if (!isSuperAdmin && (formData.role === 'SUPER_ADMIN' || formData.role === 'PRACTICE_HEAD')) {
      showToast('error', 'Ruxsat etilmagan', 'Amaliyot bo\'lim boshlig\'i Super Admin va Amaliyot bo\'limi boshlig\'i rolini yarata olmaydi.');
      return;
    }

    const currentUsers = storageService.getUsers();
    const currentStudents = storageService.getStudents();
    const autoCreds = generateAutoUserCredentials(
      formData.fullName.trim(),
      formData.role,
      currentUsers,
      currentStudents
    );

    const finalLogin = formData.login.trim() || autoCreds.login;
    const finalEmail = formData.email.trim() || autoCreds.email;
    const finalPassword = formData.password.trim() || autoCreds.password;

    const userData: Omit<User, 'id'> = {
      uid: `uid-${Date.now()}`,
      fullName: formData.fullName.trim(),
      login: finalLogin,
      username: finalLogin,
      password: finalPassword,
      role: formData.role,
      email: finalEmail,
      phone: formData.phone.trim() || '+998 (90) 000-00-00',
      status: formData.status,
      ...(formData.facultyId ? { facultyId: formData.facultyId } : {}),
      ...(formData.practicePlaceId ? { practicePlaceId: formData.practicePlaceId } : {}),
      createdAt: new Date().toISOString(),
    };

    try {
      const userId = await userService.createUser(userData);
      if (!userId) {
        throw new Error('Foydalanuvchi yaratilmadi');
      }

      if (formData.role === 'STUDENT' || formData.role === 'student') {
        const directions = storageService.getDirections();
        const courses = storageService.getCourses();
        const groups = storageService.getGroups();
        
        await studentService.createStudent({
          userId: userData.uid,
          studentId: `MED-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          login: finalLogin,
          studentCode: finalLogin,
          hemisStudentId: String(Math.floor(10000000 + Math.random() * 90000000)),
          pinfl: '3140' + String(Math.floor(1000000000 + Math.random() * 9000000000)),
          fullName: userData.fullName,
          facultyId: formData.facultyId || faculties[0]?.id || '',
          directionId: directions[0]?.id || '',
          courseId: courses[0]?.id || '',
          groupId: groups[0]?.id || '',
          phone: userData.phone,
          telegram: '@',
          email: finalEmail,
          status: 'active'
        });
      }

      if (formData.role === 'PRACTICE_SUPERVISOR' || formData.role === 'supervisor') {
        await supervisorService.createSupervisor({
          userId: userData.uid,
          fullName: userData.fullName,
          phone: userData.phone,
          email: finalEmail,
          type: 'university',
          department: 'Kafedra',
          academicDegree: 'Dotsent',
          status: 'ACTIVE'
        });
      }

      storageService.recordAuditLog({
        userId: currentUser?.uid || currentUser?.id || 'system',
        userRole: activeUserRole,
        action: 'userCreated',
        entity: 'users',
        entityId: userId,
        metadata: JSON.stringify({ createdRole: formData.role, fullName: formData.fullName, login: finalLogin, email: finalEmail })
      });

      const fullUser: User = { ...userData, id: userId };
      setCreatedCredentialsModal({ user: fullUser, rawPassword: finalPassword });
      setIsCreateModalOpen(false);
      loadUsers();
      showToast('success', 'Foydalanuvchi yaratildi!', `${fullUser.fullName} uchun email, login va parol shakllantirildi`);
    } catch (error) {
      console.error("Error creating user:", error);
      showToast('error', 'Xatolik', 'Foydalanuvchi yaratishda xatolik yuz berdi: ' + (error instanceof Error ? error.message : 'Noma\'lum xato'));
    }
  };

  const handleOpenEditModal = (u: User) => {
    setUserToEdit(u);
    setFormData({
      fullName: u.fullName,
      login: u.login || u.username || '',
      password: u.password || '',
      email: u.email || '',
      phone: u.phone || '',
      role: u.role,
      status: u.status === 'SUSPENDED' ? 'INACTIVE' : u.status,
      facultyId: u.facultyId || faculties[0]?.id || '',
      practicePlaceId: u.practicePlaceId || practicePlaces[0]?.id || ''
    });
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;

    if (!isSuperAdmin && (formData.role === 'SUPER_ADMIN' || formData.role === 'PRACTICE_HEAD')) {
      showToast('error', 'Ruxsat etilmagan', 'Siz ushbu rolni biriktira olmaysiz.');
      return;
    }

    const updated: Partial<User> = {
      fullName: formData.fullName.trim(),
      login: formData.login.trim(),
      username: formData.login.trim(),
      password: formData.password.trim() || userToEdit.password || 'password123',
      role: formData.role,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      status: formData.status,
      ...(formData.facultyId ? { facultyId: formData.facultyId } : {}),
      ...(formData.practicePlaceId ? { practicePlaceId: formData.practicePlaceId } : {}),
    };

    userService.updateUser(userToEdit.id, updated).then(() => {
        loadUsers();
        setUserToEdit(null);
        showToast('info', 'Foydalanuvchi yangilandi', `${updated.fullName} ma'lumotlari saqlandi.`);
    });
  };

  const handleDeleteConfirm = () => {
    if (!userToDelete) return;
    userService.deleteUser(userToDelete.id).then(() => {
        loadUsers();
        showToast('info', 'O\'chirildi', `${userToDelete.fullName} foydalanuvchisi tizimdan o'chirildi.`);
        setUserToDelete(null);
    });
  };

  const handleImpersonateUser = (u: User) => {
    switchRole(u.id);
    setUserToView(null);
    showToast('success', 'Profilga o\'tildi', `${u.fullName} (${ROLE_CONFIGS[u.role]?.title || u.role}) profilidasiz.`);
  };

  // Filtered users
  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (statusFilter !== 'ALL' && u.role !== statusFilter && u.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.fullName.toLowerCase().includes(q);
      const matchLogin = (u.login || u.username || '').toLowerCase().includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      const matchPhone = (u.phone || '').toLowerCase().includes(q);
      if (!matchName && !matchLogin && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  // Stats
  const totalUsers = users.length;
  const practiceDeptCount = users.filter(u => u.role === 'PRACTICE_HEAD' || u.role === 'PRACTICE_STAFF' || u.role === 'super_admin' || u.role === 'SUPER_ADMIN').length;
  const deansAndSupervisorsCount = users.filter(u => u.role === 'FACULTY_DEAN' || u.role === 'PRACTICE_SUPERVISOR' || u.role === 'dean' || u.role === 'supervisor').length;
  const clinicResponsiblesCount = users.filter(u => u.role === 'CLINIC_RESPONSIBLE' || u.role === 'clinic_responsible').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Foydalanuvchilar va Rollar Boshqaruvi</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Tizim foydalanuvchilarini yaratish va boshqarish
            </h1>
            <p className="text-xs text-blue-200 mt-1 max-w-2xl">
              Super Admin va Amaliyot bo'limi boshlig'i uchun barcha dekanlar, amaliyot rahbarlari va klinik mas'ullar hisoblarini yaratish hamda monitoring qilish bo'limi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsClearStaffDialogOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-200 border border-rose-500/30 font-bold text-xs transition-all"
              title="Barcha xodimlar hisobini tozalash"
            >
              <Trash2 className="w-4 h-4 text-rose-300" />
              <span>Xodimlarni Tozalash</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
            >
              <UserPlus className="w-5 h-5" />
              <span>Yangi foydalanuvchi yaratish</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Jami Foydalanuvchilar</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalUsers}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Amaliyot Bo'limi</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{practiceDeptCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Dekanlar va Rahbarlar</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{deansAndSupervisorsCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Klinik (Ped) Mas'ullar</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{clinicResponsiblesCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Hospital className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="F.I.SH, login, email bo'yicha izlash..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Rol:</span>
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">Barcha rollar</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="PRACTICE_HEAD">Amaliyot bo'limi boshlig'i</option>
            <option value="FACULTY_DEAN">Dekan (Fakultet)</option>
            <option value="PRACTICE_STAFF">Amaliyot bo'limi xodimi</option>
            <option value="PRACTICE_SUPERVISOR">Amaliyot rahbari</option>
            <option value="CLINIC_RESPONSIBLE">Klinik(ped) rahbar</option>
            <option value="STUDENT">Talaba</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">Barcha holatlar</option>
            <option value="ACTIVE">Faol</option>
            <option value="INACTIVE">Nofaol</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center">№</th>
                <th className="py-3 px-4">F.I.SH</th>
                <th className="py-3 px-4">Lavozimi (Roli)</th>
                <th className="py-3 px-4">Tel raqami</th>
                <th className="py-3 px-4">Login</th>
                <th className="py-3 px-4">Parol</th>
                <th className="py-3 px-4 text-center">Holat</th>
                <th className="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Bunday parametrlar bo'yicha foydalanuvchilar topilmadi.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => {
                  const cfg = ROLE_CONFIGS[user.role] || ROLE_CONFIGS['PRACTICE_HEAD'];
                  const isUserActive = user.status === 'ACTIVE';
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Order number */}
                      <td className="py-3 px-3 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Full Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold shrink-0 text-xs">
                            {user.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{user.fullName}</p>
                            <p className="text-[10px] text-slate-400">{user.email || 'Email biriktirilmagan'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.badgeColor}`}>
                          {cfg.title}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-4 text-slate-700 font-mono text-[11px]">
                        {user.phone || '—'}
                      </td>

                      {/* Login */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs">
                          {user.login || user.username || '—'}
                        </span>
                      </td>

                      {/* Password */}
                      <td className="py-3 px-4 font-mono">
                        <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-900 rounded font-bold text-xs">
                          {user.password || 'password123'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {isUserActive ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Faol
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Bloklangan
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Toggle active / block status icon */}
                          <button
                            type="button"
                            onClick={() => handleToggleUserStatus(user)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isUserActive
                                ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 border-rose-200'
                                : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                            }`}
                            title={isUserActive ? 'Foydalanuvchini bloklash (nofaol qilish)' : 'Foydalanuvchini faollashtirish'}
                          >
                            <Lock className="w-4 h-4" />
                          </button>

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-slate-200"
                            title="Tahrirlash (Parolni tahrirlash)"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* View Profile */}
                          <button
                            type="button"
                            onClick={() => setUserToView(user)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Profilni ko'rish"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => handleImpersonateUser(user)}
                              className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Ushbu profilga o'tish (Impersonate)"
                            >
                              <LogIn className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setUserToDelete(user)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Yangi foydalanuvchi yaratish"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">F.I.SH (To'liq ismi-sharifi) *</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={e => {
                const newName = e.target.value;
                const auto = generateAutoUserCredentials(
                  newName,
                  formData.role,
                  storageService.getUsers(),
                  storageService.getStudents()
                );
                setFormData(prev => ({
                  ...prev,
                  fullName: newName,
                  login: auto.login,
                  email: auto.email,
                  password: prev.password || auto.password
                }));
              }}
              placeholder="Masalan: Ergashev Odil Mirzayevich"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tizimdagi Roli *</label>
            <select
              value={formData.role}
              onChange={e => {
                const newRole = e.target.value as UserRole;
                const auto = generateAutoUserCredentials(
                  formData.fullName,
                  newRole,
                  storageService.getUsers(),
                  storageService.getStudents()
                );
                setFormData(prev => ({
                  ...prev,
                  role: newRole,
                  login: auto.login,
                  email: auto.email,
                  password: auto.password
                }));
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 font-semibold text-slate-800 text-xs"
            >
              {assignableRoles.map(r => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.category})
                </option>
              ))}
            </select>
          </div>

          {/* Auto-Generated Login, Password & Email Preview with Regeneration */}
          <div className="p-3.5 bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-emerald-50/40 border border-blue-200 rounded-xl space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-bold text-slate-900">
                  Firebase Avtomatik Login, Parol va Email
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full border border-emerald-300">
                  Avtomatik
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRegenerateCredentials()}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                title="Yangi parol va logindan qayta generatsiya qilish"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Qayta yaratish</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              Ushbu foydalanuvchi yaratilganda uning hisobi uchun quyidagi email, login va parol avtomatik shakllanadi hamda Firebase bazasida saqlanadi:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-400 block font-semibold">Tizim Logini:</span>
                <input
                  type="text"
                  value={formData.login}
                  onChange={e => setFormData({ ...formData, login: e.target.value })}
                  placeholder="Login"
                  className="mt-1 w-full font-mono text-xs font-black text-slate-900 border border-slate-200 rounded px-2 py-1 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-400 block font-semibold">Tizim Paroli:</span>
                <input
                  type="text"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Parol"
                  className="mt-1 w-full font-mono text-xs font-black text-blue-700 border border-slate-200 rounded px-2 py-1 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-400 block font-semibold">Avtomatik Email:</span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@tma.uz"
                  className="mt-1 w-full text-xs font-semibold text-slate-800 border border-slate-200 rounded px-2 py-1 bg-slate-50 focus:bg-white truncate"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Telefon raqami</label>
            <input
              type="text"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+998 (90) 123-45-67"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white text-xs"
            />
          </div>

          {(formData.role === 'FACULTY_DEAN' || formData.role === 'STUDENT') && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fakultetni biriktirish</label>
              <select
                value={formData.facultyId}
                onChange={e => setFormData({ ...formData, facultyId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              >
                {faculties.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          )}

          {(formData.role === 'CLINIC_RESPONSIBLE' || formData.role === 'PRACTICE_SUPERVISOR') && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Amaliyot Bazasini biriktirish</label>
              <select
                value={formData.practicePlaceId}
                onChange={e => setFormData({ ...formData, practicePlaceId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              >
                {practicePlaces.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700"
            >
              Yaratish va Saqlash
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW USER PROFILE MODAL */}
      {userToView && (
        <Modal
          isOpen={!!userToView}
          onClose={() => setUserToView(null)}
          title="Foydalanuvchi Profili"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                {userToView.fullName.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{userToView.fullName}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold mt-1 border ${ROLE_CONFIGS[userToView.role]?.badgeColor || ''}`}>
                  {ROLE_CONFIGS[userToView.role]?.title || userToView.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-white rounded-lg border border-slate-200">
              <div>
                <p className="text-[10px] text-slate-400">Login ID:</p>
                <p className="font-mono font-bold text-slate-800">{userToView.login || userToView.username}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Parol:</p>
                <p className="font-mono font-bold text-slate-800">{userToView.password || '••••••••'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Email:</p>
                <p className="font-medium text-slate-700 truncate">{userToView.email || 'Kiritilmagan'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Telefon:</p>
                <p className="font-medium text-slate-700">{userToView.phone || 'Kiritilmagan'}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => handleImpersonateUser(userToView)}
                  className="px-3 py-1.5 rounded-lg bg-purple-100 text-purple-900 font-bold hover:bg-purple-200 transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Ushbu profilga o'tish</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setUserToView(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
              >
                Yopish
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT USER MODAL */}
      {userToEdit && (
        <Modal
          isOpen={!!userToEdit}
          onClose={() => setUserToEdit(null)}
          title="Foydalanuvchini tahrirlash"
        >
          <form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">F.I.SH *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Login *</label>
                <input
                  type="text"
                  required
                  value={formData.login}
                  onChange={e => setFormData({ ...formData, login: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Parol</label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Roli *</label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
              >
                {assignableRoles.map(r => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Telefon</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Holat</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
              >
                <option value="ACTIVE">Faol</option>
                <option value="INACTIVE">Nofaol</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setUserToEdit(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700"
              >
                O'zgarishlarni Saqlash
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Foydalanuvchini o'chirish"
        message={`Haqiqatan ham "${userToDelete?.fullName}" foydalanuvchisini tizimdan o'chirmoqchimisiz?`}
        confirmText="O'chirish"
        cancelText="Bekor qilish"
        variant="danger"
      />

      {/* CONFIRM CLEAR ALL STAFF DIALOG */}
      <ConfirmDialog
        isOpen={isClearStaffDialogOpen}
        onClose={() => setIsClearStaffDialogOpen(false)}
        onConfirm={handleClearAllStaffConfirm}
        title="Barcha xodimlarni o'chirish"
        message="Haqiqatan ham tizimdagi barcha dekanlar, amaliyot rahbarlari va xodimlar hisoblarini tozalab (o'chirib) tashlamoqchimisiz? (Super Admin va Talabalar saqlanib qoladi)."
        confirmText="Ha, barcha xodimlarni o'chirish"
        cancelText="Bekor qilish"
        variant="danger"
      />

      {/* CREATED USER CREDENTIALS CONFIRMATION MODAL */}
      {createdCredentialsModal && (
        <Modal
          isOpen={!!createdCredentialsModal}
          onClose={() => setCreatedCredentialsModal(null)}
          title="Foydalanuvchi Hisobi Muvaffaqiyatli Yaratildi!"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="text-center space-y-1.5">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h4 className="text-base font-bold text-slate-900">
                Firebase va tizim bazasida hisob shakllantirildi!
              </h4>
              <p className="text-xs text-slate-500">
                Quyidagi email, login va parol avtomatik ravishda yaratilib, ushbu foydalanuvchiga biriktirildi:
              </p>
            </div>

            {/* Credentials Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 shadow-2xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">
                    {createdCredentialsModal.user.fullName}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {ROLE_CONFIGS[createdCredentialsModal.user.role]?.title || createdCredentialsModal.user.role}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-300">
                  FAOL (ACTIVE)
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Email Row */}
                <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Avtomatik Email:</span>
                    <span className="font-medium text-slate-900 font-mono text-xs">
                      {createdCredentialsModal.user.email}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdCredentialsModal.user.email || '');
                      showToast('success', 'Nusxalandi', `${createdCredentialsModal.user.email} nusxalab olindi`);
                    }}
                    className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors border border-slate-200"
                    title="Email nusxalash"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Login Row */}
                <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Tizim Logini:</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">
                      {createdCredentialsModal.user.login || createdCredentialsModal.user.username}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdCredentialsModal.user.login || createdCredentialsModal.user.username || '');
                      showToast('success', 'Nusxalandi', `${createdCredentialsModal.user.login} logini nusxalab olindi`);
                    }}
                    className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors border border-slate-200"
                    title="Login nusxalash"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Password Row */}
                <div className="flex items-center justify-between p-2.5 bg-blue-50/60 rounded-xl border border-blue-200 shadow-2xs">
                  <div>
                    <span className="text-[10px] text-blue-700 block font-bold">Tizim Paroli:</span>
                    <span className="font-bold text-blue-950 font-mono text-sm">
                      {createdCredentialsModal.rawPassword || createdCredentialsModal.user.password || 'password123'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdCredentialsModal.rawPassword || createdCredentialsModal.user.password || 'password123');
                      showToast('success', 'Nusxalandi', 'Parol nusxalab olindi');
                    }}
                    className="p-1.5 bg-white hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200 shadow-2xs"
                    title="Parolni nusxalash"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 bg-blue-50/70 p-2.5 rounded-xl border border-blue-200 text-left">
              <strong>Eslatma:</strong> Xodim yoki talaba ushbu login va parol orqali tizimga bevosita kirib, o'z profilida faoliyatini davom ettirishi mumkin.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const txt = `F.I.Sh: ${createdCredentialsModal.user.fullName}\nRoli: ${ROLE_CONFIGS[createdCredentialsModal.user.role]?.title || createdCredentialsModal.user.role}\nLogin: ${createdCredentialsModal.user.login || createdCredentialsModal.user.username}\nParol: ${createdCredentialsModal.rawPassword || createdCredentialsModal.user.password}\nEmail: ${createdCredentialsModal.user.email}`;
                  navigator.clipboard.writeText(txt);
                  showToast('success', 'Nusxalandi', 'Barcha hisob ma\'lumotlari xotiraga olindi');
                }}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Barchasidan nusxa olish</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {isSuperAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      handleImpersonateUser(createdCredentialsModal.user);
                      setCreatedCredentialsModal(null);
                    }}
                    className="px-3.5 py-2 text-xs font-bold text-purple-900 bg-purple-100 hover:bg-purple-200 rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Profilga o'tish</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setCreatedCredentialsModal(null)}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
                >
                  Tushunarli
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
