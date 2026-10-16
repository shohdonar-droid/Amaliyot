import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Search,
  MessageSquare,
  FileCheck,
  Building2,
  Calendar,
  UserCheck,
  AlertTriangle,
  Printer,
  Eye,
  Filter,
  Users,
  Award,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Download,
  Stethoscope,
  HeartPulse,
  CheckCircle2,
  Lock,
  FileSpreadsheet,
  GraduationCap
} from 'lucide-react';
import { DailyJournal, Student, Practice, PracticePlace, Supervisor, Faculty, Direction, Group, Course, PracticeAssignment, Attendance } from '../../../types';
import { dailyJournalService } from '../../../services/dailyJournalService';
import { storageService } from '../../../services/storageService';
import { journalExportService } from '../../../services/journalExportService';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { StatusBadge } from '../../common/Badge';
import { Modal } from '../../common/Modal';
import { DailyJournalFormModal } from './DailyJournalFormModal';
import { DailyJournalDetailModal } from './DailyJournalDetailModal';
import { DailyJournalReviewModal } from './DailyJournalReviewModal';
import { DailyJournalPrintView } from './DailyJournalPrintView';
import { FinalApprovalModule } from './FinalApprovalModule';
import { JournalArchiveModule } from './JournalArchiveModule';

export function DailyJournalModule() {
  const { showToast } = useToast();
  const { currentUser, role, canonicalRole } = useAuth();
  const [journals, setJournals] = useState<DailyJournal[]>([]);
  
  useEffect(() => {
      refreshJournals();
  }, []);
  const students = storageService.getStudents();
  const practices = storageService.getPractices();
  const practicePlaces = storageService.getPracticePlaces();
  const supervisors = storageService.getSupervisors();
  const faculties = storageService.getFaculties();
  const directions = storageService.getDirections();
  const courses = storageService.getCourses();
  const groups = storageService.getGroups();
  const assignments = storageService.getPracticeAssignments();
  const allAttendance = storageService.getAttendance();

  // Role detection
  const isStudent = canonicalRole === 'STUDENT' || role === 'student';
  const isSupervisor = canonicalRole === 'PRACTICE_SUPERVISOR' || role === 'supervisor';
  const isSupervisorOnly = isSupervisor && canonicalRole !== 'SUPER_ADMIN' && canonicalRole !== 'PRACTICE_HEAD' && canonicalRole !== 'PRACTICE_STAFF';
  const isPracticeHeadOrAdmin = canonicalRole === 'PRACTICE_HEAD' || canonicalRole === 'SUPER_ADMIN' || canonicalRole === 'PRACTICE_STAFF';
  const isDean = canonicalRole === 'FACULTY_DEAN';
  const isSupervisorOrStaff = isSupervisor || isPracticeHeadOrAdmin || isDean || canonicalRole === 'CLINIC_RESPONSIBLE';

  // Active view tab
  const [viewTab, setViewTab] = useState<'student_cabinet' | 'all_journals' | 'final_approval' | 'archive'>(
    isStudent ? 'student_cabinet' : (isSupervisorOnly ? 'all_journals' : (isPracticeHeadOrAdmin ? 'final_approval' : 'all_journals'))
  );
  const [managementSubTab, setManagementSubTab] = useState<'assigned_students' | 'all_table'>(
    isSupervisor ? 'assigned_students' : (isPracticeHeadOrAdmin ? 'assigned_students' : 'all_table')
  );

  // Filters for management view
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPractice, setFilterPractice] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('all');
  const [filterDirection, setFilterDirection] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterPlace, setFilterPlace] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterSupervisor, setFilterSupervisor] = useState('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modals state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [journalToEdit, setJournalToEdit] = useState<DailyJournal | null>(null);
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<DailyJournal | null>(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [journalToReview, setJournalToReview] = useState<DailyJournal | null>(null);
  const [reviewInitialDecision, setReviewInitialDecision] = useState<'APPROVED' | 'REVISION'>('APPROVED');

  const [isPrintViewOpen, setIsPrintViewOpen] = useState(false);
  const [journalToPrint, setJournalToPrint] = useState<DailyJournal | null>(null);

  const refreshJournals = async () => {
    const data = await dailyJournalService.getAllJournals();
    setJournals(data);
  };

  // Determine current student profile for Student Cabinet view (Strict Role Isolation)
  const currentStudent = useMemo(() => {
    if (!students || students.length === 0) return null;
    return students.find(s => s?.userId === currentUser?.uid || s?.id === currentUser?.studentId || s?.login === currentUser?.login) || null;
  }, [students, currentUser]);

  const currentAssignment = useMemo(() => {
    if (!currentStudent || !assignments || assignments.length === 0) return null;
    return assignments.find((a: PracticeAssignment) => a?.studentId === currentStudent.id) || null;
  }, [assignments, currentStudent]);

  const currentPractice = useMemo(() => {
    if (!practices || practices.length === 0 || !currentAssignment) return null;
    if (currentAssignment?.practiceId) {
      return practices.find(p => p?.id === currentAssignment.practiceId) || null;
    }
    return null;
  }, [practices, currentAssignment]);

  const currentPlace = useMemo(() => {
    if (!practicePlaces || practicePlaces.length === 0 || !currentAssignment) return null;
    if (currentAssignment?.practicePlaceId) {
      return practicePlaces.find(p => p?.id === currentAssignment.practicePlaceId) || null;
    }
    return null;
  }, [practicePlaces, currentAssignment]);

  const currentSupervisor = useMemo(() => {
    if (!supervisors || supervisors.length === 0 || !currentAssignment) return null;
    if (currentAssignment?.supervisorId) {
      return supervisors.find(s => s?.id === currentAssignment.supervisorId) || null;
    }
    return null;
  }, [supervisors, currentAssignment]);

  // Student's own attendance and attendance rate
  const studentAttendanceList = useMemo(() => {
    if (!currentStudent || !currentPractice || !allAttendance) return [];
    return allAttendance.filter(a => a?.studentId === currentStudent.id && a?.practiceId === currentPractice.id);
  }, [allAttendance, currentStudent, currentPractice]);

  const studentPracticeTotalDays = useMemo(() => {
    if (!currentPractice) return 30;
    if (currentPractice.durationDays && currentPractice.durationDays > 0) return currentPractice.durationDays;
    if (currentPractice.startDate && currentPractice.endDate) {
      const s = new Date(currentPractice.startDate).getTime();
      const e = new Date(currentPractice.endDate).getTime();
      if (!isNaN(s) && !isNaN(e) && e >= s) {
        return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
      }
    }
    return 30;
  }, [currentPractice]);

  const studentAttendedDays = useMemo(() => {
    return studentAttendanceList.filter(a => (a?.status || '').toUpperCase() === 'PRESENT' || (a?.status || '').toUpperCase() === 'LATE').length;
  }, [studentAttendanceList]);

  const studentAttendanceRate = useMemo(() => {
    if (studentPracticeTotalDays === 0) return 100;
    return Math.min(100, Math.round((studentAttendedDays / studentPracticeTotalDays) * 100));
  }, [studentAttendedDays, studentPracticeTotalDays]);

  // Student's journals
  const studentJournals = useMemo(() => {
    if (!currentStudent || !journals) return [];
    return journals.filter(j => j?.studentId === currentStudent.id);
  }, [journals, currentStudent]);

  const studentApprovedJournalsCount = useMemo(() => {
    return studentJournals.filter(j => ['APPROVED', 'SUPERVISOR_APPROVED', 'FINAL_APPROVED', 'LOCKED'].includes((j.status || '').toUpperCase())).length;
  }, [studentJournals]);

  // Today's attendance record for current student
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = useMemo(() => {
    return studentAttendanceList.find(a => a?.date === todayStr);
  }, [studentAttendanceList, todayStr]);

  const todayJournal = useMemo(() => {
    return studentJournals.find(j => j?.date === todayStr);
  }, [studentJournals, todayStr]);

  const revisionNeededJournal = useMemo(() => {
    return studentJournals.find(j => {
      const st = (j?.status || '').toUpperCase();
      return st === 'REVISION' || st === 'REJECTED';
    });
  }, [studentJournals]);

  // Permanent days list for student cabinet
  const studentDaysList = useMemo(() => {
    if (!currentStudent || !studentAttendanceList) return [];
    const sortedAtt = [...studentAttendanceList].sort((a, b) => a.date.localeCompare(b.date));
    return sortedAtt.map((att, index) => {
      const dayNum = index + 1;
      const j = studentJournals.find(item => item.date === att.date || item.attendanceId === att.id);
      return {
        dayNum,
        attendance: att,
        date: att.date,
        journal: j
      };
    });
  }, [currentStudent, studentAttendanceList, studentJournals]);

  // Supervisor and Practice Head assigned students summary list
  const supervisorAssignedStudents = useMemo(() => {
    let assignedStus: Student[] = [];
    if (isSupervisor) {
      const loggedInSup = storageService.getSupervisorForUser(currentUser as any) || supervisors.find(s => s.userId === currentUser?.uid || s.id === currentUser?.id || s.email === currentUser?.email);
      const supIdList = loggedInSup ? [loggedInSup.id, currentUser?.uid || '', currentUser?.id || ''] : [currentUser?.uid || '', currentUser?.id || '', 'sup-1'];
      let supAssignments = assignments.filter(a => supIdList.includes(a.supervisorId));
      if (supAssignments.length === 0 && assignments.length > 0) {
        supAssignments = assignments;
      }
      const assignedStuIds = new Set(supAssignments.map(a => a.studentId));
      assignedStus = students.filter(s => assignedStuIds.has(s.id) || assignedStuIds.has(s.studentId));
      if (assignedStus.length === 0) assignedStus = students.slice(0, 15);
    } else {
      // Amaliyot rahbariyati / Head / Admin
      const assignedStuIds = new Set(assignments.map(a => a.studentId));
      assignedStus = students.filter(s => assignedStuIds.has(s.id) || assignedStuIds.has(s.studentId));
      if (assignedStus.length === 0) assignedStus = students.slice(0, 20);
    }

    return assignedStus.map(student => {
      const stuAsg = assignments.find(a => a.studentId === student.id || a.studentId === student.studentId);
      const stuPractice = practices.find(p => p.id === stuAsg?.practiceId) || practices[0];
      const stuPlace = practicePlaces.find(pl => pl.id === stuAsg?.practicePlaceId) || practicePlaces[0];
      const stuSup = supervisors.find(s => s.id === stuAsg?.supervisorId);

      // Jami amaliyot kunlari soni (Practice duration in days)
      let totalPracticeDays = stuPractice?.durationDays;
      if (!totalPracticeDays || totalPracticeDays <= 0) {
        if (stuPractice?.startDate && stuPractice?.endDate) {
          const s = new Date(stuPractice.startDate).getTime();
          const e = new Date(stuPractice.endDate).getTime();
          if (!isNaN(s) && !isNaN(e) && e >= s) {
            totalPracticeDays = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
          }
        }
      }
      if (!totalPracticeDays || totalPracticeDays <= 0) totalPracticeDays = 30;

      // Qilingan davomat kunlari
      const stuAtts = allAttendance.filter(a => 
        (a.studentId === student.id || a.studentId === student.studentId) && 
        (a.status?.toUpperCase() === 'PRESENT' || a.status?.toUpperCase() === 'LATE')
      );
      const attendedDaysCount = stuAtts.length;
      const attendancePercent = Math.min(100, Math.round((attendedDaysCount / totalPracticeDays) * 100));

      // Kunlik kundaliklar
      const stuJournals = journals.filter(j => j.studentId === student.id || j.studentId === student.studentId);
      const submittedCount = stuJournals.filter(j => ['SUBMITTED', 'PENDING', 'OPEN'].includes((j.status || '').toUpperCase())).length;
      const approvedCount = stuJournals.filter(j => ['APPROVED', 'SUPERVISOR_APPROVED', 'FINAL_APPROVED', 'LOCKED'].includes((j.status || '').toUpperCase())).length;
      const revisionCount = stuJournals.filter(j => ['REVISION', 'REJECTED'].includes((j.status || '').toUpperCase())).length;
      const draftCount = stuJournals.filter(j => (j.status || '').toUpperCase() === 'DRAFT').length;

      // Tasdiqlanmay turganlar (Tekshiruv kutilayotgan + qayta ishlashdagi kundaliklar)
      const unapprovedCount = submittedCount + revisionCount;
      const journalPercent = Math.min(100, Math.round((approvedCount / totalPracticeDays) * 100));

      return {
        student,
        practice: stuPractice,
        place: stuPlace,
        supervisor: stuSup,
        assignment: stuAsg,
        totalPracticeDays,
        attendedDaysCount,
        attendancePercent,
        submittedCount,
        approvedCount,
        revisionCount,
        draftCount,
        unapprovedCount,
        journalPercent,
        stuJournals,
        stuAtts
      };
    });
  }, [isSupervisor, supervisors, currentUser, assignments, students, allAttendance, journals, practices, practicePlaces]);

  const [selectedStudentForSupervisor, setSelectedStudentForSupervisor] = useState<{
    student: Student;
    practice: Practice | null;
    place?: PracticePlace;
    supervisor?: Supervisor;
    assignment?: PracticeAssignment;
    totalPracticeDays: number;
    attendedDaysCount: number;
    attendancePercent: number;
    submittedCount: number;
    approvedCount: number;
    revisionCount: number;
    draftCount: number;
    unapprovedCount: number;
    journalPercent: number;
    stuJournals: DailyJournal[];
    stuAtts: Attendance[];
  } | null>(null);
  const [isSupervisorStudentModalOpen, setIsSupervisorStudentModalOpen] = useState(false);
  const [supervisorModalTab, setSupervisorModalTab] = useState<'all' | 'unapproved'>('unapproved');

  // Calculate Statistics (Section 1)
  const stats = useMemo(() => {
    const totalStudents = students ? students.length : 0;
    // Unique students who submitted at least one journal
    const studentsWithJournal = new Set((journals || []).map(j => j?.studentId).filter(Boolean)).size;
    const studentsWithoutJournal = Math.max(0, totalStudents - studentsWithJournal);

    const pendingCount = (journals || []).filter(j => (j?.status || '').toUpperCase() === 'PENDING').length;
    const approvedCount = (journals || []).filter(j => (j?.status || '').toUpperCase() === 'APPROVED').length;
    const revisionCount = (journals || []).filter(j => {
      const st = (j?.status || '').toUpperCase();
      return st === 'REVISION' || st === 'REJECTED';
    }).length;

    return {
      totalStudents,
      studentsWithJournal,
      studentsWithoutJournal,
      pendingCount,
      approvedCount,
      revisionCount
    };
  }, [students, journals]);

  // Filtered journals for the management view
  const filteredJournals = useMemo(() => {
    return journals.filter(journal => {
      // Status filter
      if (filterStatus !== 'all') {
        const jStatus = (journal.status || '').toUpperCase();
        const fStatus = filterStatus.toUpperCase();
        if (fStatus === 'APPROVED' || fStatus === 'SUPERVISOR_APPROVED') {
          if (!jStatus.includes('APPROV') && jStatus !== 'SUPERVISOR_APPROVED') return false;
        } else if (fStatus === 'SUBMITTED' || fStatus === 'PENDING') {
          if (jStatus !== 'SUBMITTED' && jStatus !== 'PENDING' && jStatus !== 'SUBMITTED_TO_SUPERVISOR' && jStatus !== 'OPEN') return false;
        } else if (fStatus === 'REVISION') {
          if (jStatus !== 'REVISION' && jStatus !== 'REJECTED' && jStatus !== 'RETURNED_FOR_EDIT') return false;
        } else if (jStatus !== fStatus) {
          return false;
        }
      }

      // Supervisor isolation:
      // If logged-in user is a supervisor (and not head/admin), strictly allow ONLY their assigned students' journals!
      const loggedInSupervisor = supervisors.find(s => s.userId === currentUser?.uid || s.id === currentUser?.id);
      if (isSupervisorOnly && loggedInSupervisor) {
        if (journal.supervisorId !== loggedInSupervisor.id) {
          return false;
        }
      }

      // Practice filter
      if (filterPractice !== 'all' && journal.practiceId !== filterPractice) {
        return false;
      }

      // Date filter
      if (filterDate && journal.date !== filterDate) {
        return false;
      }

      // Clinic place filter
      if (filterPlace !== 'all' && journal.practicePlaceId !== filterPlace) {
        return false;
      }

      // Bo'lim filter
      if (filterDepartment !== 'all' && journal.department !== filterDepartment) {
        return false;
      }

      // Supervisor filter
      if (filterSupervisor !== 'all' && journal.supervisorId !== filterSupervisor) {
        return false;
      }

      // Student and Academic filters
      const student = students.find(s => s.id === journal.studentId);
      if (filterFaculty !== 'all' && student?.facultyId !== filterFaculty) {
        return false;
      }
      if (filterDirection !== 'all' && student?.directionId !== filterDirection) {
        return false;
      }
      if (filterCourse !== 'all' && student?.courseId !== filterCourse) {
        return false;
      }
      if (filterGroup !== 'all' && student?.groupId !== filterGroup) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const studentName = student?.fullName?.toLowerCase() || '';
        const dept = (journal.department || '').toLowerCase();
        const summary = (journal.workSummary || '').toLowerCase();
        const diagnoses = (journal.patientDiagnosesSummary || '').toLowerCase();
        const cases = (journal.clinicalCasesSummary || '').toLowerCase();
        const procedures = Array.isArray(journal.proceduresDone)
          ? journal.proceduresDone.map(p => typeof p === 'string' ? p : JSON.stringify(p)).join(' ').toLowerCase()
          : '';

        if (
          !studentName.includes(q) &&
          !dept.includes(q) &&
          !summary.includes(q) &&
          !diagnoses.includes(q) &&
          !cases.includes(q) &&
          !procedures.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    journals,
    filterStatus,
    filterPractice,
    filterDate,
    filterPlace,
    filterDepartment,
    filterSupervisor,
    filterFaculty,
    filterDirection,
    filterCourse,
    filterGroup,
    searchQuery,
    students
  ]);

  // Helper to open detail modal
  const handleOpenDetail = (journal: DailyJournal) => {
    setSelectedJournal(journal);
    setIsDetailModalOpen(true);
  };

  // Helper to open review modal
  const handleOpenReview = (journal: DailyJournal, decision: 'APPROVED' | 'REVISION' = 'APPROVED') => {
    setJournalToReview(journal);
    setReviewInitialDecision(decision);
    setIsReviewModalOpen(true);
  };

  // Helper to open print view
  const handleOpenPrint = (journal: DailyJournal) => {
    setJournalToPrint(journal);
    setIsPrintViewOpen(true);
  };

  // Helper to open edit modal (for revision)
  const handleOpenEdit = (journal: DailyJournal) => {
    setJournalToEdit(journal);
    setIsSubmitModalOpen(true);
  };

  // Real Excel (.xlsx) export for filtered journals table
  const handleDownloadJournalsExcel = () => {
    if (filteredJournals.length === 0) {
      showToast('warning', 'Kundaliklar topilmadi', 'Eksport qilish uchun kundaliklar mavjud emas.');
      return;
    }
    const { wb, filename } = journalExportService.generateJournalsListExcel({
      journals: filteredJournals,
      students,
      practices,
      practicePlaces,
      supervisors,
      faculties,
      groups,
      directions,
      allAttendance
    });
    journalExportService.downloadExcel(wb, filename);
    showToast('success', 'Excel (.xlsx) yuklab olindi', `${filteredJournals.length} ta kundalik barcha ustunlari bilan Excel fayliga yuklandi.`);
  };

  // Real Excel (.xlsx) export for single student's complete daily journal
  const handleDownloadStudentExcel = (journal: DailyJournal) => {
    const student = students.find(s => s.id === journal.studentId);
    if (!student) {
      showToast('error', 'Xatolik', 'Talaba ma\'lumotlari topilmadi.');
      return;
    }
    const studentJournals = journals.filter(j => j.studentId === student.id);
    const practice = practices.find(p => p.id === journal.practiceId);
    const place = practicePlaces.find(p => p.id === journal.practicePlaceId);
    const sup = supervisors.find(s => s.id === journal.supervisorId);
    const fac = faculties.find(f => f.id === student.facultyId);
    const grp = groups.find(g => g.id === student.groupId);
    const dir = directions.find(d => d.id === student.directionId);

    const { wb, filename } = journalExportService.generateExcel({
      student,
      practice,
      journals: studentJournals,
      attendances: allAttendance.filter(a => a.studentId === student.id),
      supervisor: sup,
      practicePlace: place,
      faculty: fac,
      group: grp,
      direction: dir
    });
    journalExportService.downloadExcel(wb, filename);
    showToast('success', 'Excel (.xlsx) yuklab olindi', `${student.fullName} elektron kundaligi yuklandi.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Elektron amaliyot kundaligi
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kunlik bajarilgan ishlar, ko'rilgan bemorlar, muolajalar tahlili va rahbar bahosi
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Switch tabs between Student view, Management view, Final Approval, and Archive */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold flex-wrap gap-1">
            {isStudent && (
              <button
                type="button"
                onClick={() => setViewTab('student_cabinet')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewTab === 'student_cabinet'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mening kundaligim (Talaba)
              </button>
            )}

            {!isStudent && (
              <button
                type="button"
                onClick={() => setViewTab('all_journals')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewTab === 'all_journals'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isSupervisor ? "Mening talabalarim (Supervisor)" : "Kundaliklar nazorati (Tekshiruv)"}
              </button>
            )}

            {isPracticeHeadOrAdmin && (
              <button
                type="button"
                onClick={() => setViewTab('final_approval')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewTab === 'final_approval'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Yakuniy tasdiqlash (Final Approval)
              </button>
            )}

            {(isPracticeHeadOrAdmin || isDean) && (
              <button
                type="button"
                onClick={() => setViewTab('archive')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewTab === 'archive'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Elektron Arxiv & Eksport
              </button>
            )}
          </div>

          {isStudent && (
            <button
              type="button"
              onClick={() => {
                setJournalToEdit(null);
                setIsSubmitModalOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Kundalik to'ldirish</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. MANAGEMENT / ALL JOURNALS OVERVIEW OR SUPERVISOR ASSIGNED STUDENTS */}
      {viewTab === 'all_journals' && (
        <div className="space-y-4">
          {/* Sub-tab switcher for Supervisor and Practice Management */}
          {(isSupervisor || isPracticeHeadOrAdmin || isDean) && (
            <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded-xl flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setManagementSubTab('assigned_students')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    managementSubTab === 'assigned_students'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>{isSupervisor ? "Mening biriktirilgan talabalarim" : "Talabalar kesimida kundaliklar nazorati"}</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-blue-100 text-blue-800 text-[10px]">
                    {supervisorAssignedStudents.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setManagementSubTab('all_table')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    managementSubTab === 'all_table'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Barcha kundaliklar filtrlari ro'yxati</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-500 font-medium px-2 hidden sm:block">
                Talaba yuborgan kundaliklarni tekshirish, tasdiqlash yoki kamchilik izohi bilan qaytarish
              </div>
            </div>
          )}

          {managementSubTab === 'assigned_students' ? (
            <div className="space-y-4">
              {/* Quick Summary Cards for Supervisor */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  <span className="text-[11px] font-medium text-slate-500 block">Biriktirilgan talabalar</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl font-black text-slate-900">{supervisorAssignedStudents.length}</span>
                    <span className="text-[10px] text-slate-400 font-medium">nafar talaba</span>
                  </div>
                </div>

                <div className="p-3.5 bg-white border border-blue-200 rounded-xl shadow-2xs bg-blue-50/20">
                  <span className="text-[11px] font-medium text-blue-800 block">Tekshiruv kutilayotgan</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl font-black text-blue-700">
                      {supervisorAssignedStudents.reduce((sum, r) => sum + r.submittedCount, 0)}
                    </span>
                    <span className="text-[10px] font-bold text-blue-600">kundalik</span>
                  </div>
                </div>

                <div className="p-3.5 bg-white border border-teal-200 rounded-xl shadow-2xs bg-teal-50/20">
                  <span className="text-[11px] font-medium text-teal-800 block">Tasdiqlangan jami</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl font-black text-teal-700">
                      {supervisorAssignedStudents.reduce((sum, r) => sum + r.approvedCount, 0)}
                    </span>
                    <span className="text-[10px] font-bold text-teal-600">qabul qilindi</span>
                  </div>
                </div>

                <div className="p-3.5 bg-white border border-amber-200 rounded-xl shadow-2xs bg-amber-50/20">
                  <span className="text-[11px] font-medium text-amber-800 block">Tasdiqlanmay turganlar</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl font-black text-amber-700">
                      {supervisorAssignedStudents.reduce((sum, r) => sum + r.unapprovedCount, 0)}
                    </span>
                    <span className="text-[10px] font-bold text-amber-600">ko'rib chiqish</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Assigned Students Table */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
                <div className="p-3.5 border-b border-slate-200 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>Amaliyot talabalari davomati va kundaliklar monitoringi</span>
                  </h4>
                  <span className="text-xs text-slate-500">
                    Jami {supervisorAssignedStudents.length} nafar amaliyotchi
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Talaba F.I.Sh. & Guruh</th>
                        <th className="p-3 text-center">Jami amaliyot kunlari</th>
                        <th className="p-3 text-center">Bajarilgan davomat</th>
                        <th className="p-3 text-center">Kunlik kundaliklar (Bajarilgan)</th>
                        <th className="p-3 text-center">Tekshiruvga yuborilgan</th>
                        <th className="p-3 text-center">Tasdiqlanmay turganlar</th>
                        <th className="p-3 text-right">Amallar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {supervisorAssignedStudents.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                            Biriktirilgan talabalar ro'yxati topilmadi.
                          </td>
                        </tr>
                      ) : (
                        supervisorAssignedStudents.map(row => {
                          const group = groups.find(g => g.id === row.student.groupId);
                          return (
                            <tr key={row.student.id} className="hover:bg-slate-50/70 transition-colors">
                              {/* Talaba info */}
                              <td className="p-3">
                                <span className="font-bold text-slate-900 block text-xs">{row.student.fullName}</span>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono mt-0.5">
                                  <span>Guruh: {group?.name || '—'}</span>
                                  <span>•</span>
                                  <span className="text-blue-700 font-semibold">{row.student.login || row.student.studentId}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 block truncate max-w-[200px] mt-0.5">
                                  {row.place?.name} · {row.assignment?.department || 'Terapiya'}
                                </span>
                              </td>

                              {/* Jami amaliyot kunlari soni */}
                              <td className="p-3 text-center">
                                <span className="font-mono font-bold text-slate-900 text-xs block">
                                  {row.totalPracticeDays} kun
                                </span>
                                <span className="text-[10px] text-slate-500 truncate max-w-[130px] block mx-auto">
                                  {row.practice?.name || 'Amaliyot'}
                                </span>
                              </td>

                              {/* Bajarilgan davomat soni */}
                              <td className="p-3 text-center">
                                <span className="font-mono font-bold text-emerald-700 text-xs block">
                                  {row.attendedDaysCount} / {row.totalPracticeDays} kun
                                </span>
                                <div className="w-20 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden mx-auto">
                                  <div
                                    className="h-full bg-emerald-500 rounded-full transition-all"
                                    style={{ width: `${Math.min(100, (row.attendedDaysCount / row.totalPracticeDays) * 100)}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                                  {row.attendancePercent}% davomat
                                </span>
                              </td>

                              {/* Bajarilgan kunlik kundaliklar (Tasdiqlangan) */}
                              <td className="p-3 text-center">
                                <span className="font-mono font-bold text-teal-700 text-xs block">
                                  {row.approvedCount} / {row.totalPracticeDays} kun
                                </span>
                                <div className="w-20 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden mx-auto">
                                  <div
                                    className="h-full bg-teal-500 rounded-full transition-all"
                                    style={{ width: `${Math.min(100, (row.approvedCount / row.totalPracticeDays) * 100)}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-teal-700 font-semibold block mt-0.5">
                                  {row.journalPercent}% bajarildi
                                </span>
                              </td>

                              {/* Tekshiruvga yuborilgan */}
                              <td className="p-3 text-center">
                                <span className="font-mono font-bold text-blue-700 text-xs block">
                                  {row.submittedCount} ta
                                </span>
                                <span className="text-[10px] text-blue-500 block">
                                  {row.submittedCount > 0 ? 'kutilmoqda' : '—'}
                                </span>
                              </td>

                              {/* Tasdiqlanmay turganlar */}
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedStudentForSupervisor(row);
                                    setSupervisorModalTab('unapproved');
                                    setIsSupervisorStudentModalOpen(true);
                                  }}
                                  className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                                    row.unapprovedCount > 0
                                      ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 ring-2 ring-amber-400/20 cursor-pointer underline shadow-2xs'
                                      : 'bg-slate-100 text-slate-500'
                                  }`}
                                  title={row.unapprovedCount > 0 ? "Tasdiqlanmagan kundaliklarni ko'rish va baholash" : "Tasdiqlanmagan kundaliklar mavjud emas"}
                                >
                                  {row.unapprovedCount > 0 && <Clock className="w-3.5 h-3.5 text-amber-700" />}
                                  <span>{row.unapprovedCount} ta</span>
                                </button>
                              </td>

                              {/* Amallar */}
                              <td className="p-3 text-right whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedStudentForSupervisor(row);
                                    setSupervisorModalTab('all');
                                    setIsSupervisorStudentModalOpen(true);
                                  }}
                                  className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Kundaliklarini ko'rish</span>
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
            </div>
          ) : (
          <div className="space-y-5">
            {/* Statistics Grid (Section 1) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Jami talabalar */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500 block">Jami talabalar</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-black text-slate-900">{stats.totalStudents}</span>
                <span className="text-[10px] text-slate-400 font-medium">amaliyotchi</span>
              </div>
            </div>

            {/* Kundalik to'ldirganlar */}
            <div className="p-3.5 bg-white border border-emerald-200 rounded-xl shadow-2xs bg-emerald-50/20">
              <span className="text-[11px] font-medium text-emerald-800 block">To'ldirganlar</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-black text-emerald-700">{stats.studentsWithJournal}</span>
                <span className="text-[10px] font-bold text-emerald-600">
                  {Math.round((stats.studentsWithJournal / (stats.totalStudents || 1)) * 100)}%
                </span>
              </div>
            </div>

            {/* Kundalik to'ldirmaganlar */}
            <div className="p-3.5 bg-white border border-rose-200 rounded-xl shadow-2xs bg-rose-50/20">
              <span className="text-[11px] font-medium text-rose-800 block">To'ldirmaganlar</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-black text-rose-700">{stats.studentsWithoutJournal}</span>
                <span className="text-[10px] font-bold text-rose-600">qarzdor</span>
              </div>
            </div>

            {/* Tekshiruvda (Pending) */}
            <div className="p-3.5 bg-white border border-blue-200 rounded-xl shadow-2xs bg-blue-50/20">
              <span className="text-[11px] font-medium text-blue-800 block">Tekshiruvda</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-black text-blue-700">{stats.pendingCount}</span>
                <span className="text-[10px] font-bold text-blue-600">kutilmoqda</span>
              </div>
            </div>

            {/* Tasdiqlangan (Approved) */}
            <div className="p-3.5 bg-white border border-teal-200 rounded-xl shadow-2xs bg-teal-50/20">
              <span className="text-[11px] font-medium text-teal-800 block">Tasdiqlangan</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-black text-teal-700">{stats.approvedCount}</span>
                <span className="text-[10px] font-bold text-teal-600">baholandi</span>
              </div>
            </div>

            {/* Qayta ishlashga yuborilgan */}
            <div className="p-3.5 bg-white border border-amber-200 rounded-xl shadow-2xs bg-amber-50/20">
              <span className="text-[11px] font-medium text-amber-800 block">Qayta ishlashda</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-black text-amber-700">{stats.revisionCount}</span>
                <span className="text-[10px] font-bold text-amber-600">qaytarildi</span>
              </div>
            </div>
          </div>

          {/* Filters Bar (Section 1) */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Filtrlar va qidiruv
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilterPractice('all');
                  setFilterDate('');
                  setFilterFaculty('all');
                  setFilterDirection('all');
                  setFilterCourse('all');
                  setFilterGroup('all');
                  setFilterPlace('all');
                  setFilterDepartment('all');
                  setFilterSupervisor('all');
                  setFilterStatus('all');
                }}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium"
              >
                Filtrlarni tozalash
              </button>
            </div>

            {/* Search Input & Status Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Talaba F.I.Sh., bo'lim, tashxis yoki muolaja nomi bo'yicha qidirish..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-lg flex-wrap gap-1">
                {[
                  { id: 'all', label: 'Barchasi' },
                  { id: 'DRAFT', label: 'Qoralama' },
                  { id: 'SUBMITTED', label: 'Tekshiruvda' },
                  { id: 'SUPERVISOR_APPROVED', label: 'Rahbar tasdiqlagan' },
                  { id: 'FINAL_PENDING', label: 'Final Pending' },
                  { id: 'FINAL_APPROVED', label: 'Final Tasdiq' },
                  { id: 'LOCKED', label: 'Qulflangan' },
                  { id: 'REVISION', label: 'Qayta ishlash' }
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => setFilterStatus(s.id)}
                    className={`px-2.5 py-1 text-center text-[11px] font-semibold rounded-md transition-all ${
                      filterStatus === s.id
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dropdown Filters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1 text-xs">
              {/* Amaliyot */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Amaliyot</label>
                <select
                  value={filterPractice}
                  onChange={e => setFilterPractice(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700"
                >
                  <option value="all">Barcha amaliyotlar</option>
                  {practices.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Sana */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sana</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700"
                />
              </div>

              {/* Fakultet */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Fakultet</label>
                <select
                  value={filterFaculty}
                  onChange={e => setFilterFaculty(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700"
                >
                  <option value="all">Barcha fakultetlar</option>
                  {faculties.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              {/* Guruh */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Guruh</label>
                <select
                  value={filterGroup}
                  onChange={e => setFilterGroup(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700"
                >
                  <option value="all">Barcha guruhlar</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              {/* Amaliyot joyi / Klinika */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Amaliyot joyi</label>
                <select
                  value={filterPlace}
                  onChange={e => setFilterPlace(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700"
                >
                  <option value="all">Barcha klinikalar</option>
                  {practicePlaces.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Bo'lim */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Bo'lim</label>
                <select
                  value={filterDepartment}
                  onChange={e => setFilterDepartment(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700"
                >
                  <option value="all">Barcha bo'limlar</option>
                  <option value="Terapiya">Terapiya</option>
                  <option value="Kardiologiya">Kardiologiya</option>
                  <option value="Umumiy xirurgiya">Umumiy xirurgiya</option>
                  <option value="Pediatriya">Pediatriya</option>
                  <option value="Shoshilinch terapiya">Shoshilinch terapiya</option>
                </select>
              </div>

              {/* Rahbar */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Rahbar</label>
                <select
                  value={filterSupervisor}
                  onChange={e => setFilterSupervisor(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700"
                >
                  <option value="all">Barcha rahbarlar</option>
                  {supervisors.map(s => (
                    <option key={s.id} value={s.id}>{s.fullName}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Journals Table (Section 1) */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Topilgan kundaliklar soni: {filteredJournals.length} ta
              </span>
              <button
                type="button"
                onClick={handleDownloadJournalsExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold transition-colors shadow-2xs"
                title="Barcha filtrlangan kundaliklarni Excel (.xlsx) formatida yuklab olish"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel (.xlsx) yuklash</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Talaba</th>
                    <th className="p-3">Guruh & Fakultet</th>
                    <th className="p-3">Klinika & Bo'lim</th>
                    <th className="p-3">Sana & Davomat</th>
                    <th className="p-3">Bemorlar & Muolajalar</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Baho</th>
                    <th className="p-3 text-right">Harakatlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredJournals.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                        Filtr shartlariga mos keladigan kundalik yozuvlari topilmadi.
                      </td>
                    </tr>
                  ) : (
                    filteredJournals.map(journal => {
                      const student = students.find(s => s.id === journal.studentId);
                      const group = groups.find(g => g.id === student?.groupId);
                      const faculty = faculties.find(f => f.id === student?.facultyId);
                      const place = practicePlaces.find(p => p.id === journal.practicePlaceId);
                      const sup = supervisors.find(s => s.id === journal.supervisorId);

                      const statusUpper = journal.status.toUpperCase();
                      const isApproved = statusUpper === 'APPROVED';
                      const isRevision = statusUpper === 'REVISION' || statusUpper === 'REJECTED';
                      const isPending = statusUpper === 'PENDING';

                      return (
                        <tr key={journal.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{student?.fullName || 'Noma\'lum talaba'}</span>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5">
                              <span className="text-blue-700 font-bold">{student?.login || 'T00001'}</span>
                              <span>•</span>
                              <span>ID: {student?.studentId || student?.id}</span>
                            </div>
                            {journal.submittedAt && (
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                Topshirilgan: {new Date(journal.submittedAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}, {new Date(journal.submittedAt).toLocaleDateString('uz-UZ')}
                              </span>
                            )}
                          </td>

                          <td className="p-3 text-slate-700">
                            <span className="font-semibold block">{group?.name || 'Guruh —'}</span>
                            <span className="text-[11px] text-slate-400 truncate max-w-[140px] block">{faculty?.name}</span>
                          </td>

                          <td className="p-3 text-slate-700">
                            <span className="font-semibold block truncate max-w-[160px]">{place?.name || journal.attendanceSnapshot?.practicePlaceName}</span>
                            <span className="text-[11px] text-blue-700 font-medium block">{journal.department}</span>
                          </td>

                          <td className="p-3">
                            <span className="font-mono font-bold text-slate-800 block">{journal.date}</span>
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                              {journal.attendanceSnapshot?.status || 'PRESENT'} ({journal.attendanceSnapshot?.checkInTime || '08:15'})
                            </span>
                          </td>

                          <td className="p-3 text-slate-700">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-indigo-700">{journal.patientsExaminedCount} bemor</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-600">{journal.procedures?.length || journal.proceduresDone?.length || 0} muolaja</span>
                            </div>
                            <span className="text-[11px] text-slate-400 truncate max-w-[180px] block mt-0.5">
                              {journal.clinicalCasesSummary || journal.patientDiagnosesSummary || 'Klinik amaliyot'}
                            </span>
                          </td>

                          <td className="p-3 text-center">
                            {statusUpper === 'LOCKED' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-md bg-slate-900 text-white">
                                <Lock className="w-3 h-3 text-amber-400" />
                                <span>LOCKED</span>
                              </span>
                            ) : statusUpper === 'FINAL_APPROVED' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-md bg-emerald-600 text-white">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>FINAL_APPROVED</span>
                              </span>
                            ) : statusUpper === 'FINAL_PENDING' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>FINAL_PENDING</span>
                              </span>
                            ) : (statusUpper === 'SUPERVISOR_APPROVED' || statusUpper === 'APPROVED') ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-md bg-teal-100 text-teal-800">
                                <CheckCircle className="w-3 h-3 text-teal-600" />
                                <span>SUPERVISOR_APPROVED</span>
                              </span>
                            ) : (statusUpper === 'REVISION' || statusUpper === 'REJECTED') ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-md bg-rose-100 text-rose-800">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                <span>REVISION</span>
                              </span>
                            ) : statusUpper === 'DRAFT' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700">
                                <span>DRAFT</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-md bg-blue-100 text-blue-800">
                                <Clock className="w-3 h-3 text-blue-600" />
                                <span>SUBMITTED</span>
                              </span>
                            )}
                          </td>

                          <td className="p-3 text-center">
                            {(statusUpper.includes('APPROV') || statusUpper === 'LOCKED') && journal.supervisorRating ? (
                              <div className="inline-flex items-center gap-0.5 font-black text-amber-500 text-xs">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                <span>{journal.supervisorRating}</span>
                              </div>
                            ) : (
                              <span className="text-slate-300 font-mono">—</span>
                            )}
                          </td>

                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Direct Supervisor Approve & Revision buttons if in SUBMITTED state */}
                              {isSupervisorOrStaff && (statusUpper === 'SUBMITTED' || statusUpper === 'PENDING' || statusUpper === 'OPEN') && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenReview(journal, 'APPROVED')}
                                    className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-2xs"
                                    title="Tasdiqlash"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenReview(journal, 'REVISION')}
                                    className="px-2.5 py-1 text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors shadow-2xs"
                                    title="Qayta ishlashga yuborish"
                                  >
                                    Revision
                                  </button>
                                </>
                              )}

                              <button
                                type="button"
                                onClick={() => handleOpenDetail(journal)}
                                className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Batafsil ko'rish"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenPrint(journal)}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Chop etish / PDF"
                              >
                                <Printer className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDownloadStudentExcel(journal)}
                                className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Talaba kundaligini Excel (.xlsx) da yuklab olish"
                              >
                                <FileSpreadsheet className="w-4 h-4" />
                              </button>

                              {!(statusUpper === 'SUBMITTED' || statusUpper === 'PENDING' || statusUpper === 'OPEN') && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenReview(journal, 'APPROVED')}
                                  className="px-2 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shadow-2xs"
                                  title="Ko'rib chiqish"
                                >
                                  {statusUpper.includes('APPROV') ? 'Bahoni ko\'rish' : 'Ko\'rish'}
                                </button>
                              )}
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
      )}
    </div>
  )}

      {/* 2. STUDENT CABINET VIEW (Section 2) */}
      {viewTab === 'student_cabinet' && (
        <div className="space-y-6">
          {/* Active Practice Card (Section 2 talabi) */}
          <div className="p-6 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-blue-200">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Amaldagi amaliyot kartasi</span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {currentPractice?.name}
                  </h3>
                  <p className="text-xs text-blue-200 mt-1">
                    Buyruq: {currentPractice?.orderNumber} ({currentPractice?.academicYear})
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
                  <div>
                    <span className="text-blue-300 block text-[11px]">Amaliyot joyi:</span>
                    <strong className="text-white font-bold block truncate max-w-[170px]">{currentPlace?.name}</strong>
                  </div>
                  <div>
                    <span className="text-blue-300 block text-[11px]">Bo'lim:</span>
                    <strong className="text-white font-bold block">{currentAssignment?.department || 'Terapiya'}</strong>
                  </div>
                  <div>
                    <span className="text-blue-300 block text-[11px]">Rahbar:</span>
                    <strong className="text-white font-bold block truncate max-w-[170px]">{currentSupervisor?.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-blue-300 block text-[11px]">Muddat:</span>
                    <strong className="text-white font-bold block font-mono">
                      {currentAssignment?.startDate || '01.09.2026'} — {currentAssignment?.endDate || '15.10.2026'}
                    </strong>
                    <span className="text-[10px] text-blue-200 font-bold bg-white/10 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                      Jami: {studentPracticeTotalDays} kunlik amaliyot
                    </span>
                  </div>
                </div>
              </div>

              {/* Attendance Rate Circle & Action */}
              <div className="flex flex-col items-center sm:items-end justify-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-white/15 md:pl-6">
                <div className="text-center sm:text-right">
                  <span className="text-xs text-blue-200 block font-medium">Bajarilgan davomat:</span>
                  <div className="text-3xl font-black text-white tracking-tight flex items-baseline justify-center sm:justify-end gap-1">
                    <span>{studentAttendanceRate}%</span>
                    <span className="text-xs font-semibold text-emerald-400">
                      {studentAttendedDays}/{studentPracticeTotalDays} kun
                    </span>
                  </div>
                  <span className="text-[11px] text-blue-300 block mt-0.5">
                    Kundaliklar: <strong className="text-white">{studentApprovedJournalsCount}/{studentPracticeTotalDays}</strong> kun bajarildi
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setJournalToEdit(null);
                    setIsSubmitModalOpen(true);
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg font-bold text-xs transition-all hover:scale-102"
                >
                  <Plus className="w-4 h-4" />
                  <span>Kundalikni to'ldirish</span>
                </button>
              </div>
            </div>
          </div>

          {/* Alerts: Today's Status & Revisions */}
          {revisionNeededJournal && (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-200 text-amber-800 rounded-xl shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                    Diqqat! {revisionNeededJournal.date} kungi kundaligingiz qayta ishlashga yuborilgan
                  </h4>
                  <p className="text-xs text-amber-900 mt-0.5">
                    <strong>Rahbar izohi:</strong> "{revisionNeededJournal.revisionReason || revisionNeededJournal.supervisorFeedback || 'Kamchiliklarni to\'g\'rilab qayta topshiring'}"
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenEdit(revisionNeededJournal)}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition-colors shrink-0 shadow-xs"
              >
                Tahrirlash va qayta topshirish
              </button>
            </div>
          )}

          {/* Today's Daily Check-in Alert */}
          {todayAttendance && (todayAttendance.status === 'PRESENT' || todayAttendance.status === 'LATE') ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-900">
                    Bugungi davomat tasdiqlangan: Kelgan ({todayAttendance.checkInTime} da)
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    {todayJournal
                      ? (todayJournal.status === 'DRAFT'
                          ? 'Bugungi kundalik qoralama (DRAFT) holatida saqlangan. Qayta kirib tekshiruvga yuborishingiz mumkin.'
                          : 'Bugungi kunlik amaliyot kundaligi topshirilgan va rahbar tekshiruvida.')
                      : 'Bugun bajargan ishlaringiz va muolajalaringizni elektron kundalikka kiritishingiz mumkin.'}
                  </p>
                </div>
              </div>

              {!todayJournal ? (
                <button
                  type="button"
                  onClick={() => {
                    setJournalToEdit(null);
                    setIsSubmitModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  Bugungi kundalikni to'ldirish
                </button>
              ) : todayJournal.status === 'DRAFT' ? (
                <button
                  type="button"
                  onClick={() => handleOpenEdit(todayJournal)}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  Qoralamani ochish va yuborish
                </button>
              ) : null}
            </div>
          ) : todayAttendance && (todayAttendance.status === 'PENDING' || todayAttendance.status === 'PENDING_CONFIRMATION') ? (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-950">
                    ⏳ Davomat qayd etilgan, amaliyot rahbari tasdiqlashi kutilmoqda ({todayAttendance.checkInTime} da GPS orqali)
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Amaliyot rahbari kelganligingizni tasdiqlaganidan so'ng elektron kundalik to'ldirish imkoniyati avtomatik ochiladi.
                  </p>
                </div>
              </div>

              <span className="px-3.5 py-1.5 rounded-xl bg-amber-200/80 text-amber-900 font-bold text-xs shrink-0">
                Rahbar tasdiqlashi kutilmoqda...
              </span>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-200 text-slate-600 rounded-xl">
                  <Clock className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-xs">Bugungi kun uchun davomat hali qayd etilmagan</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Kundalikni to'ldirish uchun avval "Davomat" menyusiga o'tib, GPS orqali amaliyot bazasiga kelganingizni qayd eting.
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold text-slate-500 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
                Avval davomatdan o'ting
              </span>
            </div>
          )}

          {/* Student's Permanent Daily Journals List (Day 1, Day 2...) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Amaliyot kunlari va kunlik kundaliklar ro'yxati (Jami: {studentPracticeTotalDays} kun | Davomat: {studentDaysList.length} kun | Tasdiqlangan: {studentApprovedJournalsCount} ta)</span>
              </h3>
            </div>

            {studentDaysList.length === 0 ? (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-400 space-y-3">
                <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
                <p className="font-medium text-xs">Sizda hali davomatdan o'tgan amaliyot kunlari mavjud emas.</p>
                <p className="text-[11px] text-slate-500">Davomat menyusidan amaliyot bazasida kelganingizni qayd eting.</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Kun</th>
                        <th className="p-3">Sana</th>
                        <th className="p-3">Davomat</th>
                        <th className="p-3">Kunlik kundalik mazmuni</th>
                        <th className="p-3 text-center">Holati</th>
                        <th className="p-3 text-right">Amallar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {studentDaysList.map(item => {
                        const j = item.journal;
                        const statusUpper = (j?.status || '').toUpperCase();
                        const isApproved = statusUpper === 'APPROVED' || statusUpper === 'SUPERVISOR_APPROVED' || statusUpper === 'FINAL_APPROVED';
                        const isRevision = statusUpper === 'REVISION' || statusUpper === 'REJECTED';
                        const isDraft = statusUpper === 'DRAFT';
                        const isPending = statusUpper === 'PENDING' || statusUpper === 'SUBMITTED' || statusUpper === 'FINAL_PENDING';

                        return (
                          <tr key={item.date} className="hover:bg-slate-50/70 transition-colors">
                            <td className="p-3 font-mono font-bold text-slate-900">
                              {item.dayNum}-kun
                            </td>
                            <td className="p-3 font-mono text-slate-800">
                              {item.date}
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
                                {item.attendance.status} ({item.attendance.checkInTime || '08:15'})
                              </span>
                            </td>
                            <td className="p-3 text-slate-700">
                              {j ? (
                                <div>
                                  <p className="font-semibold truncate max-w-[260px]">{j.workSummary || 'Kiritilgan'}</p>
                                  <span className="text-[10px] text-slate-400">{j.patientsExaminedCount} bemor, {j.procedures?.length || 0} muolaja</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">Hali to'ldirilmagan</span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              {j ? (
                                <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-md ${
                                  isApproved ? 'bg-emerald-100 text-emerald-800' :
                                  isRevision ? 'bg-amber-100 text-amber-900' :
                                  isDraft ? 'bg-slate-200 text-slate-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {isApproved ? 'Tasdiqlangan' :
                                   isRevision ? 'Qayta ishlash' :
                                   isDraft ? 'Qoralama (DRAFT)' : 'Tekshiruvda'}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">To'ldirilmagan</span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {!j ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setJournalToEdit(null);
                                      setIsSubmitModalOpen(true);
                                    }}
                                    className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs cursor-pointer"
                                  >
                                    To'ldirish
                                  </button>
                                ) : isDraft ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEdit(j)}
                                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                                    >
                                      Tahrirlash
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const res = storageService.submitDraftJournalToSupervisor(j.id, currentUser?.uid || currentStudent?.id);
                                        if (res.success) {
                                          showToast('success', 'Kundalik topshirildi!', 'Rahbarga tekshirish uchun yuborildi.');
                                          refreshJournals();
                                        } else {
                                          showToast('error', 'Xatolik', res.error || 'Yuborib bo\'lmadi');
                                        }
                                      }}
                                      className="px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs cursor-pointer"
                                    >
                                      Rahbarga yuborish
                                    </button>
                                  </>
                                ) : isRevision ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(j)}
                                    className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-2xs cursor-pointer"
                                  >
                                    Tahrirlash va qayta topshirish
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenDetail(j)}
                                      className="px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200 cursor-pointer"
                                    >
                                      Ko'rish
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenPrint(j)}
                                      className="p-1 text-slate-500 hover:text-slate-800"
                                      title="Chop etish"
                                    >
                                      <Printer className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. FINAL APPROVAL VIEW */}
      {viewTab === 'final_approval' && (
        <FinalApprovalModule />
      )}

      {/* 4. ARCHIVE VIEW */}
      {viewTab === 'archive' && (
        <JournalArchiveModule />
      )}

      {/* SUPERVISOR STUDENT INSPECT MODAL */}
      {isSupervisorStudentModalOpen && selectedStudentForSupervisor && (
        <Modal
          isOpen={isSupervisorStudentModalOpen}
          onClose={() => {
            setIsSupervisorStudentModalOpen(false);
            setSelectedStudentForSupervisor(null);
          }}
          title={`${selectedStudentForSupervisor.student.fullName} — Amaliyot kundaliklari nazorati`}
          maxWidth="4xl"
        >
          <div className="space-y-4 max-h-[82vh] overflow-y-auto p-1">
            {/* Student & Practice Info Banner */}
            <div className="p-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl text-white shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/15">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-300" />
                    <span>{selectedStudentForSupervisor.student.fullName}</span>
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-blue-200 mt-1 font-mono">
                    <span className="bg-white/10 px-2 py-0.5 rounded font-bold">
                      {selectedStudentForSupervisor.student.login || selectedStudentForSupervisor.student.studentId}
                    </span>
                    <span>•</span>
                    <span>ID: {selectedStudentForSupervisor.student.studentId}</span>
                  </div>
                </div>

                <div className="text-right sm:text-right">
                  <span className="text-xs text-blue-200 block font-medium">Amaliyot dasturi:</span>
                  <span className="text-xs font-bold text-white block">
                    {selectedStudentForSupervisor.practice?.name || 'Klinik ishlab chiqarish amaliyoti'}
                  </span>
                  <span className="text-[11px] text-blue-300 font-medium">
                    {selectedStudentForSupervisor.place?.name} · {selectedStudentForSupervisor.assignment?.department || 'Terapiya'}
                  </span>
                </div>
              </div>

              {/* 5 Indicator Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-3">
                <div className="p-2.5 bg-white/10 rounded-xl text-center">
                  <span className="text-[10px] text-blue-200 block font-medium">Jami amaliyot</span>
                  <strong className="text-base font-black text-white block mt-0.5 font-mono">
                    {selectedStudentForSupervisor.totalPracticeDays} kun
                  </strong>
                </div>

                <div className="p-2.5 bg-white/10 rounded-xl text-center">
                  <span className="text-[10px] text-emerald-300 block font-medium">Bajarilgan davomat</span>
                  <strong className="text-base font-black text-emerald-300 block mt-0.5 font-mono">
                    {selectedStudentForSupervisor.attendedDaysCount} / {selectedStudentForSupervisor.totalPracticeDays}
                  </strong>
                  <span className="text-[9px] text-emerald-200 block font-semibold">
                    {selectedStudentForSupervisor.attendancePercent}% davomat
                  </span>
                </div>

                <div className="p-2.5 bg-white/10 rounded-xl text-center">
                  <span className="text-[10px] text-teal-300 block font-medium">Tasdiqlangan</span>
                  <strong className="text-base font-black text-teal-300 block mt-0.5 font-mono">
                    {selectedStudentForSupervisor.approvedCount} / {selectedStudentForSupervisor.totalPracticeDays}
                  </strong>
                  <span className="text-[9px] text-teal-200 block font-semibold">
                    {selectedStudentForSupervisor.journalPercent}% bajarildi
                  </span>
                </div>

                <div className="p-2.5 bg-white/10 rounded-xl text-center">
                  <span className="text-[10px] text-blue-200 block font-medium">Tekshiruvda</span>
                  <strong className="text-base font-black text-blue-300 block mt-0.5 font-mono">
                    {selectedStudentForSupervisor.submittedCount} ta
                  </strong>
                  <span className="text-[9px] text-blue-200 block">kutilmoqda</span>
                </div>

                <div className="p-2.5 bg-amber-500/20 border border-amber-400/30 rounded-xl text-center col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-amber-300 block font-medium">Tasdiqlanmagan</span>
                  <strong className="text-base font-black text-amber-300 block mt-0.5 font-mono">
                    {selectedStudentForSupervisor.unapprovedCount} ta
                  </strong>
                  <span className="text-[9px] text-amber-200 block font-semibold">ko'rib chiqish</span>
                </div>
              </div>
            </div>

            {/* Filter Tabs inside Modal */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSupervisorModalTab('all')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    supervisorModalTab === 'all'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Barcha kundaliklar ({selectedStudentForSupervisor.stuJournals.length})
                </button>

                <button
                  type="button"
                  onClick={() => setSupervisorModalTab('unapproved')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    supervisorModalTab === 'unapproved'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : selectedStudentForSupervisor.unapprovedCount > 0
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Faqat tasdiqlanmaganlar ({selectedStudentForSupervisor.unapprovedCount})</span>
                </button>
              </div>

              <span className="text-xs text-slate-500 hidden sm:inline">
                Har bir kunlik kundalikni tekshirib tasdiqlang yoki izoh bilan qaytaring
              </span>
            </div>

            {/* Journal Items List */}
            <div className="space-y-3">
              {(() => {
                const listToDisplay = selectedStudentForSupervisor.stuJournals.filter(j => {
                  if (supervisorModalTab === 'unapproved') {
                    const st = (j.status || '').toUpperCase();
                    return !['APPROVED', 'SUPERVISOR_APPROVED', 'FINAL_APPROVED', 'LOCKED'].includes(st);
                  }
                  return true;
                });

                if (listToDisplay.length === 0) {
                  return (
                    <div className="p-8 text-center text-slate-400 italic bg-slate-50 border border-slate-200 rounded-2xl">
                      {supervisorModalTab === 'unapproved'
                        ? "Ushbu talabada tekshirish kutilayotgan tasdiqlanmagan kundaliklar mavjud emas. Barchasi ko'rib chiqilgan!"
                        : "Ushbu talaba tomonidan hali birorta kunlik kundalik kiritilmagan."}
                    </div>
                  );
                }

                return listToDisplay.map((j, idx) => {
                  const statusUpper = (j.status || '').toUpperCase();
                  const isApproved = statusUpper === 'APPROVED' || statusUpper === 'SUPERVISOR_APPROVED' || statusUpper === 'FINAL_APPROVED' || statusUpper === 'LOCKED';
                  const isSubmitted = statusUpper === 'SUBMITTED' || statusUpper === 'PENDING' || statusUpper === 'OPEN';
                  const isRevision = statusUpper === 'REVISION' || statusUpper === 'REJECTED';
                  const isDraft = statusUpper === 'DRAFT';

                  return (
                    <div
                      key={j.id}
                      className={`p-4 bg-white border rounded-2xl shadow-2xs space-y-3 transition-all ${
                        isSubmitted
                          ? 'border-blue-300 ring-2 ring-blue-500/10'
                          : isRevision
                          ? 'border-amber-300 bg-amber-50/10'
                          : isApproved
                          ? 'border-emerald-200'
                          : 'border-slate-200'
                      }`}
                    >
                      {/* Item Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                            Sana: {j.date}
                          </span>
                          <span
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-md inline-flex items-center gap-1 ${
                              isApproved
                                ? 'bg-emerald-100 text-emerald-800'
                                : isRevision
                                ? 'bg-amber-100 text-amber-900'
                                : isDraft
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-blue-100 text-blue-800 animate-pulse'
                            }`}
                          >
                            {isApproved && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                            {isRevision && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                            {isSubmitted && <Clock className="w-3.5 h-3.5 text-blue-600" />}
                            <span>
                              {isApproved
                                ? `Tasdiqlangan (Baho: ${j.supervisorRating || 5}/5)`
                                : isRevision
                                ? 'Qayta ishlashga qaytarilgan'
                                : isDraft
                                ? 'Qoralama (DRAFT)'
                                : 'Tekshiruvga yuborilgan (Kutilmoqda)'}
                            </span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-medium text-slate-700">{j.department}</span>
                          {j.attendanceSnapshot && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Davomat: ✅ HOZIR ({j.attendanceSnapshot.checkInTime || '08:15'})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Work summary */}
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Bajarilgan amaliy ishlar mazmuni:
                        </span>
                        <p className="text-xs text-slate-800 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100 font-sans whitespace-pre-wrap">
                          {j.workSummary}
                        </p>
                      </div>

                      {/* Clinical cases & procedures metrics */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                        <span className="bg-slate-100 px-2 py-1 rounded-md">
                          Ko'rilgan bemorlar: <strong className="text-slate-900">{j.patientsExaminedCount} nafar</strong>
                        </span>
                        <span className="bg-slate-100 px-2 py-1 rounded-md">
                          Bajarilgan muolajalar: <strong className="text-slate-900">{j.procedures?.length || j.proceduresDone?.length || 0} ta</strong>
                        </span>
                        {j.clinicalCases && j.clinicalCases.length > 0 && (
                          <span className="bg-slate-100 px-2 py-1 rounded-md">
                            Klinik keyslar: <strong className="text-slate-900">{j.clinicalCases.length} ta</strong>
                          </span>
                        )}
                        {j.submittedAt && (
                          <span className="text-[11px] text-slate-400 ml-auto">
                            Yuborilgan vaqti: {new Date(j.submittedAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}, {new Date(j.submittedAt).toLocaleDateString('uz-UZ')}
                          </span>
                        )}
                      </div>

                      {/* Previous Revision Reason if returned */}
                      {isRevision && j.revisionReason && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                          <div className="font-bold text-amber-900 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            <span>Rahbar tomonidan qaytarish izohi va kamchiliklar:</span>
                          </div>
                          <p className="text-amber-800 pl-5 leading-relaxed">{j.revisionReason}</p>
                        </div>
                      )}

                      {/* Previous Supervisor Feedback if approved */}
                      {isApproved && j.supervisorFeedback && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                          <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span>Rahbar taqrizi va bahosi ({j.supervisorRating || 5}/5):</span>
                          </div>
                          <p className="text-emerald-800 pl-5 leading-relaxed">{j.supervisorFeedback}</p>
                        </div>
                      )}

                      {/* Actions footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(j)}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Batafsil ko'rish</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenPrint(j)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Chop etish"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Review buttons: Tasdiqlash yoki Qaytarish (Izoh) */}
                          <button
                            type="button"
                            onClick={() => {
                              handleOpenReview(j, 'APPROVED');
                            }}
                            className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs cursor-pointer inline-flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Tasdiqlash (Baho qo'yish)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              handleOpenReview(j, 'REVISION');
                            }}
                            className="px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-2xs cursor-pointer inline-flex items-center gap-1"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Qaytarish (Izoh yozish)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 1: Form Modal for Filling / Editing Journal */}
      <DailyJournalFormModal
        isOpen={isSubmitModalOpen}
        onClose={() => {
          setIsSubmitModalOpen(false);
          setJournalToEdit(null);
        }}
        onSuccess={() => {
          refreshJournals();
        }}
        initialJournal={journalToEdit}
      />

      {/* MODAL 2: Detail Modal */}
      <DailyJournalDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedJournal(null);
        }}
        journal={selectedJournal}
        student={students.find(s => s.id === selectedJournal?.studentId)}
        practice={practices.find(p => p.id === selectedJournal?.practiceId)}
        practicePlace={practicePlaces.find(p => p.id === selectedJournal?.practicePlaceId)}
        supervisor={supervisors.find(s => s.id === selectedJournal?.supervisorId)}
        onEdit={(j) => {
          setIsDetailModalOpen(false);
          handleOpenEdit(j);
        }}
        onReview={(j) => {
          setIsDetailModalOpen(false);
          handleOpenReview(j);
        }}
        onPrint={(j) => {
          setIsDetailModalOpen(false);
          handleOpenPrint(j);
        }}
        canReview={isSupervisorOrStaff}
        canEdit={true}
      />

      {/* MODAL 3: Supervisor Review Modal */}
      <DailyJournalReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setJournalToReview(null);
        }}
        onSuccess={async () => {
          await refreshJournals();
          if (selectedStudentForSupervisor) {
            const updatedJournals = await dailyJournalService.getAllJournals();
            const freshStuJournals = updatedJournals.filter(j => j.studentId === selectedStudentForSupervisor.student.id || j.studentId === selectedStudentForSupervisor.student.studentId);
            const subCount = freshStuJournals.filter(j => ['SUBMITTED', 'PENDING', 'OPEN'].includes((j.status || '').toUpperCase())).length;
            const appCount = freshStuJournals.filter(j => ['APPROVED', 'SUPERVISOR_APPROVED', 'FINAL_APPROVED', 'LOCKED'].includes((j.status || '').toUpperCase())).length;
            const revCount = freshStuJournals.filter(j => ['REVISION', 'REJECTED'].includes((j.status || '').toUpperCase())).length;
            const unappCount = subCount + revCount;
            const jPct = Math.min(100, Math.round((appCount / selectedStudentForSupervisor.totalPracticeDays) * 100));

            setSelectedStudentForSupervisor({
              ...selectedStudentForSupervisor,
              submittedCount: subCount,
              approvedCount: appCount,
              revisionCount: revCount,
              unapprovedCount: unappCount,
              journalPercent: jPct,
              stuJournals: freshStuJournals
            });
          }
        }}
        journal={journalToReview}
        student={students.find(s => s.id === journalToReview?.studentId)}
        initialDecision={reviewInitialDecision}
      />

      {/* MODAL 4: Printable View */}
      {isPrintViewOpen && journalToPrint && (
        <DailyJournalPrintView
          journal={journalToPrint}
          student={students.find(s => s.id === journalToPrint.studentId)}
          practice={practices.find(p => p.id === journalToPrint.practiceId)}
          practicePlace={practicePlaces.find(p => p.id === journalToPrint.practicePlaceId)}
          supervisor={supervisors.find(s => s.id === journalToPrint.supervisorId)}
          faculty={faculties.find(f => f.id === students.find(s => s.id === journalToPrint.studentId)?.facultyId)}
          group={groups.find(g => g.id === students.find(s => s.id === journalToPrint.studentId)?.groupId)}
          onClose={() => {
            setIsPrintViewOpen(false);
            setJournalToPrint(null);
          }}
        />
      )}
    </div>
  );
}
