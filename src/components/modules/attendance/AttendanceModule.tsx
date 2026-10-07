import React, { useState, useMemo, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  QrCode,
  Search,
  Filter,
  Users,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Building2,
  UserCheck,
  RotateCcw,
  Sparkles,
  FlaskConical,
  Smartphone,
  FileEdit,
  Trash2,
  ChevronDown
} from 'lucide-react';
import {
  Attendance,
  AttendanceStatus,
  Student,
  Practice,
  PracticePlace,
  Group,
  Faculty,
  Direction,
  Supervisor,
  AttendanceSession
} from '../../../types';
import { attendanceService } from '../../../services/attendanceService';
import { storageService } from '../../../services/storageService';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';
import { StatusBadge } from '../../common/Badge';
import { Modal } from '../../common/Modal';

// Subcomponents
import { QrGeneratorModal } from './QrGeneratorModal';
import { QrScannerModal } from './QrScannerModal';
import { ManualAttendanceModal } from './ManualAttendanceModal';
import { AttendanceIssuesView } from './AttendanceIssuesView';
import { StudentAttendanceView } from './StudentAttendanceView';
import { SupervisorAttendanceView } from './SupervisorAttendanceView';
import { ClinicResponsibleAttendanceView } from './ClinicResponsibleAttendanceView';
import { AttendanceQAtesterModal } from './AttendanceQAtesterModal';

type AttendanceViewTab = 'overview' | 'issues' | 'sessions' | 'student_portal' | 'supervisor_portal' | 'clinic_portal';

