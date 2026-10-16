import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  BarChart3,
  PieChart as PieChartIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  FileText,
  Users,
  ChevronRight,
  Filter,
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  Student,
  Group,
  PracticeAssignment,
  Practice,
  DailyJournal
} from '../../../types';
import { ActiveModule } from '../../layout/Sidebar';

interface SupervisorJournalChartsProps {
  supervisorIds: string[];
  students: Student[];
  groups: Group[];
  assignments: PracticeAssignment[];
  practices: Practice[];
  journals: DailyJournal[];
  onNavigate: (module: ActiveModule) => void;
}

export interface GroupJournalStats {
  groupId: string;
  groupName: string;
  courseLevel?: number;
  directionName?: string;
  studentCount: number;
  totalJournals: number;
  approvedCount: number;
  pendingCount: number;
  revisionCount: number;
  draftCount: number;
  expectedJournals: number;
  completionRate: number; // approved / max(1, totalJournals) * 100
  reviewRate: number; // approved / max(1, approved + pending + revision) * 100
  pendingRate: number;
}

const PIE_COLORS = {
  approved: '#10B981', // emerald-500
  pending: '#F59E0B',  // amber-500
  revision: '#F43F5E', // rose-500
  draft: '#6366F1'    // indigo-500
};

export function SupervisorJournalCharts({
  supervisorIds,
  students,
  groups,
  assignments,
  practices,
  journals,
  onNavigate
}: SupervisorJournalChartsProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'all' | 'bars' | 'pie' | 'progress'>('all');

  // Filter students assigned to this supervisor
  const supervisorStudents = useMemo(() => {
    if (supervisorIds.length === 0) return students;
    const supAssignments = assignments.filter(a => supervisorIds.includes(a.supervisorId));
    const assignedStuIds = new Set(supAssignments.map(a => a.studentId));
    const matched = students.filter(s => assignedStuIds.has(s.id) || assignedStuIds.has(s.studentId));
    return matched.length > 0 ? matched : students;
  }, [supervisorIds, assignments, students]);

  // Resolve groups assigned to supervisor
  const assignedGroups = useMemo(() => {
    const studentGroupIds = new Set(supervisorStudents.map(s => s.groupId).filter(Boolean));
    const asgGroupIds = new Set(
      assignments
        .filter(a => supervisorIds.includes(a.supervisorId))
        .map(a => a.groupId)
        .filter(Boolean) as string[]
    );
    const allIds = new Set([...studentGroupIds, ...asgGroupIds]);
    let matched = groups.filter(g => allIds.has(g.id));
    if (matched.length === 0) {
      // fallback to first 2-3 groups if empty
      matched = groups.slice(0, 3);
    }
    return matched;
  }, [supervisorStudents, assignments, supervisorIds, groups]);

  // Aggregate stats per group
  const groupStatsList = useMemo<GroupJournalStats[]>(() => {
    return assignedGroups.map(group => {
      // Students in this group belonging to supervisor (or all in group if fallback)
      let groupStudents = supervisorStudents.filter(s => s.groupId === group.id);
      if (groupStudents.length === 0) {
        groupStudents = students.filter(s => s.groupId === group.id);
      }
      const studentIds = new Set(groupStudents.map(s => s.id));

      // Daily journals for this group
      const groupJournals = journals.filter(j => {
        if (j.groupId === group.id) return true;
        if (studentIds.has(j.studentId)) return true;
        return false;
      });

      const approvedCount = groupJournals.filter(j => {
        const s = (j.status || '').toUpperCase();
        return s === 'APPROVED' || s === 'SUPERVISOR_APPROVED' || s === 'FINAL_APPROVED' || s === 'LOCKED';
      }).length;

      const pendingCount = groupJournals.filter(j => {
        const s = (j.status || '').toUpperCase();
        return s === 'PENDING' || s === 'SUBMITTED' || s === 'SUBMITTED_TO_SUPERVISOR' || s === 'OPEN';
      }).length;

      const revisionCount = groupJournals.filter(j => {
        const s = (j.status || '').toUpperCase();
        return s === 'REVISION' || s === 'RETURNED_FOR_EDIT' || s === 'REJECTED';
      }).length;

      const draftCount = groupJournals.filter(j => {
        const s = (j.status || '').toUpperCase();
        return s === 'DRAFT' || s === 'draft';
      }).length;

      const totalJournals = approvedCount + pendingCount + revisionCount + draftCount;

      // Practice expected duration
      const practice = practices[0];
      const duration = practice?.durationDays || 30;
      const expectedJournals = Math.max(totalJournals, groupStudents.length * duration);

      const completionRate = totalJournals > 0
        ? Math.round((approvedCount / totalJournals) * 100)
        : 0;

      const reviewRate = (approvedCount + pendingCount + revisionCount) > 0
        ? Math.round((approvedCount / (approvedCount + pendingCount + revisionCount)) * 100)
        : 0;

      const pendingRate = totalJournals > 0
        ? Math.round((pendingCount / totalJournals) * 100)
        : 0;

      return {
        groupId: group.id,
        groupName: group.name,
        courseLevel: group.courseId ? parseInt(group.courseId.replace(/\D/g, ''), 10) : undefined,
        studentCount: groupStudents.length || group.studentCount || 1,
        totalJournals,
        approvedCount,
        pendingCount,
        revisionCount,
        draftCount,
        expectedJournals,
        completionRate,
        reviewRate,
        pendingRate
      };
    });
  }, [assignedGroups, supervisorStudents, students, journals, practices]);

  // Overall totals across groups
  const overallTotals = useMemo(() => {
    const list = selectedGroupId === 'all' 
      ? groupStatsList 
      : groupStatsList.filter(g => g.groupId === selectedGroupId);

    const totalStudents = list.reduce((acc, curr) => acc + curr.studentCount, 0);
    const totalJournals = list.reduce((acc, curr) => acc + curr.totalJournals, 0);
    const approvedCount = list.reduce((acc, curr) => acc + curr.approvedCount, 0);
    const pendingCount = list.reduce((acc, curr) => acc + curr.pendingCount, 0);
    const revisionCount = list.reduce((acc, curr) => acc + curr.revisionCount, 0);
    const draftCount = list.reduce((acc, curr) => acc + curr.draftCount, 0);

    const completionRate = totalJournals > 0 
      ? Math.round((approvedCount / totalJournals) * 100) 
      : 0;

    const reviewRate = (approvedCount + pendingCount + revisionCount) > 0
      ? Math.round((approvedCount / (approvedCount + pendingCount + revisionCount)) * 100)
      : 0;

    return {
      totalGroups: list.length,
      totalStudents,
      totalJournals,
      approvedCount,
      pendingCount,
      revisionCount,
      draftCount,
      completionRate,
      reviewRate
    };
  }, [groupStatsList, selectedGroupId]);

  // BarChart Data format
  const barChartData = useMemo(() => {
    return groupStatsList.map(g => {
      // Short group name for tick labels (e.g. "401-A")
      const shortName = g.groupName.split(' ')[0] || g.groupName;
      return {
        name: shortName,
        fullName: g.groupName,
        talabalar: g.studentCount,
        tasdiqlangan: g.approvedCount,
        kutilmoqda: g.pendingCount,
        qaytarilgan: g.revisionCount,
        qoralama: g.draftCount,
        jami: g.totalJournals,
        foiz: g.completionRate
      };
    });
  }, [groupStatsList]);

  // PieChart Data format
  const pieChartData = useMemo(() => {
    const { approvedCount, pendingCount, revisionCount, draftCount, totalJournals } = overallTotals;
    if (totalJournals === 0) {
      return [
        { name: "Ma'lumot mavjud emas", value: 1, color: '#CBD5E1' }
      ];
    }
    return [
      { name: 'Tasdiqlangan', value: approvedCount, color: PIE_COLORS.approved },
      { name: 'Tekshiruv kutilmoqda', value: pendingCount, color: PIE_COLORS.pending },
      { name: 'Qayta ishlashda', value: revisionCount, color: PIE_COLORS.revision },
      { name: 'Qoralama', value: draftCount, color: PIE_COLORS.draft }
    ].filter(item => item.value > 0);
  }, [overallTotals]);

  // Custom Recharts Tooltip for BarChart
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700/80 text-xs min-w-[210px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="font-bold text-slate-200">{data.fullName || data.name}</span>
            <span className="font-mono text-emerald-400 font-bold">{data.foiz}% bajarildi</span>
          </div>
          <div className="space-y-1.5 font-medium">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                Tasdiqlangan:
              </span>
              <strong className="text-white font-mono">{data.tasdiqlangan} ta</strong>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
                Tekshiruvda:
              </span>
              <strong className="text-white font-mono">{data.kutilmoqda} ta</strong>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
                Qaytarilgan:
              </span>
              <strong className="text-white font-mono">{data.qaytarilgan} ta</strong>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />
                Qoralama:
              </span>
              <strong className="text-white font-mono">{data.qoralama} ta</strong>
            </div>
            <div className="border-t border-slate-800 pt-1.5 mt-1 flex justify-between text-slate-400">
              <span>Jami kundalik:</span>
              <span className="text-slate-200 font-mono">{data.jami} ta ({data.talabalar} talaba)</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Recharts Tooltip for PieChart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percent = overallTotals.totalJournals > 0
        ? Math.round((data.value / overallTotals.totalJournals) * 100)
        : 0;
      return (
        <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-700/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.color }} />
            <span className="font-bold">{data.name}:</span>
            <span className="font-mono text-emerald-300 font-bold">{data.value} ta ({percent}%)</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Guruhlar kesimida elektron kundaliklar bajarilishi
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Biriktirilgan guruhlar bo‘yicha talabalarning kundalik topshirish va tasdiqlanish ko‘rsatkichlari
          </p>
        </div>

        {/* View Mode Controls & Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Group Filter */}
          <div className="relative">
            <select
              value={selectedGroupId}
              onChange={e => setSelectedGroupId(e.target.value)}
              className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 pr-7 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer appearance-none"
            >
              <option value="all">Barcha guruhlar ({groupStatsList.length})</option>
              {groupStatsList.map(g => (
                <option key={g.groupId} value={g.groupId}>
                  {g.groupName}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* View Mode Toggle Buttons */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('all')}
              title="Kombinatsiyalangan ko'rinish"
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'all'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Barchasi</span>
            </button>
            <button
              onClick={() => setViewMode('bars')}
              title="Ustunli grafik (BarChart)"
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'bars'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Taqqoslash</span>
            </button>
            <button
              onClick={() => setViewMode('pie')}
              title="Aylana diagramma (PieChart)"
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'pie'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Uluslar</span>
            </button>
            <button
              onClick={() => setViewMode('progress')}
              title="Guruhlar progress panellari"
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'progress'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Progress</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Journals */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jami kundaliklar</span>
            <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{overallTotals.totalJournals} ta</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block font-medium">
            {overallTotals.totalStudents} nafar talaba bo‘yicha
          </span>
        </div>

        {/* Approved */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Tasdiqlangan</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">{overallTotals.approvedCount} ta</span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded-md">
              {overallTotals.completionRate}%
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5 block font-medium">
            Muvaffaqiyatli qabul qilingan
          </span>
        </div>

        {/* Pending Review */}
        <div
          onClick={() => onNavigate('daily_journal')}
          className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Tekshiruv kutilmoqda</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:rotate-45 transition-transform" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700 dark:text-amber-400 font-mono">{overallTotals.pendingCount} ta</span>
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center">
              Tekshirish →
            </span>
          </div>
          <span className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5 block font-medium">
            Rahbar xulosasini kutmoqda
          </span>
        </div>

        {/* Revision / Qaytarilgan */}
        <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/50">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">Qayta ishlashda</span>
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-700 dark:text-rose-400 font-mono">{overallTotals.revisionCount} ta</span>
          </div>
          <span className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5 block font-medium">
            Izoh bilan qaytarilgan
          </span>
        </div>
      </div>

      {/* Visual Recharts Charts Section */}
      {(viewMode === 'all' || viewMode === 'bars' || viewMode === 'pie') && (
        <div className={`grid gap-5 ${
          viewMode === 'all' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'
        }`}>
          {/* Recharts BarChart: Group Comparison */}
          {(viewMode === 'all' || viewMode === 'bars') && (
            <div className={`p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 ${
              viewMode === 'all' ? 'lg:col-span-7' : 'w-full'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    Guruhlar bo‘yicha kundaliklar taqqoslanishi
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Tasdiqlangan, tekshiruvda va qaytarilgan kundaliklar soni
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  {barChartData.length} ta guruh
                </span>
              </div>

              <div className="w-full h-72 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barChartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94A3B8" opacity={0.25} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                      axisLine={{ stroke: '#94A3B8', opacity: 0.3 }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#64748B', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ paddingBottom: 10, fontSize: 11 }}
                    />
                    <Bar
                      dataKey="tasdiqlangan"
                      name="Tasdiqlangan"
                      fill={PIE_COLORS.approved}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={36}
                    />
                    <Bar
                      dataKey="kutilmoqda"
                      name="Tekshiruvda"
                      fill={PIE_COLORS.pending}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={36}
                    />
                    <Bar
                      dataKey="qaytarilgan"
                      name="Qaytarilgan"
                      fill={PIE_COLORS.revision}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={36}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recharts PieChart: Status Distribution Donut */}
          {(viewMode === 'all' || viewMode === 'pie') && (
            <div className={`p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between ${
              viewMode === 'all' ? 'lg:col-span-5' : 'w-full'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <PieChartIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Kundaliklar holati taqsimoti
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedGroupId === 'all' ? 'Barcha guruhlar' : 'Tanlangan guruh'} umumiy ulushi
                  </p>
                </div>
              </div>

              {/* Donut Chart with Centered Rate */}
              <div className="relative w-full h-56 sm:h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={88}
                      paddingAngle={4}
                      strokeWidth={2}
                      stroke="currentColor"
                      className="text-white dark:text-slate-900"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Stats in Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                    {overallTotals.completionRate}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Tasdiqlangan
                  </span>
                </div>
              </div>

              {/* Clean Legend Badges */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/60 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">Tasdiqlangan</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">{overallTotals.approvedCount} ta</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">Tekshiruvda</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">{overallTotals.pendingCount} ta</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">Qaytarilgan</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">{overallTotals.revisionCount} ta</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="w-3 h-3 rounded-full bg-indigo-500 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">Qoralama</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">{overallTotals.draftCount} ta</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Visual Multi-Segment Progress Bars for Each Group */}
      {(viewMode === 'all' || viewMode === 'progress') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Guruhlar bo‘yicha batafsil bajarilish progress paneli
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Barcha biriktirilgan talabalar kesimida
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {groupStatsList
              .filter(g => selectedGroupId === 'all' || g.groupId === selectedGroupId)
              .map(group => {
                const total = Math.max(1, group.totalJournals);
                const approvedWidth = Math.round((group.approvedCount / total) * 100);
                const pendingWidth = Math.round((group.pendingCount / total) * 100);
                const revisionWidth = Math.round((group.revisionCount / total) * 100);
                const draftWidth = Math.round((group.draftCount / total) * 100);

                const isGood = group.completionRate >= 75;
                const isMedium = group.completionRate >= 50 && group.completionRate < 75;

                return (
                  <div
                    key={group.groupId}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      {/* Group Header & Completion Badge */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                              {group.groupName}
                            </h4>
                            {group.courseLevel && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {group.courseLevel}-kurs
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Biriktirilgan: <strong className="text-slate-700 dark:text-slate-300">{group.studentCount} nafar talaba</strong>
                          </p>
                        </div>

                        {/* Completion Badge */}
                        <div className={`px-2.5 py-1 rounded-xl text-xs font-black font-mono flex items-center gap-1 shrink-0 ${
                          isGood 
                            ? 'bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800/80' 
                            : isMedium 
                            ? 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/80' 
                            : 'bg-rose-100/80 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300/80 dark:border-rose-800/80'
                        }`}>
                          <span>{group.completionRate}%</span>
                          <span className="text-[10px] font-normal uppercase">bajarildi</span>
                        </div>
                      </div>

                      {/* Multi-Segment Visual Progress Bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden flex shadow-inner mt-2">
                        {approvedWidth > 0 && (
                          <div
                            style={{ width: `${approvedWidth}%` }}
                            className="bg-emerald-500 hover:bg-emerald-600 transition-all"
                            title={`Tasdiqlangan: ${group.approvedCount} ta (${approvedWidth}%)`}
                          />
                        )}
                        {pendingWidth > 0 && (
                          <div
                            style={{ width: `${pendingWidth}%` }}
                            className="bg-amber-500 hover:bg-amber-600 transition-all"
                            title={`Tekshiruv kutilmoqda: ${group.pendingCount} ta (${pendingWidth}%)`}
                          />
                        )}
                        {revisionWidth > 0 && (
                          <div
                            style={{ width: `${revisionWidth}%` }}
                            className="bg-rose-500 hover:bg-rose-600 transition-all"
                            title={`Qayta ishlashda: ${group.revisionCount} ta (${revisionWidth}%)`}
                          />
                        )}
                        {draftWidth > 0 && (
                          <div
                            style={{ width: `${draftWidth}%` }}
                            className="bg-indigo-400 hover:bg-indigo-500 transition-all"
                            title={`Qoralama: ${group.draftCount} ta (${draftWidth}%)`}
                          />
                        )}
                      </div>

                      {/* Progress Metrics Grid */}
                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 mt-2.5 gap-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Tasdiqlangan: <strong className="text-slate-900 dark:text-slate-200 font-mono">{group.approvedCount}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          <span>Kutilmoqda: <strong className="text-slate-900 dark:text-slate-200 font-mono">{group.pendingCount}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          <span>Qaytarilgan: <strong className="text-slate-900 dark:text-slate-200 font-mono">{group.revisionCount}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-500" />
                          <span>Jami: <strong className="text-slate-900 dark:text-slate-200 font-mono">{group.totalJournals}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Action button */}
                    <button
                      onClick={() => onNavigate('daily_journal')}
                      className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-800 dark:hover:text-teal-300 hover:border-teal-300 dark:hover:border-teal-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer group"
                    >
                      <span>Kundaliklarni ko‘rish va tasdiqlash</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Footer Banner with Quick Call to Action */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-2xl p-4 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white">
              Kutilayotgan tekshiruvlar: {overallTotals.pendingCount} ta kundalik
            </h4>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Talabalar tomonidan topshirilgan kundaliklarni ko‘rib chiqib baholang yoki izoh bilan qaytaring
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('daily_journal')}
          className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap self-stretch sm:self-auto justify-center"
        >
          <span>Kundaliklarni tekshirish</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
