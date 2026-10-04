import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Printer,
  Calendar,
  Building2,
  Users,
  CheckCircle2,
  Filter,
  Stethoscope,
  Award,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  QrCode,
  ShieldCheck,
  Search,
  Cpu,
  GraduationCap,
  Clock,
  Archive,
  RefreshCw,
  FileText
} from 'lucide-react';
import { storageService } from '../../../services/storageService';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';
import { Student } from '../../../types';
import { exportToExcel } from '../../../utils/reportGenerators';

// Subviews
import { OverallMonitoringView } from './OverallMonitoringView';
import { ProblemStudentsView } from './ProblemStudentsView';
import { GroupReportsView } from './GroupReportsView';
import { FacultyDirectionReportsView } from './FacultyDirectionReportsView';
import { ClinicReportsView } from './ClinicReportsView';
import { SupervisorMonitoringView } from './SupervisorMonitoringView';
import { VedomostCenterView } from './VedomostCenterView';

// Modals
import { QRVerificationModal } from './QRVerificationModal';
import { StudentPracticeTimelineModal } from './StudentPracticeTimelineModal';
import { Stage8QATestsModal } from './Stage8QATestsModal';
import { StudentAssessmentModal } from '../assessments/StudentAssessmentModal';

export function ReportsModule() {
  const { showToast } = useToast();
  const { currentUser, role } = useAuth();

  // Active sub-section
  const [activeTab, setActiveTab] = useState<
    | 'monitoring'
    | 'problems'
    | 'groups'
    | 'faculties'
    | 'clinics'
    | 'supervisors'
    | 'vedomosts'
    | 'skills'
    | 'attendance'
  >('monitoring');

  // Filter states
  const practices = storageService.getPractices();
  const faculties = storageService.getFaculties();
  const groups = storageService.getGroups();

  const [selectedPracticeId, setSelectedPracticeId] = useState<string>(practices[0]?.id || 'prac-1');
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('ALL');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [timelineStudent, setTimelineStudent] = useState<Student | null>(null);
  const [assessmentStudentId, setAssessmentStudentId] = useState<string | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isQATestsModalOpen, setIsQATestsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Live KPIs from storageService
  const kpis = storageService.getFinalReportsKPIs(selectedPracticeId);

  // Live rows for Overall Monitoring Table
  const monitoringRows = useMemo(() => {
    return storageService.getOverallMonitoringRows({
      practiceId: selectedPracticeId,
      facultyId: selectedFacultyId !== 'ALL' ? selectedFacultyId : undefined,
      groupId: selectedGroupId !== 'ALL' ? selectedGroupId : undefined,
      status: selectedStatus,
      grade: selectedGrade,
      searchQuery
    });
  }, [selectedPracticeId, selectedFacultyId, selectedGroupId, selectedStatus, selectedGrade, searchQuery, refreshKey]);

  // Live Problem Students
  const problemStudents = useMemo(() => {
    return storageService.getProblemStudents({
      practiceId: selectedPracticeId,
      facultyId: selectedFacultyId !== 'ALL' ? selectedFacultyId : undefined
    });
  }, [selectedPracticeId, selectedFacultyId, refreshKey]);

  // Handle Safe Sync All (Section 19)
  const handleSyncAll = () => {
    const res = storageService.syncAllStudentStatuses(currentUser?.id || 'admin', role);
    if (res.success) {
      showToast('success', 'Barcha statuslar sinxronlandi', `${res.syncedCount} nafar talaba bo'yicha baho va amaliyot holatlari xavfsiz yangilandi.`);
      setRefreshKey(prev => prev + 1);
    }
  };

  // KPI card click actions
  const handleKPIClick = (filterType: string) => {
    switch (filterType) {
      case 'all':
        setActiveTab('monitoring');
        setSelectedStatus('ALL');
        break;
      case 'started':
        setActiveTab('monitoring');
        setSelectedStatus('IN_PROGRESS');
        break;
      case 'finished':
        setActiveTab('monitoring');
        setSelectedStatus('COMPLETED');
        break;
      case 'approved':
        setActiveTab('monitoring');
        setSelectedStatus('APPROVED');
        break;
      case 'retake':
        setActiveTab('monitoring');
        setSelectedStatus('RETAKE_REQUIRED');
        break;
      case 'waiting_exam':
        setActiveTab('monitoring');
        setSelectedStatus('WAITING_FOR_EXAM');
        break;
      case 'problems':
        setActiveTab('problems');
        break;
      default:
        setActiveTab('monitoring');
        break;
    }
  };

  // Excel (.xlsx) Export for Overall Table or Subviews
  const handleExportExcel = () => {
    let filename = `Amaliyot_Yakuniy_Hisoboti_${activeTab}`;
    let excelData: any[] = [];

    if (activeTab === 'monitoring') {
      filename = 'Talaba_Amaliyot_Holati_Monitoring';
      excelData = monitoringRows.map((r, i) => ({
        "№": i + 1,
        "Talaba F.I.Sh.": r.student.fullName,
        "Talaba ID": r.student.studentId,
        "Fakultet": r.facultyName,
        "Yo'nalish": r.directionName,
        "Guruh": r.groupName,
        "Kurs": r.courseLevel,
        "Amaliyot": r.practice?.name || '',
        "Klinik Baza": r.practicePlace?.name || '',
        "Rahbar": r.supervisor?.fullName || '',
        "Davomat (%)": r.attendancePercentage,
        "Kundalik (%)": r.journalCompletionPct,
        "Ko'nikmalar (%)": r.skillsProgressPct,
        "Imtihon bali": r.examScore,
        "Jami Ball": r.totalScore,
        "Baho": r.grade,
        "Holat": r.status,
        "Muammo": r.problem || 'Mavjud emas',
        "Oxirgi Yangilanish": r.lastUpdated
      }));
    } else if (activeTab === 'problems') {
      filename = 'Muammoli_Talabalar_Nazorati';
      excelData = problemStudents.map((p, i) => ({
        "№": i + 1,
        "Talaba F.I.Sh.": p.studentName,
        "Guruh": p.group,
        "Fakultet": p.faculty,
        "Amaliyot": p.practiceName,
        "Muammo Turi": p.problemType,
        "Tavsif": p.problemLabel,
        "Daraja": p.severity,
        "Mas'ul": p.responsiblePerson,
        "Holat": p.status,
        "Sana": p.detectedDate
      }));
    } else if (activeTab === 'groups') {
      filename = 'Guruhlar_Kesimida_Hisobot';
      const gData = storageService.getGroupSummaryReports(selectedPracticeId);
      excelData = gData.map((g, i) => ({
        "№": i + 1,
        "Guruh": g.groupName,
        "Fakultet": g.facultyName,
        "Jami Talabalar": g.totalStudents,
        "Amaliyotda": g.inPractice,
        "Yakunlagan": g.completed,
        "Davomat (%)": g.avgAttendance,
        "Kundalik (%)": g.avgJournal,
        "Ko'nikma (%)": g.avgSkills,
        "O'rtacha Ball": g.avgScore,
        "A'lo (5)": g.grade5Count,
        "Yaxshi (4)": g.grade4Count,
        "Qoniqarli (3)": g.grade3Count,
        "Qoniqarsiz (2)": g.grade2Count,
        "O'zlashtirish (%)": g.masteryPercentage,
        "Sifat (%)": g.qualityPercentage
      }));
    } else {
      filename = 'Umumiy_Hisobot';
      excelData = monitoringRows.map((r, i) => ({
        "№": i + 1,
        "Talaba F.I.Sh.": r.student.fullName,
        "Talaba ID": r.student.studentId,
        "Guruh": r.groupName,
        "Jami Ball": r.totalScore,
        "Baho": r.grade,
        "Holat": r.status
      }));
    }

    if (excelData.length === 0) {
      showToast('warning', 'Ma\'lumot topilmadi', 'Eksport qilish uchun jadvalda ma\'lumot yo\'q.');
      return;
    }

    exportToExcel(excelData, filename);
    showToast('success', 'Excel (.xlsx) yuklandi', `"${filename}.xlsx" muvaffaqiyatli yuklab olindi.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Global Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              8-Bosqich
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Amaliyot Yakuniy Hisobotlari va Nazorat Markazi
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Barcha amaliyot jarayonlarini yagona markazdan yakuniy nazorat qilish va vedomostlar aylanishi
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Safe Sync Button */}
          <button
            type="button"
            onClick={handleSyncAll}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
            title="Barcha talabalar baholari va holatlarini xavfsiz qayta hisoblash"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
            <span>Sinxronlash</span>
          </button>

          {/* QR Verification */}
          <button
            type="button"
            onClick={() => setIsQRModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
            title="QR kod orqali rasmiy vedomost haqiqiyligini tekshirish"
          >
            <QrCode className="w-3.5 h-3.5 text-purple-600" />
            <span>QR Tekshirish</span>
          </button>

          {/* QA Tests Runner */}
          <button
            type="button"
            onClick={() => setIsQATestsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg shadow-2xs transition-colors"
            title="8-bosqich avtomatlashtirilgan QA testlari (25 ta test)"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span>QA Testlar (25)</span>
          </button>

          {/* Export Excel (.xlsx) */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 rounded-lg shadow-2xs transition-colors"
            title="Hisobotni barcha ustun va satrlari bilan Excel (.xlsx) formatida yuklab olish"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel (.xlsx)</span>
          </button>

          {/* Print */}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Chop etish</span>
          </button>
        </div>
      </div>

      {/* 12 KPI CARDS (SECTION 2: UMUMIY MONITORING DASHBOARD) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* 1. Jami talabalar */}
        <div
          onClick={() => handleKPIClick('all')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Jami talabalar</span>
            <Users className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">{kpis.totalStudents}</div>
          <span className="text-[10px] text-slate-400">Amaliyot kontingenti</span>
        </div>

        {/* 2. Amaliyotga biriktirilgan */}
        <div
          onClick={() => handleKPIClick('all')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Biriktirilgan</span>
            <Building2 className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">{kpis.assignedCount}</div>
          <span className="text-[10px] text-sky-600 font-medium">Baza & Rahbar</span>
        </div>

        {/* 3. Boshlagan */}
        <div
          onClick={() => handleKPIClick('started')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Boshlagan</span>
            <Clock className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold font-mono text-indigo-700">{kpis.startedCount}</div>
          <span className="text-[10px] text-slate-400">Jarayonda</span>
        </div>

        {/* 4. Yakunlagan */}
        <div
          onClick={() => handleKPIClick('finished')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Yakunlagan</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700">{kpis.finishedCount}</div>
          <span className="text-[10px] text-emerald-600 font-medium">Tugallangan</span>
        </div>

        {/* 5. Davomati to'liq */}
        <div
          onClick={() => handleKPIClick('all')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Davomat to'liq</span>
            <Calendar className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold font-mono text-teal-700">{kpis.fullAttendanceCount}</div>
          <span className="text-[10px] text-teal-600 font-medium">≥ 95% davomat</span>
        </div>

        {/* 6. Kundaligi to'liq */}
        <div
          onClick={() => handleKPIClick('all')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Kundalik to'liq</span>
            <FileText className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold font-mono text-blue-700">{kpis.fullJournalCount}</div>
          <span className="text-[10px] text-blue-600 font-medium">Tasdiqlangan</span>
        </div>

        {/* 7. Ko'nikmalari to'liq */}
        <div
          onClick={() => handleKPIClick('all')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Ko'nikma to'liq</span>
            <Stethoscope className="w-4 h-4 text-cyan-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-700">{kpis.fullSkillsCount}</div>
          <span className="text-[10px] text-cyan-600 font-medium">100% norma</span>
        </div>

        {/* 8. Imtihon topshirgan */}
        <div
          onClick={() => handleKPIClick('all')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-purple-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Imtihon topshirgan</span>
            <GraduationCap className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-700">{kpis.examTakenCount}</div>
          <span className="text-[10px] text-purple-600 font-medium">Baho qo'yilgan</span>
        </div>

        {/* 9. Attestatsiyasi tasdiqlangan */}
        <div
          onClick={() => handleKPIClick('approved')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Tasdiqlangan</span>
            <Award className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700">{kpis.approvedCount}</div>
          <span className="text-[10px] text-emerald-600 font-medium">Komissiya tasdig'i</span>
        </div>

        {/* 10. Qayta topshiruvchi */}
        <div
          onClick={() => handleKPIClick('retake')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-rose-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Qayta topshirish</span>
            <RotateCcw className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-700">{kpis.retakeCount}</div>
          <span className="text-[10px] text-rose-600 font-medium">&lt; 55 ball / Retake</span>
        </div>

        {/* 11. Tugallanmagan */}
        <div
          onClick={() => handleKPIClick('all')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Tugallanmagan</span>
            <Clock className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-700">{kpis.incompleteCount}</div>
          <span className="text-[10px] text-amber-600 font-medium">Kutilmoqda</span>
        </div>

        {/* 12. Muammoli talabalar */}
        <div
          onClick={() => handleKPIClick('problems')}
          className="bg-white p-3.5 rounded-xl border border-rose-200 bg-rose-50/20 shadow-2xs hover:border-rose-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold text-rose-700">Muammoli talabalar</span>
            <AlertTriangle className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-700">{kpis.problemStudentsCount}</div>
          <span className="text-[10px] text-rose-600 font-medium">Nazorat talab</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs (Section 1) */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab('monitoring')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'monitoring'
              ? 'bg-white text-blue-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
          <span>Umumiy monitoring</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('problems')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'problems'
              ? 'bg-white text-rose-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          <span>Muammoli talabalar ({problemStudents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('groups')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'groups'
              ? 'bg-white text-indigo-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-indigo-600" />
          <span>Guruhlar kesimida</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('faculties')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'faculties'
              ? 'bg-white text-blue-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-blue-600" />
          <span>Fakultet va yo'nalishlar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('clinics')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'clinics'
              ? 'bg-white text-emerald-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Klinik bazalar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('supervisors')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'supervisors'
              ? 'bg-white text-cyan-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5 text-cyan-600" />
          <span>Rahbarlar monitoringi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('vedomosts')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'vedomosts'
              ? 'bg-white text-purple-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-purple-600" />
          <span>Vedomostlar markazi</span>
        </button>
      </div>

      {/* Global Filter Bar (Section 20) */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {/* Practice Select */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Amaliyot:</span>
            <select
              value={selectedPracticeId}
              onChange={e => setSelectedPracticeId(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {practices.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.academicYear})</option>
              ))}
            </select>
          </div>

          {/* Faculty Select */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Fakultet:</span>
            <select
              value={selectedFacultyId}
              onChange={e => setSelectedFacultyId(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="ALL">Barcha fakultetlar</option>
              {faculties.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* Group Select */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Guruh:</span>
            <select
              value={selectedGroupId}
              onChange={e => setSelectedGroupId(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="ALL">Barcha guruhlar</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Status Select */}
          {activeTab === 'monitoring' && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Holat:</span>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="ALL">Barcha holatlar</option>
                <option value="IN_PROGRESS">Jarayonda</option>
                <option value="WAITING_FOR_EXAM">Imtihon kutilmoqda</option>
                <option value="WAITING_FOR_APPROVAL">Tasdiq kutilmoqda</option>
                <option value="APPROVED">Tasdiqlangan</option>
                <option value="COMPLETED">Yakunlangan</option>
                <option value="RETAKE_REQUIRED">Qayta topshirish</option>
              </select>
            </div>
          )}

          {/* Grade Select */}
          {activeTab === 'monitoring' && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Baho:</span>
              <select
                value={selectedGrade}
                onChange={e => setSelectedGrade(e.target.value)}
                className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="ALL">Barcha baholar</option>
                <option value="5">5 (A'lo)</option>
                <option value="4">4 (Yaxshi)</option>
                <option value="3">3 (Qoniqarli)</option>
                <option value="2">2 (Qoniqarsiz)</option>
              </select>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Talaba, guruh yoki ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'monitoring' && (
        <OverallMonitoringView
          rows={monitoringRows}
          onOpenTimeline={(std) => setTimelineStudent(std)}
          onOpenAssessment={(stdId) => setAssessmentStudentId(stdId)}
        />
      )}

      {activeTab === 'problems' && (
        <ProblemStudentsView
          problems={problemStudents}
          onOpenTimeline={(std) => setTimelineStudent(std)}
          onRefresh={() => setRefreshKey(prev => prev + 1)}
        />
      )}

      {activeTab === 'groups' && (
        <GroupReportsView
          practiceId={selectedPracticeId}
          onOpenTimeline={(std) => setTimelineStudent(std)}
        />
      )}

      {activeTab === 'faculties' && (
        <FacultyDirectionReportsView practiceId={selectedPracticeId} />
      )}

      {activeTab === 'clinics' && (
        <ClinicReportsView practiceId={selectedPracticeId} />
      )}

      {activeTab === 'supervisors' && (
        <SupervisorMonitoringView practiceId={selectedPracticeId} />
      )}

      {activeTab === 'vedomosts' && (
        <VedomostCenterView practiceId={selectedPracticeId} />
      )}

      {/* Timeline Modal (Section 16) */}
      {timelineStudent && (
        <StudentPracticeTimelineModal
          isOpen={Boolean(timelineStudent)}
          onClose={() => setTimelineStudent(null)}
          student={timelineStudent}
          practiceId={selectedPracticeId}
        />
      )}

      {/* Assessment Modal (Reused from Stage 7) */}
      {assessmentStudentId && (
        <StudentAssessmentModal
          isOpen={Boolean(assessmentStudentId)}
          onClose={() => setAssessmentStudentId(null)}
          student={storageService.getStudents().find(s => s.id === assessmentStudentId) || null}
          practiceId={selectedPracticeId}
          onAssessmentUpdated={() => setRefreshKey(k => k + 1)}
        />
      )}

      {/* QR Verification Modal (Section 14 & 15) */}
      {isQRModalOpen && (
        <QRVerificationModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
        />
      )}

      {/* QA Tests Modal (Section 23) */}
      {isQATestsModalOpen && (
        <Stage8QATestsModal
          isOpen={isQATestsModalOpen}
          onClose={() => setIsQATestsModalOpen(false)}
        />
      )}
    </div>
  );
}
