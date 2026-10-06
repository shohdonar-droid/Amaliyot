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
  FileSpreadsheet
} from 'lucide-react';
import { Student } from '../../../types';
import { studentService } from '../../../services/studentService';
import { storageService } from '../../../services/storageService';
import { useToast } from '../../../context/ToastContext';
import { StatusBadge } from '../../common/Badge';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { StudentDetailModal } from './StudentDetailModal';
import { StudentFormModal } from './StudentFormModal';
import { BulkStudentImportModal } from './BulkStudentImportModal';
import { EmptyState } from '../../common/EmptyState';
import { useAuth } from '../../../context/AuthContext';
import { useEffect, useState, useMemo } from 'react';

export function StudentsModule() {
  const { showToast } = useToast();
  const { canonicalRole, currentUser } = useAuth();
  const isSupervisor = canonicalRole === 'PRACTICE_SUPERVISOR';
  const supervisorId = currentUser?.supervisorId || (isSupervisor ? 'sup-1' : undefined);

  const [students, setStudents] = useState<Student[]>([]);
  
  useEffect(() => {
    studentService.getStudents().then(setStudents);
  }, []);
  const faculties = storageService.getFaculties();
  const directions = storageService.getDirections();
  const courses = storageService.getCourses();
  const groups = isSupervisor && supervisorId 
    ? storageService.getGroupsForSupervisor(supervisorId)
    : storageService.getGroups();
  const practices = storageService.getPractices();
  const places = storageService.getPracticePlaces();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('');
  const [filterDirection, setFilterDirection] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [filterPractice, setFilterPractice] = useState('');
  const [filterPlace, setFilterPlace] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modals
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const refreshList = async () => {
    const data = await studentService.getStudents();
    setStudents(data);
  };

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Search by name, studentId, or pinfl
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = student.fullName.toLowerCase().includes(q);
        const matchId = student.studentId.toLowerCase().includes(q);
        const matchPinfl = student.pinfl.includes(q);
        const matchPhone = student.phone.includes(q);
        if (!matchName && !matchId && !matchPinfl && !matchPhone) return false;
      }

      if (filterFaculty && student.facultyId !== filterFaculty) return false;
      if (filterDirection && student.directionId !== filterDirection) return false;
      if (filterCourse && student.courseId !== filterCourse) return false;
      if (filterGroup && student.groupId !== filterGroup) return false;
      if (filterStatus && student.status !== filterStatus) return false;
      if (filterPractice && student.currentPracticeId !== filterPractice) return false;
      if (filterPlace && student.currentPracticePlaceId !== filterPlace) return false;

      return true;
    });
  }, [
    students,
    searchQuery,
    filterFaculty,
    filterDirection,
    filterCourse,
    filterGroup,
    filterPractice,
    filterPlace,
    filterStatus
  ]);

  const handleSaveStudent = async (saved: Student) => {
    try {
      if (saved.id && saved.id !== 'new') {
        await studentService.updateStudent(saved.id, saved);
      } else {
        await studentService.createStudent(saved as Omit<Student, 'id'>);
      }
      refreshList();
      showToast('success', 'Muvaffaqiyatli saqlandi', `${saved.fullName} ro'yxatda yangilandi.`);
    } catch (e: any) {
      showToast('error', 'Xatolik', e.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    try {
      await studentService.softDeleteStudent(studentToDelete.id);
      refreshList();
      showToast('info', 'O\'chirildi', `${studentToDelete.fullName} ro'yxatdan olib tashlandi.`);
      setStudentToDelete(null);
    } catch (e: any) {
      showToast('error', 'Xatolik', e.message);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilterFaculty('');
    setFilterDirection('');
    setFilterCourse('');
    setFilterGroup('');
    setFilterPractice('');
    setFilterPlace('');
    setFilterStatus('');
  };

  const hasActiveFilters = Boolean(
    searchQuery || filterFaculty || filterDirection || filterCourse || 
    filterGroup || filterPractice || filterPlace || filterStatus
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
              ? `Sizga biriktirilgan guruhlar: ${groups.map(g => g.name).join(', ') || 'mavjud emas'} · Jami ${students.length} nafar talaba`
              : `Jami: ${students.length} nafar talaba · Filtrlangan: ${filteredStudents.length} nafar`}
          </p>
        </div>

        {!isSupervisor && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg shadow-2xs transition-colors"
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
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
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

      {/* Main Students Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredStudents.length === 0 ? (
          <EmptyState
            title="Talaba topilmadi"
            description="Kiritilgan parametrlar yoki qidiruv so'rovi bo'yicha talabalar ro'yxatda mavjud emas."
            actionLabel="Filtrlarni tozalash"
            onAction={resetFilters}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3 w-10 text-center">№</th>
                  <th className="py-3 px-4">Talaba (F.I.Sh.)</th>
                  <th className="py-3 px-4">AIDE Login / HEMIS ID</th>
                  <th className="py-3 px-4">Fakultet & Yo'nalish</th>
                  <th className="py-3 px-4">Kurs / Guruh</th>
                  <th className="py-3 px-4">Aloqa (Tel / TG)</th>
                  <th className="py-3 px-4">Status</th>
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

                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {student.fullName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors block">
                              {student.fullName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {student.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* AIDE Login & HEMIS ID */}
                      <td className="py-3 px-4 font-mono tabular-nums">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                            {student.login || student.studentCode || 'T00001'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          HEMIS: {student.hemisStudentId || student.studentId}
                        </div>
                      </td>

                      {/* Faculty & Direction */}
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium line-clamp-1">
                          {faculty?.name || 'Fakultet'}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          {direction?.name || 'Yo\'nalish'}
                        </div>
                      </td>

                      {/* Course & Group */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800">
                          {group?.name || 'Guruh'}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {course?.name} ({group?.language})
                        </span>
                      </td>

                      {/* Contacts */}
                      <td className="py-3 px-4 font-mono text-slate-700">
                        <div>{student.phone}</div>
                        <div className="text-[11px] text-blue-600 font-normal">
                          {student.telegram}
                        </div>
                      </td>

                      {/* Editable Status */}
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
                            <option value="suspended">Chetlashtirilgan (Nofaol)</option>
                          </select>
                        ) : (
                          <StatusBadge label={statusLabel} variant={statusVariant} />
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForDetail(student)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Amaliyot pasportini ko'rish"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setStudentToEdit(student);
                              setIsFormModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                            title="Tahrirlash"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentToDelete(student)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
    </div>
  );
}
