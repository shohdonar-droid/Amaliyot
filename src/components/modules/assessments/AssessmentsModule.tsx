import React, { useState, useMemo } from 'react';
import {
  Award,
  GraduationCap,
  Users,
  Search,
  Filter,
  Plus,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  Settings,
  Sparkles,
  Calendar,
  Building2,
  UserCheck,
  RefreshCw,
  ChevronRight,
  TrendingUp,
  FileText,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import {
  Student,
  Practice,
  Assessment,
  FinalExam,
  AttestationCommission,
  AssessmentSettings,
  AssessmentStatus
} from '../../../types';
import { storageService } from '../../../services/storageService';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

// Subcomponents & Modals
import { StudentAssessmentModal } from './StudentAssessmentModal';
import { FinalExamScheduleModal } from './FinalExamScheduleModal';
import { FinalExamGradingModal } from './FinalExamGradingModal';
import { RetakeModal } from './RetakeModal';
import { OfficialVedomostPrintModal } from './OfficialVedomostPrintModal';
import { StudentIndividualCertificateModal } from './StudentIndividualCertificateModal';
import { AttestationCommissionModal } from './AttestationCommissionModal';
import { StudentAttestationCabinetView } from './StudentAttestationCabinetView';

export function AssessmentsModule() {
  const { currentUser, role } = useAuth();
  const { showToast } = useToast();

  const isStudent = role === 'STUDENT' || role === 'student';

  // Master Data
  const practices = storageService.getPractices();
  const allStudents = storageService.getStudents();
  const faculties = storageService.getFaculties();
  const groups = storageService.getGroups();
  const assignments = storageService.getPracticeAssignments();

  // Selected State
  const [selectedPracticeId, setSelectedPracticeId] = useState<string>(practices[0]?.id || 'prac-1');
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'students' | 'exams' | 'commissions' | 'settings'>('students');

  // Trigger re-renders
  const [refreshKey, setRefreshKey] = useState(0);
  const reloadData = () => setRefreshKey(k => k + 1);

  // Modals state
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<Student | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  const [isExamScheduleOpen, setIsExamScheduleOpen] = useState(false);
  const [scheduleForStudentId, setScheduleForStudentId] = useState<string | undefined>(undefined);

  const [gradingExam, setGradingExam] = useState<FinalExam | null>(null);
  const [isGradingOpen, setIsGradingOpen] = useState(false);

  const [retakeAssessment, setRetakeAssessment] = useState<Assessment | null>(null);
  const [isRetakeOpen, setIsRetakeOpen] = useState(false);

  const [isVedomostOpen, setIsVedomostOpen] = useState(false);

  const [certStudent, setCertStudent] = useState<Student | null>(null);
  const [certAssessment, setCertAssessment] = useState<Assessment | null>(null);
  const [isCertOpen, setIsCertOpen] = useState(false);

  const [commissionToEdit, setCommissionToEdit] = useState<AttestationCommission | null>(null);
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);

  // Settings tab form state
  const initialSettings = storageService.getAssessmentSettings();
  const [settingsForm, setSettingsForm] = useState<AssessmentSettings>(initialSettings);

  // If currentUser is a STUDENT, render Student cabinet view directly
  if (isStudent) {
    const studentRecord = allStudents.find(
      s => s.userId === currentUser?.id || s.email === currentUser?.email
    ) || allStudents[0];

    if (!studentRecord) {
      return (
        <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          Talaba profili ma'lumotlari topilmadi.
        </div>
      );
    }

    return <StudentAttestationCabinetView student={studentRecord} />;
  }

  // Active Practice & Students
  const selectedPractice = practices.find(p => p.id === selectedPracticeId) || practices[0];

  // Assessments for selected practice
  const assessments = useMemo(() => {
    return storageService.getAssessments({ practiceId: selectedPractice?.id });
  }, [selectedPractice?.id, refreshKey]);

  // KPIs
  const kpis = useMemo(() => {
    return storageService.getAttestationKPIs(selectedPractice?.id);
  }, [selectedPractice?.id, refreshKey]);

  // Practice Students
  const practiceStudents = useMemo(() => {
    return allStudents.filter(s => {
      const hasAsg = assignments.some(a => a.studentId === s.id && a.practiceId === selectedPractice?.id);
      const inGroup = selectedPractice ? selectedPractice.groupIds.includes(s.groupId) : true;
      return hasAsg || inGroup;
    });
  }, [allStudents, assignments, selectedPractice]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return practiceStudents.filter(s => {
      if (selectedFacultyId && s.facultyId !== selectedFacultyId) return false;
      if (selectedGroupId && s.groupId !== selectedGroupId) return false;

      const ass = assessments.find(a => a.studentId === s.id) || 
        storageService.getAssessmentByStudent(s.id, selectedPractice?.id);

      if (statusFilter !== 'ALL') {
        if (statusFilter === 'APPROVED' && ass?.status !== 'APPROVED') return false;
        if (statusFilter === 'PENDING_APPROVAL' && ass?.status !== 'PENDING_APPROVAL') return false;
        if (statusFilter === 'WAITING_FOR_EXAM' && ass?.status !== 'WAITING_FOR_EXAM') return false;
        if (statusFilter === 'RETAKE_REQUIRED' && (ass?.status !== 'RETAKE_REQUIRED' && ass?.status !== 'FAILED')) return false;
      }

      if (gradeFilter !== 'ALL') {
        if (ass?.grade !== gradeFilter) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.fullName.toLowerCase().includes(q);
        const matchesId = s.studentId.toLowerCase().includes(q);
        const matchesGroup = (s.group || s.groupId || '').toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesGroup) return false;
      }

      return true;
    });
  }, [practiceStudents, assessments, selectedFacultyId, selectedGroupId, statusFilter, gradeFilter, searchQuery, selectedPractice?.id]);

  // Final Exams list
  const exams = useMemo(() => {
    return storageService.getFinalExams({ practiceId: selectedPractice?.id });
  }, [selectedPractice?.id, refreshKey]);

  // Commissions list
  const commissions = useMemo(() => {
    return storageService.getAttestationCommissions();
  }, [refreshKey]);

  // Handlers
  const handleRecalculateAll = () => {
    practiceStudents.forEach(std => {
      storageService.calculateAndSaveAssessment(
        std.id,
        selectedPractice?.id,
        currentUser?.id || 'sys',
        role || 'PRACTICE_SUPERVISOR'
      );
    });
    reloadData();
    showToast('success', 'Barcha talabalar yangilandi', 'Davomat, kundalik va ko\'nikmalar bo\'yicha ballar qayta hisoblandi.');
  };

  const handleOpenStudentModal = (student: Student) => {
    setSelectedStudentForModal(student);
    setIsStudentModalOpen(true);
  };

  const handleOpenCertificate = (student: Student, assessment: Assessment) => {
    setCertStudent(student);
    setCertAssessment(assessment);
    setIsCertOpen(true);
  };

  const handleOpenGrading = (exam: FinalExam) => {
    setGradingExam(exam);
    setIsGradingOpen(true);
  };

  const handleOpenRetake = (assessment: Assessment) => {
    setRetakeAssessment(assessment);
    setIsRetakeOpen(true);
  };

  // Settings Save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const sum = Number(settingsForm.attendanceMaxScore) + Number(settingsForm.journalMaxScore) + Number(settingsForm.skillsMaxScore) + Number(settingsForm.finalExamMaxScore);
    if (sum !== 100) {
      showToast('error', 'Xatolik', `Maksimal ballar yig'indisi aynan 100 bo'lishi shart! Hozirgi: ${sum}`);
      return;
    }

    const res = storageService.updateAssessmentSettings(
      settingsForm,
      currentUser?.id || 'sys',
      role || 'SUPER_ADMIN'
    );

    if (res.success) {
      showToast('success', 'Sozlamalar saqlandi', '100 ballik mezon taqsimoti muvaffaqiyatli yangilandi.');
      reloadData();
    } else {
      showToast('error', 'Xatolik', res.error || 'Saqlab bo\'lmadi');
    }
  };

  const settingsSum = Number(settingsForm.attendanceMaxScore) + Number(settingsForm.journalMaxScore) + Number(settingsForm.skillsMaxScore) + Number(settingsForm.finalExamMaxScore);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Module Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Amaliyot yakuniy baholash va attestatsiya
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              100 ballik tizim
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Davomat (20), elektron kundalik (20), amaliy ko'nikmalar (30) va yakuniy imtihon (30) ballari attestatsiyasi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRecalculateAll}
            title="Barcha talabalarning ballarini jonli ma'lumotlar bilan sinxronlash"
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Qayta hisoblash</span>
          </button>

          <button
            type="button"
            onClick={() => setIsVedomostOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Attestatsiya vedomosti</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setScheduleForStudentId(undefined);
              setIsExamScheduleOpen(true);
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Imtihon belgilash</span>
          </button>
        </div>
      </div>

      {/* 7 KPI CARDS (Section 3 of Prompt) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        
        {/* Card 1: Total */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500">Jami attestatsiyalar</span>
          <div className="text-xl font-bold font-mono text-slate-900">{kpis.totalAssessments}</div>
          <div className="text-[10px] text-slate-400">talabalar soni</div>
        </div>

        {/* Card 2: Completed / Approved */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Tasdiqlangan
          </span>
          <div className="text-xl font-bold font-mono text-emerald-700">{kpis.approvedCount}</div>
          <div className="text-[10px] text-emerald-600">yakunlangan</div>
        </div>

        {/* Card 3: Pending Approval */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-blue-700 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Kutilmoqda
          </span>
          <div className="text-xl font-bold font-mono text-blue-700">{kpis.pendingApprovalCount}</div>
          <div className="text-[10px] text-blue-600">baholash kutmoqda</div>
        </div>

        {/* Card 4: Waiting for Exam */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-amber-700 flex items-center gap-1">
            <GraduationCap className="w-3 h-3" />
            Imtihon kutilmoqda
          </span>
          <div className="text-xl font-bold font-mono text-amber-700">{kpis.waitingExamCount}</div>
          <div className="text-[10px] text-amber-600">imtihon topshirmagan</div>
        </div>

        {/* Card 5: Retake */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-rose-700 flex items-center gap-1">
            <RotateCcw className="w-3 h-3" />
            Qayta topshirish
          </span>
          <div className="text-xl font-bold font-mono text-rose-700">{kpis.retakeCount}</div>
          <div className="text-[10px] text-rose-600">qayta sinov</div>
        </div>

        {/* Card 6: Average Score */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-indigo-700 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            O'rtacha natija
          </span>
          <div className="text-xl font-bold font-mono text-indigo-700">{kpis.averageScore} <span className="text-xs font-normal text-slate-400">/ 100</span></div>
          <div className="text-[10px] text-indigo-600">ballik ko'rsatkich</div>
        </div>

        {/* Card 7: Grade Distribution */}
        <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Baholar</span>
          <div className="flex items-center justify-between text-[11px] font-mono pt-1">
            <span className="text-emerald-400">5: <strong>{kpis.gradeDistribution.grade5}</strong></span>
            <span className="text-blue-400">4: <strong>{kpis.gradeDistribution.grade4}</strong></span>
            <span className="text-amber-400">3: <strong>{kpis.gradeDistribution.grade3}</strong></span>
            <span className="text-rose-400">2: <strong>{kpis.gradeDistribution.grade2}</strong></span>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('students')}
          className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'students' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Award className="w-4 h-4" />
          Attestatsiya monitoringi va talabalar ({filteredStudents.length})
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'exams' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Yakuniy imtihonlar ({exams.length})
        </button>

        <button
          onClick={() => setActiveTab('commissions')}
          className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'commissions' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          Attestatsiya komissiyalari ({commissions.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'settings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Baholash mezonlari va sozlamalar
        </button>
      </div>

      {/* TAB 1: ATTENDANCE & STUDENTS MONITORING */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Practice select */}
              <div>
                <select
                  value={selectedPracticeId}
                  onChange={e => setSelectedPracticeId(e.target.value)}
                  className="px-3 py-1.5 border rounded-xl font-medium bg-slate-50 text-slate-800"
                >
                  {practices.map(p => (
                    <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                  ))}
                </select>
              </div>

              {/* Faculty */}
              <div>
                <select
                  value={selectedFacultyId}
                  onChange={e => setSelectedFacultyId(e.target.value)}
                  className="px-3 py-1.5 border rounded-xl font-medium bg-slate-50 text-slate-800"
                >
                  <option value="">Barcha fakultetlar</option>
                  {faculties.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              {/* Group */}
              <div>
                <select
                  value={selectedGroupId}
                  onChange={e => setSelectedGroupId(e.target.value)}
                  className="px-3 py-1.5 border rounded-xl font-medium bg-slate-50 text-slate-800"
                >
                  <option value="">Barcha guruhlar</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 border rounded-xl font-medium bg-slate-50 text-slate-800"
                >
                  <option value="ALL">Barcha holatlar</option>
                  <option value="APPROVED">Tasdiqlangan</option>
                  <option value="PENDING_APPROVAL">Baholash kutilmoqda</option>
                  <option value="WAITING_FOR_EXAM">Imtihon kutilmoqda</option>
                  <option value="RETAKE_REQUIRED">Qayta topshirish</option>
                </select>
              </div>

              {/* Grade */}
              <div>
                <select
                  value={gradeFilter}
                  onChange={e => setGradeFilter(e.target.value)}
                  className="px-3 py-1.5 border rounded-xl font-medium bg-slate-50 text-slate-800"
                >
                  <option value="ALL">Barcha baholar</option>
                  <option value="5">5 (A'lo)</option>
                  <option value="4">4 (Yaxshi)</option>
                  <option value="3">3 (Qoniqarli)</option>
                  <option value="2">2 (Qoniqarsiz)</option>
                </select>
              </div>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="F.I.Sh. yoki ID..."
                className="w-full pl-9 pr-3 py-1.5 border rounded-xl bg-slate-50 text-xs"
              />
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Talaba (F.I.Sh., Guruh)</th>
                    <th className="py-3 px-3 text-center">Davomat<br/>({initialSettings.attendanceMaxScore})</th>
                    <th className="py-3 px-3 text-center">Kundalik<br/>({initialSettings.journalMaxScore})</th>
                    <th className="py-3 px-3 text-center">Ko'nikma<br/>({initialSettings.skillsMaxScore})</th>
                    <th className="py-3 px-3 text-center">Imtihon<br/>({initialSettings.finalExamMaxScore})</th>
                    <th className="py-3 px-4 text-center bg-indigo-50/40 text-indigo-900 font-extrabold">Jami (100)</th>
                    <th className="py-3 px-3 text-center">Baho</th>
                    <th className="py-3 px-3 text-center">Holat</th>
                    <th className="py-3 px-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map(student => {
                    let ass = assessments.find(a => a.studentId === student.id);
                    if (!ass) {
                      ass = storageService.calculateStudentAssessment(student.id, selectedPractice?.id);
                    }

                    const grade = ass.grade;
                    const gradeBadge = 
                      grade === '5' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                      grade === '4' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      grade === '3' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-rose-100 text-rose-800 border-rose-200';

                    const statusBadge = 
                      ass.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      ass.status === 'RETAKE_REQUIRED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      ass.status === 'WAITING_FOR_EXAM' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-blue-50 text-blue-700 border-blue-200';

                    const statusText = 
                      ass.status === 'APPROVED' ? 'Tasdiqlangan' :
                      ass.status === 'RETAKE_REQUIRED' ? 'Qayta topshirish' :
                      ass.status === 'WAITING_FOR_EXAM' ? 'Imtihon kutilmoqda' :
                      'Baholash kutilmoqda';

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900">{student.fullName}</p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {student.studentId} • <span className="text-slate-600 font-sans font-medium">{student.group}</span>
                          </p>
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-medium text-slate-800">
                          {ass.attendanceScore}
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-medium text-slate-800">
                          {ass.journalScore}
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-medium text-slate-800">
                          {ass.skillsScore}
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-medium text-slate-800">
                          {ass.finalExamScore}
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-bold text-sm bg-indigo-50/20 text-indigo-900">
                          {ass.totalScore}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold border ${gradeBadge}`}>
                            {grade}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge}`}>
                            {statusText}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right space-x-1">
                          <button
                            type="button"
                            onClick={() => handleOpenStudentModal(student)}
                            className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            Attestatsiya
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenCertificate(student, ass)}
                            title="Attestatsiya varaqasini chiqarish"
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors inline-block"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredStudents.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                Tanlangan filtrlar bo'yicha talabalar topilmadi.
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: FINAL EXAMS */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Yakuniy amaliyot imtihonlari ro'yxati va 5 ta klinik mezon baholari
            </p>
            <button
              onClick={() => {
                setScheduleForStudentId(undefined);
                setIsExamScheduleOpen(true);
              }}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yangi imtihon belgilash</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Talaba F.I.Sh.</th>
                    <th className="py-3 px-3">Sana & Vaqt</th>
                    <th className="py-3 px-3">Klinika / Baza</th>
                    <th className="py-3 px-3">Imtihonchilar</th>
                    <th className="py-3 px-3 text-center">Nazariy (6)</th>
                    <th className="py-3 px-3 text-center">Amaliy (8)</th>
                    <th className="py-3 px-3 text-center">Keys (8)</th>
                    <th className="py-3 px-3 text-center">Etika (4)</th>
                    <th className="py-3 px-3 text-center">Xavfsiz (4)</th>
                    <th className="py-3 px-3 text-center font-bold text-indigo-900">Jami (30)</th>
                    <th className="py-3 px-3 text-center">Holat</th>
                    <th className="py-3 px-4 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {exams.map(exam => {
                    const std = allStudents.find(s => s.id === exam.studentId);
                    return (
                      <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900">{std?.fullName || 'Talaba'}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{std?.studentId} • {std?.group}</p>
                        </td>

                        <td className="py-3 px-3">
                          <p className="font-medium text-slate-800">{exam.examDate}</p>
                          <p className="text-[10px] text-slate-400">{exam.examTime || '10:00'}</p>
                        </td>

                        <td className="py-3 px-3">
                          <p className="font-medium text-slate-800 truncate max-w-[140px]">{exam.placeName || 'Shifoxona'}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{exam.departmentName || 'Bo\'lim'}</p>
                        </td>

                        <td className="py-3 px-3 text-slate-600 truncate max-w-[140px]">
                          {exam.examinerNames?.join(', ') || exam.gradedBy || 'Komissiya'}
                        </td>

                        <td className="py-3 px-3 text-center font-mono">{exam.theoryScore}</td>
                        <td className="py-3 px-3 text-center font-mono">{exam.practicalScore}</td>
                        <td className="py-3 px-3 text-center font-mono">{exam.clinicalCaseScore}</td>
                        <td className="py-3 px-3 text-center font-mono">{exam.professionalismScore}</td>
                        <td className="py-3 px-3 text-center font-mono">{exam.safetyScore}</td>

                        <td className="py-3 px-3 text-center font-mono font-bold text-indigo-700">
                          {exam.totalScore}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            exam.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                            exam.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {exam.status === 'COMPLETED' ? 'Topshirildi' : 'Rejalashtirilgan'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenGrading(exam)}
                            className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            {exam.status === 'COMPLETED' ? 'Tahrirlash' : 'Baholash'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {exams.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                Ushbu amaliyot bo'yicha imtihonlar hali rejalashtirilmagan.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: COMMISSIONS */}
      {activeTab === 'commissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Amaliyot yakuniy attestatsiya komissiyalari va hay'at a'zolari
            </p>
            <button
              onClick={() => {
                setCommissionToEdit(null);
                setIsCommissionModalOpen(true);
              }}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yangi komissiya tuzish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commissions.map(comm => (
              <div key={comm.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{comm.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{comm.facultyName} • {comm.department}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    comm.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {comm.isActive ? 'FAOL' : 'NOFAOL'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 text-slate-700">
                  <div>
                    <span className="text-slate-500">Komissiya raisi: </span>
                    <strong className="text-slate-900">{comm.chairpersonName}</strong> ({comm.position})
                  </div>
                  <div>
                    <span className="text-slate-500">Komissiya a'zolari: </span>
                    <span>{comm.memberNames?.join(', ') || 'A\'zolar ko\'rsatilmagan'}</span>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      setCommissionToEdit(comm);
                      setIsCommissionModalOpen(true);
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Tahrirlash
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 max-w-3xl space-y-6">
          <div>
            <h3 className="font-bold text-sm text-slate-900">100 ballik attestatsiya taqsimoti va mezonlari</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Standart taqsimot: Davomat (20), Kundalik (20), Ko'nikmalar (30), Imtihon (30). Jami 100 bo'lishi shart.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
            
            {/* Live Sum Bar */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              settingsSum === 100 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <div>
                <span className="font-bold">Maksimal ballar yig'indisi:</span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {settingsSum === 100 ? 'To\'g\'ri taqsimlangan (Jami 100 ball)' : `Xatolik: Yig'indi 100 bo'lishi shart! (Hozir: ${settingsSum})`}
                </p>
              </div>
              <span className={`text-2xl font-black font-mono ${settingsSum === 100 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {settingsSum} / 100
              </span>
            </div>

            {/* 4 Block Weights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Davomat (Max)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={settingsForm.attendanceMaxScore}
                  onChange={e => setSettingsForm({ ...settingsForm, attendanceMaxScore: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kundalik (Max)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={settingsForm.journalMaxScore}
                  onChange={e => setSettingsForm({ ...settingsForm, journalMaxScore: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ko'nikmalar (Max)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={settingsForm.skillsMaxScore}
                  onChange={e => setSettingsForm({ ...settingsForm, skillsMaxScore: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Imtihon (Max)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={settingsForm.finalExamMaxScore}
                  onChange={e => setSettingsForm({ ...settingsForm, finalExamMaxScore: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl font-mono font-bold"
                />
              </div>
            </div>

            {/* Grade Thresholds */}
            <div className="pt-4 border-t space-y-3">
              <h4 className="font-bold text-slate-900">Baho chegaralari (Minimal o'tish ballari):</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">"5" (A'lo) minimal ball</label>
                  <input
                    type="number"
                    min={75}
                    max={100}
                    value={settingsForm.grade5Min}
                    onChange={e => setSettingsForm({ ...settingsForm, grade5Min: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl font-mono font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">"4" (Yaxshi) minimal ball</label>
                  <input
                    type="number"
                    min={60}
                    max={85}
                    value={settingsForm.grade4Min}
                    onChange={e => setSettingsForm({ ...settingsForm, grade4Min: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl font-mono font-bold text-blue-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">"3" (Qoniqarli) minimal ball</label>
                  <input
                    type="number"
                    min={40}
                    max={70}
                    value={settingsForm.grade3Min}
                    onChange={e => setSettingsForm({ ...settingsForm, grade3Min: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl font-mono font-bold text-amber-700"
                  />
                </div>
              </div>
            </div>

            {/* Exam Criteria Weights */}
            <div className="pt-4 border-t space-y-3">
              <h4 className="font-bold text-slate-900">Yakuniy imtihon 5 ta mezonining maksimal ballari (Jami {settingsForm.finalExamMaxScore}):</h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div>
                  <label className="block text-slate-500 text-[11px] mb-1">1. Nazariy (max)</label>
                  <input
                    type="number"
                    value={settingsForm.examCriteriaWeights.theoryMax}
                    onChange={e => setSettingsForm({
                      ...settingsForm,
                      examCriteriaWeights: { ...settingsForm.examCriteriaWeights, theoryMax: Number(e.target.value) }
                    })}
                    className="w-full px-2 py-1.5 border rounded-lg font-mono text-center"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 text-[11px] mb-1">2. Amaliy (max)</label>
                  <input
                    type="number"
                    value={settingsForm.examCriteriaWeights.practicalMax}
                    onChange={e => setSettingsForm({
                      ...settingsForm,
                      examCriteriaWeights: { ...settingsForm.examCriteriaWeights, practicalMax: Number(e.target.value) }
                    })}
                    className="w-full px-2 py-1.5 border rounded-lg font-mono text-center"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 text-[11px] mb-1">3. Keys (max)</label>
                  <input
                    type="number"
                    value={settingsForm.examCriteriaWeights.clinicalCaseMax}
                    onChange={e => setSettingsForm({
                      ...settingsForm,
                      examCriteriaWeights: { ...settingsForm.examCriteriaWeights, clinicalCaseMax: Number(e.target.value) }
                    })}
                    className="w-full px-2 py-1.5 border rounded-lg font-mono text-center"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 text-[11px] mb-1">4. Etika (max)</label>
                  <input
                    type="number"
                    value={settingsForm.examCriteriaWeights.professionalismMax}
                    onChange={e => setSettingsForm({
                      ...settingsForm,
                      examCriteriaWeights: { ...settingsForm.examCriteriaWeights, professionalismMax: Number(e.target.value) }
                    })}
                    className="w-full px-2 py-1.5 border rounded-lg font-mono text-center"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 text-[11px] mb-1">5. Xavfsiz (max)</label>
                  <input
                    type="number"
                    value={settingsForm.examCriteriaWeights.safetyMax}
                    onChange={e => setSettingsForm({
                      ...settingsForm,
                      examCriteriaWeights: { ...settingsForm.examCriteriaWeights, safetyMax: Number(e.target.value) }
                    })}
                    className="w-full px-2 py-1.5 border rounded-lg font-mono text-center"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                type="submit"
                disabled={settingsSum !== 100}
                className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                Sozlamalarni saqlash
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ALL MODALS */}
      {isStudentModalOpen && selectedStudentForModal && (
        <StudentAssessmentModal
          isOpen={isStudentModalOpen}
          onClose={() => setIsStudentModalOpen(false)}
          student={selectedStudentForModal}
          practiceId={selectedPractice?.id}
          onAssessmentUpdated={reloadData}
          onOpenExamGrading={handleOpenGrading}
          onOpenRetake={handleOpenRetake}
          onOpenCertificate={handleOpenCertificate}
        />
      )}

      {isExamScheduleOpen && (
        <FinalExamScheduleModal
          isOpen={isExamScheduleOpen}
          onClose={() => setIsExamScheduleOpen(false)}
          practiceId={selectedPractice?.id}
          onExamCreated={reloadData}
          preselectedStudentId={scheduleForStudentId}
        />
      )}

      {isGradingOpen && gradingExam && (
        <FinalExamGradingModal
          isOpen={isGradingOpen}
          onClose={() => {
            setIsGradingOpen(false);
            setGradingExam(null);
          }}
          exam={gradingExam}
          onExamGraded={reloadData}
        />
      )}

      {isRetakeOpen && retakeAssessment && (
        <RetakeModal
          isOpen={isRetakeOpen}
          onClose={() => {
            setIsRetakeOpen(false);
            setRetakeAssessment(null);
          }}
          assessment={retakeAssessment}
          onRetakeRequested={reloadData}
        />
      )}

      {isVedomostOpen && (
        <OfficialVedomostPrintModal
          isOpen={isVedomostOpen}
          onClose={() => setIsVedomostOpen(false)}
          practiceId={selectedPractice?.id}
          selectedGroupId={selectedGroupId || undefined}
        />
      )}

      {isCertOpen && certStudent && certAssessment && (
        <StudentIndividualCertificateModal
          isOpen={isCertOpen}
          onClose={() => {
            setIsCertOpen(false);
            setCertStudent(null);
            setCertAssessment(null);
          }}
          student={certStudent}
          assessment={certAssessment}
        />
      )}

      {isCommissionModalOpen && (
        <AttestationCommissionModal
          isOpen={isCommissionModalOpen}
          onClose={() => {
            setIsCommissionModalOpen(false);
            setCommissionToEdit(null);
          }}
          editCommission={commissionToEdit}
          onCommissionSaved={reloadData}
        />
      )}

    </div>
  );
}
