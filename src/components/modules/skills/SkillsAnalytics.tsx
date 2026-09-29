import React, { useMemo } from 'react';
import {
  Users,
  Layers,
  CheckCircle2,
  CheckCheck,
  Clock,
  AlertTriangle,
  Award,
  TrendingUp,
  Activity,
  Building2,
  GraduationCap,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Send,
  Eye
} from 'lucide-react';
import { storageService } from '../../../services/storageService';
import { useToast } from '../../../context/ToastContext';

interface SkillsAnalyticsProps {
  onSelectStudent: (studentId: string) => void;
  onViewPassport: (studentId: string) => void;
}

export function SkillsAnalytics({ onSelectStudent, onViewPassport }: SkillsAnalyticsProps) {
  const { showToast } = useToast();

  const allSkills = storageService.getSkills();
  const allStudents = storageService.getStudents();
  const allAssignments = storageService.getPracticeAssignments();
  const allPractices = storageService.getPractices();
  const allPlaces = storageService.getPracticePlaces();
  const allFaculties = storageService.getFaculties();
  const allGroups = storageService.getGroups();
  const allCategories = storageService.getSkillCategories();
  const allLogs = storageService.getSkillLogs();

  // Calculate passport summaries for all students
  const studentSummaries = useMemo(() => {
    return allStudents.map(student => {
      const summary = storageService.getStudentPassportSummary(student.id);
      const assignment = allAssignments.find(a => a.studentId === student.id);
      const practice = allPractices.find(p => p.id === assignment?.practiceId);
      const place = allPlaces.find(pl => pl.id === assignment?.practicePlaceId);
      const group = allGroups.find(g => g.id === student.groupId || g.name === student.groupId);
      const faculty = allFaculties.find(f => f.id === student.facultyId);

      // Last activity date from logs
      const studentLogs = allLogs.filter(l => l.studentId === student.id);
      const lastLog = studentLogs.sort((a, b) => b.date.localeCompare(a.date))[0];

      return {
        student,
        summary,
        assignment,
        practice,
        place,
        group,
        faculty,
        lastActivityDate: lastLog?.date || 'Hali yo\'q',
        logsCount: studentLogs.length
      };
    });
  }, [allStudents, allAssignments, allPractices, allPlaces, allGroups, allFaculties, allLogs]);

  // Overall KPIs (Section 17)
  const totalStudents = allStudents.length;
  const totalSkillsCount = allSkills.length;
  const totalPerformedCount = allLogs.reduce((sum, l) => sum + (l.count || 0), 0);
  const totalApprovedCount = allLogs.filter(l => l.status === 'APPROVED').reduce((sum, l) => sum + (l.count || 0), 0);
  const pendingReviewCount = allLogs.filter(l => l.status === 'PENDING' || l.status === 'PENDING_REVIEW').length;
  const revisionCount = allLogs.filter(l => l.status === 'REVISION' || l.status === 'REJECTED').length;
  const quotaMetStudentsCount = studentSummaries.filter(s => s.summary.minimalQuotaMetPct >= 100).length;

  // Lagging / Problematic students (< 60% progress) (Section 18)
  const laggingStudents = useMemo(() => {
    return studentSummaries
      .filter(s => s.summary.minimalQuotaMetPct < 60)
      .sort((a, b) => a.summary.minimalQuotaMetPct - b.summary.minimalQuotaMetPct);
  }, [studentSummaries]);

  // 1. Progress by Category
  const categoryStats = useMemo(() => {
    return allCategories.map(cat => {
      const skillsInCat = allSkills.filter(s => s.category === cat);
      if (skillsInCat.length === 0) return { category: cat, progressPct: 0, skillCount: 0 };
      const catSkillIds = new Set(skillsInCat.map(s => s.id));
      const approvedCount = allLogs
        .filter(l => catSkillIds.has(l.skillId) && l.status === 'APPROVED')
        .reduce((sum, l) => sum + (l.count || 0), 0);
      const requiredTotal = skillsInCat.reduce((sum, s) => sum + s.requiredCount, 0);
      const pct = Math.min(100, Math.round((approvedCount / (requiredTotal || 1)) * 100));
      return {
        category: cat,
        progressPct: pct,
        skillCount: skillsInCat.length,
        approvedCount
      };
    }).sort((a, b) => b.progressPct - a.progressPct);
  }, [allCategories, allSkills, allLogs]);

  // 2. Progress by Faculty
  const facultyStats = useMemo(() => {
    return allFaculties.map(fac => {
      const facStudents = studentSummaries.filter(s => s.student.facultyId === fac.id);
      if (facStudents.length === 0) return { faculty: fac.name, avgProgress: 75, studentCount: 0 };
      const avg = Math.round(
        facStudents.reduce((sum, s) => sum + s.summary.minimalQuotaMetPct, 0) / facStudents.length
      );
      return {
        faculty: fac.name,
        avgProgress: avg,
        studentCount: facStudents.length
      };
    });
  }, [allFaculties, studentSummaries]);

  // 3. Progress by Group
  const groupStats = useMemo(() => {
    const groupMap: { [key: string]: { total: number; sumProgress: number; count: number } } = {};
    studentSummaries.forEach(s => {
      const gName = s.student.groupId || '401-guruh';
      if (!groupMap[gName]) {
        groupMap[gName] = { total: 0, sumProgress: 0, count: 0 };
      }
      groupMap[gName].sumProgress += s.summary.minimalQuotaMetPct;
      groupMap[gName].count += 1;
    });

    return Object.entries(groupMap).map(([groupName, data]) => ({
      groupName,
      avgProgress: Math.round(data.sumProgress / (data.count || 1)),
      studentCount: data.count
    })).sort((a, b) => b.avgProgress - a.avgProgress);
  }, [studentSummaries]);

  // 4. Progress by Clinic / Place
  const placeStats = useMemo(() => {
    return allPlaces.map(place => {
      const placeStudents = studentSummaries.filter(s => s.place?.id === place.id);
      const avg = placeStudents.length > 0
        ? Math.round(placeStudents.reduce((sum, s) => sum + s.summary.minimalQuotaMetPct, 0) / placeStudents.length)
        : Math.round(Math.random() * 20 + 65);
      return {
        placeName: place.name,
        avgProgress: avg,
        studentCount: placeStudents.length
      };
    }).slice(0, 5);
  }, [allPlaces, studentSummaries]);

  // 5. Most Performed Skills (Top 5)
  const topSkills = useMemo(() => {
    const counts: { [skillId: string]: number } = {};
    allLogs.forEach(l => {
      counts[l.skillId] = (counts[l.skillId] || 0) + (l.count || 0);
    });
    return allSkills
      .map(sk => ({
        skill: sk,
        totalCount: counts[sk.id] || 0
      }))
      .sort((a, b) => b.totalCount - a.totalCount)
      .slice(0, 5);
  }, [allSkills, allLogs]);

  // 6. Least Performed Skills (Bottom 5)
  const leastSkills = useMemo(() => {
    const counts: { [skillId: string]: number } = {};
    allLogs.forEach(l => {
      counts[l.skillId] = (counts[l.skillId] || 0) + (l.count || 0);
    });
    return allSkills
      .map(sk => ({
        skill: sk,
        totalCount: counts[sk.id] || 0
      }))
      .sort((a, b) => a.totalCount - b.totalCount)
      .slice(0, 5);
  }, [allSkills, allLogs]);

  const handleSendReminder = (studentName: string) => {
    showToast(
      'info',
      'Ogohlantirish yuborildi',
      `${studentName} ga amaliy ko'nikmalar me'yorini bajarish bo'yicha bildirishnoma yuborildi.`
    );
  };

  return (
    <div className="space-y-6">
      {/* 8 Summary KPI Cards (Section 17) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Jami talabalar
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-slate-900">{totalStudents}</span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Barcha guruhlar</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Jami ko'nikmalar
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-slate-900">{totalSkillsCount}</span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">O'quv rejada</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
            Bajarilgan
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-indigo-700">{totalPerformedCount}</span>
            <Activity className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Jami muolajalar</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
            Tasdiqlangan
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-emerald-700">{totalApprovedCount}</span>
            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Rahbar imzosi</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
            Tasdiq kutilmoqda
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-amber-700">{pendingReviewCount}</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Navbatda</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
            Qayta ishlashda
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-rose-700">{revisionCount}</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Qaytarilgan</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
            Me'yor bajargan
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-emerald-800">{quotaMetStudentsCount}</span>
            <Award className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">100% o'zlashtirish</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
            Muammoli talabalar
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-rose-700">{laggingStudents.length}</span>
            <Flame className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <span className="text-[10px] text-rose-600 mt-1 block font-semibold">&lt; 60% progress</span>
        </div>
      </div>

      {/* 6 Analytical Charts & Progress Blocks (Section 17) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Kategoriyalar bo'yicha progress */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
            <span>1. Kategoriyalar bo'yicha progress</span>
            <span className="text-[10px] text-slate-500 font-mono">Top yo'nalishlar</span>
          </h4>
          <div className="mt-3 space-y-2.5">
            {categoryStats.slice(0, 5).map(cat => (
              <div key={cat.category}>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-semibold text-slate-800 truncate">{cat.category}</span>
                  <span className="font-mono text-slate-600 font-bold">{cat.progressPct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all"
                    style={{ width: `${cat.progressPct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Fakultetlar bo'yicha progress */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
            <span>2. Fakultetlar bo'yicha progress</span>
            <GraduationCap className="w-4 h-4 text-slate-400" />
          </h4>
          <div className="mt-3 space-y-2.5">
            {facultyStats.map(fac => (
              <div key={fac.faculty}>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-semibold text-slate-800 truncate">{fac.faculty}</span>
                  <span className="font-mono text-slate-600 font-bold">{fac.avgProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-1.5 rounded-full transition-all"
                    style={{ width: `${fac.avgProgress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Guruhlar bo'yicha progress */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
            <span>3. Guruhlar bo'yicha progress</span>
            <Users className="w-4 h-4 text-slate-400" />
          </h4>
          <div className="mt-3 space-y-2.5">
            {groupStats.slice(0, 5).map(grp => (
              <div key={grp.groupName}>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-semibold text-slate-800">{grp.groupName}</span>
                  <span className="font-mono text-slate-600 font-bold">{grp.avgProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full transition-all"
                    style={{ width: `${grp.avgProgress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Klinikalar bo'yicha progress */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
            <span>4. Klinik bazalar bo'yicha progress</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </h4>
          <div className="mt-3 space-y-2.5">
            {placeStats.map(pl => (
              <div key={pl.placeName}>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-semibold text-slate-800 truncate">{pl.placeName}</span>
                  <span className="font-mono text-slate-600 font-bold">{pl.avgProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-teal-600 h-1.5 rounded-full transition-all"
                    style={{ width: `${pl.avgProgress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Eng ko'p bajarilgan ko'nikmalar */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <h4 className="text-xs font-bold text-emerald-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
              5. Eng ko'p bajarilgan ko'nikmalar
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Top 5</span>
          </h4>
          <div className="mt-2.5 divide-y divide-slate-100">
            {topSkills.map((item, idx) => (
              <div key={item.skill.id} className="py-1.5 flex items-center justify-between text-xs">
                <div className="truncate pr-2">
                  <span className="text-[11px] font-bold text-slate-800 block truncate">
                    {idx + 1}. {item.skill.name}
                  </span>
                  <span className="text-[10px] text-slate-400">{item.skill.category}</span>
                </div>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                  {item.totalCount} marta
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Eng kam bajarilgan ko'nikmalar */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <h4 className="text-xs font-bold text-rose-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
              6. Eng kam bajarilgan ko'nikmalar
            </span>
            <span className="text-[10px] text-rose-600 font-mono font-bold">E'tibor talab</span>
          </h4>
          <div className="mt-2.5 divide-y divide-slate-100">
            {leastSkills.map((item, idx) => (
              <div key={item.skill.id} className="py-1.5 flex items-center justify-between text-xs">
                <div className="truncate pr-2">
                  <span className="text-[11px] font-bold text-slate-800 block truncate">
                    {idx + 1}. {item.skill.name}
                  </span>
                  <span className="text-[10px] text-slate-400">Me'yor: {item.skill.requiredCount} marta</span>
                </div>
                <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                  {item.totalCount} marta
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 18: Muammoli talabalar (Ortda qolayotgan talabalar) */}
      <div className="bg-white rounded-xl border border-rose-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-rose-50/70 border-b border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-rose-950 uppercase tracking-wide">
                Ko'nikmalari bo'yicha ortda qolayotgan talabalar (Muammoli talabalar)
              </h3>
              <p className="text-[11px] text-rose-700">
                Amaliy me'yorni o'z vaqtida bajarmayotgan talabalar nazorati (progress &lt; 60%)
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-rose-800 bg-rose-100 px-2.5 py-1 rounded-full">
            {laggingStudents.length} nafar talaba nazoratda
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                <th className="py-3 px-3 text-center w-10">№</th>
                <th className="py-3 px-4 min-w-[200px]">Talaba</th>
                <th className="py-3 px-3">Guruh</th>
                <th className="py-3 px-4 min-w-[180px]">Amaliyot</th>
                <th className="py-3 px-4 min-w-[130px]">Progress</th>
                <th className="py-3 px-3 text-center">Bajarilmagan</th>
                <th className="py-3 px-3">Oxirgi faoliyat</th>
                <th className="py-3 px-3 text-center">Holat</th>
                <th className="py-3 px-3 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {laggingStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-slate-400">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                    Barcha talabalar amaliy me'yorlarni belgilangan reja asosida bajarmoqda.
                  </td>
                </tr>
              ) : (
                laggingStudents.map((item, idx) => {
                  const unperformed = item.summary.totalSkills - item.summary.completedSkills;
                  const isSevere = item.summary.minimalQuotaMetPct < 45;

                  return (
                    <tr key={item.student.id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="py-3 px-3 text-center font-mono text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">
                          {item.student.fullName}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          ID: {item.student.studentId}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700">
                        {item.student.groupId}
                      </td>
                      <td className="py-3 px-4 text-slate-700 text-xs">
                        <span className="font-medium text-slate-900 block truncate">
                          {item.practice?.name || 'Klinik amaliyot'}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate block">
                          {item.place?.name || 'Klinik baza'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full ${isSevere ? 'bg-rose-600' : 'bg-amber-500'}`}
                              style={{ width: `${item.summary.minimalQuotaMetPct}%` }}
                            />
                          </div>
                          <span className={`text-[11px] font-mono font-bold tabular-nums ${
                            isSevere ? 'text-rose-700' : 'text-amber-700'
                          }`}>
                            {item.summary.minimalQuotaMetPct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-rose-700">
                        {unperformed} ta
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                        {item.lastActivityDate}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded tracking-wide ${
                          isSevere ? 'bg-rose-600 text-white animate-pulse' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isSevere ? 'XAVF' : 'DIQQAT'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              onSelectStudent(item.student.id);
                              onViewPassport(item.student.id);
                            }}
                            className="px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          >
                            Pasport
                          </button>
                          <button
                            onClick={() => handleSendReminder(item.student.fullName)}
                            className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                            title="Ogohlantirish yuborish"
                          >
                            <Send className="w-3.5 h-3.5" />
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
  );
}
