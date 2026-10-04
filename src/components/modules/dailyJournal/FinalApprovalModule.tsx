import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  FileCheck,
  Building2,
  Calendar,
  UserCheck,
  Clock,
  Eye,
  Download,
  AlertCircle,
  Search,
  Filter,
  Award,
  Sparkles,
  Lock,
  ArrowRight,
  FileSpreadsheet
} from 'lucide-react';
import { DailyJournal, Student, Practice, PracticePlace, Supervisor, Faculty, Direction, Group, Course } from '../../../types';
import { dailyJournalService } from '../../../services/dailyJournalService';
import { storageService } from '../../../services/storageService';
import { journalExportService } from '../../../services/journalExportService';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { Modal } from '../../common/Modal';
import { DailyJournalDetailModal } from './DailyJournalDetailModal';

export function FinalApprovalModule() {
  const { currentUser, canonicalRole, role } = useAuth();
  const { showToast } = useToast();

  const [journals, setJournals] = useState<DailyJournal[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');
  
  // Selected student for detailed preview or final approve modal
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedPracticeId, setSelectedPracticeId] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [approvalNote, setApprovalNote] = useState('Barcha amaliyot kunlari to\'liq va namunali bajarilgan. Amaliyot bo\'limi tomonidan yakuniy tasdiqlandi.');
  const [isProcessing, setIsProcessing] = useState(false);

  // Journal detail modal for inspection
  const [inspectJournal, setInspectJournal] = useState<DailyJournal | null>(null);
  const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);

  const students = storageService.getStudents();
  const practices = storageService.getPractices();
  const practicePlaces = storageService.getPracticePlaces();
  const supervisors = storageService.getSupervisors();
  const faculties = storageService.getFaculties();
  const courses = storageService.getCourses();
  const groups = storageService.getGroups();
  const directions = storageService.getDirections();
  const allAttendance = storageService.getAttendance();

  const loadJournals = async () => {
    const data = await dailyJournalService.getAllJournals();
    setJournals(data);
  };

  useEffect(() => {
    loadJournals();
  }, []);

  // Group pending journals by Student & Practice
  // A student appears in Final Approval queue if they have journals in FINAL_PENDING
  // or if all their journals are SUPERVISOR_APPROVED
  const pendingQueues = useMemo(() => {
    // Map studentId -> journals
    const studentMap = new Map<string, DailyJournal[]>();
    journals.forEach(j => {
      const list = studentMap.get(j.studentId) || [];
      list.push(j);
      studentMap.set(j.studentId, list);
    });

    const queue: {
      student: Student;
      practice?: Practice;
      place?: PracticePlace;
      supervisor?: Supervisor;
      faculty?: Faculty;
      group?: Group;
      journals: DailyJournal[];
      finalPendingCount: number;
      supervisorApprovedCount: number;
      isReadyForFinalApproval: boolean;
      totalDays: number;
      attendancePercent: number;
      averageRating: string;
      status: string;
    }[] = [];

    studentMap.forEach((studentJournals, studentId) => {
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      // Group by practiceId
      const practiceId = studentJournals[0]?.practiceId;
      const practice = practices.find(p => p.id === practiceId);
      const place = practicePlaces.find(p => p.id === studentJournals[0]?.practicePlaceId);
      const supervisor = supervisors.find(s => s.id === studentJournals[0]?.supervisorId);
      const faculty = faculties.find(f => f.id === student.facultyId);
      const group = groups.find(g => g.id === student.groupId);

      const finalPending = studentJournals.filter(j => j.status === 'FINAL_PENDING');
      const supervisorApproved = studentJournals.filter(j => 
        j.status === 'SUPERVISOR_APPROVED' || j.status === 'APPROVED_BY_SUPERVISOR' || j.status === 'APPROVED'
      );
      const lockedOrFinal = studentJournals.filter(j => 
        j.status === 'FINAL_APPROVED' || j.status === 'LOCKED'
      );

      // Only show students who have at least one journal in FINAL_PENDING
      // OR students whose journals are all supervisor approved and not yet locked!
      const hasFinalPending = finalPending.length > 0;
      const allSupervisorApproved = studentJournals.length > 0 && 
        (finalPending.length + supervisorApproved.length === studentJournals.length) &&
        lockedOrFinal.length < studentJournals.length;

      if (hasFinalPending || allSupervisorApproved) {
        // Attendance calculation
        const studentAtt = allAttendance.filter(a => a.studentId === student.id && a.practiceId === practiceId);
        const presentAtt = studentAtt.filter(a => a.status.toUpperCase() === 'PRESENT' || a.status.toUpperCase() === 'LATE').length;
        const attRate = studentAtt.length > 0 ? Math.round((presentAtt / studentAtt.length) * 100) : 100;

        // Average Rating
        const ratings = studentJournals
          .map(j => j.supervisorRating)
          .filter((r): r is number => typeof r === 'number' && r > 0);
        const avg = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '5.0';

        queue.push({
          student,
          practice,
          place,
          supervisor,
          faculty,
          group,
          journals: studentJournals,
          finalPendingCount: finalPending.length,
          supervisorApprovedCount: supervisorApproved.length,
          isReadyForFinalApproval: true,
          totalDays: studentJournals.length,
          attendancePercent: attRate,
          averageRating: avg,
          status: hasFinalPending ? 'FINAL_PENDING' : 'SUPERVISOR_APPROVED'
        });
      }
    });

    return queue;
  }, [journals, students, practices, practicePlaces, supervisors, faculties, groups, allAttendance]);

  // Filter queue
  const filteredQueue = useMemo(() => {
    return pendingQueues.filter(item => {
      if (filterFaculty !== 'all' && item.student.facultyId !== filterFaculty) return false;
      if (filterCourse !== 'all' && String(item.student.course) !== filterCourse) return false;
      if (filterGroup !== 'all' && item.student.groupId !== filterGroup) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (item.student.fullName || '').toLowerCase();
        const id = (item.student.studentId || item.student.id || '').toLowerCase();
        const login = (item.student.login || '').toLowerCase();
        const practiceName = (item.practice?.name || '').toLowerCase();
        const supName = (item.supervisor?.fullName || '').toLowerCase();

        if (!name.includes(q) && !id.includes(q) && !login.includes(q) && !practiceName.includes(q) && !supName.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [pendingQueues, filterFaculty, filterCourse, filterGroup, searchQuery]);

  // Execute Final Approval
  const handleExecuteFinalApprove = async () => {
    if (!selectedStudentId || !currentUser) return;
    setIsProcessing(true);

    try {
      const targetQueue = pendingQueues.find(q => q.student.id === selectedStudentId);
      if (!targetQueue) throw new Error('Talaba navbatda topilmadi');

      // Update all journals for this student and practice to FINAL_APPROVED and isLocked = true
      const now = new Date().toISOString();
      for (const j of targetQueue.journals) {
        await dailyJournalService.finalApproveJournal(j.id, currentUser.uid || currentUser.id);
      }

      // Also ensure storageService state is fully synchronized, notifications and audit logs are recorded
      storageService.finalApproveStudentJournals(
        selectedStudentId,
        currentUser.uid || currentUser.id,
        currentUser.fullName || 'Amaliyot bo\'limi boshlig\'i',
        approvalNote
      );

      showToast(
        'success',
        'Yakuniy tasdiqlandi',
        `${targetQueue.student.fullName}ning amaliyot kundaligi yakuniy tasdiqlandi va qulflanib (LOCKED) arxivga joylandi.`
      );

      setIsConfirmModalOpen(false);
      setSelectedStudentId(null);
      await loadJournals();
    } catch (e: any) {
      console.error('Final approval error:', e);
      showToast('error', 'Xatolik', e.message || 'Yakuniy tasdiqlashda xatolik yuz berdi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPDF = async (item: typeof pendingQueues[0]) => {
    const { doc, filename } = await journalExportService.generatePDF({
      student: item.student,
      practice: item.practice,
      journals: item.journals,
      attendances: allAttendance.filter(a => a.studentId === item.student.id),
      supervisor: item.supervisor,
      practicePlace: item.place,
      faculty: item.faculty,
      group: item.group
    });
    journalExportService.downloadPDF(doc, filename);
    showToast('success', 'PDF yuklab olindi', filename);
  };

  const handleDownloadExcel = (item: typeof pendingQueues[0]) => {
    const { wb, filename } = journalExportService.generateExcel({
      student: item.student,
      practice: item.practice,
      journals: item.journals,
      attendances: allAttendance.filter(a => a.studentId === item.student.id),
      supervisor: item.supervisor,
      practicePlace: item.place,
      faculty: item.faculty,
      group: item.group,
      direction: directions.find(d => d.id === item.student.directionId)
    });
    journalExportService.downloadExcel(wb, filename);
    showToast('success', 'Excel (.xlsx) yuklab olindi', `${item.student.fullName} elektron kundaligi Excel fayliga yuklandi.`);
  };

  const handleDownloadAllPendingExcel = () => {
    if (filteredQueue.length === 0) {
      showToast('warning', 'Talabalar topilmadi', 'Eksport qilish uchun talabalar mavjud emas.');
      return;
    }
    const { wb, filename } = journalExportService.generateFinalApprovalListExcel(filteredQueue);
    journalExportService.downloadExcel(wb, filename);
    showToast('success', 'Excel (.xlsx) yuklab olindi', `${filteredQueue.length} nafar kutilayotgan talabalar ro'yxati Excel fayliga yuklandi.`);
  };

  const handleDownloadZip = async (item: typeof pendingQueues[0]) => {
    showToast('info', 'Arxiv tayyorlanmoqda', 'PDF va Excel fayllar arxivlanmoqda...');
    const { blob, filename } = await journalExportService.generateZip({
      student: item.student,
      practice: item.practice,
      journals: item.journals,
      attendances: allAttendance.filter(a => a.studentId === item.student.id),
      supervisor: item.supervisor,
      practicePlace: item.place,
      faculty: item.faculty,
      group: item.group
    });
    journalExportService.downloadBlob(blob, filename);
    showToast('success', 'ZIP arxiv yuklandi', filename);
  };

  const activeTargetItem = pendingQueues.find(q => q.student.id === selectedStudentId);

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-semibold backdrop-blur-md">
              <Clock className="w-3.5 h-3.5" />
              <span>Amaliyot bo'limi boshlig'i yakuniy tasdiqlash xizmati</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Yakuniy tasdiqlash navbati (FINAL APPROVAL)
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Ushbu sahifada amaliyot rahbari tomonidan to'liq tekshirilib tasdiqlangan va yakuniy tasdiq kutayotgan (FINAL_PENDING) talabalar kundaliklari aks etadi. Yakuniy tasdiqlangandan so'ng kundalik butunlay qulflanadi (LOCKED) va arxiv fondiga yo'naltiriladi.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10 shrink-0">
            <div className="text-center">
              <span className="text-[11px] text-slate-300 block font-medium">Kutilayotgan talabalar</span>
              <span className="text-3xl font-black text-amber-400">{pendingQueues.length}</span>
            </div>
            <div className="h-10 w-px bg-white/20"></div>
            <div className="text-center">
              <span className="text-[11px] text-slate-300 block font-medium">Status</span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full inline-block mt-1">
                FINAL_PENDING
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Talaba F.I.Sh., HEMIS ID, guruh yoki amaliyot nomi bo'yicha qidirish..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={filterFaculty}
              onChange={e => setFilterFaculty(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">Barcha fakultetlar</option>
              {faculties.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterGroup}
              onChange={e => setFilterGroup(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">Barcha guruhlar</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">
              Yakuniy tasdiq kutayotgan talabalar: {filteredQueue.length} nafar
            </span>
            <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Barcha kunlari tasdiqlangan
            </span>
          </div>

          <button
            type="button"
            onClick={handleDownloadAllPendingExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold transition-colors shadow-2xs self-start sm:self-auto"
            title="Barcha yakuniy tasdiq kutayotgan talabalar ro'yxatini Excel (.xlsx) da yuklab olish"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Kutilayotganlarni Excel (.xlsx) yuklash</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Talaba (HEMIS / Login)</th>
                <th className="p-3">Fakultet & Guruh</th>
                <th className="p-3">Amaliyot & Klinik baza</th>
                <th className="p-3">Rahbar (Supervisor)</th>
                <th className="p-3 text-center">Kunlar soni</th>
                <th className="p-3 text-center">Davomat & Baho</th>
                <th className="p-3 text-center">Holati</th>
                <th className="p-3 text-right">Yakuniy Harakat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <CheckCircle className="w-10 h-10 mx-auto text-emerald-400 mb-2 opacity-60" />
                    <p className="font-bold text-slate-700 text-xs">
                      Yakuniy tasdiqlash uchun kutilayotgan arizalar yo'q.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Barcha amaliyot rahbarlari tomonidan topshirilgan arizalar yakuniy tasdiqlangan yoki hali jarayonda.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredQueue.map(item => (
                  <tr key={item.student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{item.student.fullName}</span>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span className="text-blue-700 font-bold">{item.student.login || item.student.studentId}</span>
                        <span>•</span>
                        <span>ID: {item.student.studentId || item.student.id}</span>
                      </div>
                    </td>

                    <td className="p-3 text-slate-700">
                      <span className="font-semibold block">{item.group?.name || 'Guruh —'}</span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[150px] block">{item.faculty?.name}</span>
                    </td>

                    <td className="p-3 text-slate-700">
                      <span className="font-semibold block truncate max-w-[170px]">{item.practice?.name}</span>
                      <span className="text-[11px] text-blue-700 font-medium block truncate max-w-[170px]">
                        {item.place?.name}
                      </span>
                    </td>

                    <td className="p-3 text-slate-700">
                      <span className="font-semibold block truncate max-w-[150px]">{item.supervisor?.fullName || 'Amaliyot rahbari'}</span>
                      <span className="text-[11px] text-slate-400 block">Kafedra mas'uli</span>
                    </td>

                    <td className="p-3 text-center">
                      <div className="inline-block px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg">
                        <strong className="font-black text-emerald-700">{item.totalDays}</strong>
                        <span className="text-[10px] text-emerald-600 block font-medium">kun to'liq</span>
                      </div>
                    </td>

                    <td className="p-3 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-emerald-700">{item.attendancePercent}% davomat</span>
                        <span className="text-[11px] font-black text-amber-500 mt-0.5">⭐ {item.averageRating} ball</span>
                      </div>
                    </td>

                    <td className="p-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-amber-800 bg-amber-100 rounded-md">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>FINAL_PENDING</span>
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.journals.length > 0) {
                              setInspectJournal(item.journals[0]);
                              setIsInspectModalOpen(true);
                            }
                          }}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Batafsil tekshirish"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadPDF(item)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="PDF eksport"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadExcel(item)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Talaba kundaligini Excel (.xlsx) da yuklab olish"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudentId(item.student.id);
                            setSelectedPracticeId(item.practice?.id || null);
                            setIsConfirmModalOpen(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-all hover:scale-102"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Final Approve</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Final Approve */}
      {isConfirmModalOpen && activeTargetItem && (
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false);
            setSelectedStudentId(null);
          }}
          title="Yakuniy tasdiqlash va qulflash (LOCKED)"
          subtitle={`${activeTargetItem.student.fullName} • ${activeTargetItem.group?.name || ''}`}
          maxWidth="md"
        >
          <div className="p-6 space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <strong className="block font-bold mb-0.5">Muhim qonuniy ogohlantirish:</strong>
                Yakuniy tasdiqlash bosilgandan so'ng, ushbu talabaning barcha ({activeTargetItem.totalDays} ta) amaliyot kundaliklari <strong>FINAL_APPROVED</strong> va <strong>LOCKED</strong> holatiga o'tadi. Talaba yoki amaliyot rahbari tomonidan qayta o'zgartirish yoki tahrirlash butunlay to'xtatiladi.
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Talaba:</span>
                <strong className="text-slate-900">{activeTargetItem.student.fullName}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Amaliyot:</span>
                <strong className="text-slate-900">{activeTargetItem.practice?.name}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Davomat ko'rsatkichi:</span>
                <strong className="text-emerald-700">{activeTargetItem.attendancePercent}%</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Rahbar o'rtacha bahosi:</span>
                <strong className="text-amber-600">⭐ {activeTargetItem.averageRating} ball</strong>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Amaliyot bo'limi boshlig'i xulosasi / Izohi:
              </label>
              <textarea
                rows={2}
                value={approvalNote}
                onChange={e => setApprovalNote(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setSelectedStudentId(null);
                }}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Bekor qilish
              </button>

              <button
                type="button"
                onClick={handleExecuteFinalApprove}
                disabled={isProcessing}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isProcessing ? "Tasdiqlanmoqda..." : "Tasdiqlash va qulflash"}</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Detailed Inspection Modal */}
      {isInspectModalOpen && inspectJournal && (
        <DailyJournalDetailModal
          isOpen={isInspectModalOpen}
          onClose={() => {
            setIsInspectModalOpen(false);
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
