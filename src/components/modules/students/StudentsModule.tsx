import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Download,
  GraduationCap,
  Building2,
  X,
  FileSpreadsheet,
  CheckCircle2,
  Copy,
  Key,
  RotateCcw
} from 'lucide-react';
import { Student } from '../../../types';
import { studentService } from '../../../services/studentService';
import { storageService } from '../../../services/storageService';
import { userService } from '../../../services/userService';
import { parseStudentCodeSequence } from '../../../services/loginGeneratorService';
import { useToast } from '../../../context/ToastContext';
import { StatusBadge } from '../../common/Badge';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { StudentDetailModal } from './StudentDetailModal';
import { StudentFormModal } from './StudentFormModal';
import { BulkStudentImportModal } from './BulkStudentImportModal';
import { EmptyState } from '../../common/EmptyState';
import { Modal } from '../../common/Modal';
import { useAuth } from '../../../context/AuthContext';
import { useEffect, useState, useMemo } from 'react';

export function StudentsModule() {
  const { showToast } = useToast();
  const { canonicalRole, currentUser, role, isSuperAdmin } = useAuth();
  const isSupervisor = canonicalRole === 'PRACTICE_SUPERVISOR';
  const supervisorId = currentUser?.supervisorId || (isSupervisor ? 'sup-1' : undefined);

  const [students, setStudents] = useState<Student[]>([]);
  
  useEffect(() => {
    studentService.getStudents().then(data => {
      setStudents(Array.isArray(data) ? data : []);
    }).catch(err => {
      console.warn("Failed to load students:", err);
      setStudents(storageService.getStudents() || []);
    });
  }, []);

  const faculties = storageService.getFaculties() || [];
  const directions = storageService.getDirections() || [];
  const courses = storageService.getCourses() || [];
  const groups = (isSupervisor && supervisorId 
    ? storageService.getGroupsForSupervisor(supervisorId)
    : storageService.getGroups()) || [];
  const practices = storageService.getPractices() || [];
  const places = storageService.getPracticePlaces() || [];

  // Search & Filter States (Sequential & Supervisor filters)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('');
  const [filterDirection, setFilterDirection] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [filterSupervisors, setFilterSupervisors] = useState<string[]>([]);
  const [filterClinicResponsibles, setFilterClinicResponsibles] = useState<string[]>([]);
  const [filterPractice, setFilterPractice] = useState('');
  const [filterPlace, setFilterPlace] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modals & Helpers
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [createdCredentialsModal, setCreatedCredentialsModal] = useState<{
    student: Student;
  } | null>(null);
  const [studentToResetPassword, setStudentToResetPassword] = useState<Student | null>(null);

  const handleResetPasswordConfirm = async () => {
    if (!studentToResetPassword) return;
    try {
      const targetUserId = studentToResetPassword.userId || studentToResetPassword.id;
      await userService.updateUser(targetUserId, { password: 'password123' });
      showToast('success', 'Parol tiklandi', `${studentToResetPassword.fullName} uchun parol birlamchi "password123" ga qaytarildi. Tizimga shu parol bilan kirish mumkin.`);
      setStudentToResetPassword(null);
    } catch (err: any) {
      showToast('error', 'Xatolik', 'Parolni tiklashda xatolik yuz berdi: ' + (err?.message || ''));
    }
  };

  const refreshList = async () => {
    try {
      const data = await studentService.getStudents();
      setStudents(Array.isArray(data) ? data : []);
    } catch {
      setStudents(storageService.getStudents() || []);
    }
  };

  const allSupervisors = storageService.getSupervisors() || [];
  const allClinicResponsibles = storageService.getClinicResponsibles() || [];
  const assignments = storageService.getAssignments() || [];

  // Sequential cascading options
  const availableDirections = directions.filter(d => 
    !filterFaculty || d.facultyId === filterFaculty
  );

  const availableGroups = groups.filter(g => {
    if (filterFaculty && g.facultyId !== filterFaculty) return false;
    if (filterCourse && g.courseId !== filterCourse) return false;
    if (filterDirection && g.directionId !== filterDirection) return false;
    return true;
  });

  // Filtered & Sequentially Sorted Students
  const filteredStudents = useMemo(() => {
    if (!Array.isArray(students)) return [];

    const list = students.filter(student => {
      if (!student) return false;
      const sFullName = String(student.fullName || '');
      const sStudentId = String(student.studentId || '');
      const sPinfl = String(student.pinfl || '');
      const sPhone = String(student.phone || '');
      const sLogin = String(student.login || student.studentCode || '');

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = sFullName.toLowerCase().includes(q);
        const matchId = sStudentId.toLowerCase().includes(q);
        const matchPinfl = sPinfl.includes(q);
        const matchPhone = sPhone.includes(q);
        const matchLogin = sLogin.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchPinfl && !matchPhone && !matchLogin) return false;
      }

      if (filterFaculty && student.facultyId !== filterFaculty) return false;
      if (filterDirection && student.directionId !== filterDirection) return false;
      if (filterCourse && student.courseId !== filterCourse) return false;
      if (filterGroup && student.groupId !== filterGroup) return false;

      if (filterSupervisors.length > 0) {
        const asg = assignments.find(a => a.studentId === student.id);
        if (!asg || !filterSupervisors.includes(asg.supervisorId)) return false;
      }

      if (filterClinicResponsibles.length > 0) {
        const asg = assignments.find(a => a.studentId === student.id);
        if (!asg || !asg.clinicResponsibleId || !filterClinicResponsibles.includes(asg.clinicResponsibleId)) return false;
      }

      if (filterStatus && student.status !== filterStatus) return false;
      if (filterPractice && student.currentPracticeId !== filterPractice) return false;
      if (filterPlace && student.currentPracticePlaceId !== filterPlace) return false;

      return true;
    });

    return list.sort((a, b) => {
      const seqA = parseStudentCodeSequence(a?.login || a?.studentCode || '') || 0;
      const seqB = parseStudentCodeSequence(b?.login || b?.studentCode || '') || 0;
      if (seqA !== seqB) return seqA - seqB;
      return String(a?.createdAt || '').localeCompare(String(b?.createdAt || ''));
    });
  }, [
    students,
    searchQuery,
    filterFaculty,
    filterDirection,
    filterCourse,
    filterGroup,
    filterSupervisors,
    filterClinicResponsibles,
    filterPractice,
    filterPlace,
    filterStatus,
    assignments
  ]);

  const handleSaveStudent = async (saved: Student) => {
    try {
      if (saved.id && saved.id !== 'new') {
        // Update existing
        setStudents(prev => prev.map(s => s.id === saved.id ? saved : s));
        storageService.saveStudent(saved);
        showToast('success', 'Muvaffaqiyatli saqlandi', `${saved.fullName} ma'lumotlari yangilandi.`);
        studentService.updateStudent(saved.id, saved).catch(console.warn);
      } else {
        // Create new - INSTANT optimistic update
        const tempId = `st-${Date.now()}`;
        const newStudentRecord: Student = { ...saved, id: tempId };
        
        storageService.saveStudent(newStudentRecord);
        setStudents(prev => [...prev.filter(s => s.id !== tempId), newStudentRecord]);
        setCreatedCredentialsModal({ student: newStudentRecord });
        showToast('success', 'Talaba yaratildi!', `${saved.fullName} uchun tartibli login (${saved.login}) va parol biriktirildi.`);

        // Clear active search/filters so new student is immediately visible in list
        resetFilters();

        // Asynchronous background persistence to Firestore
        (async () => {
          try {
            const actualId = await studentService.createStudent(saved as Omit<Student, 'id'>);
            if (actualId && actualId !== tempId) {
              const updatedRecord = { ...newStudentRecord, id: actualId };
              storageService.saveStudent(updatedRecord);
              await refreshList();
            }
          } catch (err) {
            console.warn("Background student creation warning:", err);
          }
        })();
      }
    } catch (e: any) {
      showToast('error', 'Xatolik', e.message || 'Saqlashda xatolik yuz berdi');
    }
  };

  const canDeleteStudents = isSuperAdmin || canonicalRole === 'SUPER_ADMIN' || canonicalRole === 'PRACTICE_HEAD' || role === 'SUPER_ADMIN' || role === 'PRACTICE_HEAD' || role === 'super_admin' || role === 'dept_head';

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    const targetId = studentToDelete.id;
    const targetName = studentToDelete.fullName;

    if (!canDeleteStudents) {
      showToast('error', 'Ruxsat etilmagan', 'Faqat Amaliyot bo\'limi boshlig\'i va Super Admin talabani o\'chira oladi.');
      setStudentToDelete(null);
      return;
    }

    // Immediately remove from UI list
    setStudents(prev => prev.filter(s => s.id !== targetId));
    setStudentToDelete(null);
    showToast('success', 'Tizimdan o\'chirildi', `${targetName} talabasi tizimdan muvaffaqiyatli o'chirildi.`);

    try {
      await studentService.deleteStudent(targetId);
    } catch (e: any) {
      showToast('error', 'Xatolik', 'Bazadan o\'chirishda xatolik: ' + (e.message || ''));
      refreshList();
    }
  };

  const handleResetAllStudents = async () => {
    setIsResetting(true);
    try {
      await studentService.clearAllStudentsAndResetSequence();
      setStudents([]);
      setIsResetConfirmOpen(false);
      showToast('success', 'Baza tozalandi', 'Barcha talabalar profili tozalandi va login hisoblagich T00001 dan qayta boshlanadigan qilib yangilandi.');
      await refreshList();
    } catch (err: any) {
      showToast('error', 'Xatolik', 'Talabalarni tozalashda xatolik: ' + (err?.message || ''));
    } finally {
      setIsResetting(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilterFaculty('');
    setFilterDirection('');
    setFilterCourse('');
    setFilterGroup('');
    setFilterSupervisors([]);
    setFilterClinicResponsibles([]);
    setFilterPractice('');
    setFilterPlace('');
    setFilterStatus('');
  };

  const hasActiveFilters = Boolean(
    searchQuery || filterFaculty || filterDirection || filterCourse || 
    filterGroup || filterSupervisors.length > 0 || filterClinicResponsibles.length > 0 || filterPractice || filterPlace || filterStatus
  );

  const canEditStatus = canonicalRole === 'SUPER_ADMIN' || canonicalRole === 'PRACTICE_HEAD' || canonicalRole === 'PRACTICE_STAFF' || canonicalRole === 'FACULTY_DEAN';

  const handleStudentStatusChange = async (targetStudent: Student, newStatus: string) => {
    try {
      await studentService.updateStudent(targetStudent.id, { status: newStatus as any });
      await refreshList();
      showToast('info', 'Status yangilandi', `${targetStudent.fullName} statusi "${newStatus}" ga o'zgartirildi.`);
    } catch (err: any) {
      showToast('error', 'Xatolik', 'Statusni yangilashda xatolik: ' + (err.message || ''));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {isSupervisor ? "Mening biriktirilgan talabalarim" : "Talabalar amaliyoti ro'yxati"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isSupervisor 
              ? `Sizga biriktirilgan guruhlar: ${(groups || []).map(g => g?.name || '').filter(Boolean).join(', ') || 'mavjud emas'} · Jami ${students.length} nafar talaba`
              : `Jami: ${students.length} nafar talaba · Filtrlangan: ${filteredStudents.length} nafar`}
          </p>
        </div>

        {!isSupervisor && (
          <div className="flex items-center gap-2 flex-wrap">
            {canDeleteStudents && (
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                title="Barcha talabalar profilini o'chirish va T00001 dan qayta boshlash"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Tozalash (T00001 dan)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <span>Bittada yuklash (Excel/CSV)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStudentToEdit(null);
                setIsFormModalOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi talaba</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Panel */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="F.I.Sh., Talaba ID, JSHSHIR yoki telefon bo'yicha qidirish..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-slate-50/50"
          />
        </div>

        {/* Deep Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 pt-1">
          {/* Faculty */}
          <select
            value={filterFaculty}
            onChange={e => setFilterFaculty(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Barcha fakultetlar</option>
            {faculties.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>

          {/* Direction */}
          <select
            value={filterDirection}
            onChange={e => setFilterDirection(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Barcha yo'nalishlar</option>
            {directions.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* Course */}
          <select
            value={filterCourse}
            onChange={e => setFilterCourse(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Barcha kurslar</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Group */}
          <select
            value={filterGroup}
            onChange={e => setFilterGroup(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Barcha guruhlar</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          {/* Practice */}
          <select
            value={filterPractice}
            onChange={e => setFilterPractice(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Amaliyot bo'yicha</option>
            {practices.map(p => (
              <option key={p.id} value={p.id}>{p.code}</option>
            ))}
          </select>

          {/* Practice Place */}
          <select
            value={filterPlace}
            onChange={e => setFilterPlace(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Amaliyot joyi bo'yicha</option>
            {places.map(pl => (
              <option key={pl.id} value={pl.id}>{pl.name}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:ring-2 focus:ring-blue-600 font-medium"
          >
            <option value="">Holat (Barchasi)</option>
            <option value="in_practice">Amaliyotda</option>
            <option value="active">Faol (O'qimoqda)</option>
            <option value="completed">Yakunlagan</option>
            <option value="suspended">Chetlashtirilgan</option>
          </select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span>Filtrlar qo'llanilgan ({filteredStudents.length} ta natija)</span>
            <button
              onClick={resetFilters}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Filtrlarni tozalash
            </button>
          </div>
        )}
      </div>

      {/* Main Students Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredStudents.length === 0 ? (
          <EmptyState
            title="Talaba topilmadi"
            description="Kiritilgan parametrlar yoki qidiruv so'rovi bo'yicha talabalar ro'yxatda mavjud emas."
            actionLabel="Filtrlarni tozalash"
            onAction={resetFilters}
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3 w-10 text-center">№</th>
                    <th className="py-3 px-4">Id raqami</th>
                    <th className="py-3 px-4">FISH</th>
                    <th className="py-3 px-4">Hemis id</th>
                    <th className="py-3 px-4">Kursi</th>
                    <th className="py-3 px-4">Fakultet / yo'nalishi</th>
                    <th className="py-3 px-4">Guruhi</th>
                    <th className="py-3 px-4">Aloqa (Tel / TG)</th>
                    <th className="py-3 px-4">Login/Parol Status</th>
                    <th className="py-3 px-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student, idx) => {
                    const faculty = faculties.find(f => f.id === student.facultyId);
                    const direction = directions.find(d => d.id === student.directionId);
                    const course = courses.find(c => c.id === student.courseId);
                    const group = groups.find(g => g.id === student.groupId);

                    const statusVariant = 
                      student.status === 'in_practice' ? 'success' :
                      student.status === 'active' ? 'info' :
                      student.status === 'suspended' || student.status === 'dismissed' ? 'danger' : 'neutral';

                    const statusLabel = 
                      student.status === 'in_practice' ? 'Amaliyotda' :
                      student.status === 'active' ? 'Faol (O\'qimoqda)' :
                      student.status === 'suspended' || student.status === 'dismissed' ? 'Chetlashtirilgan' : 'Yakunlagan';

                    const formattedId = student.studentId || (parseStudentCodeSequence(student.login || '') ? String(parseStudentCodeSequence(student.login || '')).padStart(5, '0') : '00001');

                    return (
                      <tr
                        key={student.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => setSelectedStudentForDetail(student)}
                      >
                        {/* Order number */}
                        <td className="py-3 px-3 text-center font-bold text-slate-400">
                          {idx + 1}
                        </td>

                        {/* Id raqami */}
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                            {student.login || student.studentCode || 'T00001'}
                          </span>
                        </td>

                        {/* FISH */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                              {(student.fullName || 'T').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors block">
                                {student.fullName || 'Talaba'}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {student.email || `${student.login || 'student'}@student.uz`}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Hemis id */}
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {student.hemisStudentId || student.studentId || '-'}
                        </td>

                        {/* Kursi */}
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {course?.name || '4-kurs'}
                        </td>

                        {/* Fakultet / yo'nalishi */}
                        <td className="py-3 px-4">
                          <div className="text-slate-800 font-medium line-clamp-1">
                            {faculty?.name || 'Fakultet'}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">
                            {direction?.name || 'Yo\'nalish'}
                          </div>
                        </td>

                        {/* Guruhi */}
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800">
                            {group?.name || 'Guruh'}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {group?.language ? `(${group.language})` : ''}
                          </span>
                        </td>

                        {/* Aloqa */}
                        <td className="py-3 px-4 font-mono text-slate-700">
                          <div>{student.phone || '—'}</div>
                          <div className="text-[11px] text-blue-600 font-normal">
                            {student.telegram || '—'}
                          </div>
                        </td>

                        {/* Login/Parol Status */}
                        <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                          {canEditStatus ? (
                            <select
                              value={student.status}
                              onChange={e => handleStudentStatusChange(student, e.target.value)}
                              className={`px-2 py-1 rounded-lg text-[11px] font-bold border focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                                student.status === 'in_practice' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                                student.status === 'active' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                                student.status === 'suspended' || student.status === 'dismissed' ? 'bg-rose-50 text-rose-800 border-rose-300' :
                                'bg-slate-100 text-slate-700 border-slate-300'
                              }`}
                            >
                              <option value="active">Faol (O'qimoqda)</option>
                              <option value="in_practice">Amaliyotda</option>
                              <option value="completed">Yakunlagan</option>
                              <option value="suspended">Chetlashtirilgan</option>
                            </select>
                          ) : (
                            <StatusBadge label={statusLabel} variant={statusVariant} />
                          )}
                        </td>

                        {/* Amallar */}
                        <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {/* Pasportni ko'rish */}
                            <button
                              type="button"
                              onClick={() => setSelectedStudentForDetail(student)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Amaliyot pasportini ko'rish"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Birlamchi parolga qaytarish (Key icon) */}
                            <button
                              type="button"
                              onClick={() => setStudentToResetPassword(student)}
                              className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Parolni birlamchi holatga (password123) qaytarish"
                            >
                              <Key className="w-4 h-4" />
                            </button>

                            {/* Tahrirlash */}
                            <button
                              type="button"
                              onClick={() => {
                                setStudentToEdit(student);
                                setIsFormModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Tahrirlash"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* O'chirish */}
                            {canDeleteStudents && (
                              <button
                                type="button"
                                onClick={() => setStudentToDelete(student)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="O'chirish"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (Optimized for 320px - 430px screens) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredStudents.map((student, idx) => {
                const faculty = faculties.find(f => f.id === student.facultyId);
                const direction = directions.find(d => d.id === student.directionId);
                const course = courses.find(c => c.id === student.courseId);
                const group = groups.find(g => g.id === student.groupId);

                const statusLabel = 
                  student.status === 'in_practice' ? 'Amaliyotda' :
                  student.status === 'active' ? 'Faol (O\'qimoqda)' :
                  student.status === 'suspended' || student.status === 'dismissed' ? 'Chetlashtirilgan' : 'Yakunlagan';

                const statusVariant = 
                  student.status === 'in_practice' ? 'success' :
                  student.status === 'active' ? 'info' :
                  student.status === 'suspended' || student.status === 'dismissed' ? 'danger' : 'neutral';

                return (
                  <div
                    key={student.id}
                    className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Header: F.I.SH & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {(student.fullName || 'T').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm truncate leading-snug">
                            {student.fullName}
                          </p>
                          <p className="text-[11px] font-mono font-semibold text-blue-600">
                            {student.login || student.studentCode || 'T00001'} {student.hemisStudentId ? `· HEMIS: ${student.hemisStudentId}` : ''}
                          </p>
                        </div>
                      </div>
                      <StatusBadge label={statusLabel} variant={statusVariant} />
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase block">Kurs & Guruh</span>
                        <span className="font-bold text-slate-800">{course?.name || '4-kurs'} · {group?.name || 'Guruh'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase block">Yo‘nalish</span>
                        <span className="font-semibold text-slate-800 truncate block">{direction?.name || faculty?.name || 'Yo‘nalish'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase block">Aloqa</span>
                        <span className="font-mono text-slate-700">{student.phone || '—'} {student.telegram ? `(${student.telegram})` : ''}</span>
                      </div>
                    </div>

                    {/* Mobile Action Buttons */}
                    <div className="flex items-center justify-between gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedStudentForDetail(student)}
                        className="flex-1 py-2 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ko‘rish</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStudentToResetPassword(student)}
                        className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                        title="Birlamchi parolga qaytarish"
                      >
                        <Key className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setStudentToEdit(student);
                          setIsFormModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                        title="Tahrirlash"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {canDeleteStudents && (
                        <button
                          type="button"
                          onClick={() => setStudentToDelete(student)}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                          title="O‘chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Student Detail Modal */}
      <StudentDetailModal
        isOpen={Boolean(selectedStudentForDetail)}
        onClose={() => setSelectedStudentForDetail(null)}
        student={selectedStudentForDetail}
      />

      {/* Add / Edit Student Modal */}
      <StudentFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setStudentToEdit(null);
        }}
        onSave={handleSaveStudent}
        studentToEdit={studentToEdit}
      />

      {/* Bulk Student Import Modal */}
      <BulkStudentImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={refreshList}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(studentToDelete)}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Talabani o'chirish"
        message={`Haqiqatan ham "${studentToDelete?.fullName}" talabasini tizimdan o'chirmoqchimisiz? Talabaga tegishli barcha amaliyot va davomat ma'lumotlari ham o'chiriladi.`}
        confirmLabel="O'chirish"
        cancelLabel="Bekor qilish"
        isDestructive
      />

      {/* Reset All Students and Sequence Confirmation */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetAllStudents}
        title="Talabalarni tozalash va T00001 dan qayta boshlash"
        message="Haqiqatan ham barcha mavjud talabalar profillarini o'chirib, login hisoblagichini T00001 dan qayta boshlamoqchimisiz? Ushbu amal barcha talabalar hisoblarini tozalaydi va yangi yaratiladigan talabalar T00001 dan boshlab ketma-ket login oladi."
        confirmLabel={isResetting ? "Tozalanmoqda..." : "Tozalash va T00001 dan boshlash"}
        cancelLabel="Bekor qilish"
        isDestructive
      />

      {/* Created Student Credentials Modal */}
      {createdCredentialsModal && (
        <Modal
          isOpen={Boolean(createdCredentialsModal)}
          onClose={() => setCreatedCredentialsModal(null)}
          title="Talaba Profili Muvaffaqiyatli Yaratildi!"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="text-center space-y-1.5">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h4 className="text-base font-bold text-slate-900">
                Tizimda Yangi Talaba Saqlandi!
              </h4>
              <p className="text-xs text-slate-500">
                Quyidagi tartibli login va parol avtomatik ravishda talabaga biriktirildi:
              </p>
            </div>

            {/* Credentials Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 shadow-2xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">
                    {createdCredentialsModal.student.fullName}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium font-mono">
                    HEMIS ID: {createdCredentialsModal.student.hemisStudentId}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-300">
                  FAOL
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Login Row */}
                <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Tizimdagi Tartibli Login:</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">
                      {createdCredentialsModal.student.login || createdCredentialsModal.student.studentCode}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdCredentialsModal.student.login || createdCredentialsModal.student.studentCode || '');
                      showToast('success', 'Nusxalandi', `${createdCredentialsModal.student.login} logini nusxalab olindi`);
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
                      {createdCredentialsModal.student.password || 'password123'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdCredentialsModal.student.password || 'password123');
                      showToast('success', 'Nusxalandi', 'Parol nusxalab olindi');
                    }}
                    className="p-1.5 bg-white hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200 shadow-2xs"
                    title="Parolni nusxalash"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Email & Student ID */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-semibold">Student ID (Sonli):</span>
                    <span className="font-mono font-bold text-slate-800">{createdCredentialsModal.student.studentId}</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 truncate">
                    <span className="text-[10px] text-slate-400 block font-semibold">Avtomatik Email:</span>
                    <span className="font-mono font-bold text-slate-800 truncate block">{createdCredentialsModal.student.email}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const txt = `F.I.Sh: ${createdCredentialsModal.student.fullName}\nHEMIS ID: ${createdCredentialsModal.student.hemisStudentId}\nLogin: ${createdCredentialsModal.student.login || createdCredentialsModal.student.studentCode}\nParol: ${createdCredentialsModal.student.password || 'password123'}\nStudent ID: ${createdCredentialsModal.student.studentId}\nEmail: ${createdCredentialsModal.student.email}`;
                  navigator.clipboard.writeText(txt);
                  showToast('success', 'Nusxalandi', 'Talabaning barcha kirish ma\'lumotlari nusxalab olindi');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Nusxa olish</span>
              </button>

              <button
                type="button"
                onClick={() => setCreatedCredentialsModal(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
              >
                Tushunarli
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reset Student Password to Default Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(studentToResetPassword)}
        onClose={() => setStudentToResetPassword(null)}
        onConfirm={handleResetPasswordConfirm}
        title="Parolni birlamchi holatga qaytarish"
        message={`Haqiqatan ham "${studentToResetPassword?.fullName}" talabasining parolini birlamchi "password123" holatiga qaytarmoqchimisiz? Talaba kiritgan shaxsiy yangi paroli bekor qilinadi va tizimga kirishda birlamchi parol qabul qilinadi.`}
        confirmLabel="Birlamchi parolga qaytarish"
        cancelLabel="Bekor qilish"
      />
    </div>
  );
}
