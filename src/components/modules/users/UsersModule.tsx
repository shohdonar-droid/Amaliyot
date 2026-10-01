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
  Hospital
} from 'lucide-react';
import { User, UserRole, CanonicalUserRole } from '../../../types';
import { storageService } from '../../../services/storageService';
import { generateStaffLogin, getNextStudentLogin } from '../../../services/loginGeneratorService';
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

  const loadUsers = () => {
    const list = storageService.getUsers();
    setUsers(list);
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
    const defaultRole = isSuperAdmin ? 'PRACTICE_HEAD' : 'FACULTY_DEAN';
    setFormData({
      fullName: '',
      login: '',
      password: '',
      email: '',
      phone: '',
      role: defaultRole as UserRole,
      status: 'ACTIVE',
      facultyId: faculties[0]?.id || '',
      practicePlaceId: practicePlaces[0]?.id || ''
    });
    setIsCreateModalOpen(true);
  };

  const computeAutoLogin = (fullName: string, targetRole: UserRole, existingUsersList: User[]): string => {
    const isStudent = targetRole === 'STUDENT' || targetRole === 'student';
    if (isStudent) {
      return getNextStudentLogin(storageService.getStudents(), existingUsersList);
    }
    const existingLogins = existingUsersList.map(u => u.login || u.username || '');
    return generateStaffLogin(fullName, existingLogins);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      showToast('warning', 'Ma\'lumotlar yetarli emas', 'F.I.SH (Familiya Ism Sharif) kiritilishi shart');
      return;
    }

    // Check permissions
    if (!isSuperAdmin && (formData.role === 'SUPER_ADMIN' || formData.role === 'PRACTICE_HEAD')) {
      showToast('error', 'Ruxsat etilmagan', 'Amaliyot bo\'lim boshlig\'i Super Admin va Amaliyot bo\'limi boshlig\'i rolini yarata olmaydi.');
      return;
    }

    const currentUsers = storageService.getUsers();
    const autoLogin = computeAutoLogin(formData.fullName.trim(), formData.role, currentUsers);
    const standardPassword = 'password123'; // Standard one-time initial password for all created accounts

    const newUser: User = {
      id: `user-${Date.now()}`,
      uid: `uid-${Date.now()}`,
      fullName: formData.fullName.trim(),
      login: autoLogin,
      username: autoLogin,
      password: standardPassword,
      role: formData.role,
      email: formData.email.trim() || `${autoLogin}@med.uz`,
      phone: formData.phone.trim() || '+998 (90) 000-00-00',
      status: formData.status,
      facultyId: formData.facultyId || undefined,
      practicePlaceId: formData.practicePlaceId || undefined,
      createdAt: new Date().toISOString()
    };

    // If creating a STUDENT, also save to students table so they appear in student lists
    if (formData.role === 'STUDENT' || formData.role === 'student') {
      const faculties = storageService.getFaculties();
      const directions = storageService.getDirections();
      const courses = storageService.getCourses();
      const groups = storageService.getGroups();
      storageService.saveStudent({
        id: newUser.id,
        userId: newUser.uid,
        studentId: `MED-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        login: autoLogin,
        studentCode: autoLogin,
        hemisStudentId: String(Math.floor(10000000 + Math.random() * 90000000)),
        pinfl: '3140' + String(Math.floor(1000000000 + Math.random() * 9000000000)),
        fullName: newUser.fullName,
        facultyId: formData.facultyId || faculties[0]?.id || '',
        directionId: directions[0]?.id || '',
        courseId: courses[0]?.id || '',
        groupId: groups[0]?.id || '',
        phone: newUser.phone,
        telegram: '@',
        email: newUser.email,
        status: 'active',
        createdAt: new Date().toISOString()
      });
    }

    storageService.saveUser(newUser);
    storageService.recordAuditLog({
      userId: currentUser?.uid || currentUser?.id || 'system',
      userRole: activeUserRole,
      action: 'createUser',
      entity: 'users',
      entityId: newUser.id,
      metadata: JSON.stringify({ createdRole: newUser.role, fullName: newUser.fullName, login: autoLogin })
    });

    loadUsers();
    setIsCreateModalOpen(false);
    showToast('success', 'Foydalanuvchi yaratildi', `${newUser.fullName} (${ROLE_CONFIGS[newUser.role]?.title || newUser.role}) yaratildi. Login: ${autoLogin}, Parol: ${standardPassword}`);
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

    const updated: User = {
      ...userToEdit,
      fullName: formData.fullName.trim(),
      login: formData.login.trim(),
      username: formData.login.trim(),
      password: formData.password.trim() || userToEdit.password || 'password123',
      role: formData.role,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      status: formData.status,
      facultyId: formData.facultyId || undefined,
      practicePlaceId: formData.practicePlaceId || undefined,
      updatedAt: new Date().toISOString()
    };

    storageService.saveUser(updated);
    loadUsers();
    setUserToEdit(null);
    showToast('info', 'Foydalanuvchi yangilandi', `${updated.fullName} ma'lumotlari saqlandi.`);
  };

  const handleDeleteConfirm = () => {
    if (!userToDelete) return;
    storageService.deleteUser(userToDelete.id);
    loadUsers();
    showToast('info', 'O\'chirildi', `${userToDelete.fullName} foydalanuvchisi tizimdan o'chirildi.`);
    setUserToDelete(null);
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
                <th className="py-3 px-4">Foydalanuvchi F.I.SH</th>
                <th className="py-3 px-4">Login / Parol</th>
                <th className="py-3 px-4">Tizimdagi Roli</th>
                <th className="py-3 px-4">Aloqa (Email / Tel)</th>
                <th className="py-3 px-4">Holati</th>
                <th className="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Bunday parametrlar bo'yicha foydalanuvchilar topilmadi.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const cfg = ROLE_CONFIGS[user.role] || ROLE_CONFIGS['PRACTICE_HEAD'];
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold shrink-0">
                            {user.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{user.fullName}</p>
                            <p className="text-[10px] text-slate-400">ID: {user.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <div className="font-semibold text-slate-800">{user.login || user.username}</div>
                        <div className="text-[10px] text-slate-400">••••••••</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.badgeColor}`}>
                          {cfg.title}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <p className="truncate">{user.email || '—'}</p>
                        <p className="text-[11px] text-slate-400">{user.phone || '—'}</p>
                      </td>

                      <td className="py-3 px-4">
                        {user.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            Faol
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                            <XCircle className="w-3 h-3" />
                            Nofaol
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setUserToView(user)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Profilni ko'rish"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Tahrirlash"
                          >
                            <Edit2 className="w-4 h-4" />
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
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Masalan: Ergashev Odil Mirzayevich"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          {/* Auto-Generated Login & Standard Password Notice */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-blue-900">Login va Parol Avtomatik Shakllantiriladi</p>
                <p className="text-[11px] text-blue-700">Qo'lda kiritilmaydi. Roliga va F.I.Sh. ma'lumotiga qarab tizim tomonidan biriktiriladi.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-blue-100 text-xs">
              <div className="p-2 bg-white rounded-lg border border-blue-200">
                <span className="text-[10px] text-slate-400 block font-medium">Auto-Login:</span>
                <span className="font-mono font-bold text-blue-900">
                  {formData.fullName.trim()
                    ? computeAutoLogin(formData.fullName.trim(), formData.role, users)
                    : (formData.role === 'STUDENT' ? 'T000XX (Avtomatik)' : 'Familiya_Ism (Avtomatik)')
                  }
                </span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-blue-200">
                <span className="text-[10px] text-slate-400 block font-medium">Birlamchi Standard Parol:</span>
                <span className="font-mono font-bold text-emerald-700">password123</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tizimdagi Roli *</label>
            <select
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 font-semibold text-slate-800"
            >
              {assignableRoles.map(r => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.category})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email pochtasi</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="ergashev@med.uz"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Telefon raqami</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+998 (90) 123-45-67"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>
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
    </div>
  );
}
