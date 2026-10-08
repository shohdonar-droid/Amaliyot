import React from 'react';
import {
  Users,
  Building2,
  CalendarRange,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Award,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Stethoscope,
  ChevronRight,
  Filter,
  FileCheck,
  Sparkles,
  Phone,
  Mail,
  QrCode,
  MapPin,
  CheckCircle2,
  Calendar,
  Split,
  BarChart3,
  Bell,
  PlusCircle,
  FileSpreadsheet,
  AlertCircle,
  ShieldCheck,
  GraduationCap,
  Activity,
  HeartPulse,
  Layers
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { storageService } from '../../../services/storageService';
import { ActiveModule } from '../../layout/Sidebar';

interface DashboardModuleProps {
  onNavigate: (module: ActiveModule) => void;
}

export function DashboardModule({ onNavigate }: DashboardModuleProps) {
  const { role, canonicalRole, currentUser } = useAuth();

  const userRoleStr = (currentUser?.role || role || '').toUpperCase();
  const isStudent = canonicalRole === 'STUDENT' || userRoleStr === 'STUDENT' || userRoleStr === 'TALABA';
  const isSupervisor = canonicalRole === 'PRACTICE_SUPERVISOR' || userRoleStr === 'PRACTICE_SUPERVISOR' || userRoleStr === 'SUPERVISOR';
  const isClinic = canonicalRole === 'CLINIC_RESPONSIBLE' || userRoleStr === 'CLINIC_RESPONSIBLE' || userRoleStr === 'CLINIC';
  const isDean = canonicalRole === 'FACULTY_DEAN' || userRoleStr === 'FACULTY_DEAN' || userRoleStr === 'DEAN';
  const isStaff = canonicalRole === 'PRACTICE_STAFF' || userRoleStr === 'PRACTICE_STAFF' || userRoleStr === 'DEPT_STAFF';
  const isHead = canonicalRole === 'PRACTICE_HEAD' || userRoleStr === 'PRACTICE_HEAD' || userRoleStr === 'DEPT_HEAD';
  const isSuperAdmin = canonicalRole === 'SUPER_ADMIN' || userRoleStr === 'SUPER_ADMIN' || !role;

  // Master data from storageService
  const students = storageService.getStudents() || [];
  const practices = storageService.getPractices() || [];
  const [places, setPlaces] = React.useState(() => storageService.getPracticePlaces() || []);

  React.useEffect(() => {
    const handleSync = () => {
      setPlaces(storageService.getPracticePlaces() || []);
    };
    window.addEventListener('tma_state_changed', handleSync);
    return () => window.removeEventListener('tma_state_changed', handleSync);
  }, []);
  const supervisors = storageService.getSupervisors() || [];
  const assignments = storageService.getAssignments() || [];
  const attendance = storageService.getAttendance() || [];
  const journals = storageService.getDailyJournals() || [];
  const assessments = storageService.getAssessments() || [];
  const groups = storageService.getGroups() || [];
  const faculties = storageService.getFaculties() || [];
  const directions = storageService.getDirections() || [];
  const courses = storageService.getCourses() || [];
  const auditLogs = storageService.getAuditLogs() || [];
  const notifications = storageService.getNotifications() || [];
  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  const todayDate = '2026-09-28';

  // Common helpers
  const todayAttendance = attendance.filter(a => a?.date === todayDate);
  const isPresent = (st?: string) => st?.toUpperCase() === 'PRESENT';
  const isLate = (st?: string) => st?.toUpperCase() === 'LATE';
  const isAbsent = (st?: string) => st?.toUpperCase() === 'ABSENT';

  const presentToday = todayAttendance.filter(a => isPresent(a.status)).length;
  const lateToday = todayAttendance.filter(a => isLate(a.status)).length;
  const absentToday = todayAttendance.filter(a => isAbsent(a.status)).length;

  const todayAttendanceRate = todayAttendance.length > 0
    ? Math.round(((presentToday + lateToday) / todayAttendance.length) * 100)
    : 96;

  const pendingJournalsCount = journals.filter(j => {
    const s = (j?.status || '').toUpperCase();
    return s.includes('PEND') || s === 'SUBMITTED';
  }).length;

  const problematicStudents = students.filter(s => {
    const sAtt = attendance.filter(a => a?.studentId === s.id);
    const hasAbsent = sAtt.some(a => isAbsent(a.status));
    const isSuspended = s.status === 'suspended' || s.status === 'dismissed';
    return hasAbsent || isSuspended;
  });

  // =========================================================================
  // 9. TALABA — AMALIYOTIM (STUDENT)
  // =========================================================================
  if (isStudent) {
    const myStudent = students.find(s => s?.userId === currentUser?.uid || s?.id === currentUser?.studentId || s?.login === currentUser?.login) || students[0];
    const myAssignment = myStudent ? assignments.find(a => a?.studentId === myStudent.id) : null;
    const myPractice = myAssignment ? practices.find(p => p?.id === myAssignment.practiceId) : practices[0];
    const myClinicPlace = myAssignment ? places.find(p => p?.id === myAssignment.practicePlaceId) : places[0];
    const mySupervisor = myAssignment ? supervisors.find(s => s?.id === myAssignment.supervisorId) : supervisors[0];

    const myFaculty = faculties.find(f => f.id === myStudent?.facultyId);
    const myDirection = directions.find(d => d.id === myStudent?.directionId);
    const myGroup = groups.find(g => g.id === myStudent?.groupId);
    const myCourse = courses.find(c => c.id === myStudent?.courseId);

    const myAttendance = attendance.filter(a => a?.studentId === myStudent?.id);
    const todayAttRecord = myAttendance.find(a => a?.date === todayDate);
    const todayJournalRecord = journals.find(j => j?.studentId === myStudent?.id && j?.date === todayDate);

    const mySkillsCount = storageService.getSkillLogs({ studentId: myStudent?.id, status: 'APPROVED' }).length;

    return (
      <div className="space-y-5 max-w-lg mx-auto sm:max-w-4xl">
        {/* Header: Talaba rasmi, "Assalomu alaykum, [F.I.SH]", Guruh, Kurs, Yo‘nalish */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
              {(myStudent?.fullName || currentUser?.fullName || 'T').charAt(0).toUpperCase()}
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
              ✓
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
              Talaba profili
            </span>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 truncate">
              Assalomu alaykum, {myStudent?.fullName || currentUser?.fullName || 'Talaba'}!
            </h1>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-1 font-medium">
              <span className="text-slate-800 font-semibold">{myGroup?.name || '401-A'}</span>
              <span>•</span>
              <span>{myCourse?.name || '4-kurs'}</span>
              <span>•</span>
              <span className="truncate">{myDirection?.name || 'Davolash ishi'}</span>
            </div>
          </div>
        </div>

        {/* Katta status card: 🟢 AMALIYOTDA */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-blue-900/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              🟢 AMALIYOTDA
            </span>

            <span className="text-xs font-mono text-blue-200/90 font-semibold">
              {myPractice?.academicYear || '2025-2026'}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold text-white mb-4">
            {myPractice?.name || 'Klinik amaliyot'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white/5 p-4 rounded-2xl border border-white/10">
            <div>
              <p className="text-[10px] text-blue-300 uppercase font-bold">Tashkilot (Klinik baza)</p>
              <p className="font-semibold text-white mt-0.5">{myClinicPlace?.name || 'Toshkent shahar 1-son klinik shifoxonasi'}</p>
            </div>
            <div>
              <p className="text-[10px] text-blue-300 uppercase font-bold">Amaliyot rahbari</p>
              <p className="font-semibold text-white mt-0.5">{mySupervisor?.fullName || 'Prof. Sobirov Alisher Tolipovich'}</p>
            </div>
            <div>
              <p className="text-[10px] text-blue-300 uppercase font-bold">Bo‘lim</p>
              <p className="font-semibold text-white mt-0.5">{myAssignment?.department || 'Terapiya va kardiologiya'}</p>
            </div>
            <div>
              <p className="text-[10px] text-blue-300 uppercase font-bold">Amaliyot muddati va vaqti</p>
              <p className="font-semibold text-white mt-0.5 font-mono">
                {myPractice?.startDate || '05.10.2026'} — {myPractice?.endDate || '30.10.2026'} · Du–Ju (08:00 — 14:00)
              </p>
            </div>
          </div>
        </div>

        {/* 4 ta katta quick action: DAVOMAT, KUNDALIK, KO‘NIKMALAR, NATIJALAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => onNavigate('attendance')}
            className="p-4 rounded-2xl bg-blue-50/80 hover:bg-blue-100/90 active:scale-95 border border-blue-200/80 text-left transition-all cursor-pointer group shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <p className="text-xs font-black text-blue-950 uppercase tracking-wider">
              📍 DAVOMAT
            </p>
            <p className="text-[11px] text-blue-700/90 mt-0.5 font-medium truncate">
              {todayAttRecord ? 'Bugun kelingan' : 'QR / GPS belgilash'}
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('daily_journal')}
            className="p-4 rounded-2xl bg-indigo-50/80 hover:bg-indigo-100/90 active:scale-95 border border-indigo-200/80 text-left transition-all cursor-pointer group shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <p className="text-xs font-black text-indigo-950 uppercase tracking-wider">
              📖 KUNDALIK
            </p>
            <p className="text-[11px] text-indigo-700/90 mt-0.5 font-medium truncate">
              {todayJournalRecord ? 'Topshirilgan' : 'Topshirish kerak'}
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('skills')}
            className="p-4 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100/90 active:scale-95 border border-emerald-200/80 text-left transition-all cursor-pointer group shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5" />
            </div>
            <p className="text-xs font-black text-emerald-950 uppercase tracking-wider">
              🩺 KO‘NIKMALAR
            </p>
            <p className="text-[11px] text-emerald-700/90 mt-0.5 font-medium truncate">
              {mySkillsCount} ta qayd tasdiqlandi
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('assessments')}
            className="p-4 rounded-2xl bg-purple-50/80 hover:bg-purple-100/90 active:scale-95 border border-purple-200/80 text-left transition-all cursor-pointer group shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <p className="text-xs font-black text-purple-950 uppercase tracking-wider">
              📊 NATIJALAR
            </p>
            <p className="text-[11px] text-purple-700/90 mt-0.5 font-medium truncate">
              Oraliq va yakuniy ballar
            </p>
          </button>
        </div>

        {/* BUGUNGI HOLAT: Davomat, Kundalik, Ko‘nikmalar */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">
              BUGUNGI HOLAT ({todayDate})
            </h3>
            <span className="text-[11px] font-bold text-slate-500">
              Jonli nazorat
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Davomat */}
            <div
              onClick={() => onNavigate('attendance')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                todayAttRecord
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/80 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>Davomat</span>
                <span className={`w-2 h-2 rounded-full ${todayAttRecord ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              </div>
              <p className="font-extrabold text-sm mt-1">
                {todayAttRecord ? '🟢 Kelgan' : '🟡 Belgilanmagan'}
              </p>
              <p className="text-[11px] opacity-80 mt-0.5">
                {todayAttRecord?.checkInTime ? `Vaqti: ${todayAttRecord.checkInTime}` : 'QR yoki GPS orqali tasdiqlang →'}
              </p>
            </div>

            {/* Kundalik */}
            <div
              onClick={() => onNavigate('daily_journal')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                todayJournalRecord
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/80 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>Kundalik</span>
                <span className={`w-2 h-2 rounded-full ${todayJournalRecord ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              </div>
              <p className="font-extrabold text-sm mt-1">
                {todayJournalRecord ? '🟢 Topshirilgan' : '🟡 Kutilmoqda'}
              </p>
              <p className="text-[11px] opacity-80 mt-0.5">
                {todayJournalRecord ? `Status: ${todayJournalRecord.status}` : 'Bugungi muolajalarni kiriting →'}
              </p>
            </div>

            {/* Ko'nikmalar */}
            <div
              onClick={() => onNavigate('skills')}
              className="p-3.5 rounded-2xl border border-purple-200 bg-purple-50/80 text-purple-900 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between font-bold">
                <span>Ko‘nikmalar</span>
                <span className="w-2 h-2 rounded-full bg-purple-500" />
              </div>
              <p className="font-extrabold text-sm mt-1">
                🩺 {mySkillsCount} ta amaliyot
              </p>
              <p className="text-[11px] opacity-80 mt-0.5">
                Klinik manipulyatsiyalar pasporti →
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 7. KAFEDRA AMALIYOT RAHBARI (PRACTICE_SUPERVISOR)
  // =========================================================================
  if (isSupervisor) {
    const supervisorId = currentUser?.supervisorId || 'sup-1';
    const mySupervisorStudents = storageService.getStudentsForSupervisor(supervisorId) || [];
    const myGroups = storageService.getGroupsForSupervisor(supervisorId) || groups.slice(0, 2);
    const supervisorPendingJournals = journals.filter(j =>
      (j?.status || '').toUpperCase() === 'PENDING' &&
      (j?.supervisorId === supervisorId || mySupervisorStudents.some(s => s.id === j?.studentId))
    );
    const supAttendance = attendance.filter(a => mySupervisorStudents.some(s => s.id === a.studentId) && a.date === todayDate);
    const supPresent = supAttendance.filter(a => isPresent(a.status) || isLate(a.status)).length;
    const supAttRate = supAttendance.length > 0 ? Math.round((supPresent / supAttendance.length) * 100) : 100;

    return (
      <div className="space-y-5 max-w-lg mx-auto sm:max-w-5xl">
        {/* Header: Kafedra amaliyot rahbari */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider block">
              Universitet kafedrasi
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Kafedra amaliyot rahbari
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Rahbar: <strong className="text-slate-800">{currentUser?.fullName || 'Kafedra dotsenti'}</strong> · Biriktirilgan talabalar: {mySupervisorStudents.length} nafar
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Dashboard: Mening guruhlarim, Mening talabalarim, Bugungi davomat, Tekshirilishi kerak bo‘lgan kundaliklar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            onClick={() => onNavigate('academic')}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs cursor-pointer hover:border-slate-300 transition-colors"
          >
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Mening guruhlarim</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">{myGroups.length} ta</span>
            <span className="text-[11px] text-teal-600 font-medium">Faol guruhlar</span>
          </div>

          <div
            onClick={() => onNavigate('students')}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs cursor-pointer hover:border-slate-300 transition-colors"
          >
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Mening talabalarim</span>
            <span className="text-2xl font-black text-blue-600 mt-1 block font-mono">{mySupervisorStudents.length} nafar</span>
            <span className="text-[11px] text-slate-400 font-medium">Ro‘yxat bo‘yicha</span>
          </div>

          <div
            onClick={() => onNavigate('attendance')}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs cursor-pointer hover:border-slate-300 transition-colors"
          >
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Bugungi davomat</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block font-mono">{supAttRate}%</span>
            <span className="text-[11px] text-emerald-700 font-medium">{supPresent} nafar ishtirok</span>
          </div>

          <div
            onClick={() => onNavigate('daily_journal')}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs cursor-pointer hover:border-slate-300 transition-colors"
          >
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Kutilayotgan kundalik</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block font-mono">{supervisorPendingJournals.length} ta</span>
            <span className="text-[11px] text-amber-700 font-medium">Tekshirish kerak</span>
          </div>
        </div>

        {/* Katta card: BUGUNGI NAZORAT (Davomat, Kundalik, Ko‘nikmalar) */}
        <div className="bg-gradient-to-br from-slate-900 to-teal-950 rounded-3xl p-6 text-white shadow-xl border border-teal-900/60">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-teal-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              BUGUNGI NAZORAT
            </h2>
            <span className="text-xs font-mono text-teal-200 font-semibold">{todayDate}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div
              onClick={() => onNavigate('attendance')}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 transition-colors cursor-pointer border border-white/10"
            >
              <span className="text-[10px] text-teal-300 font-bold uppercase block">Davomat</span>
              <p className="text-lg font-black text-white mt-1">{supAttRate}% keldi</p>
              <p className="text-[11px] text-slate-300 mt-0.5">Kelgan: {supPresent} / {mySupervisorStudents.length}</p>
            </div>

            <div
              onClick={() => onNavigate('daily_journal')}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 transition-colors cursor-pointer border border-white/10"
            >
              <span className="text-[10px] text-teal-300 font-bold uppercase block">Kundalik</span>
              <p className="text-lg font-black text-amber-300 mt-1">{supervisorPendingJournals.length} ta kutilmoqda</p>
              <p className="text-[11px] text-slate-300 mt-0.5">Tekshirib tasdiqlash uchun bosing →</p>
            </div>

            <div
              onClick={() => onNavigate('skills')}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 transition-colors cursor-pointer border border-white/10"
            >
              <span className="text-[10px] text-teal-300 font-bold uppercase block">Ko‘nikmalar</span>
              <p className="text-lg font-black text-white mt-1">Amaliy ko‘nikmalar</p>
              <p className="text-[11px] text-slate-300 mt-0.5">Manipulyatsiya va logbooklar →</p>
            </div>
          </div>
        </div>

        {/* Quick actions: Talabalar, Davomat, Kundalik, Ko‘nikmalar, Hisobot */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Tezkor amallar
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <button
              onClick={() => onNavigate('students')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 font-bold text-xs text-slate-800 text-center transition-colors cursor-pointer border border-slate-200"
            >
              👥 Talabalar
            </button>
            <button
              onClick={() => onNavigate('attendance')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 font-bold text-xs text-slate-800 text-center transition-colors cursor-pointer border border-slate-200"
            >
              📍 Davomat
            </button>
            <button
              onClick={() => onNavigate('daily_journal')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 font-bold text-xs text-slate-800 text-center transition-colors cursor-pointer border border-slate-200"
            >
              📖 Kundalik
            </button>
            <button
              onClick={() => onNavigate('skills')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 font-bold text-xs text-slate-800 text-center transition-colors cursor-pointer border border-slate-200"
            >
              🩺 Ko‘nikmalar
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 font-bold text-xs text-slate-800 text-center transition-colors cursor-pointer border border-slate-200 col-span-2 sm:col-span-1"
            >
              📊 Hisobot
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 8. KLINIKA / SHIFOXONA MAS'ULI (CLINIC_RESPONSIBLE)
  // =========================================================================
  if (isClinic) {
    const myPlaceId = currentUser?.practicePlaceId || 'place-1';
    const myPlace = places.find(p => p.id === myPlaceId) || places[0];
    const clinicStudents = students.filter(s => s.currentPracticePlaceId === myPlaceId || assignments.some(a => a.studentId === s.id && a.practicePlaceId === myPlaceId));
    const clinicTodayAtt = attendance.filter(a => a.date === todayDate && (a.practicePlaceId === myPlaceId || clinicStudents.some(s => s.id === a.studentId)));
    const clinicPresent = clinicTodayAtt.filter(a => isPresent(a.status) || isLate(a.status)).length;

    const clinicDepartments = [
      { name: 'Jarrohlik (Xirurgiya)', count: Math.ceil(clinicStudents.length * 0.28) },
      { name: 'Terapiya', count: Math.ceil(clinicStudents.length * 0.32) },
      { name: 'Pediatriya', count: Math.ceil(clinicStudents.length * 0.18) },
      { name: 'Qabul bo‘limi', count: Math.ceil(clinicStudents.length * 0.12) },
      { name: 'Reanimatsiya', count: Math.max(1, Math.floor(clinicStudents.length * 0.1)) }
    ];

    return (
      <div className="space-y-5 max-w-lg mx-auto sm:max-w-5xl">
        {/* Dashboard: Tashkilot nomi, Tashkilot ID, Manzil, Mas'ul shaxs */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
                Klinik baza nazorati
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {myPlace?.name || 'Klinik shifoxona'}
              </h1>
            </div>
            <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 font-mono text-xs font-bold border border-amber-200 self-start sm:self-auto">
              ID: {myPlace?.id || 'KB-01'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 text-xs">
            <p className="text-slate-600">
              📍 <strong>Manzil:</strong> {myPlace?.address || myPlace?.city || 'Toshkent shahri'}
            </p>
            <p className="text-slate-600">
              👤 <strong>Mas'ul shaxs:</strong> {myPlace?.contactPerson || currentUser?.fullName || 'Mas\'ul shifokor'}
            </p>
          </div>
        </div>

        {/* Keyin: Talabalar, Faol amaliyotlar, Bugungi davomat */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div
            onClick={() => onNavigate('students')}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs cursor-pointer hover:border-slate-300"
          >
            <span className="text-xs font-bold text-slate-500 uppercase block">Talabalar</span>
            <span className="text-3xl font-black text-blue-600 mt-1 block font-mono">{clinicStudents.length} nafar</span>
            <span className="text-[11px] text-slate-500">Shifoxona kontingenti</span>
          </div>

          <div
            onClick={() => onNavigate('practices')}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs cursor-pointer hover:border-slate-300"
          >
            <span className="text-xs font-bold text-slate-500 uppercase block">Faol amaliyotlar</span>
            <span className="text-3xl font-black text-purple-600 mt-1 block font-mono">{practices.filter(p => p.status === 'active').length} ta</span>
            <span className="text-[11px] text-slate-500">Davom etayotgan sikllar</span>
          </div>

          <div
            onClick={() => onNavigate('attendance')}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs cursor-pointer hover:border-slate-300"
          >
            <span className="text-xs font-bold text-slate-500 uppercase block">Bugungi davomat</span>
            <span className="text-3xl font-black text-emerald-600 mt-1 block font-mono">{clinicPresent} nafar</span>
            <span className="text-[11px] text-emerald-700">QR skanerlagan talabalar</span>
          </div>
        </div>

        {/* Ichki bo‘limlar cardlari: Jarrohlik, Terapiya, Pediatriya, Qabul, Reanimatsiya */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Ichki bo‘limlar va talabalar taqsimoti
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Har bir klinik bo‘limdagi faol talabalar soni
              </p>
            </div>
            <button
              onClick={() => onNavigate('allocation')}
              className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 cursor-pointer shadow-xs"
            >
              Taqsimotga o‘tish
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {clinicDepartments.map((dept) => (
              <div
                key={dept.name}
                onClick={() => onNavigate('allocation')}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-center"
              >
                <span className="text-[11px] font-bold text-slate-600 block truncate" title={dept.name}>
                  {dept.name}
                </span>
                <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
                  {dept.count}
                </span>
                <span className="text-[10px] text-blue-600 font-semibold block mt-0.5">
                  talaba biriktirilgan
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 6. FAKULTET / DEKAN (FACULTY_DEAN)
  // =========================================================================
  if (isDean) {
    const deanFaculty = faculties[0];
    const deanStudents = students.filter(s => !deanFaculty || s.facultyId === deanFaculty.id);
    const deanInPractice = deanStudents.filter(s => s.status === 'in_practice');
    const deanGroups = groups.filter(g => deanStudents.some(s => s.groupId === g.id));
    const deanAtt = attendance.filter(a => a.date === todayDate && deanStudents.some(s => s.id === a.studentId));
    const deanPresent = deanAtt.filter(a => isPresent(a.status) || isLate(a.status)).length;
    const deanAttRate = deanAtt.length > 0 ? Math.round((deanPresent / deanAtt.length) * 100) : 95;

    const kafedralar = [
      { name: 'Davolash ishi', count: Math.ceil(deanStudents.length * 0.45), practices: 2, att: 96 },
      { name: 'Pediatriya', count: Math.ceil(deanStudents.length * 0.25), practices: 1, att: 94 },
      { name: 'Stomatologiya', count: Math.ceil(deanStudents.length * 0.20), practices: 1, att: 97 },
      { name: 'Farmatsiya', count: Math.max(1, Math.floor(deanStudents.length * 0.10)), practices: 1, att: 92 }
    ];

    return (
      <div className="space-y-5 max-w-lg mx-auto sm:max-w-5xl">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
            Fakultet dekanati
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
            {deanFaculty?.name || '1-son Davolash fakulteti'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dekan: <strong className="text-slate-800">{deanFaculty?.deanName || currentUser?.fullName || 'Dekan'}</strong>
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Jami talabalar</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">{deanStudents.length}</span>
            <span className="text-[11px] text-slate-400">Fakultetda</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Amaliyotda</span>
            <span className="text-2xl font-black text-blue-600 mt-1 block font-mono">{deanInPractice.length}</span>
            <span className="text-[11px] text-blue-700">Klinik bazalarda</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Faol guruhlar</span>
            <span className="text-2xl font-black text-purple-600 mt-1 block font-mono">{deanGroups.length}</span>
            <span className="text-[11px] text-slate-400">Akademik guruh</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Bugungi davomat</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block font-mono">{deanAttRate}%</span>
            <span className="text-[11px] text-emerald-700">Qatnashish darajasi</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3.5">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
            Kafedralar va Yo‘nalishlar ro‘yxati
          </h3>
          <div className="space-y-2.5">
            {kafedralar.map(kaf => (
              <div key={kaf.name} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{kaf.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Talabalar: <strong>{kaf.count} nafar</strong> · Faol amaliyotlar: <strong>{kaf.practices} ta</strong>
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs font-extrabold text-emerald-700">{kaf.att}%</span>
                  <span className="text-[10px] text-slate-400 block">davomat</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 5. AMALIYOT BO‘LIMI XODIMI (PRACTICE_STAFF)
  // =========================================================================
  if (isStaff) {
    const tasks = [
      { label: 'Amaliyotlar', count: practices.length, mod: 'practices' as ActiveModule, color: 'text-blue-600' },
      { label: 'Taqsimotlar', count: assignments.length, mod: 'allocation' as ActiveModule, color: 'text-indigo-600' },
      { label: 'Talabalar', count: students.length, mod: 'students' as ActiveModule, color: 'text-purple-600' },
      { label: 'Amaliyot bazalari', count: places.length, mod: 'practice_places' as ActiveModule, color: 'text-teal-600' },
      { label: 'Davomat', count: todayAttendance.length, mod: 'attendance' as ActiveModule, color: 'text-emerald-600' },
      { label: 'Hisobotlar', count: storageService.getVedomosts().length || 4, mod: 'reports' as ActiveModule, color: 'text-slate-700' }
    ];

    return (
      <div className="space-y-5 max-w-lg mx-auto sm:max-w-5xl">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
            Amaliyot bo‘limi xodimi
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
            Bugungi vazifalar
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kundalik amaliyot jarayonlarini muvofiqlashtirish va monitoring qilish paneli.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {tasks.map(t => (
            <button
              key={t.label}
              onClick={() => onNavigate(t.mod)}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-2xs text-left transition-all cursor-pointer"
            >
              <span className="text-xs font-bold text-slate-500 uppercase block">{t.label}</span>
              <span className={`text-3xl font-black ${t.color} mt-1 block font-mono`}>{t.count}</span>
              <span className="text-[11px] text-blue-600 font-semibold block mt-1">Ko‘rish →</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. AMALIYOT BO‘LIMI BOSHLIG‘I (PRACTICE_HEAD)
  // =========================================================================
  if (isHead) {
    const actionCards = [
      { label: 'Amaliyotlar', mod: 'practices' as ActiveModule, icon: CalendarRange, color: 'bg-blue-600' },
      { label: 'Amaliyot taqsimoti', mod: 'allocation' as ActiveModule, icon: Split, color: 'bg-indigo-600' },
      { label: 'Talabalar', mod: 'students' as ActiveModule, icon: Users, color: 'bg-cyan-600' },
      { label: 'Amaliyot bazalari', mod: 'practice_places' as ActiveModule, icon: Building2, color: 'bg-emerald-600' },
      { label: 'Rahbarlar', mod: 'supervisors' as ActiveModule, icon: UserCheck, color: 'bg-teal-600' },
      { label: 'Davomat', mod: 'attendance' as ActiveModule, icon: QrCode, color: 'bg-green-600' },
      { label: 'Kundaliklar', mod: 'daily_journal' as ActiveModule, icon: BookOpen, color: 'bg-amber-600' },
      { label: 'Ko‘nikmalar', mod: 'skills' as ActiveModule, icon: Stethoscope, color: 'bg-purple-600' },
      { label: 'Attestatsiya', mod: 'assessments' as ActiveModule, icon: Award, color: 'bg-rose-600' },
      { label: 'Hisobotlar', mod: 'reports' as ActiveModule, icon: BarChart3, color: 'bg-slate-700' }
    ];

    return (
      <div className="space-y-5 max-w-lg mx-auto sm:max-w-6xl">
        {/* Dashboard Title */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
              Boshqaruv markazi
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Amaliyot nazorat markazi
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {storageService.getUniversityName()} barcha amaliyot yo‘nalishlari yagona monitoringi
            </p>
          </div>
          <span className="px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200 self-start sm:self-auto font-mono">
            {todayDate}
          </span>
        </div>

        {/* Statistic Cards: Jami talabalar, Faol amaliyotlar, Bugungi davomat, Muammoli talabalar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div onClick={() => onNavigate('students')} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs cursor-pointer">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Jami talabalar</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">{students.length}</span>
            <span className="text-[11px] text-blue-600 font-semibold">Baza bo‘yicha</span>
          </div>

          <div onClick={() => onNavigate('practices')} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs cursor-pointer">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Faol amaliyotlar</span>
            <span className="text-2xl font-black text-blue-600 mt-1 block font-mono">{practices.filter(p => p.status === 'active').length}</span>
            <span className="text-[11px] text-slate-500">Davom etmoqda</span>
          </div>

          <div onClick={() => onNavigate('attendance')} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs cursor-pointer">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Bugungi davomat</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block font-mono">{todayAttendanceRate}%</span>
            <span className="text-[11px] text-emerald-700">{presentToday} nafar keldi</span>
          </div>

          <div onClick={() => onNavigate('attendance')} className="p-4 rounded-2xl bg-rose-50 border border-rose-200 shadow-2xs cursor-pointer">
            <span className="text-[11px] font-bold text-rose-700 uppercase block">Muammoli talabalar</span>
            <span className="text-2xl font-black text-rose-700 mt-1 block font-mono">{problematicStudents.length}</span>
            <span className="text-[11px] text-rose-600 font-semibold">Nazoratda</span>
          </div>
        </div>

        {/* Muammoli talabalar alohida qizil/warning cardda */}
        {problematicStudents.length > 0 && (
          <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-rose-900 uppercase flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Muammoli va nazoratdagi talabalar ({problematicStudents.length} nafar)
              </h3>
              <button
                onClick={() => onNavigate('students')}
                className="text-xs font-bold text-rose-700 hover:text-rose-900 cursor-pointer"
              >
                Barchasini ko‘rish →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {problematicStudents.slice(0, 3).map(st => (
                <div key={st.id} className="p-3 bg-white rounded-xl border border-rose-200 text-xs">
                  <p className="font-bold text-slate-900 truncate">{st.fullName}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{st.login} · {st.phone}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    Sababsiz kelmagan yoki chetlashtirilgan
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Katta action cards: 10 ta asosiy bo‘lim */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Amaliyot boshqaruv modullari
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {actionCards.map(c => {
              const Icon = c.icon;
              return (
                <button
                  key={c.label}
                  onClick={() => onNavigate(c.mod)}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 active:scale-95 transition-all text-left group cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-xl ${c.color} text-white flex items-center justify-center mb-2.5 shadow-xs group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-900 truncate">{c.label}</p>
                  <span className="text-[10px] text-slate-400 block mt-0.5">O‘tish →</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. SUPER ADMIN DASHBOARD
  // =========================================================================
  return (
    <div className="space-y-5 max-w-lg mx-auto sm:max-w-6xl">
      {/* Header: Profil rasmi, Super Admin, Notification icon */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md shrink-0">
            {(currentUser?.fullName || 'S').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">
              Super Admin
            </span>
            {/* Salomlashuv: "Assalomu alaykum" */}
            <h1 className="text-lg sm:text-xl font-black text-slate-900 truncate">
              Assalomu alaykum, {currentUser?.fullName ? currentUser.fullName.split(' ')[0] : 'Admin'}!
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('notifications')}
          className="relative p-2.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer shrink-0"
          title="Bildirishnomalar"
        >
          <Bell className="w-5 h-5" />
          {unreadNotifCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
              {unreadNotifCount}
            </span>
          )}
        </button>
      </div>

      {/* Statistic cards: Jami talabalar, Faol amaliyotlar, Tashkilotlar, Rahbarlar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => onNavigate('students')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs cursor-pointer hover:border-slate-300 transition-colors"
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Jami talabalar</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">{students.length}</span>
          <span className="text-[11px] text-blue-600 font-semibold">Barcha kurslar</span>
        </div>

        <div
          onClick={() => onNavigate('practices')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs cursor-pointer hover:border-slate-300 transition-colors"
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Faol amaliyotlar</span>
          <span className="text-2xl font-black text-purple-600 mt-1 block font-mono">{practices.filter(p => p.status === 'active').length}</span>
          <span className="text-[11px] text-purple-700 font-semibold">Rektorat buyrug‘i</span>
        </div>

        <div
          onClick={() => onNavigate('practice_places')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs cursor-pointer hover:border-slate-300 transition-colors"
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Amaliyot bazalari</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block font-mono">{places.length}</span>
          <span className="text-[11px] text-emerald-700 font-semibold">Klinik bazalar</span>
        </div>

        <div
          onClick={() => onNavigate('supervisors')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs cursor-pointer hover:border-slate-300 transition-colors"
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Rahbarlar</span>
          <span className="text-2xl font-black text-teal-600 mt-1 block font-mono">{supervisors.length}</span>
          <span className="text-[11px] text-teal-700 font-semibold">Kafedra & Mentorlar</span>
        </div>
      </div>

      {/* BUGUNGI HOLAT: Davomat, Kundalik, Muammoli talabalar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
            BUGUNGI HOLAT ({todayDate})
          </h2>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Jonli sinxron
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            onClick={() => onNavigate('attendance')}
            className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 cursor-pointer text-left"
          >
            <span className="text-[11px] font-bold text-emerald-800 uppercase block">Davomat</span>
            <span className="text-2xl font-black text-emerald-950 mt-1 block font-mono">{todayAttendanceRate}%</span>
            <p className="text-[11px] text-emerald-800/80 mt-0.5">
              Kelgan: {presentToday} · Kechikkan: {lateToday}
            </p>
          </div>

          <div
            onClick={() => onNavigate('daily_journal')}
            className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 cursor-pointer text-left"
          >
            <span className="text-[11px] font-bold text-amber-800 uppercase block">Kundalik</span>
            <span className="text-2xl font-black text-amber-950 mt-1 block font-mono">{pendingJournalsCount} ta</span>
            <p className="text-[11px] text-amber-800/80 mt-0.5">
              Tekshirish kutilmoqda
            </p>
          </div>

          <div
            onClick={() => onNavigate('students')}
            className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 cursor-pointer text-left"
          >
            <span className="text-[11px] font-bold text-rose-800 uppercase block">Muammoli talabalar</span>
            <span className="text-2xl font-black text-rose-950 mt-1 block font-mono">{problematicStudents.length} nafar</span>
            <p className="text-[11px] text-rose-800/80 mt-0.5">
              Sababsiz qoldirgan yoki intizomiy nazorat
            </p>
          </div>
        </div>
      </div>

      {/* TEZKOR AMALLAR: Talabalar, Amaliyot yaratish, Taqsimot, Tashkilotlar, Hisobotlar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
          TEZKOR AMALLAR
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            onClick={() => onNavigate('students')}
            className="p-3.5 rounded-2xl bg-blue-50/70 hover:bg-blue-100 border border-blue-200 text-left cursor-pointer transition-colors"
          >
            <Users className="w-5 h-5 text-blue-600 mb-2" />
            <span className="text-xs font-bold text-slate-900 block">Talabalar</span>
            <span className="text-[10px] text-blue-700">Ro‘yxat va amallar</span>
          </button>

          <button
            onClick={() => onNavigate('practices')}
            className="p-3.5 rounded-2xl bg-purple-50/70 hover:bg-purple-100 border border-purple-200 text-left cursor-pointer transition-colors"
          >
            <CalendarRange className="w-5 h-5 text-purple-600 mb-2" />
            <span className="text-xs font-bold text-slate-900 block">Amaliyot yaratish</span>
            <span className="text-[10px] text-purple-700">Yangi o‘quv rejasi</span>
          </button>

          <button
            onClick={() => onNavigate('allocation')}
            className="p-3.5 rounded-2xl bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200 text-left cursor-pointer transition-colors"
          >
            <Split className="w-5 h-5 text-indigo-600 mb-2" />
            <span className="text-xs font-bold text-slate-900 block">Taqsimot</span>
            <span className="text-[10px] text-indigo-700">Shifoxonalarga</span>
          </button>

          <button
            onClick={() => onNavigate('practice_places')}
            className="p-3.5 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-200 text-left cursor-pointer transition-colors"
          >
            <Building2 className="w-5 h-5 text-emerald-600 mb-2" />
            <span className="text-xs font-bold text-slate-900 block">Amaliyot bazalari</span>
            <span className="text-[10px] text-emerald-700">Klinik bazalar</span>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-left cursor-pointer transition-colors col-span-2 sm:col-span-1"
          >
            <BarChart3 className="w-5 h-5 text-slate-700 mb-2" />
            <span className="text-xs font-bold text-slate-900 block">Hisobotlar</span>
            <span className="text-[10px] text-slate-600">Vedomost va tahlil</span>
          </button>
        </div>
      </div>

      {/* SO‘NGGI FAOLIYAT: Real Firestore ma'lumotlari */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
            SO‘NGGI FAOLIYAT (AUDIT)
          </h2>
          <button
            onClick={() => onNavigate('audit_logs')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            Barchasi ({auditLogs.length}) →
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {auditLogs.slice(0, 5).map(log => (
            <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
              <div className="min-w-0">
                <p className="font-bold text-slate-800 truncate">
                  {log.action} · {log.entity}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  Foydalanuvchi: {log.userRole ? `${log.userRole} (${log.userId})` : log.userId}
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
