import React, { useState, useMemo } from 'react';
import {
  Stethoscope,
  Plus,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Flame,
  Award,
  TrendingUp,
  Clock,
  Printer,
  FileSpreadsheet,
  CheckCheck,
  Edit2,
  Trash2,
  Eye,
  UserCheck,
  Activity,
  Layers,
  Sparkles,
  BookOpen,
  Calendar,
  XCircle,
  FolderOpen
} from 'lucide-react';
import { Skill, StudentSkill, SkillLogEntry, Student, UserRole } from '../../../types';
import { storageService } from '../../../services/storageService';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { StatusBadge } from '../../common/Badge';
import { SkillLogModal } from './SkillLogModal';
import { SkillCreateModal } from './SkillCreateModal';
import { SkillReviewModal } from './SkillReviewModal';
import { SkillPassportPrintModal } from './SkillPassportPrintModal';

export function SkillsModule() {
  const { showToast } = useToast();
  const { currentUser, role, canonicalRole } = useAuth();

  // Role detection
  const isStudent = canonicalRole === 'STUDENT' || role === 'student';
  const isSupervisor = canonicalRole === 'PRACTICE_SUPERVISOR' || role === 'supervisor';
  const isClinicResponsible = canonicalRole === 'CLINIC_RESPONSIBLE' || role === 'clinic_responsible';
  const isFacultyDean = canonicalRole === 'FACULTY_DEAN' || role === 'dean';
  const isHeadOrAdmin = canonicalRole === 'PRACTICE_HEAD' || canonicalRole === 'SUPER_ADMIN' || canonicalRole === 'PRACTICE_STAFF' || role === 'dept_head' || role === 'super_admin' || role === 'dept_staff';

  const [skillsVersion, setSkillsVersion] = useState(0);
  const refreshData = () => setSkillsVersion(v => v + 1);

  // Raw data from storage
  const allSkills = storageService.getSkills();
  const allStudents = storageService.getStudents();
  const allAssignments = storageService.getPracticeAssignments();
  const allSupervisors = storageService.getSupervisors();
  const allPracticePlaces = storageService.getPracticePlaces();
  const allCategories = storageService.getSkillCategories();
  const allLogs = storageService.getSkillLogs();

  // Determine current student for student role
  const currentStudentId = useMemo(() => {
    if (isStudent && currentUser) {
      const match = allStudents.find(s => s.userId === currentUser.uid || s.email === currentUser.email);
      if (match) return match.id;
    }
    return allStudents[0]?.id || 'std-1';
  }, [isStudent, currentUser, allStudents]);

  // Selected student for supervisor / admin view
  const [selectedStudentId, setSelectedStudentId] = useState<string>(currentStudentId);

  // Active Tab
  // For student: 'passport' | 'logbook'
  // For supervisor: 'review_queue' | 'passport' | 'logbook'
  // For admin: 'students_monitoring' | 'passport' | 'catalog' | 'logbook'
  const defaultTab = isStudent ? 'passport' : (isSupervisor || isClinicResponsible) ? 'review_queue' : 'students_monitoring';
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [facultyFilter, setFacultyFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');

  // Modals state
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedSkillForLog, setSelectedSkillForLog] = useState<Skill | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [skillToEdit, setSkillToEdit] = useState<Skill | null>(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [logToReview, setLogToReview] = useState<SkillLogEntry | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printTargetStudentId, setPrintTargetStudentId] = useState<string>(selectedStudentId);

  // Passport Summary for currently viewed student
  const effectiveStudentId = isStudent ? currentStudentId : selectedStudentId;
  const studentPassport = useMemo(() => {
    return storageService.getStudentPassportSummary(effectiveStudentId);
  }, [effectiveStudentId, skillsVersion]);

  // Pending logs for supervisor queue
  const pendingLogs = useMemo(() => {
    let logs = storageService.getSkillLogs({ status: 'PENDING' });
    if (isSupervisor && currentUser) {
      const sup = allSupervisors.find(s => s.userId === currentUser.uid);
      if (sup) {
        logs = logs.filter(l => l.supervisorId === sup.id);
      }
    }
    return logs;
  }, [allSupervisors, currentUser, isSupervisor, skillsVersion]);

  // Filtered skills for passport table
  const filteredPassportSkills = useMemo(() => {
    return studentPassport.detailedSkills.filter(item => {
      if (selectedCategory !== 'all' && item.skill.category !== selectedCategory) {
        return false;
      }
      if (statusFilter !== 'all') {
        if (statusFilter === 'completed' && !item.isMastered) return false;
        if (statusFilter === 'in_progress' && (item.isMastered || item.performedCount === 0)) return false;
        if (statusFilter === 'not_started' && item.performedCount > 0) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.skill.name.toLowerCase().includes(q) ||
          item.skill.category.toLowerCase().includes(q) ||
          item.skill.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [studentPassport, selectedCategory, statusFilter, searchQuery]);

  // Filtered logs for logbook tab
  const filteredLogs = useMemo(() => {
    let logs = allLogs;
    if (isStudent) {
      logs = logs.filter(l => l.studentId === currentStudentId);
    } else if (selectedStudentId && activeTab === 'passport') {
      logs = logs.filter(l => l.studentId === selectedStudentId);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      logs = logs.filter(l => {
        const sk = allSkills.find(s => s.id === l.skillId);
        const std = allStudents.find(s => s.id === l.studentId);
        return (
          sk?.name.toLowerCase().includes(q) ||
          std?.fullName.toLowerCase().includes(q) ||
          l.notes?.toLowerCase().includes(q)
        );
      });
    }

    return logs;
  }, [allLogs, isStudent, currentStudentId, selectedStudentId, activeTab, searchQuery, allSkills, allStudents]);

  // All Students summary for Admin / Dean monitoring table
  const studentsMonitoringList = useMemo(() => {
    return allStudents.map(std => {
      const summary = storageService.getStudentPassportSummary(std.id);
      const asg = allAssignments.find(a => a.studentId === std.id);
      const place = allPracticePlaces.find(p => p.id === asg?.practicePlaceId);
      const sup = allSupervisors.find(s => s.id === asg?.supervisorId);

      return {
        student: std,
        summary,
        assignment: asg,
        place,
        supervisor: sup
      };
    }).filter(item => {
      if (groupFilter !== 'all' && item.student.groupId !== groupFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.student.fullName.toLowerCase().includes(q) ||
          item.student.studentId.toLowerCase().includes(q) ||
          item.student.groupId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allStudents, allAssignments, allPracticePlaces, allSupervisors, groupFilter, searchQuery, skillsVersion]);

  // Batch approve handler
  const handleBatchApprovePending = () => {
    if (pendingLogs.length === 0) return;
    const logIds = pendingLogs.map(l => l.id);
    const result = storageService.batchReviewSkillLogs({
      logIds,
      status: 'APPROVED',
      rating: 5,
      feedback: "Barcha ko'nikmalar to'liq tasdiqlandi.",
      reviewerName: currentUser?.fullName || 'Mas\'ul rahbar',
      reviewerId: currentUser?.id,
      actorUserId: currentUser?.id,
      actorRole: canonicalRole
    });

    if (result.success) {
      showToast('success', 'Barchasi tasdiqlandi', `${result.updatedCount} ta ko'nikma hisoboti tasdiqlandi.`);
      refreshData();
    }
  };

  const handleDeleteSkill = (skill: Skill) => {
    if (window.confirm(`Haqiqatan ham "${skill.name}" ko'nikmasini katalogdan o'chirmoqchimisiz?`)) {
      storageService.deleteSkill(skill.id, currentUser?.id, canonicalRole);
      showToast('info', 'Ko\'nikma o\'chirildi', `"${skill.name}" muvaffaqiyatli olib tashlandi.`);
      refreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                Amaliy ko'nikmalar pasporti
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Skills Logbook
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Klinik manipulyatsiyalar, muolajalar va amaliy me'yorlar monitoringi
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {isStudent && (
            <button
              onClick={() => {
                setSelectedSkillForLog(null);
                setIsLogModalOpen(true);
              }}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Bajarishni qayd etish</span>
            </button>
          )}

          {isHeadOrAdmin && (
            <button
              onClick={() => {
                setSkillToEdit(null);
                setIsCreateModalOpen(true);
              }}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Yangi ko'nikma</span>
            </button>
          )}

          <button
            onClick={() => {
              setPrintTargetStudentId(effectiveStudentId);
              setIsPrintModalOpen(true);
            }}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Rasmiy pasport (Chop etish)</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary Cards (Section 3) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Jami ko'nikmalar
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {studentPassport.totalSkills}
            </span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Tibbiy katalog me'yori</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
            Bajarilgan (100%)
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-700">
              {studentPassport.completedSkills}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">To'liq o'zlashtirilgan</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
            Tasdiqlangan
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-blue-700">
              {studentPassport.totalApprovedCount}
            </span>
            <CheckCheck className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Rahbar imzosi bilan</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider block">
            Jarayonda
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-indigo-700">
              {studentPassport.inProgressSkills}
            </span>
            <Activity className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Boshlangan manipulyatsiyalar</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
            Bajarilmagan
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-700">
              {studentPassport.notStartedSkills}
            </span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Hali qayd etilmagan</span>
        </div>

        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
            Me'yor bajarilishi
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-blue-700">
              {studentPassport.minimalQuotaMetPct}%
            </span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <div className="w-full bg-blue-200/60 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${studentPassport.minimalQuotaMetPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Student context selector (for supervisor/admin) */}
      {!isStudent && (
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <label className="font-semibold text-slate-700 whitespace-nowrap">
              Ko'rilayotgan talaba:
            </label>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
            >
              {allStudents.map(s => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.studentId}) — {s.groupId}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 text-slate-500 text-[11px]">
            <span>Klinik baza: <strong>{studentPassport.practicePlace?.name || 'Respublika 1-son Shifoxonasi'}</strong></span>
            <span>·</span>
            <span>Bo'lim: <strong>{studentPassport.assignment?.department || 'Terapiya'}</strong></span>
            <span>·</span>
            <span>Rahbar: <strong>{studentPassport.supervisor?.fullName || 'Dr. Karimov'}</strong></span>
          </div>
        </div>
      )}

      {/* 3. Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-1 overflow-x-auto">
          {!isStudent && isHeadOrAdmin && (
            <button
              onClick={() => setActiveTab('students_monitoring')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'students_monitoring'
                  ? 'border-blue-600 text-blue-700 bg-blue-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Talabalar monitoringi ({allStudents.length})</span>
            </button>
          )}

          {(!isStudent) && (
            <button
              onClick={() => setActiveTab('review_queue')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'review_queue'
                  ? 'border-blue-600 text-blue-700 bg-blue-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>Tasdiqlash navbati</span>
              {pendingLogs.length > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-mono font-bold animate-pulse">
                  {pendingLogs.length}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setActiveTab('passport')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'passport'
                ? 'border-blue-600 text-blue-700 bg-blue-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Ko'nikmalar pasporti jadvali</span>
          </button>

          <button
            onClick={() => setActiveTab('logbook')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'logbook'
                ? 'border-blue-600 text-blue-700 bg-blue-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Bajarishlar tarixi (Logbook)</span>
          </button>

          {isHeadOrAdmin && (
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'catalog'
                  ? 'border-blue-600 text-blue-700 bg-blue-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>Ko'nikmalar katalogi ({allSkills.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Category Tabs & Search Bar */}
      {(activeTab === 'passport' || activeTab === 'catalog') && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Ko'nikma nomi yoki tavsifi bo'yicha..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Categories Pill/Tab Bar */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Barchasi
            </button>
            {allCategories.slice(0, 8).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT: Passport Table (Section 4) */}
      {activeTab === 'passport' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-700 border-b border-slate-200 font-semibold">
                  <th className="py-3 px-3 text-center w-10">№</th>
                  <th className="py-3 px-4 min-w-[220px]">Ko‘nikma nomi</th>
                  <th className="py-3 px-3 min-w-[130px]">Kategoriya</th>
                  <th className="py-3 px-3 text-center min-w-[70px]">Me‘yor</th>
                  <th className="py-3 px-3 text-center min-w-[70px] font-bold text-slate-900">Bajarilgan</th>
                  <th className="py-3 px-3 text-center min-w-[70px] text-blue-700">Mustaqil</th>
                  <th className="py-3 px-3 text-center min-w-[70px] text-indigo-700">Nazorat</th>
                  <th className="py-3 px-3 text-center min-w-[70px] text-amber-700">Kuzatuv</th>
                  <th className="py-3 px-3 text-center min-w-[80px] text-emerald-700 font-bold">Tasdiqlangan</th>
                  <th className="py-3 px-3 min-w-[140px]">Progress</th>
                  <th className="py-3 px-3 text-center min-w-[100px]">Holat</th>
                  <th className="py-3 px-3 text-right min-w-[100px]">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPassportSkills.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-8 text-center text-xs text-slate-400">
                      Ko'rsatilgan filtrlar bo'yicha ko'nikmalar topilmadi.
                    </td>
                  </tr>
                ) : (
                  filteredPassportSkills.map(item => (
                    <tr
                      key={item.skill.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-3 text-center font-mono text-slate-400 font-medium">
                        {item.number}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block leading-snug">
                          {item.skill.name}
                        </span>
                        <span className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {item.skill.description}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] font-medium text-slate-600">
                          {item.skill.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-700">
                        {item.requiredCount}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                        {item.performedCount}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-blue-700 font-medium">
                        {item.independentCount}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-indigo-700 font-medium">
                        {item.supervisedCount}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-amber-700 font-medium">
                        {item.observedCount}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                        {item.approvedCount}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                item.isMastered ? 'bg-emerald-500' : 'bg-blue-600'
                              }`}
                              style={{ width: `${item.progressPct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono font-bold text-slate-700 tabular-nums w-8">
                            {item.progressPct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <StatusBadge
                          label={
                            item.status === 'BAJARILDI' ? "Bajarildi" :
                            item.status === 'JARAYONDA' ? "Jarayonda" :
                            "Boshlanmagan"
                          }
                          variant={
                            item.status === 'BAJARILDI' ? "success" :
                            item.status === 'JARAYONDA' ? "info" :
                            "neutral"
                          }
                        />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedSkillForLog(item.skill);
                            setIsLogModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
                        >
                          + Qayd etish
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TAB CONTENT: Supervisor Review Queue (Section 9) */}
      {activeTab === 'review_queue' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Tekshiruv kutilayotgan ko'nikma yozuvlari</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-mono font-bold">
                  {pendingLogs.length} ta
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Talabalar bajargan klinik muolajalarini tasdiqlash yoki qayta ishlashga yuborish
              </p>
            </div>

            {pendingLogs.length > 0 && (
              <button
                onClick={handleBatchApprovePending}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Barchasini tasdiqlash ({pendingLogs.length})</span>
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                  <th className="py-3 px-3 text-center w-10">№</th>
                  <th className="py-3 px-4">Talaba</th>
                  <th className="py-3 px-4">Ko'nikma</th>
                  <th className="py-3 px-3">Sana</th>
                  <th className="py-3 px-3">Bajarish turi</th>
                  <th className="py-3 px-3 text-center">Soni</th>
                  <th className="py-3 px-4">Tavsif / Izoh</th>
                  <th className="py-3 px-3 text-center">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      Ayni paytda tekshirilmagan yangi yozuvlar yo'q. Barcha ko'nikmalar ko'rib chiqilgan.
                    </td>
                  </tr>
                ) : (
                  pendingLogs.map((log, idx) => {
                    const std = allStudents.find(s => s.id === log.studentId);
                    const sk = allSkills.find(s => s.id === log.skillId);

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 text-center font-mono text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block truncate">
                            {std?.fullName || log.studentId}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {std?.groupId} · {std?.studentId}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800 block">
                            {sk?.name || log.skillId}
                          </span>
                          <span className="text-[11px] text-blue-700">
                            {sk?.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700">
                          {log.date}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                            log.participationType === 'INDEPENDENT' ? 'bg-blue-50 text-blue-700' :
                            log.participationType === 'SUPERVISED' ? 'bg-indigo-50 text-indigo-700' :
                            'bg-amber-50 text-amber-700'
                          }`}>
                            {log.participationType}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                          {log.count}
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <p className="text-slate-700 line-clamp-2 text-xs">
                            {log.notes}
                          </p>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => {
                              setLogToReview(log);
                              setIsReviewModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition-colors"
                          >
                            Tekshirish
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. TAB CONTENT: Logbook / History */}
      {activeTab === 'logbook' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">
              Bajarilgan ishlar jurnali ({filteredLogs.length} ta yozuv)
            </span>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/60 text-slate-600 border-b border-slate-200 font-semibold">
                <th className="py-2.5 px-3 text-center w-10">№</th>
                <th className="py-2.5 px-3 w-28">Sana</th>
                {!isStudent && <th className="py-2.5 px-3">Talaba</th>}
                <th className="py-2.5 px-4">Ko'nikma</th>
                <th className="py-2.5 px-3">Ishtirok turi</th>
                <th className="py-2.5 px-2 text-center w-12">Soni</th>
                <th className="py-2.5 px-4">Izoh / Muolaja tafsiloti</th>
                <th className="py-2.5 px-3 text-center">Holat</th>
                <th className="py-2.5 px-3">Rahbar bahosi</th>
                <th className="py-2.5 px-3 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 text-xs">
                    Hozircha hech qanday ko'nikma qayd etilmagan.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => {
                  const sk = allSkills.find(s => s.id === log.skillId);
                  const std = allStudents.find(s => s.id === log.studentId);

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">
                        {log.date}
                      </td>
                      {!isStudent && (
                        <td className="py-2.5 px-3 font-medium text-slate-900">
                          {std?.fullName || log.studentId}
                        </td>
                      )}
                      <td className="py-2.5 px-4 font-semibold text-slate-800">
                        {sk?.name || log.skillId}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] font-medium text-slate-600">
                          {log.participationType}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-900">
                        {log.count}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700 text-xs max-w-xs">
                        <p className="line-clamp-2">{log.notes || '—'}</p>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <StatusBadge
                          label={
                            log.status === 'APPROVED' ? "Tasdiqlangan" :
                            log.status === 'REJECTED' ? "Qaytarilgan" :
                            "Tekshiruvda"
                          }
                          variant={
                            log.status === 'APPROVED' ? "success" :
                            log.status === 'REJECTED' ? "danger" :
                            "warning"
                          }
                        />
                      </td>
                      <td className="py-2.5 px-3 text-xs">
                        {log.status === 'APPROVED' ? (
                          <div>
                            <span className="font-bold text-amber-600">★ {log.supervisorRating || 5}/5</span>
                            <span className="text-[11px] text-slate-500 block truncate max-w-[150px]">
                              {log.supervisorFeedback || 'A\'lo'}
                            </span>
                          </div>
                        ) : log.status === 'REJECTED' ? (
                          <span className="text-rose-600 text-[11px] truncate max-w-[150px] block">
                            {log.supervisorFeedback || 'Qayta bajarilsin'}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Kutilmoqda</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {(isSupervisor || isHeadOrAdmin || isClinicResponsible) && log.status === 'PENDING' ? (
                          <button
                            onClick={() => {
                              setLogToReview(log);
                              setIsReviewModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded"
                          >
                            Tekshirish
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setLogToReview(log);
                              setIsReviewModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-700"
                            title="Batafsil ko'rish"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 8. TAB CONTENT: Admin / Dean Students Monitoring Table */}
      {activeTab === 'students_monitoring' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-800">
              Talabalar amaliy ko'nikmalar pasporti monitoringi ({studentsMonitoringList.length} nafar talaba)
            </span>

            <div className="flex items-center gap-2">
              <label className="text-slate-500 text-xs">Guruh:</label>
              <select
                value={groupFilter}
                onChange={e => setGroupFilter(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-300 rounded bg-white"
              >
                <option value="all">Barcha guruhlar</option>
                <option value="grp-401">401-guruh</option>
                <option value="grp-402">402-guruh</option>
                <option value="grp-301">301-guruh</option>
              </select>
            </div>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/60 text-slate-600 border-b border-slate-200 font-semibold">
                <th className="py-3 px-3 text-center w-10">№</th>
                <th className="py-3 px-4">Talaba F.I.Sh.</th>
                <th className="py-3 px-3">Guruh</th>
                <th className="py-3 px-4">Klinik baza</th>
                <th className="py-3 px-3">Mas'ul rahbar</th>
                <th className="py-3 px-3 text-center">Bajarilgan me'yor</th>
                <th className="py-3 px-4 min-w-[140px]">Progress</th>
                <th className="py-3 px-3 text-center">Holat</th>
                <th className="py-3 px-3 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentsMonitoringList.map((item, idx) => (
                <tr key={item.student.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 text-center font-mono text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block truncate">
                      {item.student.fullName}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      ID: {item.student.studentId}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-700">
                    {item.student.groupId}
                  </td>
                  <td className="py-3 px-4 text-slate-700 truncate max-w-xs">
                    {item.place?.name || 'Klinik baza'}
                  </td>
                  <td className="py-3 px-3 text-slate-700 truncate">
                    {item.supervisor?.fullName || 'Dr. Karimov'}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                    {item.summary.completedSkills} / {item.summary.totalSkills} ta
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${
                            item.summary.minimalQuotaMetPct >= 100 ? 'bg-emerald-600' : 'bg-blue-600'
                          }`}
                          style={{ width: `${item.summary.minimalQuotaMetPct}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono font-bold text-slate-800 tabular-nums">
                        {item.summary.minimalQuotaMetPct}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <StatusBadge
                      label={
                        item.summary.minimalQuotaMetPct >= 100 ? "Me'yor bajarildi" :
                        item.summary.completedSkills > 0 ? "Jarayonda" : "Boshlanmagan"
                      }
                      variant={
                        item.summary.minimalQuotaMetPct >= 100 ? "success" :
                        item.summary.completedSkills > 0 ? "info" : "neutral"
                      }
                    />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedStudentId(item.student.id);
                          setActiveTab('passport');
                        }}
                        className="px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-50 rounded"
                      >
                        Pasport
                      </button>
                      <button
                        onClick={() => {
                          setPrintTargetStudentId(item.student.id);
                          setIsPrintModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-800"
                        title="Chop etish"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 9. TAB CONTENT: Skills Catalog Management (Section 5 & 6) */}
      {activeTab === 'catalog' && isHeadOrAdmin && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900">
              O'quv rejasidagi klinik ko'nikmalar katalogi ({allSkills.length} ta)
            </span>
            <button
              onClick={() => {
                setSkillToEdit(null);
                setIsCreateModalOpen(true);
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yangi ko'nikma</span>
            </button>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/60 text-slate-700 border-b border-slate-200 font-semibold">
                <th className="py-3 px-3 text-center w-10">№</th>
                <th className="py-3 px-4 min-w-[220px]">Ko'nikma nomi</th>
                <th className="py-3 px-3">Kategoriya</th>
                <th className="py-3 px-3 text-center">Minimal me'yor</th>
                <th className="py-3 px-3 text-center">Tavsiya soni</th>
                <th className="py-3 px-3">Kurs & Fani</th>
                <th className="py-3 px-3 text-center">Muhimlik</th>
                <th className="py-3 px-3 text-center">Holat</th>
                <th className="py-3 px-3 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allSkills.map((sk, idx) => (
                <tr key={sk.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 text-center font-mono text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">
                      {sk.name}
                    </span>
                    <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {sk.description}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {sk.category}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                    {sk.requiredCount}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-600">
                    {sk.recommendedCount || '—'}
                  </td>
                  <td className="py-3 px-3 text-slate-600 text-[11px]">
                    {sk.course ? `${sk.course}-kurs · ` : ''}{sk.practiceType || 'Klinik amaliyot'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {sk.importance || 'MANDATORY'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      sk.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {sk.isActive ? 'Faol' : 'Nofaol'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setSkillToEdit(sk);
                          setIsCreateModalOpen(true);
                        }}
                        className="p-1 text-slate-500 hover:text-blue-600"
                        title="Tahrirlash"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSkill(sk)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {isLogModalOpen && (
        <SkillLogModal
          isOpen={isLogModalOpen}
          onClose={() => {
            setIsLogModalOpen(false);
            setSelectedSkillForLog(null);
          }}
          onSuccess={refreshData}
          preselectedSkill={selectedSkillForLog}
          studentId={effectiveStudentId}
        />
      )}

      {isCreateModalOpen && (
        <SkillCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setSkillToEdit(null);
          }}
          onSuccess={refreshData}
          editSkill={skillToEdit}
          actorUserId={currentUser?.id}
          actorRole={canonicalRole}
        />
      )}

      {isReviewModalOpen && logToReview && (
        <SkillReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setLogToReview(null);
          }}
          onSuccess={refreshData}
          log={logToReview}
          currentUserFullName={currentUser?.fullName || 'Mas\'ul rahbar'}
          currentUserId={currentUser?.id || 'system'}
          currentUserRole={canonicalRole}
        />
      )}

      {isPrintModalOpen && (
        <SkillPassportPrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          studentId={printTargetStudentId}
        />
      )}
    </div>
  );
}
