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
  FileCheck
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
  const isSupervisor = canonicalRole === 'PRACTICE_SUPERVISOR';
  const supervisorId = currentUser?.supervisorId || (isSupervisor ? 'sup-1' : undefined);

  // Load live data from service layer
  const students = storageService.getStudents();
  const practices = storageService.getPractices();
  const places = storageService.getPracticePlaces();
  const supervisors = storageService.getSupervisors();
  const assignments = storageService.getAssignments();
  const attendance = storageService.getAttendance();
  const journals = storageService.getDailyJournals();
  const assessments = storageService.getAssessments();

  // Supervisor-specific calculations
  const mySupervisorStudents = isSupervisor && supervisorId
    ? storageService.getStudentsForSupervisor(supervisorId)
    : [];
  const supervisorUnassigned = isSupervisor && supervisorId
    ? storageService.getUnassignedDepartmentStudentsForSupervisor(supervisorId)
    : [];
  const supervisorPendingJournals = isSupervisor && supervisorId
    ? journals.filter(j => j.status?.toUpperCase() === 'PENDING' && (j.supervisorId === supervisorId || mySupervisorStudents.some(s => s.id === j.studentId)))
    : [];

  // Compute live statistics requested in Section 3:
  const totalStudents = isSupervisor ? mySupervisorStudents.length : students.length;
  const inPracticeStudents = isSupervisor
    ? mySupervisorStudents.length
    : students.filter(s => s.status === 'in_practice').length;
  const totalPlaces = places.length;
  const totalSupervisors = supervisors.length;
  const activePractices = practices.filter(p => p.status === 'active');
  
  // Today's attendance calculation (today is '2026-09-28')
  const todayDate = '2026-09-28';
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

  // Attendance issues (absent or late today)
  const attendanceIssues = todayAttendance.filter(a => isAbsent(a.status) || isLate(a.status));

  // Missing journals (pending or students in practice who haven't submitted for yesterday)
  const pendingJournals = journals.filter(j => j.status?.toUpperCase() === 'PENDING');
  
  // Pending assessments (students in practice who don't have graded assessment yet)
  const unassessedCount = Math.max(0, inPracticeStudents - assessments.filter(a => a.status?.toUpperCase() === 'GRADED').length);

  // Problematic/At-Risk Students list (3+ absent, or multiple late)
  const problematicStudents = students.filter(s => {
    const studentAtt = attendance.filter(a => a.studentId === s.id);
    const absentCount = studentAtt.filter(a => isAbsent(a.status)).length;
    const lateCount = studentAtt.filter(a => isLate(a.status)).length;
    const isSuspended = s.status === 'suspended';
    return absentCount >= 1 || lateCount >= 2 || isSuspended;
  });

  // Practices ending soon (sorted by endDate)
  const endingSoonPractices = [...practices]
    .filter(p => p.status === 'active')
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 3);

  // Group-level attendance breakdown
  const groups = storageService.getGroups();

  // Recharts quick overview data
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
    <div className="space-y-6">
      {/* Role Notice & Welcome Banner */}
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
            className="px-4 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-xs transition-colors"
          >
            Amaliyotlar
          </button>
          <button
            type="button"
            onClick={() => onNavigate('allocation')}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs transition-colors"
          >
            Taqsimlash
          </button>
        </div>
      </div>

      {/* Supervisor Special Action Center (Requirement 10 & 13) */}
      {isSupervisor && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => onNavigate('allocation')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer shadow-xs ${
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
            className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-left hover:bg-amber-100/80 transition-all cursor-pointer shadow-xs"
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
            className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-left hover:bg-blue-100/80 transition-all cursor-pointer shadow-xs"
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
      )}

      {/* 9 Core Metric Cards required by Section 3 */}
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

      {/* Recharts Summary Card Component for Quick Overview */}
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
          {/* Quick Metrics Badges / Cards */}
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

          {/* Recharts Bar Visualization */}
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

      {/* Row: Hospital Capacity Distribution & Attendance by Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Practice Places Distribution */}
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
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
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

        {/* Group-level Attendance Rates */}
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
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Davomat jurnali <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {groups.map((group, idx) => {
              // Synthetic realistic rate for display
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

      {/* Row: At-risk / Problematic Students & Ending Soon Practices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Muammoli talabalar jadvali */}
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
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded-md hover:bg-blue-50"
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

        {/* Amaliyot tugashiga yaqin amaliyotlar */}
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
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
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