export function AttendanceModule() {
  const { currentUser, role } = useAuth();
  const { showToast } = useToast();

  // Load database state
  const practices = storageService.getPractices();
  const students = storageService.getStudents();
  const places = storageService.getPracticePlaces();
  const groups = storageService.getGroups();
  const faculties = storageService.getFaculties();
  const directions = storageService.getDirections();
  const supervisors = storageService.getSupervisors();
  const departments = storageService.getPracticeDepartments();
  const assignments = storageService.getAssignments();

  // Active view tab
  const [activeTab, setActiveTab] = useState<AttendanceViewTab>(() => {
    const canonical = role?.toUpperCase();
    if (canonical === 'STUDENT') return 'student_portal';
    if (canonical === 'CLINIC_RESPONSIBLE') return 'clinic_portal';
    if (canonical === 'PRACTICE_SUPERVISOR') return 'supervisor_portal';
    return 'overview';
  });

  // Filter States (Section 1: Amaliyot, Sana, Fakultet, Yo'nalish, Kurs, Guruh, Amaliyot joyi, Bo'lim, Rahbar, Status)
  const [selectedPracticeId, setSelectedPracticeId] = useState<string>(practices[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-28');
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');
  const [selectedDirectionId, setSelectedDirectionId] = useState<string>('');
  const [selectedCourseLevel, setSelectedCourseLevel] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isQrGeneratorOpen, setIsQrGeneratorOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isQATesterOpen, setIsQATesterOpen] = useState(false);

  // Manual edit record selection
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | undefined>(undefined);

  // Attendance records state
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>(() => storageService.getAttendanceSessions());

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    const data = await attendanceService.getAllAttendance();
    setAttendanceRecords(data);
    setAttendanceSessions(storageService.getAttendanceSessions());
  };

  const isPresent = (st?: string) => st?.toUpperCase() === 'PRESENT';
  const isLate = (st?: string) => st?.toUpperCase() === 'LATE';
  const isAbsent = (st?: string) => st?.toUpperCase() === 'ABSENT';
  const isExcused = (st?: string) => st?.toUpperCase() === 'EXCUSED';

  // Current logged in student/clinic/supervisor resolution
  const currentStudent = (students && students.length > 0)
    ? (students.find(s => s.id === currentUser?.studentId || s.userId === currentUser?.uid) || students[0])
    : null;
  const currentPlaceId = currentUser?.practicePlaceId || 'place-1';
  const currentSupervisorId = currentUser?.supervisorId || 'sup-1';

  // Section 1: Calculate Live Top Counters
  // Jami talabalar, Bugun kelganlar, Kechikkanlar, Kelmaganlar, Uzrli kelmaganlar, Davomat foizi
  const dayRecords = (attendanceRecords || []).filter(a => 
    (!selectedPracticeId || a.practiceId === selectedPracticeId) && a.date === selectedDate
  );

  const presentCount = dayRecords.filter(a => isPresent(a.status)).length;
  const lateCount = dayRecords.filter(a => isLate(a.status)).length;
  const absentCount = dayRecords.filter(a => isAbsent(a.status)).length;
  const excusedCount = dayRecords.filter(a => isExcused(a.status)).length;

  // Selected practice students
  const activePractice = practices.find(p => p.id === selectedPracticeId);
  const totalPracticeStudents = (students || []).filter(s =>
    activePractice && Array.isArray(activePractice.groupIds) ? activePractice.groupIds.includes(s.groupId) : true
  ).length;

  const totalEvaluated = dayRecords.length;
  const attendanceRate = totalEvaluated > 0
    ? Math.round(((presentCount + lateCount + excusedCount) / totalEvaluated) * 100)
    : 100;

  // Filtered Student List for the Overview Table
  const filteredRows = useMemo(() => {
    return (students || []).filter(student => {
      if (!student) return false;

      // Practice group filter
      if (activePractice && Array.isArray(activePractice.groupIds) && !activePractice.groupIds.includes(student.groupId)) {
        return false;
      }

      // Faculty filter
      if (selectedFacultyId && student.facultyId !== selectedFacultyId) return false;

      // Direction filter
      if (selectedDirectionId && student.directionId !== selectedDirectionId) return false;

      // Group filter
      if (selectedGroupId && student.groupId !== selectedGroupId) return false;

      // Find assignment
      const asg = assignments.find(a => a.studentId === student.id && a.practiceId === selectedPracticeId);

      // Hospital / Place filter
      if (selectedPlaceId && (asg?.practicePlaceId !== selectedPlaceId && student.currentPracticePlaceId !== selectedPlaceId)) {
        return false;
      }

      // Department filter
      if (selectedDepartment && asg?.department !== selectedDepartment) return false;

      // Supervisor filter
      if (selectedSupervisorId && asg?.supervisorId !== selectedSupervisorId) return false;

      // Find record for this day
      const record = attendanceRecords.find(
        a => a.practiceId === selectedPracticeId && a.studentId === student.id && a.date === selectedDate
      );

      // Status filter
      if (selectedStatus) {
        if (!record && selectedStatus !== 'NONE') return false;
        if (record && record.status.toUpperCase() !== selectedStatus) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = student.fullName.toLowerCase().includes(q);
        const matchId = student.studentId.toLowerCase().includes(q);
        if (!matchName && !matchId) return false;
      }

      return true;
    }).map(student => {
      const group = groups.find(g => g.id === student.groupId);
      const asg = assignments.find(a => a.studentId === student.id && a.practiceId === selectedPracticeId);
      const place = places.find(p => p.id === (asg?.practicePlaceId || student.currentPracticePlaceId));
      const record = attendanceRecords.find(
        a => a.practiceId === selectedPracticeId && a.studentId === student.id && a.date === selectedDate
      );

      return {
        student,
        group,
        assignment: asg,
        place,
        record
      };
    });
  }, [
    students,
    activePractice,
    selectedPracticeId,
    selectedDate,
    selectedFacultyId,
    selectedDirectionId,
    selectedGroupId,
    selectedPlaceId,
    selectedDepartment,
    selectedSupervisorId,
    selectedStatus,
    searchQuery,
    attendanceRecords,
    assignments,
    places,
    groups
  ]);

  // Quick inline status change (PRESENT, LATE, ABSENT, EXCUSED)
  const handleInlineStatus = (studentId: string, status: AttendanceStatus) => {
    if (!currentUser) return;
    storageService.manualUpdateAttendance({
      studentId,
      practiceId: selectedPracticeId,
      date: selectedDate,
      status,
      checkInTime: (status === 'PRESENT' || status === 'present') ? '08:30' : (status === 'LATE' || status === 'late') ? '09:15' : undefined,
      checkOutTime: (status === 'PRESENT' || status === 'present') ? '14:30' : undefined,
      reason: `Tezkor holat belgilandi: ${status}`,
      actorUserId: currentUser.uid || currentUser.id,
      actorRole: currentUser.role,
      actorName: currentUser.fullName
    });
    refreshData();
    showToast('success', 'Davomat belgilandi', `Talaba holati: ${status}`);
  };

  const handleOpenEdit = (record: Attendance | null, studentId: string) => {
    setEditingAttendance(record);
    setEditingStudentId(studentId);
    setIsManualModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Main Navigation Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Elektron Davomat + QR Davomat Tizimi
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase font-mono tracking-wider">
              4-Bosqich Faol
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Klinik amaliyot bazalarida real-time QR davomat, geolokatsiya, kechikishlar va audit jurnali nazorati
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Section 24: QA Tester Button */}
          <button
            type="button"
            onClick={() => setIsQATesterOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors shadow-2xs"
          >
            <FlaskConical className="w-4 h-4 text-purple-600" />
            <span>10 ta QA Test</span>
          </button>

          {/* Student QR Scanner Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsQrScannerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs"
          >
            <Smartphone className="w-4 h-4" />
            <span>[ QR SKANERLASH ]</span>
          </button>

          {/* Clinical Responsible / Supervisor QR Generator Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsQrGeneratorOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs"
          >
            <QrCode className="w-4 h-4" />
            <span>QR DAVOMATNI BOSHLASH</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 overflow-x-auto text-xs font-semibold text-slate-600">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all shrink-0 ${
            activeTab === 'overview'
              ? 'bg-white text-slate-900 shadow-2xs font-bold'
              : 'hover:text-slate-900'
          }`}
        >
          <CalendarCheck className="w-4 h-4 text-blue-600" />
          <span>Umumiy davomat</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('issues')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all shrink-0 ${
            activeTab === 'issues'
              ? 'bg-white text-slate-900 shadow-2xs font-bold'
              : 'hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Davomat muammolari (🔴 🟠 🟡)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('student_portal')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all shrink-0 ${
            activeTab === 'student_portal'
              ? 'bg-white text-slate-900 shadow-2xs font-bold'
              : 'hover:text-slate-900'
          }`}
        >
          <Smartphone className="w-4 h-4 text-emerald-600" />
          <span>Talaba kabineti (Davomatim)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('supervisor_portal')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all shrink-0 ${
            activeTab === 'supervisor_portal'
              ? 'bg-white text-slate-900 shadow-2xs font-bold'
              : 'hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-teal-600" />
          <span>Rahbar kabineti</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('clinic_portal')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all shrink-0 ${
            activeTab === 'clinic_portal'
              ? 'bg-white text-slate-900 shadow-2xs font-bold'
              : 'hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4 text-indigo-600" />
          <span>Klinika mas'uli</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW (Section 1) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Section 1: 6 Live Counter Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-center shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Jami talabalar
              </span>
              <span className="text-xl font-black font-mono text-slate-900 mt-1 block">
                {totalPracticeStudents}
              </span>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-center shadow-2xs">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                Bugun kelganlar
              </span>
              <span className="text-xl font-black font-mono text-emerald-800 mt-1 block">
                {presentCount}
              </span>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-center shadow-2xs">
              <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
                Kechikkanlar
              </span>
              <span className="text-xl font-black font-mono text-amber-800 mt-1 block">
                {lateCount}
              </span>
            </div>

            <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 text-center shadow-2xs">
              <span className="text-[11px] font-semibold text-red-700 uppercase tracking-wider block">
                Kelmaganlar
              </span>
              <span className="text-xl font-black font-mono text-red-800 mt-1 block">
                {absentCount}
              </span>
            </div>

            <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 text-center shadow-2xs">
              <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider block">
                Uzrli kelmaganlar
              </span>
              <span className="text-xl font-black font-mono text-purple-800 mt-1 block">
                {excusedCount}
              </span>
            </div>

            <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 text-center shadow-2xs">
              <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
                Davomat foizi
              </span>
              <span className="text-xl font-black font-mono text-blue-800 mt-1 block">
                {attendanceRate}%
              </span>
            </div>
          </div>

          {/* Section 1: 10 Comprehensive Filters Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                <span>Qidiruv va Saralash Filtrlari (Section 1)</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedFacultyId('');
                  setSelectedDirectionId('');
                  setSelectedGroupId('');
                  setSelectedPlaceId('');
                  setSelectedDepartment('');
                  setSelectedSupervisorId('');
                  setSelectedStatus('');
                  setSearchQuery('');
                }}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
              >
                Filtrlarni tozalash
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {/* 1. Amaliyot */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">1. Amaliyot</label>
                <select
                  value={selectedPracticeId}
                  onChange={e => setSelectedPracticeId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-slate-50 font-medium"
                >
                  {practices.map(p => (
                    <option key={p.id} value={p.id}>{p.code}</option>
                  ))}
                </select>
              </div>

              {/* 2. Sana */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">2. Sana</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-slate-50 font-mono"
                />
              </div>

              {/* 3. Fakultet */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">3. Fakultet</label>
                <select
                  value={selectedFacultyId}
                  onChange={e => setSelectedFacultyId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-slate-50"
                >
                  <option value="">Barchasi</option>
                  {faculties.map(f => (
                    <option key={f.id} value={f.id}>{f.code}</option>
                  ))}
                </select>
              </div>

              {/* 4. Yo'nalish */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">4. Yo'nalish</label>
                <select
                  value={selectedDirectionId}
                  onChange={e => setSelectedDirectionId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-slate-50"
                >
                  <option value="">Barchasi</option>
                  {directions.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* 5. Kurs */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">5. Kurs</label>
                <select
                  value={selectedCourseLevel}
                  onChange={e => setSelectedCourseLevel(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-slate-50"
                >
                  <option value="">Barchasi</option>
                  <option value="3">3-kurs</option>
                  <option value="4">4-kurs</option>
                  <option value="5">5-kurs</option>
                  <option value="6">6-kurs</option>
                </select>
              </div>

              {/* 6. Guruh */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">6. Guruh</label>
                <select
                  value={selectedGroupId}
                  onChange={e => setSelectedGroupId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-slate-50"
                >
                  <option value="">Barchasi</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              {/* 7. Amaliyot joyi */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">7. Amaliyot joyi</label>
                <select
                  value={selectedPlaceId}
                  onChange={e => setSelectedPlaceId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-slate-50"
                >
                  <option value="">Barchasi</option>
                  {places.map(p => (
                    <option key={p.id} value={p.id}>{p.name.substring(0, 25)}...</option>
                  ))}
                </select>
              </div>

              {/* 8. Bo'lim */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">8. Bo'lim</label>
                <select
                  value={selectedDepartment}
                  onChange={e => setSelectedDepartment(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-slate-50"
                >
                  <option value="">Barchasi</option>
                  <option value="Terapiya">Terapiya</option>
                  <option value="Umumiy xirurgiya">Umumiy xirurgiya</option>
                  <option value="Kardiologiya">Kardiologiya</option>
                  <option value="Pediatriya">Pediatriya</option>
                  <option value="Shoshilinch terapiya">Shoshilinch terapiya</option>
                </select>
              </div>

              {/* 9. Rahbar */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">9. Rahbar</label>
                <select
                  value={selectedSupervisorId}
                  onChange={e => setSelectedSupervisorId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-slate-50"
                >
                  <option value="">Barchasi</option>
                  {supervisors.map(s => (
                    <option key={s.id} value={s.id}>{s.fullName.substring(0, 20)}...</option>
                  ))}
                </select>
              </div>

              {/* 10. Status */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">10. Status</label>
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-slate-50"
                >
                  <option value="">Barcha holatlar</option>
                  <option value="PRESENT">PRESENT (Kelgan)</option>
                  <option value="LATE">LATE (Kechikkan)</option>
                  <option value="ABSENT">ABSENT (Kelmagan)</option>
                  <option value="EXCUSED">EXCUSED (Uzrli)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 1: Main Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-3.5 border-b flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Talaba ismi yoki guvohnoma ID..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg bg-slate-50"
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-mono">
                  {filteredRows.length} nafar talaba
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(null, filteredRows[0]?.student.id || '')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-2xs"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>Qo'lda qo'shish</span>
                </button>
              </div>
            </div>

            {/* Exactly formatted Table according to Section 1:
                | Talaba | Guruh | Amaliyot joyi | Bo'lim | Kelish | Ketish | Status | */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b text-slate-600 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Talaba</th>
                    <th className="py-3 px-4">Guruh</th>
                    <th className="py-3 px-4">Amaliyot joyi</th>
                    <th className="py-3 px-4">Bo'lim</th>
                    <th className="py-3 px-4">Kelish</th>
                    <th className="py-3 px-4">Ketish</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRows.map(({ student, group, assignment, place, record }) => {
                    const st = record?.status?.toUpperCase();
                    return (
                      <tr key={student.id} className="hover:bg-slate-50">
                        {/* Talaba */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{student.fullName}</div>
                          <div className="font-mono text-[10px] text-slate-500">{student.studentId}</div>
                        </td>

                        {/* Guruh */}
                        <td className="py-3 px-4 font-mono font-medium text-slate-700">
                          {group?.name || '—'}
                        </td>

                        {/* Amaliyot joyi */}
                        <td className="py-3 px-4 text-slate-700">
                          <div className="truncate max-w-[200px]" title={place?.name}>
                            {place?.name || 'Biriktirilmagan'}
                          </div>
                        </td>

                        {/* Bo'lim */}
                        <td className="py-3 px-4 text-slate-700">
                          {assignment?.department || 'Terapiya'}
                        </td>

                        {/* Kelish */}
                        <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                          {record?.checkInTime || '—'}
                        </td>

                        {/* Ketish */}
                        <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                          {record?.checkOutTime || '—'}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          {record ? (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              st === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                              st === 'LATE' ? 'bg-amber-100 text-amber-800' :
                              st === 'EXCUSED' ? 'bg-purple-100 text-purple-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {st === 'PRESENT' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                              {st === 'LATE' && <Clock className="w-3 h-3 text-amber-600" />}
                              {st === 'ABSENT' && <XCircle className="w-3 h-3 text-red-600" />}
                              {st === 'PRESENT' ? 'Kelgan' : st === 'LATE' ? 'Kechikkan' : st === 'EXCUSED' ? 'Uzrli' : 'Kelmagan'}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Kiritilmagan</span>
                          )}
                        </td>

                        {/* Amallar */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Inline quick buttons */}
                            <button
                              type="button"
                              onClick={() => handleInlineStatus(student.id, 'PRESENT')}
                              className="px-2 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50 rounded border border-emerald-200"
                              title="Kelgan deb belgilash"
                            >
                              Keldi
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInlineStatus(student.id, 'ABSENT')}
                              className="px-2 py-1 text-[10px] font-bold text-red-700 hover:bg-red-50 rounded border border-red-200"
                              title="Kelmagan deb belgilash"
                            >
                              Kelmadi
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(record || null, student.id)}
                              className="px-2 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-100 rounded border"
                              title="Batafsil tahrirlash (Uzrli/Sabab bilan)"
                            >
                              Tahrirlash
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Tanlangan filtrlarga mos keluvchi davomat yozuvlari topilmadi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ISSUES (Section 15 & 16) */}
      {activeTab === 'issues' && (
        <AttendanceIssuesView
          students={students}
          practices={practices}
          places={places}
          groups={groups}
          attendance={attendanceRecords}
          onOpenManualModal={(stId, prId) => {
            setEditingStudentId(stId);
            setSelectedPracticeId(prId);
            setIsManualModalOpen(true);
          }}
        />
      )}

      {/* TAB 3: STUDENT PORTAL (Section 4, 12, 20) */}
      {activeTab === 'student_portal' && (
        <StudentAttendanceView
          student={currentStudent}
          onRefresh={refreshData}
        />
      )}

      {/* TAB 4: SUPERVISOR PORTAL (Section 13) */}
      {activeTab === 'supervisor_portal' && (
        <SupervisorAttendanceView
          supervisorId={currentSupervisorId}
          onOpenManualModal={(stId, prId) => {
            setEditingStudentId(stId);
            setSelectedPracticeId(prId);
            setIsManualModalOpen(true);
          }}
          onRefresh={refreshData}
        />
      )}

      {/* TAB 5: CLINIC PORTAL (Section 14) */}
      {activeTab === 'clinic_portal' && (
        <ClinicResponsibleAttendanceView
          practicePlaceId={currentPlaceId}
          onStartQr={() => setIsQrGeneratorOpen(true)}
          onOpenManualModal={(stId, prId) => {
            setEditingStudentId(stId);
            setSelectedPracticeId(prId);
            setIsManualModalOpen(true);
          }}
          onRefresh={refreshData}
        />
      )}

      {/* Modals */}
      <QrGeneratorModal
        isOpen={isQrGeneratorOpen}
        onClose={() => {
          setIsQrGeneratorOpen(false);
          refreshData();
        }}
        practices={practices}
        places={places}
        departments={departments}
        initialPracticeId={selectedPracticeId}
        initialPlaceId={selectedPlaceId || places[0]?.id}
        onSessionCreated={() => refreshData()}
      />

      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => {
          setIsQrScannerOpen(false);
          refreshData();
        }}
        studentId={currentStudent?.id || ''}
        onSuccess={() => refreshData()}
      />

      <ManualAttendanceModal
        isOpen={isManualModalOpen}
        onClose={() => {
          setIsManualModalOpen(false);
          setEditingAttendance(null);
          setEditingStudentId(undefined);
        }}
        attendanceRecord={editingAttendance}
        practiceId={selectedPracticeId}
        studentId={editingStudentId}
        date={selectedDate}
        students={students}
        practices={practices}
        onSaved={refreshData}
      />

      <AttendanceQAtesterModal
        isOpen={isQATesterOpen}
        onClose={() => {
          setIsQATesterOpen(false);
          refreshData();
        }}
        onTestsComplete={refreshData}
      />
    </div>
  );
}
