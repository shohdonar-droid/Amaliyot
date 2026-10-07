import React, { useState } from 'react';
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
  Calendar
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { storageService } from '../../../services/storageService';
import { StatCard } from '../../common/StatCard';
import { StatusBadge } from '../../common/Badge';
import { ActiveModule } from '../../layout/Sidebar';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

interface DashboardModuleProps {
  onNavigate: (module: ActiveModule) => void;
}

export function DashboardModule({ onNavigate }: DashboardModuleProps) {
  const { role, canonicalRole, currentUser } = useAuth();

  const userRoleStr = (currentUser?.role || role || '').toUpperCase();
  const isStudent = canonicalRole === 'STUDENT' || userRoleStr === 'STUDENT' || userRoleStr === 'TALABA';
  const isSupervisor = canonicalRole === 'PRACTICE_SUPERVISOR' || userRoleStr === 'PRACTICE_SUPERVISOR' || userRoleStr === 'SUPERVISOR' || userRoleStr === 'PRACTICE_LEADER_UNI' || userRoleStr === 'SUPERVISOR_UNIVERSITY';
  const isClinic = canonicalRole === 'CLINIC_RESPONSIBLE' || userRoleStr === 'CLINIC_RESPONSIBLE' || userRoleStr === 'CLINIC' || userRoleStr === 'SUPERVISOR_CLINIC';

  // Load live data from storage service
  const students = storageService.getStudents() || [];
  const practices = storageService.getPractices() || [];
  const places = storageService.getPracticePlaces() || [];
  const supervisors = storageService.getSupervisors() || [];
  const assignments = storageService.getAssignments() || [];
  const attendance = storageService.getAttendance() || [];
  const journals = storageService.getDailyJournals() || [];
  const assessments = storageService.getAssessments() || [];
  const groups = storageService.getGroups() || [];

  // Today date
  const todayDate = '2026-09-28';

  // =========================================================================
  // 1. STUDENT DASHBOARD VIEW (Strict Role Isolation)
  // =========================================================================
  if (isStudent) {
    const myStudent = students.find(s => s?.userId === currentUser?.uid || s?.id === currentUser?.studentId || s?.login === currentUser?.login) || students[0];
    const myAssignment = assignments.find(a => a?.studentId === myStudent?.id) || assignments[0];
    const myPractice = practices.find(p => p?.id === myAssignment?.practiceId) || practices[0];
    const myClinicPlace = places.find(p => p?.id === myAssignment?.practicePlaceId) || places[0];
    const mySupervisor = supervisors.find(s => s?.id === myAssignment?.supervisorId) || supervisors[0];

    const myAttendance = attendance.filter(a => a?.studentId === myStudent?.id);
    const myPresentCount = myAttendance.filter(a => {
      const st = (a?.status || '').toUpperCase();
      return st === 'PRESENT' || st === 'LATE';
    }).length;
    const myTotalDays = Math.max(1, myAttendance.length);
    const studentAttRate = Math.round((myPresentCount / myTotalDays) * 100);

    const myJournals = journals.filter(j => j?.studentId === myStudent?.id);
    const myApprovedJournals = myJournals.filter(j => (j?.status || '').toUpperCase().includes('APPROV'));
    const myPendingJournals = myJournals.filter(j => {
      const st = (j?.status || '').toUpperCase();
      return st.includes('PEND') || st === 'SUBMITTED';
    });

    const todayJournal = myJournals.find(j => j?.date === todayDate);
    const todayAttRecord = myAttendance.find(a => a?.date === todayDate);

    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-blue-900/50">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold backdrop-blur-xs mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              Talaba Shaxsiy Kabineti · {storageService.getUniversityName()}
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Salom, {myStudent?.fullName || currentUser?.fullName || 'Talaba'}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Klinik amaliyot jarayoningiz, biriktirilgan shifoxona, kunlik davomat va elektron kundaliklar nazorat paneli.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('daily_journal')}
              className="px-4 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Kunlik Kundalik</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('attendance')}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-white" />
              <span>QR Davomat</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('skills')}
              className="px-4 py-2 text-xs font-semibold text-blue-200 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-white/10"
            >
              <Award className="w-4 h-4" />
              <span>Ko'nikmalar</span>
            </button>
          </div>
        </div>

        {/* 4 Student Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Joriy Amaliyot Dasturi"
            value={myPractice?.name || 'Klinik amaliyot'}
            subtitle={`Muddati: ${myPractice?.startDate || '2026-10-01'} — ${myPractice?.endDate || '2026-11-15'}`}
            icon={<Stethoscope className="w-5 h-5 text-blue-600" />}
            variant="blue"
            onClick={() => onNavigate('practices')}
          />

          <StatCard
            title="Klinik Baza / Shifoxona"
            value={myClinicPlace?.name || 'Klinik baza'}
            subtitle={`Bo'lim: ${myAssignment?.department || (myAssignment as any)?.departmentName || 'Shifoxona bo\'limi'}`}
            icon={<Building2 className="w-5 h-5 text-indigo-600" />}
            onClick={() => onNavigate('practice_places')}
          />

          <StatCard
            title="Mening Davomatim"
            value={`${studentAttRate}%`}
            subtitle={`${myPresentCount} / ${myTotalDays} kun qatnashildi`}
            icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
            variant="success"
            onClick={() => onNavigate('attendance')}
          />

          <StatCard
            title="Kunlik Kundaliklarim"
            value={`${myJournals.length} ta yuborildi`}
            subtitle={`${myApprovedJournals.length} tasdiqlandi · ${myPendingJournals.length} kutilmoqda`}
            icon={<BookOpen className="w-5 h-5 text-amber-600" />}
            variant={myPendingJournals.length > 0 ? 'warning' : 'default'}
            onClick={() => onNavigate('daily_journal')}
          />
        </div>

        {/* Student Today Status & Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action 1: Today Journal */}
          <div
            onClick={() => onNavigate('daily_journal')}
            className={`p-5 rounded-xl border text-left transition-all cursor-pointer shadow-2xs ${
              todayJournal
                ? 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-100/60'
                : 'bg-amber-50/60 border-amber-200 hover:bg-amber-100/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Bugungi Kundalik
              </span>
              <span className={`w-2.5 h-2.5 rounded-full ${todayJournal ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            </div>
            <div className="text-base font-extrabold text-slate-900 mt-1">
              {todayJournal ? '🟢 Bugungi kundalik topshirilgan' : '🟡 Bugungi kundalik hali topshirilmadi'}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {todayJournal ? `Status: ${todayJournal.status}` : 'Bugungi bajarilgan tibbiy muolajalaringizni yozib yuboring →'}
            </p>
          </div>

          {/* Action 2: Today Attendance */}
          <div
            onClick={() => onNavigate('attendance')}
            className={`p-5 rounded-xl border text-left transition-all cursor-pointer shadow-2xs ${
              todayAttRecord
                ? 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-100/60'
                : 'bg-blue-50/60 border-blue-200 hover:bg-blue-100/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-emerald-600" />
                Bugungi QR Davomat
              </span>
              <span className={`w-2.5 h-2.5 rounded-full ${todayAttRecord ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`} />
            </div>
            <div className="text-base font-extrabold text-slate-900 mt-1">
              {todayAttRecord ? `🟢 ${todayAttRecord.checkInTime || '08:15'} da belgilandi` : '🔵 QR Kod skanerlash kerak'}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {todayAttRecord ? 'Shifoxona koordinatasi tasdiqlangan' : 'Klinika QR kodini skanerlab kelganingizni tasdiqlang →'}
            </p>
          </div>

          {/* Action 3: Skills log */}
          <div
            onClick={() => onNavigate('skills')}
            className="p-5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/60 text-left transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-600" />
                Amaliy Ko'nikmalar Pasporti
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            </div>
            <div className="text-base font-extrabold text-purple-950 mt-1">
              🩺 Klinik Muolajalar
            </div>
            <p className="text-xs text-slate-600 mt-1">
              O'zlashtirilgan tibbiy muolaja va operatsiyalarni qayd etish →
            </p>
          </div>
        </div>

        {/* Supervisor Info Card */}
        {mySupervisor && (
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-teal-600" />
              <span>Biriktirilgan Amaliyot Rahbari (Universitet)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
              <div>
                <p className="text-[11px] text-slate-400 uppercase font-semibold">F.I.Sh.</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{mySupervisor.fullName}</p>
                <p className="text-[11px] text-slate-500">{mySupervisor.academicDegree || 'O\'qituvchi'}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Kafedra / Bo'lim</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{mySupervisor.department || 'Kafedra'}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Aloqa ma'lumotlari</p>
                <p className="font-mono text-slate-700 mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" /> {mySupervisor.phone || '+998 (90) 000-00-00'}
                </p>
                <p className="font-mono text-slate-600 flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3 text-slate-400" /> {mySupervisor.email || 'rahbar@tma.uz'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 2. PRACTICE SUPERVISOR DASHBOARD VIEW (Universitet Amaliyot Rahbari)
  // =========================================================================
  if (isSupervisor) {
    const supervisorId = currentUser?.supervisorId || 'sup-1';
    const mySupervisorStudents = storageService.getStudentsForSupervisor(supervisorId) || [];
    const supervisorUnassigned = storageService.getUnassignedDepartmentStudentsForSupervisor(supervisorId) || [];
    const supervisorPendingJournals = journals.filter(j => 
      (j?.status || '').toUpperCase() === 'PENDING' && 
      (j?.supervisorId === supervisorId || mySupervisorStudents.some(s => s.id === j?.studentId))
    );

    const supAttendance = attendance.filter(a => mySupervisorStudents.some(s => s.id === a.studentId) && a.date === todayDate);
    const supPresent = supAttendance.filter(a => {
      const st = (a?.status || '').toUpperCase();
      return st === 'PRESENT' || st === 'LATE';
    }).length;
    const supAttRate = supAttendance.length > 0 ? Math.round((supPresent / supAttendance.length) * 100) : 100;

    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-blue-900/50">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold backdrop-blur-xs mb-2">
              <UserCheck className="w-3.5 h-3.5 text-teal-300" />
              Universitet Amaliyot Rahbari Kabineti · {storageService.getUniversityName()}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Salom, {currentUser?.fullName || 'Amaliyot Rahbari'}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              O'zingizga biriktirilgan guruhlar va talabalarning amaliyot jarayoni, kunlik davomati va elektron kundaliklarini nazorat qilish paneli.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('daily_journal')}
              className="px-4 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Kundaliklarni tekshirish
            </button>
            <button
              type="button"
              onClick={() => onNavigate('allocation')}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Taqsimotlar
            </button>
          </div>
        </div>

        {/* Supervisor Action Center */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => onNavigate('allocation')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer shadow-2xs ${
              supervisorUnassigned.length > 0
                ? 'bg-rose-50 border-rose-200 hover:bg-rose-100/80'
                : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                supervisorUnassigned.length > 0 ? 'text-rose-700' : 'text-emerald-700'
              }`}>
                Bo'limlarga taqsimot
              </span>
              <span className={`w-2.5 h-2.5 rounded-full ${
                supervisorUnassigned.length > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
              }`} />
            </div>
            <div className={`text-xl font-extrabold mt-1 ${
              supervisorUnassigned.length > 0 ? 'text-rose-900' : 'text-emerald-900'
            }`}>
              {supervisorUnassigned.length > 0
                ? `🔴 ${supervisorUnassigned.length} nafar biriktirilmagan`
                : '🟢 Barchasi biriktirilgan'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Guruh talabalarini klinik bo'limlarga biriktirish uchun bosing →
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('daily_journal')}
            className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-left hover:bg-amber-100/80 transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                Elektron Kundaliklar
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            </div>
            <div className="text-xl font-extrabold text-amber-900 mt-1">
              🟡 {supervisorPendingJournals.length} ta tekshirish kutilmoqda
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Talabalaringiz yuborgan kundaliklarni ko'rib chiqish va baholash →
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('students')}
            className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-left hover:bg-blue-100/80 transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                Mening Talabalarim
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            </div>
            <div className="text-xl font-extrabold text-blue-900 mt-1">
              👨‍⚕️ {mySupervisorStudents.length} nafar talaba
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Faqat sizga biriktirilgan guruhlar talabalari ro'yxati →
            </p>
          </button>
        </div>

        {/* 4 Supervisor Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Biriktirilgan Talabalar"
            value={mySupervisorStudents.length}
            subtitle="Sizning guruhlaringizda"
            icon={<Users className="w-5 h-5 text-blue-600" />}
            variant="blue"
            onClick={() => onNavigate('students')}
          />

          <StatCard
            title="Guruhlarim Davomati"
            value={`${supAttRate}%`}
            subtitle={`${supPresent} / ${supAttendance.length || mySupervisorStudents.length} ishtirok etdi`}
            icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
            variant="success"
            onClick={() => onNavigate('attendance')}
          />

          <StatCard
            title="Kutilayotgan Kundaliklar"
            value={supervisorPendingJournals.length}
            subtitle="Tekshirib tasdiqlash kutilmoqda"
            icon={<BookOpen className="w-5 h-5 text-amber-600" />}
            variant={supervisorPendingJournals.length > 0 ? 'warning' : 'default'}
            onClick={() => onNavigate('daily_journal')}
          />

          <StatCard
            title="Taqsimlanmaganlar"
            value={supervisorUnassigned.length}
            subtitle="Bo'limlarga biriktirilishi kerak"
            icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
            variant={supervisorUnassigned.length > 0 ? 'alert' : 'default'}
            onClick={() => onNavigate('allocation')}
          />
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. CLINIC RESPONSIBLE DASHBOARD VIEW (Klinik / Shifoxona Mas'uli)
  // =========================================================================
  if (isClinic) {
    const myPlaceId = currentUser?.practicePlaceId || 'place-1';
    const myPlace = places.find(p => p.id === myPlaceId) || places[0];
    const clinicStudents = students.filter(s => s.currentPracticePlaceId === myPlaceId || assignments.some(a => a.studentId === s.id && a.practicePlaceId === myPlaceId));
    const clinicTodayAtt = attendance.filter(a => a.date === todayDate && (a.practicePlaceId === myPlaceId || clinicStudents.some(s => s.id === a.studentId)));
    const clinicPresent = clinicTodayAtt.filter(a => {
      const st = (a?.status || '').toUpperCase();
      return st === 'PRESENT' || st === 'LATE';
    }).length;

    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-amber-900/50">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold backdrop-blur-xs mb-2">
              <Building2 className="w-3.5 h-3.5 text-amber-300" />
              Klinik Baza Mas'uli Kabineti · {myPlace?.name || 'Shifoxona'}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Salom, {currentUser?.fullName || 'Klinika Mas\'uli'}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Shifoxonangizga biriktirilgan talabalar, ularning kunlik QR davomati va bo'limlar bo'yicha taqsimoti.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('attendance')}
            className="px-4 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            QR Davomat Jurnali
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Klinikadagi Talabalar"
            value={clinicStudents.length}
            subtitle={`${myPlace?.name || 'Shifoxona'} kontingenti`}
            icon={<Users className="w-5 h-5 text-blue-600" />}
            onClick={() => onNavigate('students')}
          />

          <StatCard
            title="Bugun Kelganlar (QR)"
            value={clinicPresent}
            subtitle={`${clinicTodayAtt.length} nafar skanerladi`}
            icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
            variant="success"
            onClick={() => onNavigate('attendance')}
          />

          <StatCard
            title="Baza Sig'imi (Kvota)"
            value={`${clinicStudents.length} / ${myPlace?.capacity || 100}`}
            subtitle={`${Math.round((clinicStudents.length / Math.max(1, myPlace?.capacity || 100)) * 100)}% bandlik`}
            icon={<Building2 className="w-5 h-5 text-amber-600" />}
            onClick={() => onNavigate('practice_places')}
          />

          <StatCard
            title="Klinik Bo'limlar"
            value={storageService.getPracticeDepartments()?.length || 8}
            subtitle="Statsionar va poliklinika"
            icon={<Stethoscope className="w-5 h-5 text-indigo-600" />}
            onClick={() => onNavigate('practice_places')}
          />
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. SUPER ADMIN & PRACTICE HEAD DASHBOARD VIEW (Full University Overview)
  // =========================================================================
  const totalStudents = students.length;
  const inPracticeStudents = students.filter(s => s.status === 'in_practice').length;
  const totalPlaces = places.length;
  const totalSupervisors = supervisors.length;
  const activePractices = practices.filter(p => p.status === 'active');

  const todayAttendance = attendance.filter(a => a.date === todayDate);
  const isPresent = (st?: string) => st?.toUpperCase() === 'PRESENT';
  const isLate = (st?: string) => st?.toUpperCase() === 'LATE';
  const isAbsent = (st?: string) => st?.toUpperCase() === 'ABSENT';
  const isExcused = (st?: string) => st?.toUpperCase() === 'EXCUSED';

  const presentToday = todayAttendance.filter(a => isPresent(a.status)).length;
  const lateToday = todayAttendance.filter(a => isLate(a.status)).length;
  const absentToday = todayAttendance.filter(a => isAbsent(a.status)).length;
  const excusedToday = todayAttendance.filter(a => isExcused(a.status)).length;
  const attendanceRate = todayAttendance.length > 0 
    ? Math.round(((presentToday + lateToday + excusedToday) / todayAttendance.length) * 100) 
    : 100;

  const attendanceIssues = todayAttendance.filter(a => isAbsent(a.status) || isLate(a.status));
  const pendingJournals = journals.filter(j => (j.status || '').toUpperCase() === 'PENDING');
  const unassessedCount = Math.max(0, inPracticeStudents - assessments.filter(a => (a.status || '').toUpperCase() === 'GRADED').length);

  const problematicStudents = students.filter(s => {
    const studentAtt = attendance.filter(a => a.studentId === s.id);
    const absentCount = studentAtt.filter(a => isAbsent(a.status)).length;
    const lateCount = studentAtt.filter(a => isLate(a.status)).length;
    const isSuspended = s.status === 'suspended';
    return absentCount >= 1 || lateCount >= 2 || isSuspended;
  });

  const endingSoonPractices = [...practices]
    .filter(p => p.status === 'active')
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 3);

  const summaryChartData = [
    {
      name: "Jami talabalar",
      shortName: "Talabalar",
      count: totalStudents,
      color: "#2563eb",
      badge: "Ta'lim oluvchilar",
      desc: "Tizimda ro'yxatga olingan umumiy talabalar kontingenti"
    },
    {
      name: "Faol amaliyot joylari",
      shortName: "Klinik bazalar",
      count: totalPlaces,
      color: "#059669",
      badge: "Klinikalar va markazlar",
      desc: "Biriktirilgan shifoxonalar, ilmiy markazlar va oilaviy poliklinikalar"
    },
    {
      name: "Davom etayotgan amaliyotlar",
      shortName: "Amaliyotlar",
      count: activePractices.length,
      color: "#7c3aed",
      badge: "Faol davrlar",
      desc: "Rektorat buyrug'i asosida o'tkazilayotgan faol amaliyotlar"
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-blue-900/50">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
            Tibbiyot Ta'limi · Amaliyot boshqaruvi
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Salom, {currentUser?.fullName || 'Amaliyot Boshlig\'i'}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            {storageService.getUniversityName()} talabalarining barcha klinik bazalardagi amaliyot jarayoni, davomati va elektron kundaliklari nazoratda.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('practices')}
            className="px-4 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Amaliyotlar
          </button>
          <button
            type="button"
            onClick={() => onNavigate('allocation')}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Taqsimlash
          </button>
        </div>
      </div>

      {/* 9 Core Metric Cards for Admin */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        <StatCard
          title="Jami talabalar"
          value={totalStudents}
          subtitle="Universitet ro'yxatida"
          icon={<Users className="w-5 h-5 text-blue-600" />}
          variant="blue"
          onClick={() => onNavigate('students')}
        />

        <StatCard
          title="Amaliyotdagi talabalar"
          value={inPracticeStudents}
          subtitle={`${Math.round((inPracticeStudents / Math.max(totalStudents, 1)) * 100)}% qamrov`}
          icon={<Stethoscope className="w-5 h-5 text-emerald-600" />}
          variant="success"
          trend={{ value: `${inPracticeStudents} nafar`, isPositive: true, label: 'klinikada' }}
          onClick={() => onNavigate('students')}
        />

        <StatCard
          title="Amaliyot joylari"
          value={totalPlaces}
          subtitle="Shifoxona, klinika, markazlar"
          icon={<Building2 className="w-5 h-5 text-indigo-600" />}
          onClick={() => onNavigate('practice_places')}
        />

        <StatCard
          title="Amaliyot rahbarlari"
          value={totalSupervisors}
          subtitle="Kafedra va klinik mentorlar"
          icon={<UserCheck className="w-5 h-5 text-teal-600" />}
          onClick={() => onNavigate('supervisors')}
        />

        <StatCard
          title="Faol amaliyotlar"
          value={activePractices.length}
          subtitle="Buyruq asosida davom etmoqda"
          icon={<CalendarRange className="w-5 h-5 text-blue-600" />}
          onClick={() => onNavigate('practices')}
        />

        <StatCard
          title="Bugungi davomat"
          value={`${attendanceRate}%`}
          subtitle={`${presentToday} / ${todayAttendance.length || inPracticeStudents} ishtirok etdi`}
          icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
          variant="default"
          onClick={() => onNavigate('attendance')}
        />

        <StatCard
          title="Davomat muammolari"
          value={attendanceIssues.length}
          subtitle="Kelmadi yoki kechikdi"
          icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
          variant={attendanceIssues.length > 0 ? 'alert' : 'default'}
          trend={attendanceIssues.length > 0 ? { value: `${attendanceIssues.length} talaba`, isPositive: false, label: 'nazoratda' } : undefined}
          onClick={() => onNavigate('attendance')}
        />

        <StatCard
          title="Kundalik topshirmaganlar"
          value={pendingJournals.length}
          subtitle="Tekshirish yoki topshirish kutilmoqda"
          icon={<BookOpen className="w-5 h-5 text-amber-600" />}
          variant={pendingJournals.length > 0 ? 'warning' : 'default'}
          onClick={() => onNavigate('daily_journal')}
        />

        <StatCard
          title="Baholanmagan talabalar"
          value={Math.max(unassessedCount, 0)}
          subtitle="Oraliq/yakuniy attestatsiya"
          icon={<Award className="w-5 h-5 text-slate-600" />}
          onClick={() => onNavigate('assessments')}
        />
      </div>

      {/* Summary Chart Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Umumiy Ko'rsatkichlar Qisqacha Sharhi (Quick Overview)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Jami talabalar, faol amaliyot joylari va davom etayotgan amaliyotlarning grafik vizualizatsiyasi
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Jonli statistika
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-4 space-y-3">
            <div
              onClick={() => onNavigate('students')}
              className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/60 hover:bg-blue-100/60 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wide">
                  Jami Talabalar
                </span>
                <Users className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-black text-blue-950 mt-1">
                {totalStudents} <span className="text-xs font-semibold text-blue-700">nafar</span>
              </div>
              <p className="text-[11px] text-blue-700/80 mt-1">
                Tizimda qayd etilgan talabalar kontingenti
              </p>
            </div>

            <div
              onClick={() => onNavigate('practice_places')}
              className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/60 hover:bg-emerald-100/60 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                  Faol Amaliyot Joylari
                </span>
                <Building2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-black text-emerald-950 mt-1">
                {totalPlaces} <span className="text-xs font-semibold text-emerald-700">ta baza</span>
              </div>
              <p className="text-[11px] text-emerald-700/80 mt-1">
                Klinik shifoxonalar, poliklinika va markazlar
              </p>
            </div>

            <div
              onClick={() => onNavigate('practices')}
              className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/60 hover:bg-purple-100/60 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wide">
                  Davom Etayotgan Amaliyotlar
                </span>
                <CalendarRange className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-black text-purple-950 mt-1">
                {activePractices.length} <span className="text-xs font-semibold text-purple-700">ta faol</span>
              </div>
              <p className="text-[11px] text-purple-700/80 mt-1">
                Rektorat buyrug'i asosida o'tkazilayotgan amaliyotlar
              </p>
            </div>
          </div>

          <div className="lg:col-span-8 h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={summaryChartData}
                margin={{ top: 10, right: 20, left: 0, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="shortName"
                  tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-800">
                          <p className="font-bold text-slate-200">{data.name}</p>
                          <p className="text-lg font-black" style={{ color: data.color }}>
                            {data.count} <span className="text-xs font-normal text-slate-300">birlik</span>
                          </p>
                          <p className="text-[11px] text-slate-400">{data.desc}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="count"
                  radius={[8, 8, 0, 0]}
                  barSize={55}
                >
                  {summaryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row: Hospital Capacity Distribution & Group Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Amaliyot joylari bo'yicha taqsimot
              </h3>
              <p className="text-xs text-slate-500">
                Klinik bazalarning to'lish ko'rsatkichi va kvotalari
              </p>
            </div>
            <button
              onClick={() => onNavigate('practice_places')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              Barchasi <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {places.map(place => {
              const percentage = Math.min(Math.round((place.activeStudentsCount / place.capacity) * 100), 100);
              return (
                <div key={place.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div className="flex items-start justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-800 line-clamp-1">{place.name}</span>
                    <span className="text-slate-600 font-mono tabular-nums font-medium shrink-0 ml-2">
                      {place.activeStudentsCount} / {place.capacity} talaba
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                    <span>{place.type} · {place.city}</span>
                    <span className="font-mono tabular-nums font-medium">{percentage}% band</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Guruhlar bo'yicha davomat
              </h3>
              <p className="text-xs text-slate-500">
                Akademik guruhlarning amaliyotdagi faolligi
              </p>
            </div>
            <button
              onClick={() => onNavigate('attendance')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              Davomat jurnali <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {groups.map((group, idx) => {
              const rate = [95, 90, 85, 96, 92][idx % 5];
              return (
                <div key={group.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800">
                      {group.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {group.studentCount || 20} talaba · {group.language} guruh
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-slate-200 rounded-full h-2 hidden sm:block">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-700 tabular-nums">
                      {rate}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row: Problematic Students & Practice Expirations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <h3 className="text-sm font-bold text-slate-900">
                Nazoratdagi va muammoli talabalar
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {problematicStudents.length} nafar
            </span>
          </div>

          {problematicStudents.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Ayni vaqtda intizom buzilishi yoki qoldirilgan amaliyotlar yo'q.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {problematicStudents.map(student => {
                const group = groups.find(g => g.id === student.groupId);
                const isAbsent = attendance.some(a => a.studentId === student.id && a.status === 'absent');
                return (
                  <div key={student.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {student.fullName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {group?.name || 'Guruh'} · {student.phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {student.status === 'suspended' ? (
                        <StatusBadge label="Chetlashtirilgan" variant="danger" />
                      ) : isAbsent ? (
                        <StatusBadge label="Sababsiz kelmadi" variant="danger" />
                      ) : (
                        <StatusBadge label="Nazoratda" variant="warning" />
                      )}
                      <button
                        onClick={() => onNavigate('students')}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded-md hover:bg-blue-50 cursor-pointer"
                      >
                        Profil
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Yaqinda yakunlanadigan amaliyotlar
              </h3>
            </div>
            <button
              onClick={() => onNavigate('practices')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Amaliyotlar jadvali
            </button>
          </div>

          <div className="space-y-3">
            {endingSoonPractices.map(practice => {
              const daysLeft = Math.ceil(
                (new Date(practice.endDate).getTime() - new Date('2026-09-28').getTime()) / (1000 * 3600 * 24)
              );
              return (
                <div key={practice.id} className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">
                      {practice.name}
                    </p>
                    <StatusBadge label="Faol" variant="active" />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Muddati: {practice.startDate} — {practice.endDate}</span>
                    <span className={`font-semibold tabular-nums ${daysLeft <= 7 ? 'text-red-600' : 'text-amber-600'}`}>
                      {daysLeft > 0 ? `${daysLeft} kun qoldi` : 'Bugun yakunlanadi'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
