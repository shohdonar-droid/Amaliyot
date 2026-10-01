import React, { useState, useMemo, useEffect } from 'react';
import {
  Split,
  Building2,
  Users,
  CheckCircle2,
  UserCheck,
  Plus,
  Trash2,
  Search,
  Filter,
  ArrowRight,
  Printer,
  Edit2,
  Hospital,
  GraduationCap,
  ShieldCheck,
  FileCheck,
  Calendar,
  Clock,
  AlertCircle,
  ChevronRight,
  CheckSquare,
  Square,
  Layers,
  Sparkles,
  MapPin,
  X
} from 'lucide-react';
import {
  Practice,
  PracticeAssignment,
  PracticeDistribution,
  Student,
  PracticePlace,
  Supervisor,
  ClinicResponsible,
  Group,
  Direction,
  Course
} from '../../../types';
import { practiceAssignmentService } from '../../../services/practiceAssignmentService';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';
import { StatusBadge } from '../../common/Badge';
import { Modal } from '../../common/Modal';

export function AllocationModule() {
  const { showToast } = useToast();
  const { canonicalRole, currentUser } = useAuth();
  const isSupervisor = canonicalRole === 'PRACTICE_SUPERVISOR';
  const supervisorId = currentUser?.supervisorId || (isSupervisor ? 'sup-1' : undefined);

  // Core Data
  const [distributions, setDistributions] = useState<PracticeDistribution[]>(() => storageService.getDistributions());
  const [assignments, setAssignments] = useState<PracticeAssignment[]>([]);
  
  useEffect(() => {
    practiceAssignmentService.getPracticeAssignments(canonicalRole, currentUser?.uid, supervisorId).then(setAssignments);
  }, [canonicalRole, currentUser, supervisorId]);

  const practices = storageService.getPractices();
  const places = storageService.getPracticePlaces();
  const supervisors = storageService.getSupervisors();
  const students = storageService.getStudents();
  const groups = storageService.getGroups();
  const directions = storageService.getDirections();
  const courses = storageService.getCourses();

  const refreshData = async () => {
    setDistributions(storageService.getDistributions());
    const updatedAssignments = await practiceAssignmentService.getPracticeAssignments();
    setAssignments(updatedAssignments);
  };

  // ==========================================
  // SUPERVISOR WORKSPACE STATE & LOGIC
  // ==========================================
  const supervisorGroups = useMemo(() => {
    if (!supervisorId) return [];
    return storageService.getGroupsForSupervisor(supervisorId);
  }, [supervisorId, distributions, assignments]);

  const [selectedSupervisorGroupId, setSelectedSupervisorGroupId] = useState<string>('');

  useEffect(() => {
    if (supervisorGroups.length > 0 && (!selectedSupervisorGroupId || !supervisorGroups.some(g => g.id === selectedSupervisorGroupId))) {
      setSelectedSupervisorGroupId(supervisorGroups[0].id);
    }
  }, [supervisorGroups, selectedSupervisorGroupId]);

  // Supervisor unassigned department count
  const supervisorUnassignedList = useMemo(() => {
    if (!supervisorId) return [];
    return storageService.getUnassignedDepartmentStudentsForSupervisor(supervisorId);
  }, [supervisorId, assignments, students]);

  const unassignedCount = supervisorUnassignedList.length;

  // Filter supervisor's current group students
  const currentSupervisorGroupAssignments = useMemo(() => {
    if (!supervisorId || !selectedSupervisorGroupId) return [];
    return assignments.filter(
      a => a.supervisorId === supervisorId &&
           (a.groupId === selectedSupervisorGroupId || students.find(s => s.id === a.studentId)?.groupId === selectedSupervisorGroupId) &&
           (a.status === 'in_progress' || a.status === 'assigned')
    );
  }, [assignments, supervisorId, selectedSupervisorGroupId, students]);

  // Supervisor filters
  const [supSearchQuery, setSupSearchQuery] = useState('');
  const [supDeptFilter, setSupDeptFilter] = useState<'all' | 'unassigned' | string>('all');
  const [selectedStudentAsgIds, setSelectedStudentAsgIds] = useState<string[]>([]);
  const [targetDepartmentName, setTargetDepartmentName] = useState<string>('');

  // Hospital of the selected group
  const activeSupervisorDistribution = useMemo(() => {
    return distributions.find(d => d.supervisorId === supervisorId && d.groupId === selectedSupervisorGroupId);
  }, [distributions, supervisorId, selectedSupervisorGroupId]);

  const currentHospital = useMemo(() => {
    const placeId = activeSupervisorDistribution?.organizationId || currentSupervisorGroupAssignments[0]?.practicePlaceId || 'place-1';
    return places.find(p => p.id === placeId);
  }, [activeSupervisorDistribution, currentSupervisorGroupAssignments, places]);

  // Default departments in hospital
  const hospitalDepartments = useMemo(() => {
    if (currentHospital && currentHospital.departments && currentHospital.departments.length > 0) {
      return currentHospital.departments;
    }
    return ['Jarrohlik', 'Terapiya', 'Pediatriya', 'Qabul bo\'limi', 'Reanimatsiya'];
  }, [currentHospital]);

  useEffect(() => {
    if (hospitalDepartments.length > 0 && !targetDepartmentName) {
      setTargetDepartmentName(hospitalDepartments[0]);
    }
  }, [hospitalDepartments, targetDepartmentName]);

  // Department counts for this supervisor group
  const groupDeptBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      unassigned: 0
    };
    hospitalDepartments.forEach(dept => {
      counts[dept] = 0;
    });

    currentSupervisorGroupAssignments.forEach(asg => {
      if (!asg.departmentId || !asg.department || asg.department === 'Biriktirilmagan') {
        counts.unassigned = (counts.unassigned || 0) + 1;
      } else {
        counts[asg.department] = (counts[asg.department] || 0) + 1;
      }
    });

    return counts;
  }, [currentSupervisorGroupAssignments, hospitalDepartments]);

  // Filtered supervisor students
  const filteredSupervisorStudents = useMemo(() => {
    return currentSupervisorGroupAssignments.filter(asg => {
      const student = students.find(s => s.id === asg.studentId);
      if (!student) return false;

      if (supSearchQuery.trim()) {
        const q = supSearchQuery.toLowerCase();
        const matchName = student.fullName.toLowerCase().includes(q);
        const matchId = student.studentId.toLowerCase().includes(q);
        if (!matchName && !matchId) return false;
      }

      if (supDeptFilter === 'unassigned') {
        return !asg.departmentId || !asg.department || asg.department === 'Biriktirilmagan';
      } else if (supDeptFilter !== 'all') {
        return asg.department === supDeptFilter;
      }

      return true;
    });
  }, [currentSupervisorGroupAssignments, students, supSearchQuery, supDeptFilter]);

  // Supervisor bulk department assignment
  const handleSupervisorAssignDepartment = () => {
    if (selectedStudentAsgIds.length === 0) {
      showToast('warning', 'Talabalar tanlanmagan', 'Kamida bitta talabani belgilang.');
      return;
    }
    if (!targetDepartmentName) {
      showToast('warning', 'Bo\'lim tanlanmagan', 'Iltimos, shifoxona bo\'limini tanlang.');
      return;
    }

    const deptId = `dept-${targetDepartmentName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const result = storageService.assignStudentsToDepartment(
      selectedStudentAsgIds,
      deptId,
      targetDepartmentName,
      supervisorId,
      currentUser?.id || 'supervisor',
      'PRACTICE_SUPERVISOR'
    );

    refreshData();
    setSelectedStudentAsgIds([]);
    showToast(
      'success',
      'Bo\'limga muvaffaqiyatli biriktirildi',
      `${result.successCount} nafar talaba "${targetDepartmentName}" bo'limiga biriktirildi.`
    );
  };

  // Toggle selection
  const handleToggleSelectAll = () => {
    if (selectedStudentAsgIds.length === filteredSupervisorStudents.length) {
      setSelectedStudentAsgIds([]);
    } else {
      setSelectedStudentAsgIds(filteredSupervisorStudents.map(a => a.id));
    }
  };

  const handleToggleStudent = (asgId: string) => {
    setSelectedStudentAsgIds(prev =>
      prev.includes(asgId) ? prev.filter(id => id !== asgId) : [...prev, asgId]
    );
  };

  // ==========================================
  // PRACTICE HEAD / ADMIN STATE & LOGIC
  // ==========================================
  const [headActiveTab, setHeadActiveTab] = useState<'distributions' | 'matrix' | 'students' | 'unassigned'>('distributions');
  const [headSearchQuery, setHeadSearchQuery] = useState('');
  const [filterPracticeId, setFilterPracticeId] = useState<string>('all');
  const [filterOrgId, setFilterOrgId] = useState<string>('all');

  // Distribution Creation Modal State
  const [isDistModalOpen, setIsDistModalOpen] = useState(false);
  const [formAcademicYear, setFormAcademicYear] = useState('2025-2026');
  const [formPracticeId, setFormPracticeId] = useState(practices[0]?.id || '');
  const [formDirectionId, setFormDirectionId] = useState(directions[0]?.id || '');
  const [formCourseLevel, setFormCourseLevel] = useState<number>(3);
  const [formGroupId, setFormGroupId] = useState(groups[0]?.id || '');
  const [formOrgId, setFormOrgId] = useState(places[0]?.id || '');
  const [formSupervisorId, setFormSupervisorId] = useState(supervisors[0]?.id || '');
  const [formStartDate, setFormStartDate] = useState('2026-10-05');
  const [formEndDate, setFormEndDate] = useState('2026-10-30');
  const [formPracticeDays, setFormPracticeDays] = useState<string[]>([
    'Dushanba',
    'Seshanba',
    'Chorshanba',
    'Payshanba',
    'Juma'
  ]);
  const [formStartTime, setFormStartTime] = useState('08:00');
  const [formEndTime, setFormEndTime] = useState('14:00');

  // Available groups for selected direction and course in creation form
  const availableFormGroups = useMemo(() => {
    return groups.filter(g => {
      if (formDirectionId && g.directionId !== formDirectionId) return false;
      return true;
    });
  }, [groups, formDirectionId]);

  useEffect(() => {
    if (availableFormGroups.length > 0 && !availableFormGroups.some(g => g.id === formGroupId)) {
      setFormGroupId(availableFormGroups[0].id);
    }
  }, [availableFormGroups, formGroupId]);

  const handleCreateDistribution = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = storageService.createPracticeDistribution(
        {
          practiceId: formPracticeId,
          academicYear: formAcademicYear,
          courseLevel: Number(formCourseLevel),
          directionId: formDirectionId,
          groupId: formGroupId,
          supervisorId: formSupervisorId,
          organizationId: formOrgId,
          startDate: formStartDate,
          endDate: formEndDate,
          practiceDays: formPracticeDays,
          startTime: formStartTime,
          endTime: formEndTime
        },
        currentUser?.id || 'admin',
        'PRACTICE_HEAD'
      );

      refreshData();
      setIsDistModalOpen(false);
      showToast(
        'success',
        'Amaliyot taqsimoti muvaffaqiyatli yaratildi',
        `${created.distributionCode} kodi bilan ${created.totalStudentsCount} nafar talabaga biriktirildi va xabarnomalar yuborildi.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Taqsimot yaratishda xatolik yuz berdi';
      showToast('error', 'Taqsimot yaratib bo\'lmadi', msg);
    }
  };

  const handleDeleteDistribution = (distId: string, distCode: string) => {
    if (window.confirm(`Rostdan ham ${distCode} taqsimotini o'chirmoqchimisiz? Guruh talabalari amaliyotdan bo'shatiladi.`)) {
      storageService.deletePracticeDistribution(distId, currentUser?.id || 'admin', 'PRACTICE_HEAD');
      refreshData();
      showToast('info', 'Taqsimot o\'chirildi', `${distCode} taqsimoti va talabalar biriktiruvi bekor qilindi.`);
    }
  };

  const togglePracticeDay = (day: string) => {
    setFormPracticeDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Filtered distributions for Head view
  const filteredDistributions = useMemo(() => {
    return distributions.filter(d => {
      if (filterPracticeId !== 'all' && d.practiceId !== filterPracticeId) return false;
      if (filterOrgId !== 'all' && d.organizationId !== filterOrgId) return false;
      if (headSearchQuery.trim()) {
        const q = headSearchQuery.toLowerCase();
        const group = groups.find(g => g.id === d.groupId);
        const supervisor = supervisors.find(s => s.id === d.supervisorId);
        const org = places.find(p => p.id === d.organizationId);
        const matchCode = (d.distributionCode || '').toLowerCase().includes(q);
        const matchGroup = (group?.name || '').toLowerCase().includes(q);
        const matchSup = (supervisor?.fullName || '').toLowerCase().includes(q);
        const matchOrg = (org?.name || '').toLowerCase().includes(q);
        if (!matchCode && !matchGroup && !matchSup && !matchOrg) return false;
      }
      return true;
    });
  }, [distributions, filterPracticeId, filterOrgId, headSearchQuery, groups, supervisors, places]);

  // Organization-Centric Matrix (Requirement 3: 1 tashkilot -> bir nechta guruh -> har bir guruhga alohida amaliyot rahbari)
  const organizationMatrix = useMemo(() => {
    return places.map(place => {
      const placeDists = distributions.filter(d => d.organizationId === place.id);
      const placeAssignments = assignments.filter(a => a.practicePlaceId === place.id && (a.status === 'in_progress' || a.status === 'assigned'));
      return {
        place,
        distributions: placeDists,
        totalAssignedStudents: placeAssignments.length
      };
    });
  }, [places, distributions, assignments]);

  // Unassigned university students (no active practice)
  const unassignedStudents = useMemo(() => {
    const activeStudentIds = new Set(
      assignments.filter(a => a.status === 'in_progress' || a.status === 'assigned').map(a => a.studentId)
    );
    return students.filter(s => !activeStudentIds.has(s.id));
  }, [students, assignments]);

  // ==========================================
  // RENDER VIEW
  // ==========================================
  return (
    <div className="space-y-6">
      {/* ============================================================ */}
      {/* 1. SUPERVISOR WORKSPACE                                      */}
      {/* ============================================================ */}
      {isSupervisor ? (
        <div className="space-y-6">
          {/* Header & Sticky Status Badge */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
                Amaliyot Rahbari Kabineti · Bo'limlarga taqsimlash
              </span>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
                Mening guruhlarim va talabalarni bo'limlarga biriktirish
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Faqat sizga biriktirilgan guruhlar ko'rsatilmoqda. Boshqa rahbarlarning guruhlari himoyalangan.
              </p>
            </div>

            {/* Prominent Real-time Status Badge (Requirement 10) */}
            <div className="flex items-center gap-3">
              {unassignedCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setSupDeptFilter(supDeptFilter === 'unassigned' ? 'all' : 'unassigned')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-xs ${
                    supDeptFilter === 'unassigned'
                      ? 'bg-rose-700 text-white ring-2 ring-rose-400'
                      : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span>Bo'limga biriktirilmagan: {unassignedCount} nafar</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-rose-200 text-rose-800 rounded">
                    {supDeptFilter === 'unassigned' ? 'Filtr faol' : 'Ko\'rish'}
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Barcha talabalar bo'limlarga taqsimlangan</span>
                </div>
              )}
            </div>
          </div>

          {/* Group Tabs (Mening guruhlarim) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
            {supervisorGroups.length === 0 ? (
              <div className="p-4 text-xs text-slate-500 italic">
                Hozircha sizga biriktirilgan guruhlar mavjud emas.
              </div>
            ) : (
              supervisorGroups.map(grp => {
                const grpAssignments = assignments.filter(
                  a => a.supervisorId === supervisorId &&
                       (a.groupId === grp.id || students.find(s => s.id === a.studentId)?.groupId === grp.id)
                );
                const grpUnassigned = grpAssignments.filter(
                  a => !a.departmentId || !a.department || a.department === 'Biriktirilmagan'
                ).length;
                const isSelected = selectedSupervisorGroupId === grp.id;

                return (
                  <button
                    key={grp.id}
                    type="button"
                    onClick={() => {
                      setSelectedSupervisorGroupId(grp.id);
                      setSelectedStudentAsgIds([]);
                      setSupDeptFilter('all');
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer shrink-0 border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>{grp.name}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {grpAssignments.length} talaba
                    </span>
                    {grpUnassigned > 0 && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isSelected ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {grpUnassigned} ta bo'sh
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Group Details & Department Allocation Dashboard */}
          {selectedSupervisorGroupId && (
            <div className="space-y-4">
              {/* Group Hospital & Schedule Info */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Klinik Baza (Tashkilot)
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 font-bold text-white text-sm">
                    <Hospital className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{currentHospital?.name || 'Chirchiq shahar tibbiyot birlashmasi'}</span>
                  </div>
                  <span className="text-[11px] text-blue-300 font-mono mt-0.5 block">
                    ID: {currentHospital?.organizationCode || 'TASH-000125'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Amaliyot Muddatlari
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 font-semibold text-white">
                    <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      {activeSupervisorDistribution?.startDate || '05.10.2026'} — {activeSupervisorDistribution?.endDate || '30.10.2026'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-300 mt-0.5 block">
                    {activeSupervisorDistribution?.practiceDays?.join(', ') || 'Dushanba – Juma'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Amaliyot Vaqti
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 font-semibold text-white">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {activeSupervisorDistribution?.startTime || '08:00'} — {activeSupervisorDistribution?.endTime || '14:00'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-300 mt-0.5 block">
                    Kunlik klinik mashg'ulot
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Taqsimot Kodi
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 font-mono font-bold text-white text-sm">
                    <Split className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>{activeSupervisorDistribution?.distributionCode || 'TAQ-2026-00125'}</span>
                  </div>
                  <span className="text-[11px] text-slate-300 mt-0.5 block">
                    Rasmiy taqsimot hujjati
                  </span>
                </div>
              </div>

              {/* Department Distribution Summary Bar (Requirement 9) */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    Bo'limlar bo'yicha joriy taqsimot:
                  </span>
                  <span className="text-slate-500 font-normal">
                    Jami guruh: {currentSupervisorGroupAssignments.length} talaba
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSupDeptFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                      supDeptFilter === 'all'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Barchasi ({currentSupervisorGroupAssignments.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setSupDeptFilter('unassigned')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                      supDeptFilter === 'unassigned'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : groupDeptBreakdown.unassigned > 0
                        ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}
                  >
                    Biriktirilmagan ({groupDeptBreakdown.unassigned})
                  </button>

                  {hospitalDepartments.map(dept => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setSupDeptFilter(supDeptFilter === dept ? 'all' : dept)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                        supDeptFilter === dept
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {dept} ({groupDeptBreakdown[dept] || 0})
                    </button>
                  ))}
                </div>
              </div>

              {/* Bulk Action Bar (When Checkboxes Selected) */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-900 hover:text-blue-700 cursor-pointer"
                  >
                    {selectedStudentAsgIds.length > 0 && selectedStudentAsgIds.length === filteredSupervisorStudents.length ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                    <span>
                      {selectedStudentAsgIds.length > 0
                        ? `${selectedStudentAsgIds.length} nafar tanlandi`
                        : "Barchasini tanlash"}
                    </span>
                  </button>
                  {selectedStudentAsgIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedStudentAsgIds([])}
                      className="text-[11px] text-slate-500 hover:underline cursor-pointer"
                    >
                      Bekor qilish
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
                      Bo'limga:
                    </span>
                    <select
                      value={targetDepartmentName}
                      onChange={e => setTargetDepartmentName(e.target.value)}
                      className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    >
                      {hospitalDepartments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleSupervisorAssignDepartment}
                    disabled={selectedStudentAsgIds.length === 0}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Biriktirish ({selectedStudentAsgIds.length})</span>
                  </button>
                </div>
              </div>

              {/* Students Table with Checkboxes */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="p-3 border-b border-slate-200 flex items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Talabani F.I.Sh yoki ID bo'yicha qidirish..."
                      value={supSearchQuery}
                      onChange={e => setSupSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <span className="text-xs text-slate-500">
                    Ko'rsatilmoqda: {filteredSupervisorStudents.length} ta
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={filteredSupervisorStudents.length > 0 && selectedStudentAsgIds.length === filteredSupervisorStudents.length}
                            onChange={handleToggleSelectAll}
                            className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </th>
                        <th className="py-2.5 px-3">Talaba F.I.Sh</th>
                        <th className="py-2.5 px-3">Talaba ID</th>
                        <th className="py-2.5 px-3">Guruh</th>
                        <th className="py-2.5 px-3">Hozirgi Bo'lim</th>
                        <th className="py-2.5 px-3">Tezkor Ta'simlash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredSupervisorStudents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 text-xs italic">
                            Talabalar topilmadi.
                          </td>
                        </tr>
                      ) : (
                        filteredSupervisorStudents.map(asg => {
                          const student = students.find(s => s.id === asg.studentId);
                          const group = groups.find(g => g.id === (asg.groupId || student?.groupId));
                          const isSelected = selectedStudentAsgIds.includes(asg.id);
                          const isUnassigned = !asg.departmentId || !asg.department || asg.department === 'Biriktirilmagan';

                          return (
                            <tr
                              key={asg.id}
                              className={`hover:bg-slate-50/80 transition-colors ${
                                isSelected ? 'bg-blue-50/40' : ''
                              }`}
                            >
                              <td className="py-2.5 px-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleStudent(asg.id)}
                                  className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-slate-900">
                                {student?.fullName || 'Noma\'lum talaba'}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-500">
                                {student?.studentId || asg.studentId}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">
                                {group?.name || 'Guruh'}
                              </td>
                              <td className="py-2.5 px-3">
                                {isUnassigned ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                    Biriktirilmagan
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">
                                    {asg.department}
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-1.5">
                                  <select
                                    value={isUnassigned ? '' : asg.department}
                                    onChange={e => {
                                      const newDept = e.target.value;
                                      if (!newDept) return;
                                      const deptId = `dept-${newDept.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
                                      storageService.assignStudentsToDepartment(
                                        [asg.id],
                                        deptId,
                                        newDept,
                                        supervisorId,
                                        currentUser?.id || 'supervisor',
                                        'PRACTICE_SUPERVISOR'
                                      );
                                      refreshData();
                                      showToast('success', 'Bo\'lim o\'zgartirildi', `${student?.fullName} -> ${newDept}`);
                                    }}
                                    className="px-2 py-1 text-xs border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                                  >
                                    {isUnassigned && <option value="">Tanlang...</option>}
                                    {hospitalDepartments.map(d => (
                                      <option key={d} value={d}>{d}</option>
                                    ))}
                                  </select>
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
      ) : (
        /* ============================================================ */
        /* 2. PRACTICE HEAD / ADMIN WORKSPACE                           */
        /* ============================================================ */
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Amaliyot taqsimoti va guruhlar biriktiruvi
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Amaliyot → Kurs → Yo'nalish → Guruh → Tashkilot (TASH ID) → Amaliyot rahbari (Guruh kesimida)
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsDistModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi taqsimot yaratish</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setHeadActiveTab('distributions')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
                headActiveTab === 'distributions'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Split className="w-4 h-4" />
              <span>Guruh taqsimotlari ({distributions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setHeadActiveTab('matrix')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
                headActiveTab === 'matrix'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Hospital className="w-4 h-4" />
              <span>Tashkilotlar va guruhlar matritsasi</span>
            </button>

            <button
              type="button"
              onClick={() => setHeadActiveTab('students')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
                headActiveTab === 'students'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Talabalar kesimida ({assignments.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setHeadActiveTab('unassigned')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
                headActiveTab === 'unassigned'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              <span>Taqsimlanmagan talabalar ({unassignedStudents.length})</span>
            </button>
          </div>

          {/* TAB 1: DISTRIBUTIONS (TAQ-2026-XXXXX) */}
          {headActiveTab === 'distributions' && (
            <div className="space-y-4">
              {/* Filter bar */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Taqsimot kodi, guruh, shifoxona yoki rahbar..."
                    value={headSearchQuery}
                    onChange={e => setHeadSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={filterPracticeId}
                    onChange={e => setFilterPracticeId(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="all">Barcha amaliyotlar</option>
                    {practices.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>

                  <select
                    value={filterOrgId}
                    onChange={e => setFilterOrgId(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="all">Barcha shifoxonalar</option>
                    {places.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Distributions Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">Taqsimot ID</th>
                        <th className="py-2.5 px-3">Amaliyot va O'quv Yili</th>
                        <th className="py-2.5 px-3">Kurs & Guruh</th>
                        <th className="py-2.5 px-3">Tashkilot (Klinik Baza)</th>
                        <th className="py-2.5 px-3">Amaliyot Rahbari</th>
                        <th className="py-2.5 px-3">Muddat va Vaqt</th>
                        <th className="py-2.5 px-3">Talabalar</th>
                        <th className="py-2.5 px-3">Bo'limlar Holati</th>
                        <th className="py-2.5 px-3 text-right">Amallar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredDistributions.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-slate-400 text-xs italic">
                            Taqsimotlar mavjud emas.
                          </td>
                        </tr>
                      ) : (
                        filteredDistributions.map(dist => {
                          const practice = practices.find(p => p.id === dist.practiceId);
                          const group = groups.find(g => g.id === dist.groupId);
                          const org = places.find(p => p.id === dist.organizationId);
                          const supervisor = supervisors.find(s => s.id === dist.supervisorId);
                          const direction = directions.find(d => d.id === dist.directionId);

                          const distAssignments = assignments.filter(
                            a => a.distributionId === dist.id || a.distributionCode === dist.distributionCode
                          );
                          const assignedCount = distAssignments.filter(a => !!a.departmentId && a.department !== '').length;
                          const totalCount = distAssignments.length || dist.totalStudentsCount || 0;

                          return (
                            <tr key={dist.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-2.5 px-3 font-mono font-bold text-blue-600">
                                {dist.distributionCode}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-semibold text-slate-900">{practice?.name || 'Amaliyot'}</div>
                                <div className="text-[11px] text-slate-500">{dist.academicYear}</div>
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-semibold text-slate-900">{group?.name || 'Guruh'}</div>
                                <div className="text-[11px] text-slate-500">{dist.courseLevel}-kurs · {direction?.name}</div>
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-semibold text-slate-900">{org?.name}</div>
                                <div className="text-[11px] text-slate-500 font-mono">ID: {org?.organizationCode || 'TASH-000125'}</div>
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-semibold text-slate-900">{supervisor?.fullName}</div>
                                <div className="text-[11px] text-slate-500">{supervisor?.academicDegree}</div>
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="text-slate-800 font-medium">
                                  {dist.startDate} — {dist.endDate}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {dist.practiceDays?.join(', ')} · {dist.startTime}–{dist.endTime}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-slate-900">
                                {totalCount} nafar
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className={`h-full ${assignedCount === totalCount && totalCount > 0 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                      style={{ width: `${totalCount > 0 ? (assignedCount / totalCount) * 100 : 0}%` }}
                                    />
                                  </div>
                                  <span className="text-[11px] font-semibold text-slate-700">
                                    {assignedCount}/{totalCount}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {totalCount - assignedCount > 0 ? `${totalCount - assignedCount} bo'sh` : 'To\'liq biriktirilgan'}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDistribution(dist.id, dist.distributionCode)}
                                  className="p-1 text-rose-500 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                  title="Taqsimotni o'chirish"
                                >
                                  <Trash2 className="w-4 h-4" />
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
          )}

          {/* TAB 2: ORGANIZATION-GROUP MATRIX (Requirement 3) */}
          {headActiveTab === 'matrix' && (
            <div className="space-y-6">
              <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-xl text-xs text-blue-900">
                <span className="font-bold">Biznes Qoida Nazorati:</span> Bitta tashkilotga (masalan Chirchiq shahar tibbiyot birlashmasi) bir nechta guruh biriktirilishi mumkin, lekin har bir guruhga alohida amaliyot rahbari biriktirilgan.
              </div>

              <div className="grid grid-cols-1 gap-6">
                {organizationMatrix.map(({ place, distributions: placeDists, totalAssignedStudents }) => (
                  <div key={place.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Hospital className="w-5 h-5 text-blue-600" />
                          <h3 className="font-bold text-slate-900 text-base">{place.name}</h3>
                          <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                            {place.organizationCode || 'TASH-000125'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {place.city}, {place.address}
                          </span>
                          <span>·</span>
                          <span>Sig'im: {place.capacity} nafar</span>
                          <span>·</span>
                          <span>Aloqa: {place.contactPerson} ({place.contactPhone})</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                          Jami: {totalAssignedStudents} nafar talaba
                        </span>
                      </div>
                    </div>

                    {/* Group-wise Supervisor allocation table */}
                    <div>
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                        Ushbu muassasaga biriktirilgan guruhlar va mas'ul rahbarlar:
                      </span>

                      {placeDists.length === 0 ? (
                        <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400 italic">
                          Hozircha ushbu muassasaga guruh taqsimoti qilinmagan.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {placeDists.map(dist => {
                            const group = groups.find(g => g.id === dist.groupId);
                            const supervisor = supervisors.find(s => s.id === dist.supervisorId);
                            const distAssignments = assignments.filter(
                              a => a.distributionId === dist.id || a.distributionCode === dist.distributionCode
                            );

                            return (
                              <div
                                key={dist.id}
                                className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2 hover:bg-slate-50 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                    <GraduationCap className="w-4 h-4 text-blue-600" />
                                    <span>{group?.name || 'Guruh'}</span>
                                  </div>
                                  <span className="text-[10px] font-mono font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                                    {dist.distributionCode}
                                  </span>
                                </div>

                                <div className="text-xs text-slate-700">
                                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Amaliyot Rahbari:</span>
                                  <span className="font-semibold text-slate-900">{supervisor?.fullName}</span>
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                                  <span>{distAssignments.length} nafar talaba</span>
                                  <span>{dist.startTime}–{dist.endTime}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: STUDENTS DETAIL LIST */}
          {headActiveTab === 'students' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-3 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  Talabalar bo'yicha to'liq biriktiruv jurnali: {assignments.length} yozuv
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Talaba F.I.Sh</th>
                      <th className="py-2.5 px-3">Guruh</th>
                      <th className="py-2.5 px-3">Taqsimot Kodi</th>
                      <th className="py-2.5 px-3">Tashkilot</th>
                      <th className="py-2.5 px-3">Amaliyot Rahbari</th>
                      <th className="py-2.5 px-3">Bo'lim</th>
                      <th className="py-2.5 px-3">Muddat</th>
                      <th className="py-2.5 px-3">Holat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assignments.map(asg => {
                      const student = students.find(s => s.id === asg.studentId);
                      const group = groups.find(g => g.id === (asg.groupId || student?.groupId));
                      const org = places.find(p => p.id === asg.practicePlaceId);
                      const supervisor = supervisors.find(s => s.id === asg.supervisorId);

                      return (
                        <tr key={asg.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2 px-3 font-semibold text-slate-900">{student?.fullName || asg.studentId}</td>
                          <td className="py-2 px-3 text-slate-600">{group?.name}</td>
                          <td className="py-2 px-3 font-mono text-blue-600 font-semibold">{asg.distributionCode || asg.assignmentId || 'TAQ-2026'}</td>
                          <td className="py-2 px-3 text-slate-800">{org?.name}</td>
                          <td className="py-2 px-3 text-slate-700">{supervisor?.fullName}</td>
                          <td className="py-2 px-3">
                            {asg.departmentId && asg.department ? (
                              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px] font-semibold">
                                {asg.department}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-[11px] font-semibold">
                                Biriktirilmagan
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-slate-500 text-[11px]">{asg.startDate} — {asg.endDate}</td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              FAOL
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: UNASSIGNED STUDENTS */}
          {headActiveTab === 'unassigned' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm">Amaliyotga biriktirilmagan talabalar</h3>
                <p className="text-xs text-slate-500">
                  Ushbu talabalar hozircha hech qaysi amaliyot taqsimotiga biriktirilmagan ({unassignedStudents.length} nafar).
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Talaba F.I.Sh</th>
                      <th className="py-2.5 px-3">Talaba ID</th>
                      <th className="py-2.5 px-3">Guruh</th>
                      <th className="py-2.5 px-3">Telefon</th>
                      <th className="py-2.5 px-3">Holat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {unassignedStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-emerald-600 text-xs font-semibold">
                          Barcha talabalar amaliyotlarga biriktirilgan!
                        </td>
                      </tr>
                    ) : (
                      unassignedStudents.map(student => {
                        const group = groups.find(g => g.id === student.groupId);
                        return (
                          <tr key={student.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-semibold text-slate-900">{student.fullName}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-500">{student.studentId}</td>
                            <td className="py-2.5 px-3 text-slate-600">{group?.name || 'Guruh'}</td>
                            <td className="py-2.5 px-3 text-slate-500">{student.phone}</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                                Kutmoqda
                              </span>
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
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. PRACTICE DISTRIBUTION CREATION MODAL                       */}
      {/* ============================================================ */}
      <Modal
        isOpen={isDistModalOpen}
        onClose={() => setIsDistModalOpen(false)}
        title="Yangi amaliyot taqsimoti yaratish (Guruh kesimida)"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateDistribution} className="space-y-4 text-xs">
          <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200 text-blue-900">
            <span className="font-bold">Ketma-ketlik:</span> Amaliyot → Kurs → Yo'nalish → Guruh → Tashkilot (Shifoxona) → Amaliyot rahbari (Guruh kesimida)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">O'quv yili *</label>
              <select
                value={formAcademicYear}
                onChange={e => setFormAcademicYear(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white"
                required
              >
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Amaliyot *</label>
              <select
                value={formPracticeId}
                onChange={e => setFormPracticeId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white"
                required
              >
                {practices.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kurs *</label>
              <select
                value={formCourseLevel}
                onChange={e => setFormCourseLevel(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg bg-white"
                required
              >
                {[1, 2, 3, 4, 5, 6].map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}-kurs</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Yo'nalish *</label>
              <select
                value={formDirectionId}
                onChange={e => setFormDirectionId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white"
                required
              >
                {directions.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Guruh *</label>
              <select
                value={formGroupId}
                onChange={e => setFormGroupId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white"
                required
              >
                {availableFormGroups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tashkilot (Klinik baza) *</label>
              <select
                value={formOrgId}
                onChange={e => setFormOrgId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white"
                required
              >
                {places.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.organizationCode || 'TASH-000125'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Amaliyot rahbari (Ushbu guruh uchun) *
              </label>
              <select
                value={formSupervisorId}
                onChange={e => setFormSupervisorId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white"
                required
              >
                {supervisors.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.academicDegree})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Boshlanish sanasi *</label>
              <input
                type="date"
                value={formStartDate}
                onChange={e => setFormStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tugash sanasi *</label>
              <input
                type="date"
                value={formEndDate}
                onChange={e => setFormEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Haftaning amaliyot kunlari *
            </label>
            <div className="flex flex-wrap gap-2">
              {['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'].map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => togglePracticeDay(day)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                    formPracticeDays.includes(day)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Boshlanish vaqti *</label>
              <input
                type="time"
                value={formStartTime}
                onChange={e => setFormStartTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tugash vaqti *</label>
              <input
                type="time"
                value={formEndTime}
                onChange={e => setFormEndTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDistModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Taqsimotni tasdiqlash va biriktirish</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
