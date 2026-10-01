import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Search,
  MessageSquare,
  FileCheck,
  Building2,
  Calendar,
  UserCheck,
  AlertTriangle,
  Printer,
  Eye,
  Filter,
  Users,
  Award,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Download,
  Stethoscope,
  HeartPulse,
  CheckCircle2
} from 'lucide-react';
import { DailyJournal, Student, Practice, PracticePlace, Supervisor, Faculty, Direction, Group, Course, PracticeAssignment } from '../../../types';
import { dailyJournalService } from '../../../services/dailyJournalService';
import { storageService } from '../../../services/storageService';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { StatusBadge } from '../../common/Badge';
import { DailyJournalFormModal } from './DailyJournalFormModal';
import { DailyJournalDetailModal } from './DailyJournalDetailModal';
import { DailyJournalReviewModal } from './DailyJournalReviewModal';
import { DailyJournalPrintView } from './DailyJournalPrintView';

export function DailyJournalModule() {
  const { showToast } = useToast();
  const { currentUser, role, canonicalRole } = useAuth();
  const [journals, setJournals] = useState<DailyJournal[]>([]);
  
  useEffect(() => {
      refreshJournals();
  }, []);
  const students = storageService.getStudents();
  const practices = storageService.getPractices();
  const practicePlaces = storageService.getPracticePlaces();
  const supervisors = storageService.getSupervisors();
  const faculties = storageService.getFaculties();
  const directions = storageService.getDirections();
  const courses = storageService.getCourses();
  const groups = storageService.getGroups();
  const assignments = storageService.getPracticeAssignments();
  const allAttendance = storageService.getAttendance();

  // Role detection
  const isStudent = canonicalRole === 'STUDENT' || role === 'student';
  const isSupervisorOrStaff = canonicalRole === 'PRACTICE_SUPERVISOR' || canonicalRole === 'CLINIC_RESPONSIBLE' || canonicalRole === 'PRACTICE_HEAD' || canonicalRole === 'SUPER_ADMIN' || canonicalRole === 'PRACTICE_STAFF' || canonicalRole === 'FACULTY_DEAN';

  // Active view tab (allow switching to view student perspective if supervisor/admin)
  const [viewTab, setViewTab] = useState<'student_cabinet' | 'all_journals'>(
    isStudent ? 'student_cabinet' : 'all_journals'
  );

  // Filters for management view
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPractice, setFilterPractice] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('all');
  const [filterDirection, setFilterDirection] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterPlace, setFilterPlace] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterSupervisor, setFilterSupervisor] = useState('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modals state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [journalToEdit, setJournalToEdit] = useState<DailyJournal | null>(null);
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<DailyJournal | null>(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [journalToReview, setJournalToReview] = useState<DailyJournal | null>(null);

  const [isPrintViewOpen, setIsPrintViewOpen] = useState(false);
  const [journalToPrint, setJournalToPrint] = useState<DailyJournal | null>(null);

  const refreshJournals = async () => {
    const data = await dailyJournalService.getAllJournals(); // Need to add this to service
    setJournals(data);
  };

  // Determine current student profile for Student Cabinet view
  const currentStudent = useMemo(() => {
    return students.find(s => s.userId === currentUser?.uid || s.id === currentUser?.studentId) || students[0];
  }, [students, currentUser]);

  const currentAssignment = useMemo(() => {
    return assignments.find((a: PracticeAssignment) => a.studentId === currentStudent?.id) || assignments[0];
  }, [assignments, currentStudent]);

  const currentPractice = useMemo(() => {
    return practices.find(p => p.id === currentAssignment?.practiceId) || practices[0];
  }, [practices, currentAssignment]);

  const currentPlace = useMemo(() => {
    return practicePlaces.find(p => p.id === currentAssignment?.practicePlaceId) || practicePlaces[0];
  }, [practicePlaces, currentAssignment]);

  const currentSupervisor = useMemo(() => {
    return supervisors.find(s => s.id === currentAssignment?.supervisorId) || supervisors[0];
  }, [supervisors, currentAssignment]);

  // Student's own attendance and attendance rate
  const studentAttendanceList = useMemo(() => {
    if (!currentStudent || !currentPractice) return [];
    return allAttendance.filter(a => a.studentId === currentStudent.id && a.practiceId === currentPractice.id);
  }, [allAttendance, currentStudent, currentPractice]);

  const studentAttendanceRate = useMemo(() => {
    if (studentAttendanceList.length === 0) return 95;
    const presentCount = studentAttendanceList.filter(a => a.status.toUpperCase() === 'PRESENT' || a.status.toUpperCase() === 'LATE').length;
    return Math.round((presentCount / studentAttendanceList.length) * 100);
  }, [studentAttendanceList]);

  // Today's attendance record for current student
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = useMemo(() => {
    return studentAttendanceList.find(a => a.date === todayStr);
  }, [studentAttendanceList, todayStr]);

  // Student's journals
  const studentJournals = useMemo(() => {
    return journals.filter(j => j.studentId === currentStudent?.id);
  }, [journals, currentStudent]);

  const todayJournal = useMemo(() => {
    return studentJournals.find(j => j.date === todayStr);
  }, [studentJournals, todayStr]);

  const revisionNeededJournal = useMemo(() => {
    return studentJournals.find(j => j.status.toUpperCase() === 'REVISION' || j.status.toUpperCase() === 'REJECTED');
  }, [studentJournals]);

  // Calculate Statistics (Section 1)
  const stats = useMemo(() => {
    const totalStudents = students.length;
    // Unique students who submitted at least one journal
    const studentsWithJournal = new Set(journals.map(j => j.studentId)).size;
    const studentsWithoutJournal = Math.max(0, totalStudents - studentsWithJournal);

    const pendingCount = journals.filter(j => j.status.toUpperCase() === 'PENDING').length;
    const approvedCount = journals.filter(j => j.status.toUpperCase() === 'APPROVED').length;
    const revisionCount = journals.filter(j => j.status.toUpperCase() === 'REVISION' || j.status.toUpperCase() === 'REJECTED').length;

    return {
      totalStudents,
      studentsWithJournal,
      studentsWithoutJournal,
      pendingCount,
      approvedCount,
      revisionCount
    };
  }, [students, journals]);

  // Filtered journals for the management view
  const filteredJournals = useMemo(() => {
    return journals.filter(journal => {
      // Status filter
      if (filterStatus !== 'all' && journal.status.toUpperCase() !== filterStatus.toUpperCase()) {
        return false;
      }

      // Practice filter
      if (filterPractice !== 'all' && journal.practiceId !== filterPractice) {
        return false;
      }

      // Date filter
      if (filterDate && journal.date !== filterDate) {
        return false;
      }

      // Clinic place filter
      if (filterPlace !== 'all' && journal.practicePlaceId !== filterPlace) {
        return false;
      }

      // Bo'lim filter
      if (filterDepartment !== 'all' && journal.department !== filterDepartment) {
        return false;
      }

      // Supervisor filter
      if (filterSupervisor !== 'all' && journal.supervisorId !== filterSupervisor) {
        return false;
      }

      // Student and Academic filters
      const student = students.find(s => s.id === journal.studentId);
      if (filterFaculty !== 'all' && student?.facultyId !== filterFaculty) {
        return false;
      }
      if (filterDirection !== 'all' && student?.directionId !== filterDirection) {
        return false;
      }
      if (filterCourse !== 'all' && student?.courseId !== filterCourse) {
        return false;
      }
      if (filterGroup !== 'all' && student?.groupId !== filterGroup) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const studentName = student?.fullName.toLowerCase() || '';
        const dept = journal.department.toLowerCase();
        const summary = (journal.workSummary || '').toLowerCase();
        const diagnoses = (journal.patientDiagnosesSummary || '').toLowerCase();
        const cases = (journal.clinicalCasesSummary || '').toLowerCase();
        const procedures = (journal.proceduresDone || []).join(' ').toLowerCase();

        if (
          !studentName.includes(q) &&
          !dept.includes(q) &&
          !summary.includes(q) &&
          !diagnoses.includes(q) &&
          !cases.includes(q) &&
          !procedures.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    journals,
    filterStatus,
    filterPractice,
    filterDate,
    filterPlace,
    filterDepartment,
    filterSupervisor,
    filterFaculty,
    filterDirection,
    filterCourse,
    filterGroup,
    searchQuery,
    students
  ]);

  // Helper to open detail modal
  const handleOpenDetail = (journal: DailyJournal) => {
    setSelectedJournal(journal);
    setIsDetailModalOpen(true);
  };

  // Helper to open review modal
  const handleOpenReview = (journal: DailyJournal) => {
    setJournalToReview(journal);
    setIsReviewModalOpen(true);
  };

  // Helper to open print view
  const handleOpenPrint = (journal: DailyJournal) => {
    setJournalToPrint(journal);
    setIsPrintViewOpen(true);
  };

  // Helper to open edit modal (for revision)
  const handleOpenEdit = (journal: DailyJournal) => {
    setJournalToEdit(journal);
    setIsSubmitModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Elektron amaliyot kundaligi
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kunlik bajarilgan ishlar, ko'rilgan bemorlar, muolajalar tahlili va rahbar bahosi
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Switch tabs between Student view & All journals view */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewTab('student_cabinet')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewTab === 'student_cabinet'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mening kundaligim (Talaba)
            </button>
            <button
              type="button"
              onClick={() => setViewTab('all_journals')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewTab === 'all_journals'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Barcha kundaliklar (Tekshiruv)
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setJournalToEdit(null);
              setIsSubmitModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Kundalik to'ldirish</span>
          </button>
        </div>
      </div>

      {/* 1. MANAGEMENT / ALL JOURNALS OVERVIEW (Section 1) */}
      {viewTab === 'all_journals' && (
        <div className="space-y-5">
          {/* Statistics Grid (Section 1) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Jami talabalar */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500 block">Jami talabalar</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-black text-slate-900">{stats.totalStudents}</span>
                <span className="text-[10px] text-slate-400 font-medium">amaliyotchi</span>
              </div>
            </div>

            {/* Kundalik to'ldirganlar */}
            <div className="p-3.5 bg-white border border-emerald-200 rounded-xl shadow-2xs bg-emerald-50/20">
              <span className="text-[11px] font-medium text-emerald-800 block">To'ldirganlar</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-black text-emerald-700">{stats.studentsWithJournal}</span>
                <span className="text-[10px] font-bold text-emerald-600">
                  {Math.round((stats.studentsWithJournal / (stats.totalStudents || 1)) * 100)}%
                </span>
              </div>
            </div>

            {/* Kundalik to'ldirmaganlar */}
            <div className="p-3.5 bg-white border border-rose-200 rounded-xl shadow-2xs bg-rose-50/20">
              <span className="text-[11px] font-medium text-rose-800 block">To'ldirmaganlar</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-black text-rose-700">{stats.studentsWithoutJournal}</span>
                <span className="text-[10px] font-bold text-rose-600">qarzdor</span>
              </div>
            </div>

            {/* Tekshiruvda (Pending) */}
            <div className="p-3.5 bg-white border border-blue-200 rounded-xl shadow-2xs bg-blue-50/20">
              <span className="text-[11px] font-medium text-blue-800 block">Tekshiruvda</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-black text-blue-700">{stats.pendingCount}</span>
                <span className="text-[10px] font-bold text-blue-600">kutilmoqda</span>
              </div>
            </div>

            {/* Tasdiqlangan (Approved) */}
            <div className="p-3.5 bg-white border border-teal-200 rounded-xl shadow-2xs bg-teal-50/20">
              <span className="text-[11px] font-medium text-teal-800 block">Tasdiqlangan</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-black text-teal-700">{stats.approvedCount}</span>
                <span className="text-[10px] font-bold text-teal-600">baholandi</span>
              </div>
            </div>

            {/* Qayta ishlashga yuborilgan */}
            <div className="p-3.5 bg-white border border-amber-200 rounded-xl shadow-2xs bg-amber-50/20">
              <span className="text-[11px] font-medium text-amber-800 block">Qayta ishlashda</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-black text-amber-700">{stats.revisionCount}</span>
                <span className="text-[10px] font-bold text-amber-600">qaytarildi</span>
              </div>
            </div>
          </div>

          {/* Filters Bar (Section 1) */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Filtrlar va qidiruv
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilterPractice('all');
                  setFilterDate('');
                  setFilterFaculty('all');
                  setFilterDirection('all');
                  setFilterCourse('all');
                  setFilterGroup('all');
                  setFilterPlace('all');
                  setFilterDepartment('all');
                  setFilterSupervisor('all');
                  setFilterStatus('all');
                }}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium"
              >
                Filtrlarni tozalash
              </button>
            </div>

            {/* Search Input & Status Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Talaba F.I.Sh., bo'lim, tashxis yoki muolaja nomi bo'yicha qidirish..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-lg">
                {[
                  { id: 'all', label: 'Barchasi' },
                  { id: 'PENDING', label: 'Tekshiruvda' },
                  { id: 'APPROVED', label: 'Tasdiqlangan' },
                  { id: 'REVISION', label: 'Qayta ishlash' }
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => setFilterStatus(s.id)}
                    className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-md transition-all ${
                      filterStatus === s.id
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dropdown Filters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1 text-xs">
              {/* Amaliyot */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Amaliyot</label>
                <select
                  value={filterPractice}
                  onChange={e => setFilterPractice(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700"
                >
                  <option value="all">Barcha amaliyotlar</option>
                  {practices.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Sana */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sana</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700"
                />
              </div>

              {/* Fakultet */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Fakultet</label>
                <select
                  value={filterFaculty}
                  onChange={e => setFilterFaculty(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700"
                >
                  <option value="all">Barcha fakultetlar</option>
                  {faculties.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              {/* Guruh */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Guruh</label>
                <select
                  value={filterGroup}
                  onChange={e => setFilterGroup(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700"
                >
                  <option value="all">Barcha guruhlar</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              {/* Amaliyot joyi / Klinika */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Amaliyot joyi</label>
                <select
                  value={filterPlace}
                  onChange={e => setFilterPlace(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700"
                >
                  <option value="all">Barcha klinikalar</option>
                  {practicePlaces.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Bo'lim */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Bo'lim</label>
                <select
                  value={filterDepartment}
                  onChange={e => setFilterDepartment(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700"
                >
                  <option value="all">Barcha bo'limlar</option>
                  <option value="Terapiya">Terapiya</option>
                  <option value="Kardiologiya">Kardiologiya</option>
                  <option value="Umumiy xirurgiya">Umumiy xirurgiya</option>
                  <option value="Pediatriya">Pediatriya</option>
                  <option value="Shoshilinch terapiya">Shoshilinch terapiya</option>
                </select>
              </div>

              {/* Rahbar */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Rahbar</label>
                <select
                  value={filterSupervisor}
                  onChange={e => setFilterSupervisor(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700"
                >
                  <option value="all">Barcha rahbarlar</option>
                  {supervisors.map(s => (
                    <option key={s.id} value={s.id}>{s.fullName}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Journals Table (Section 1) */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Topilgan kundaliklar soni: {filteredJournals.length} ta
              </span>
              <button
                type="button"
                onClick={() => {
                  showToast('info', 'Eksport qilindi', 'Kundaliklar ro\'yxati tayyorlandi.');
                }}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Excel / Hisobot</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Talaba</th>
                    <th className="p-3">Guruh & Fakultet</th>
                    <th className="p-3">Klinika & Bo'lim</th>
                    <th className="p-3">Sana & Davomat</th>
                    <th className="p-3">Bemorlar & Muolajalar</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Baho</th>
                    <th className="p-3 text-right">Harakatlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredJournals.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                        Filtr shartlariga mos keladigan kundalik yozuvlari topilmadi.
                      </td>
                    </tr>
                  ) : (
                    filteredJournals.map(journal => {
                      const student = students.find(s => s.id === journal.studentId);
                      const group = groups.find(g => g.id === student?.groupId);
                      const faculty = faculties.find(f => f.id === student?.facultyId);
                      const place = practicePlaces.find(p => p.id === journal.practicePlaceId);
                      const sup = supervisors.find(s => s.id === journal.supervisorId);

                      const statusUpper = journal.status.toUpperCase();
                      const isApproved = statusUpper === 'APPROVED';
                      const isRevision = statusUpper === 'REVISION' || statusUpper === 'REJECTED';
                      const isPending = statusUpper === 'PENDING';

                      return (
                        <tr key={journal.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{student?.fullName || 'Noma\'lum talaba'}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{student?.studentId}</span>
                          </td>

                          <td className="p-3 text-slate-700">
                            <span className="font-semibold block">{group?.name || 'Guruh —'}</span>
                            <span className="text-[11px] text-slate-400 truncate max-w-[140px] block">{faculty?.name}</span>
                          </td>

                          <td className="p-3 text-slate-700">
                            <span className="font-semibold block truncate max-w-[160px]">{place?.name || journal.attendanceSnapshot?.practicePlaceName}</span>
                            <span className="text-[11px] text-blue-700 font-medium block">{journal.department}</span>
                          </td>

                          <td className="p-3">
                            <span className="font-mono font-bold text-slate-800 block">{journal.date}</span>
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                              {journal.attendanceSnapshot?.status || 'PRESENT'} ({journal.attendanceSnapshot?.checkInTime || '08:15'})
                            </span>
                          </td>

                          <td className="p-3 text-slate-700">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-indigo-700">{journal.patientsExaminedCount} bemor</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-600">{journal.procedures?.length || journal.proceduresDone?.length || 0} muolaja</span>
                            </div>
                            <span className="text-[11px] text-slate-400 truncate max-w-[180px] block mt-0.5">
                              {journal.clinicalCasesSummary || journal.patientDiagnosesSummary || 'Klinik amaliyot'}
                            </span>
                          </td>

                          <td className="p-3 text-center">
                            <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-md ${
                              isApproved
                                ? 'bg-emerald-100 text-emerald-800'
                                : isRevision
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {isApproved ? 'Tasdiqlangan' : isRevision ? 'Qayta ishlash' : 'Tekshiruvda'}
                            </span>
                          </td>

                          <td className="p-3 text-center">
                            {isApproved && journal.supervisorRating ? (
                              <div className="inline-flex items-center gap-0.5 font-black text-amber-500 text-xs">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                <span>{journal.supervisorRating}</span>
                              </div>
                            ) : (
                              <span className="text-slate-300 font-mono">—</span>
                            )}
                          </td>

                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenDetail(journal)}
                                className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Batafsil ko'rish"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenPrint(journal)}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Chop etish / PDF"
                              >
                                <Printer className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenReview(journal)}
                                className="px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs"
                                title="Baholash"
                              >
                                {isApproved ? 'Bahoni ko\'rish' : 'Tekshirish'}
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
        </div>
      )}

      {/* 2. STUDENT CABINET VIEW (Section 2) */}
      {viewTab === 'student_cabinet' && (
        <div className="space-y-6">
          {/* Active Practice Card (Section 2 talabi) */}
          <div className="p-6 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-blue-200">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Amaldagi amaliyot kartasi</span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {currentPractice?.name}
                  </h3>
                  <p className="text-xs text-blue-200 mt-1">
                    Buyruq: {currentPractice?.orderNumber} ({currentPractice?.academicYear})
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
                  <div>
                    <span className="text-blue-300 block text-[11px]">Amaliyot joyi:</span>
                    <strong className="text-white font-bold block truncate max-w-[170px]">{currentPlace?.name}</strong>
                  </div>
                  <div>
                    <span className="text-blue-300 block text-[11px]">Bo'lim:</span>
                    <strong className="text-white font-bold block">{currentAssignment?.department || 'Terapiya'}</strong>
                  </div>
                  <div>
                    <span className="text-blue-300 block text-[11px]">Rahbar:</span>
                    <strong className="text-white font-bold block truncate max-w-[170px]">{currentSupervisor?.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-blue-300 block text-[11px]">Muddat:</span>
                    <strong className="text-white font-bold block font-mono">
                      {currentAssignment?.startDate || '01.09.2026'} — {currentAssignment?.endDate || '15.10.2026'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Attendance Rate Circle & Action */}
              <div className="flex flex-col items-center sm:items-end justify-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-white/15 md:pl-6">
                <div className="text-center sm:text-right">
                  <span className="text-xs text-blue-200 block font-medium">Davomat ko'rsatkichi:</span>
                  <div className="text-3xl font-black text-white tracking-tight flex items-baseline justify-center sm:justify-end gap-1">
                    <span>{studentAttendanceRate}%</span>
                    <span className="text-xs font-semibold text-emerald-400">A'lo</span>
                  </div>
                  <span className="text-[11px] text-blue-300">
                    {studentAttendanceList.filter(a => a.status.toUpperCase() === 'PRESENT').length} kun kelgan / {studentAttendanceList.length} jami
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setJournalToEdit(null);
                    setIsSubmitModalOpen(true);
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg font-bold text-xs transition-all hover:scale-102"
                >
                  <Plus className="w-4 h-4" />
                  <span>Kundalikni to'ldirish</span>
                </button>
              </div>
            </div>
          </div>

          {/* Alerts: Today's Status & Revisions */}
          {revisionNeededJournal && (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-200 text-amber-800 rounded-xl shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                    Diqqat! {revisionNeededJournal.date} kungi kundaligingiz qayta ishlashga yuborilgan
                  </h4>
                  <p className="text-xs text-amber-900 mt-0.5">
                    <strong>Rahbar izohi:</strong> "{revisionNeededJournal.revisionReason || revisionNeededJournal.supervisorFeedback || 'Kamchiliklarni to\'g\'rilab qayta topshiring'}"
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenEdit(revisionNeededJournal)}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition-colors shrink-0 shadow-xs"
              >
                Tahrirlash va qayta topshirish
              </button>
            </div>
          )}

          {/* Today's Daily Check-in Alert */}
          {todayAttendance ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-900">
                    Bugungi davomat tasdiqlangan: {todayAttendance.status} ({todayAttendance.checkInTime} da kelindi)
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    {todayJournal
                      ? 'Bugungi kunlik amaliyot kundaligi topshirilgan va ko\'rib chiqilmoqda.'
                      : 'Bugun bajargan ishlaringiz va muolajalaringizni elektron kundalikka kiritishingiz mumkin.'}
                  </p>
                </div>
              </div>

              {!todayJournal && (
                <button
                  type="button"
                  onClick={() => {
                    setJournalToEdit(null);
                    setIsSubmitModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors shrink-0"
                >
                  Bugungi kundalikni to'ldirish
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 text-xs text-slate-600">
              <Clock className="w-5 h-5 text-slate-400 shrink-0" />
              <div>
                <p className="font-bold text-slate-800">Bugungi kun uchun davomat hali o'tilmagan</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Kundalikni faqat shu kuni QR orqali kelganingiz tasdiqlangandan keyin to'ldirishingiz mumkin.
                </p>
              </div>
            </div>
          )}

          {/* Student's Journals History Cards & Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Mening kundaliklarim tarixi ({studentJournals.length} ta yozuv)</span>
              </h3>
            </div>

            {studentJournals.length === 0 ? (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-400 space-y-3">
                <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
                <p className="font-medium text-xs">Sizda hali topshirilgan amaliyot kundaliklari mavjud emas.</p>
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                >
                  Birinchi kundalikni to'ldirish
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentJournals.map(j => {
                  const statusUpper = j.status.toUpperCase();
                  const isApproved = statusUpper === 'APPROVED';
                  const isRevision = statusUpper === 'REVISION' || statusUpper === 'REJECTED';
                  const isPending = statusUpper === 'PENDING';

                  return (
                    <div
                      key={j.id}
                      className={`p-5 rounded-2xl border transition-all hover:shadow-md ${
                        isApproved
                          ? 'bg-white border-slate-200 hover:border-emerald-300'
                          : isRevision
                          ? 'bg-amber-50/40 border-amber-300 hover:border-amber-400'
                          : 'bg-white border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-slate-900">{j.date}</span>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                              isApproved
                                ? 'bg-emerald-100 text-emerald-800'
                                : isRevision
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {isApproved ? 'Tasdiqlangan' : isRevision ? 'Qayta ishlash' : 'Tekshiruvda'}
                            </span>
                            {j.version && j.version > 1 && (
                              <span className="text-[10px] text-slate-400 font-mono">v{j.version}</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 font-medium">
                            {j.department} • {j.attendanceSnapshot?.practicePlaceName || currentPlace?.name}
                          </p>
                        </div>

                        {/* Stars if approved */}
                        {isApproved && j.supervisorRating && (
                          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-black text-amber-900">{j.supervisorRating}/5</span>
                          </div>
                        )}
                      </div>

                      {/* Summary */}
                      <p className="text-xs text-slate-700 mt-3 line-clamp-2 leading-relaxed">
                        {j.workSummary}
                      </p>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                        <div>
                          <span>Bemorlar: </span>
                          <strong className="text-slate-800">{j.patientsExaminedCount} nafar</strong>
                        </div>
                        <div>
                          <span>Muolajalar: </span>
                          <strong className="text-slate-800">{j.procedures?.length || j.proceduresDone?.length || 0} ta</strong>
                        </div>
                      </div>

                      {/* Feedback or revision warning */}
                      {j.supervisorFeedback && (
                        <div className="mt-3 p-2.5 bg-slate-50 rounded-xl text-xs text-slate-700 italic border border-slate-200">
                          <strong className="not-italic text-slate-900">Rahbar:</strong> "{j.supervisorFeedback}"
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleOpenPrint(j)}
                          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-medium"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Chop etish</span>
                        </button>

                        <div className="flex items-center gap-2">
                          {isRevision && (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(j)}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-2xs"
                            >
                              Tahrirlash
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenDetail(j)}
                            className="px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded-lg"
                          >
                            Batafsil
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: Form Modal for Filling / Editing Journal */}
      <DailyJournalFormModal
        isOpen={isSubmitModalOpen}
        onClose={() => {
          setIsSubmitModalOpen(false);
          setJournalToEdit(null);
        }}
        onSuccess={() => {
          refreshJournals();
        }}
        initialJournal={journalToEdit}
      />

      {/* MODAL 2: Detail Modal */}
      <DailyJournalDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedJournal(null);
        }}
        journal={selectedJournal}
        student={students.find(s => s.id === selectedJournal?.studentId)}
        practice={practices.find(p => p.id === selectedJournal?.practiceId)}
        practicePlace={practicePlaces.find(p => p.id === selectedJournal?.practicePlaceId)}
        supervisor={supervisors.find(s => s.id === selectedJournal?.supervisorId)}
        onEdit={(j) => {
          setIsDetailModalOpen(false);
          handleOpenEdit(j);
        }}
        onReview={(j) => {
          setIsDetailModalOpen(false);
          handleOpenReview(j);
        }}
        onPrint={(j) => {
          setIsDetailModalOpen(false);
          handleOpenPrint(j);
        }}
        canReview={isSupervisorOrStaff}
        canEdit={true}
      />

      {/* MODAL 3: Supervisor Review Modal */}
      <DailyJournalReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setJournalToReview(null);
        }}
        onSuccess={() => {
          refreshJournals();
        }}
        journal={journalToReview}
        student={students.find(s => s.id === journalToReview?.studentId)}
      />

      {/* MODAL 4: Printable View */}
      {isPrintViewOpen && journalToPrint && (
        <DailyJournalPrintView
          journal={journalToPrint}
          student={students.find(s => s.id === journalToPrint.studentId)}
          practice={practices.find(p => p.id === journalToPrint.practiceId)}
          practicePlace={practicePlaces.find(p => p.id === journalToPrint.practicePlaceId)}
          supervisor={supervisors.find(s => s.id === journalToPrint.supervisorId)}
          faculty={faculties.find(f => f.id === students.find(s => s.id === journalToPrint.studentId)?.facultyId)}
          group={groups.find(g => g.id === students.find(s => s.id === journalToPrint.studentId)?.groupId)}
          onClose={() => {
            setIsPrintViewOpen(false);
            setJournalToPrint(null);
          }}
        />
      )}
    </div>
  );
}
