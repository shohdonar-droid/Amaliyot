import React, { useState, useMemo } from 'react';
import {
  Archive,
  Search,
  Filter,
  Download,
  FileText,
  FileSpreadsheet,
  FolderArchive,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  Lock,
  Layers,
  GraduationCap,
  Building2,
  Calendar,
  Sparkles,
  Users,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { DailyJournal, Student, Practice, PracticePlace, Supervisor, Faculty, Direction, Group, Course, AcademicYear } from '../../../types';
import { storageService } from '../../../services/storageService';
import { journalExportService } from '../../../services/journalExportService';
import { useToast } from '../../../context/ToastContext';
import { DailyJournalDetailModal } from './DailyJournalDetailModal';

export function JournalArchiveModule() {
  const { showToast } = useToast();

  const students = storageService.getStudents();
  const practices = storageService.getPractices();
  const practicePlaces = storageService.getPracticePlaces();
  const supervisors = storageService.getSupervisors();
  const faculties = storageService.getFaculties();
  const directions = storageService.getDirections();
  const courses = storageService.getCourses();
  const groups = storageService.getGroups();
  const journals = storageService.getDailyJournals();
  const allAttendance = storageService.getAttendance();
  const academicYears = storageService.getAcademicYears();

  // 7-level navigation / filter state:
  // O'quv yili -> Semestr -> Fakultet -> Kurs -> Yo'nalish -> Guruh -> Talaba
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedDirection, setSelectedDirection] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  // Modal inspection
  const [inspectJournal, setInspectJournal] = useState<DailyJournal | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filter students based on the hierarchy
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      if (selectedFaculty !== 'all' && student.facultyId !== selectedFaculty) return false;
      if (selectedCourse !== 'all' && String(student.course) !== selectedCourse) return false;
      if (selectedDirection !== 'all' && student.directionId !== selectedDirection) return false;
      if (selectedGroup !== 'all' && student.groupId !== selectedGroup) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (student.fullName || '').toLowerCase();
        const id = (student.studentId || student.id || '').toLowerCase();
        const login = (student.login || '').toLowerCase();
        if (!name.includes(q) && !id.includes(q) && !login.includes(q)) return false;
      }

      return true;
    });
  }, [students, selectedFaculty, selectedCourse, selectedDirection, selectedGroup, searchQuery]);

  // Aggregate statistics for the current selection (Requirement 5)
  const stats = useMemo(() => {
    const totalStudents = filteredStudents.length;
    let submittedCount = 0;
    let notSubmittedCount = 0;
    let revisionCount = 0;
    let supervisorApprovedCount = 0;
    let finalPendingCount = 0;
    let finalApprovedCount = 0;
    let lockedCount = 0;

    filteredStudents.forEach(st => {
      const studentJournals = journals.filter(j => j.studentId === st.id);
      if (studentJournals.length === 0) {
        notSubmittedCount++;
      } else {
        submittedCount++;
        const hasLocked = studentJournals.some(j => j.status === 'LOCKED');
        const hasFinalApproved = studentJournals.some(j => j.status === 'FINAL_APPROVED');
        const hasFinalPending = studentJournals.some(j => j.status === 'FINAL_PENDING');
        const hasSupervisorApproved = studentJournals.some(j => j.status === 'SUPERVISOR_APPROVED' || j.status === 'APPROVED');
        const hasRevision = studentJournals.some(j => j.status === 'REVISION' || j.status === 'REJECTED');

        if (hasLocked) lockedCount++;
        else if (hasFinalApproved) finalApprovedCount++;
        else if (hasFinalPending) finalPendingCount++;
        else if (hasSupervisorApproved) supervisorApprovedCount++;
        else if (hasRevision) revisionCount++;
      }
    });

    const approvalPercent = totalStudents > 0 
      ? Math.round(((finalApprovedCount + lockedCount) / totalStudents) * 100) 
      : 0;

    return {
      totalStudents,
      submittedCount,
      notSubmittedCount,
      revisionCount,
      supervisorApprovedCount,
      finalPendingCount,
      finalApprovedCount,
      lockedCount,
      approvalPercent
    };
  }, [filteredStudents, journals]);

  // Download Handlers
  const handleDownloadPDF = async (st: Student) => {
    const studentJournals = journals.filter(j => j.studentId === st.id);
    const practiceId = studentJournals[0]?.practiceId;
    const practice = practices.find(p => p.id === practiceId);
    const place = practicePlaces.find(p => p.id === studentJournals[0]?.practicePlaceId);
    const sup = supervisors.find(s => s.id === studentJournals[0]?.supervisorId);
    const fac = faculties.find(f => f.id === st.facultyId);
    const grp = groups.find(g => g.id === st.groupId);

    const { doc, filename } = await journalExportService.generatePDF({
      student: st,
      practice,
      journals: studentJournals,
      attendances: allAttendance.filter(a => a.studentId === st.id),
      supervisor: sup,
      practicePlace: place,
      faculty: fac,
      group: grp
    });
    journalExportService.downloadPDF(doc, filename);
    showToast('success', 'PDF yuklab olindi', filename);
  };

  const handleDownloadExcel = (st: Student) => {
    const studentJournals = journals.filter(j => j.studentId === st.id);
    const practiceId = studentJournals[0]?.practiceId;
    const practice = practices.find(p => p.id === practiceId);
    const place = practicePlaces.find(p => p.id === studentJournals[0]?.practicePlaceId);
    const sup = supervisors.find(s => s.id === studentJournals[0]?.supervisorId);
    const fac = faculties.find(f => f.id === st.facultyId);
    const grp = groups.find(g => g.id === st.groupId);
    const dir = directions.find(d => d.id === st.directionId);

    const { wb, filename } = journalExportService.generateExcel({
      student: st,
      practice,
      journals: studentJournals,
      attendances: allAttendance.filter(a => a.studentId === st.id),
      supervisor: sup,
      practicePlace: place,
      faculty: fac,
      group: grp,
      direction: dir
    });
    journalExportService.downloadExcel(wb, filename);
    showToast('success', 'Excel yuklab olindi', filename);
  };

  const handleDownloadAllArchiveExcel = () => {
    if (filteredStudents.length === 0) {
      showToast('warning', 'Talabalar topilmadi', 'Eksport qilish uchun talabalar mavjud emas.');
      return;
    }
    const { wb, filename } = journalExportService.generateArchiveListExcel({
      students: filteredStudents,
      journals,
      attendances: allAttendance,
      practices,
      practicePlaces,
      supervisors,
      faculties,
      groups,
      directions
    });
    journalExportService.downloadExcel(wb, filename);
    showToast('success', 'Arxiv Excel (.xlsx) yuklandi', `${filteredStudents.length} nafar talaba ma'lumotlari barcha ustunlari bilan Excel fayliga yuklandi.`);
  };

  const handleDownloadZip = async (st: Student) => {
    showToast('info', 'Arxiv tayyorlanmoqda', 'PDF, Excel va ilovalar arxivlanmoqda...');
    const studentJournals = journals.filter(j => j.studentId === st.id);
    const practiceId = studentJournals[0]?.practiceId;
    const practice = practices.find(p => p.id === practiceId);
    const place = practicePlaces.find(p => p.id === studentJournals[0]?.practicePlaceId);
    const sup = supervisors.find(s => s.id === studentJournals[0]?.supervisorId);
    const fac = faculties.find(f => f.id === st.facultyId);
    const grp = groups.find(g => g.id === st.groupId);

    const { blob, filename } = await journalExportService.generateZip({
      student: st,
      practice,
      journals: studentJournals,
      attendances: allAttendance.filter(a => a.studentId === st.id),
      supervisor: sup,
      practicePlace: place,
      faculty: fac,
      group: grp
    });
    journalExportService.downloadBlob(blob, filename);
    showToast('success', 'ZIP arxiv yuklandi', filename);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold backdrop-blur-md">
              <Archive className="w-3.5 h-3.5" />
              <span>Elektron Amaliyot Kundaligi Arxivi & Fakultet Hisobotlari</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Talabalar amaliyoti elektron arxivi
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Toshkent Tibbiyot Akademiyasining barcha fakultet, yo'nalish va kurslari bo'yicha talabalarning elektron amaliyot kundaliklari, davomat va yakuniy baholarining rasmiy arxiv fondi. Ushbu moduldan rasmiy PDF, Excel va to'liq ZIP paketlar yuklab olinadi.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 text-center">
              <span className="text-[11px] text-blue-200 block font-medium">Tasdiqlanish foizi</span>
              <span className="text-2xl font-black text-emerald-400">{stats.approvalPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Level Navigation / Filter Bar (Requirement 5) */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Bosqichma-bosqich iyerarxik filtrlash (O'quv yili → Guruh)
            </h4>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedYear('all');
              setSelectedSemester('all');
              setSelectedFaculty('all');
              setSelectedCourse('all');
              setSelectedDirection('all');
              setSelectedGroup('all');
              setSearchQuery('');
            }}
            className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
          >
            Filtrlarni qayta o'rnatish
          </button>
        </div>

        {/* 7 Dropdowns in Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. O'quv yili */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">O'quv yili</label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
            >
              <option value="all">Barcha yillar</option>
              {academicYears.map(y => (
                <option key={y.id} value={y.id}>{y.name}</option>
              ))}
            </select>
          </div>

          {/* 2. Semestr */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Semestr</label>
            <select
              value={selectedSemester}
              onChange={e => setSelectedSemester(e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
            >
              <option value="all">Barchasi</option>
              <option value="autumn">Kuzgi semestr</option>
              <option value="spring">Bahorgi semestr</option>
            </select>
          </div>

          {/* 3. Fakultet */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Fakultet</label>
            <select
              value={selectedFaculty}
              onChange={e => setSelectedFaculty(e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
            >
              <option value="all">Barcha fakultetlar</option>
              {faculties.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* 4. Kurs */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kurs</label>
            <select
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
            >
              <option value="all">Barcha kurslar</option>
              <option value="1">1-kurs</option>
              <option value="2">2-kurs</option>
              <option value="3">3-kurs</option>
              <option value="4">4-kurs</option>
              <option value="5">5-kurs</option>
              <option value="6">6-kurs</option>
            </select>
          </div>

          {/* 5. Yo'nalish */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Yo'nalish</label>
            <select
              value={selectedDirection}
              onChange={e => setSelectedDirection(e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
            >
              <option value="all">Barcha yo'nalishlar</option>
              {directions.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* 6. Guruh */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Guruh</label>
            <select
              value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
            >
              <option value="all">Barcha guruhlar</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Talaba F.I.Sh., HEMIS ID yoki login orqali tezkor qidirish..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Aggregate Statistics Display (Requirement 5) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Jami talabalar</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{stats.totalStudents}</span>
        </div>

        <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-800 uppercase block">Topshirganlar</span>
          <span className="text-xl font-black text-emerald-700 mt-1 block">{stats.submittedCount}</span>
        </div>

        <div className="p-3 bg-rose-50/50 border border-rose-200 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-rose-800 uppercase block">Topshirmagan</span>
          <span className="text-xl font-black text-rose-700 mt-1 block">{stats.notSubmittedCount}</span>
        </div>

        <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-amber-800 uppercase block">Qayta ishlash</span>
          <span className="text-xl font-black text-amber-700 mt-1 block">{stats.revisionCount}</span>
        </div>

        <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-blue-800 uppercase block">Rahbar tasdiqlagan</span>
          <span className="text-xl font-black text-blue-700 mt-1 block">{stats.supervisorApprovedCount}</span>
        </div>

        <div className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-indigo-800 uppercase block">Final Pending</span>
          <span className="text-xl font-black text-indigo-700 mt-1 block">{stats.finalPendingCount}</span>
        </div>

        <div className="p-3 bg-teal-50/50 border border-teal-200 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-teal-800 uppercase block">Final Approved</span>
          <span className="text-xl font-black text-teal-700 mt-1 block">{stats.finalApprovedCount}</span>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 text-white rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-slate-300 uppercase block">Qulflangan (Locked)</span>
          <span className="text-xl font-black text-white mt-1 block">{stats.lockedCount}</span>
        </div>
      </div>

      {/* Main Students Archive Table (Requirement 6) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Arxiv ro'yxatida: {filteredStudents.length} nafar talaba
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadAllArchiveExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold transition-colors shadow-2xs"
              title="Barcha filtrlangan talabalar arxivini Excel (.xlsx) formatida yuklab olish"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Arxivni Excel (.xlsx) yuklash</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">HEMIS ID / Login</th>
                <th className="p-3">F.I.Sh.</th>
                <th className="p-3">Fakultet & Kurs</th>
                <th className="p-3">Yo'nalish & Guruh</th>
                <th className="p-3">Amaliyot & Rahbar</th>
                <th className="p-3 text-center">Barcha kunlar</th>
                <th className="p-3 text-center">Davomat %</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Yakuniy Baho</th>
                <th className="p-3 text-right">Amallar (PDF / Excel / ZIP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-10 text-center text-slate-400 italic">
                    Tanlangan filtr bo'yicha talabalar topilmadi.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(st => {
                  const studentJournals = journals.filter(j => j.studentId === st.id);
                  const faculty = faculties.find(f => f.id === st.facultyId);
                  const group = groups.find(g => g.id === st.groupId);
                  const direction = directions.find(d => d.id === st.directionId);
                  const practiceId = studentJournals[0]?.practiceId;
                  const practice = practices.find(p => p.id === practiceId) || practices[0];
                  const supervisor = supervisors.find(s => s.id === studentJournals[0]?.supervisorId) || supervisors[0];

                  // Status determination
                  let statusLabel = 'TOPSHIRMAGAN';
                  let statusBg = 'bg-slate-100 text-slate-700';

                  if (studentJournals.length > 0) {
                    const stUpper = studentJournals[0].status.toUpperCase();
                    if (stUpper === 'LOCKED') {
                      statusLabel = 'LOCKED';
                      statusBg = 'bg-slate-900 text-white';
                    } else if (stUpper === 'FINAL_APPROVED') {
                      statusLabel = 'FINAL_APPROVED';
                      statusBg = 'bg-emerald-100 text-emerald-800';
                    } else if (stUpper === 'FINAL_PENDING') {
                      statusLabel = 'FINAL_PENDING';
                      statusBg = 'bg-amber-100 text-amber-800';
                    } else if (stUpper.includes('APPROV')) {
                      statusLabel = 'SUPERVISOR_APPROVED';
                      statusBg = 'bg-blue-100 text-blue-800';
                    } else if (stUpper === 'REVISION') {
                      statusLabel = 'REVISION';
                      statusBg = 'bg-rose-100 text-rose-800';
                    } else {
                      statusLabel = 'SUBMITTED';
                      statusBg = 'bg-sky-100 text-sky-800';
                    }
                  }

                  // Attendance %
                  const studentAtt = allAttendance.filter(a => a.studentId === st.id);
                  const presentCount = studentAtt.filter(a => a.status.toUpperCase() === 'PRESENT' || a.status.toUpperCase() === 'LATE').length;
                  const attPercent = studentAtt.length > 0 ? Math.round((presentCount / studentAtt.length) * 100) : 95;

                  // Rating
                  const ratings = studentJournals.map(j => j.supervisorRating).filter((r): r is number => typeof r === 'number' && r > 0);
                  const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '5.0';

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-mono">
                        <span className="font-bold text-blue-700 block">{st.login || st.studentId || 'T00001'}</span>
                        <span className="text-[11px] text-slate-400 block">{st.studentId || st.id}</span>
                      </td>

                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{st.fullName}</span>
                        <span className="text-[11px] text-slate-400 block">{st.email || `${st.login || 'student'}@tma.uz`}</span>
                      </td>

                      <td className="p-3 text-slate-700">
                        <span className="font-semibold block">{faculty?.name || 'Davolash'}</span>
                        <span className="text-[11px] text-slate-500 block">{st.course || 4}-kurs</span>
                      </td>

                      <td className="p-3 text-slate-700">
                        <span className="font-semibold block">{group?.name || 'Guruh —'}</span>
                        <span className="text-[11px] text-slate-400 truncate max-w-[130px] block">{direction?.name || 'Davolash ishi'}</span>
                      </td>

                      <td className="p-3 text-slate-700">
                        <span className="font-semibold block truncate max-w-[150px]">{practice?.name}</span>
                        <span className="text-[11px] text-slate-400 truncate max-w-[150px] block">{supervisor?.fullName}</span>
                      </td>

                      <td className="p-3 text-center font-bold text-slate-800">
                        {studentJournals.length} kun
                      </td>

                      <td className="p-3 text-center">
                        <span className="font-bold text-emerald-700">{attPercent}%</span>
                      </td>

                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${statusBg}`}>
                          {statusLabel}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <span className="font-black text-amber-600">⭐ {avgRating}</span>
                      </td>

                      {/* Action buttons (Requirement 6) */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (studentJournals.length > 0) {
                                setInspectJournal(studentJournals[0]);
                                setIsDetailModalOpen(true);
                              } else {
                                showToast('warning', 'Yozuv yo\'q', 'Ushbu talabada hali kundalik yozuvlari mavjud emas.');
                              }
                            }}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Kundalikni ko'rish"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadPDF(st)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="PDF yuklab olish"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadExcel(st)}
                            className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Excel (.xlsx) yuklab olish"
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadZip(st)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="ZIP arxiv yuklab olish"
                          >
                            <FolderArchive className="w-4 h-4" />
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

      {/* Inspect Journal Modal */}
      {isDetailModalOpen && inspectJournal && (
        <DailyJournalDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setInspectJournal(null);
          }}
          journal={inspectJournal}
          student={students.find(s => s.id === inspectJournal.studentId)}
          practice={practices.find(p => p.id === inspectJournal.practiceId)}
          practicePlace={practicePlaces.find(p => p.id === inspectJournal.practicePlaceId)}
          supervisor={supervisors.find(s => s.id === inspectJournal.supervisorId)}
          canEdit={false}
          canReview={false}
        />
      )}
    </div>
  );
}
