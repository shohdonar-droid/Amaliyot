import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Users,
  Building2,
  UserCheck,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Search,
  Check,
  Zap,
  AlertTriangle,
  Hospital,
  Sparkles,
  Phone,
  GraduationCap,
  Calendar,
  Layers
} from 'lucide-react';
import {
  Practice,
  PracticeType,
  PracticeStatus,
  PracticeAssignment,
  Student,
  PracticePlace,
  Supervisor,
  ClinicResponsible
} from '../../../types';
import { storageService } from '../../../services/storageService';
import { Modal } from '../../common/Modal';
import { StatusBadge } from '../../common/Badge';
import { useToast } from '../../../context/ToastContext';

interface PracticeWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (practice: Practice, assignments: PracticeAssignment[]) => void;
}

const PRACTICE_TYPES: PracticeType[] = [
  "Ishlab chiqarish amaliyoti",
  "Klinik amaliyot",
  "O'quv amaliyoti",
  "Pedagogik amaliyot",
  "Malakaviy amaliyot",
  "O'quv-tanishuv amaliyoti",
  "Hamshiralik malakaviy amaliyoti",
  "Klinik ishlab chiqarish amaliyoti",
  "Subordinatura amaliyoti",
  "Klinik ordinatura amaliyoti",
  "Boshqa"
];

interface StudentAllocationDraft {
  studentId: string;
  placeId: string;
  department: string;
  supervisorId: string;
  clinicResponsibleId: string;
}

export function PracticeWizardModal({
  isOpen,
  onClose,
  onComplete
}: PracticeWizardModalProps) {
  const { showToast } = useToast();

  const faculties = storageService.getFaculties();
  const directions = storageService.getDirections();
  const courses = storageService.getCourses();
  const groups = storageService.getGroups();
  const allStudents = storageService.getStudents();
  const allPlaces = storageService.getPracticePlaces();
  const allSupervisors = storageService.getSupervisors();
  const allClinicResponsibles = storageService.getClinicResponsibles();

  // Wizard current step: 1..5
  const [currentStep, setCurrentStep] = useState<number>(1);

  // STEP 1: Basic Information
  const [name, setName] = useState('');
  const [type, setType] = useState<PracticeType>("Klinik ishlab chiqarish amaliyoti");
  const [code, setCode] = useState('');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-11-15');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [orderNumber, setOrderNumber] = useState('');
  const [orderDate, setOrderDate] = useState('2026-09-25');
  const [totalHours, setTotalHours] = useState(180);
  const [credits, setCredits] = useState(6);
  const [description, setDescription] = useState('');

  // STEP 2: Students selection
  const [facultyId, setFacultyId] = useState(faculties[0]?.id || '');
  const [directionId, setDirectionId] = useState(directions[0]?.id || '');
  const [courseLevel, setCourseLevel] = useState<number>(4);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // STEP 3: Practice Places
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);

  // STEP 4: Supervisors & Clinic Responsibles
  const [selectedSupervisorIds, setSelectedSupervisorIds] = useState<string[]>([]);
  const [selectedClinicRespIds, setSelectedClinicRespIds] = useState<string[]>([]);

  // STEP 5: Allocation Drafts
  const [allocations, setAllocations] = useState<Record<string, StudentAllocationDraft>>({});
  const [activeDepartmentPreset, setActiveDepartmentPreset] = useState('Terapiya');

  // Initialize or reset wizard on open
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      setName("4-kurs Davolash ishi klinik ishlab chiqarish amaliyoti");
      setType("Klinik ishlab chiqarish amaliyoti");
      setCode(`PRAC-${new Date().getFullYear()}-MED${randomSuffix}`);
      setStartDate('2026-10-01');
      setEndDate('2026-11-15');
      setAcademicYear('2025-2026');
      setOrderNumber(`BUYRUQ-№${randomSuffix}/A`);
      setOrderDate('2026-09-25');
      setTotalHours(180);
      setCredits(6);
      setDescription("Talabalarning statsionar shifoxonalarda ichki kasalliklar, jarrohlik va pediatriya bo'limlarida malakaviy ko'nikmalarini oshirish.");

      const defaultFac = faculties[0]?.id || '';
      setFacultyId(defaultFac);
      const defaultDir = directions.find(d => d.facultyId === defaultFac)?.id || directions[0]?.id || '';
      setDirectionId(defaultDir);
      setCourseLevel(4);

      // Default groups for this faculty & direction
      const matchingGroups = groups.filter(g => g.facultyId === defaultFac && g.directionId === defaultDir);
      const initGroupIds = matchingGroups.slice(0, 2).map(g => g.id);
      setSelectedGroupIds(initGroupIds);

      // Default selected students in these groups
      const initStudents = allStudents.filter(s => initGroupIds.includes(s.groupId));
      setSelectedStudentIds(initStudents.map(s => s.id));

      // Default places
      setSelectedPlaceIds(allPlaces.slice(0, 2).map(p => p.id));

      // Default supervisors & mentors
      setSelectedSupervisorIds(allSupervisors.slice(0, 2).map(s => s.id));
      setSelectedClinicRespIds(allClinicResponsibles.slice(0, 2).map(c => c.id));
      setAllocations({});
    }
  }, [isOpen]);

  // Filtered directions based on chosen faculty
  const availableDirections = useMemo(() => {
    return directions.filter(d => !facultyId || d.facultyId === facultyId);
  }, [directions, facultyId]);

  // Filtered groups based on chosen faculty & direction
  const availableGroups = useMemo(() => {
    return groups.filter(g => {
      const matchFac = !facultyId || g.facultyId === facultyId;
      const matchDir = !directionId || g.directionId === directionId;
      return matchFac && matchDir;
    });
  }, [groups, facultyId, directionId]);

  // Students available for selection based on selected groups
  const poolStudents = useMemo(() => {
    if (selectedGroupIds.length === 0) {
      return allStudents.filter(s => {
        const matchFac = !facultyId || s.facultyId === facultyId;
        const matchDir = !directionId || s.directionId === directionId;
        return matchFac && matchDir;
      });
    }
    return allStudents.filter(s => selectedGroupIds.includes(s.groupId));
  }, [allStudents, selectedGroupIds, facultyId, directionId]);

  // Filtered pool students by search text
  const displayedPoolStudents = useMemo(() => {
    if (!studentSearchQuery.trim()) return poolStudents;
    const q = studentSearchQuery.toLowerCase();
    return poolStudents.filter(s => 
      s.fullName.toLowerCase().includes(q) ||
      s.studentId.toLowerCase().includes(q) ||
      s.pinfl.includes(q)
    );
  }, [poolStudents, studentSearchQuery]);

  // Auto-build allocation drafts when reaching step 5
  useEffect(() => {
    if (currentStep === 5) {
      setAllocations(prev => {
        const next: Record<string, StudentAllocationDraft> = { ...prev };
        const placesPool = selectedPlaceIds.length > 0 ? selectedPlaceIds : [allPlaces[0]?.id || 'place-1'];
        const superPool = selectedSupervisorIds.length > 0 ? selectedSupervisorIds : [allSupervisors[0]?.id || 'sup-1'];
        const clinicPool = selectedClinicRespIds.length > 0 ? selectedClinicRespIds : [allClinicResponsibles[0]?.id || 'cresp-1'];

        selectedStudentIds.forEach((stdId, idx) => {
          if (!next[stdId]) {
            const assignedPlace = placesPool[idx % placesPool.length];
            const matchingClinicMentor = allClinicResponsibles.find(c => c.practicePlaceId === assignedPlace);
            next[stdId] = {
              studentId: stdId,
              placeId: assignedPlace,
              department: activeDepartmentPreset,
              supervisorId: superPool[idx % superPool.length],
              clinicResponsibleId: matchingClinicMentor ? matchingClinicMentor.id : clinicPool[idx % clinicPool.length]
            };
          }
        });
        return next;
      });
    }
  }, [currentStep, selectedStudentIds, selectedPlaceIds, selectedSupervisorIds, selectedClinicRespIds, activeDepartmentPreset]);

  // Bulk smart balance for Step 5
  const handleSmartAutoDistribute = () => {
    if (selectedPlaceIds.length === 0) {
      showToast('warning', 'Bazalar yetarli emas', 'Amaliyot joylarini tanlang.');
      return;
    }
    const next: Record<string, StudentAllocationDraft> = {};
    const places = selectedPlaceIds;
    const sups = selectedSupervisorIds.length > 0 ? selectedSupervisorIds : [allSupervisors[0]?.id || 'sup-1'];

    selectedStudentIds.forEach((stdId, index) => {
      const placeId = places[index % places.length];
      const matchingClinicMentor = allClinicResponsibles.find(c => c.practicePlaceId === placeId);
      next[stdId] = {
        studentId: stdId,
        placeId,
        department: activeDepartmentPreset,
        supervisorId: sups[index % sups.length],
        clinicResponsibleId: matchingClinicMentor ? matchingClinicMentor.id : (selectedClinicRespIds[0] || 'cresp-1')
      };
    });

    setAllocations(next);
    showToast('success', 'Avtomatik taqsimlandi', `${selectedStudentIds.length} nafar talaba muvozanatli taqsimlandi.`);
  };

  // Group selection toggle
  const toggleGroup = (groupId: string) => {
    const isSelected = selectedGroupIds.includes(groupId);
    let nextGroupIds: string[];
    if (isSelected) {
      nextGroupIds = selectedGroupIds.filter(id => id !== groupId);
    } else {
      nextGroupIds = [...selectedGroupIds, groupId];
    }
    setSelectedGroupIds(nextGroupIds);

    // Auto-sync students from these groups
    const relatedStudents = allStudents.filter(s => nextGroupIds.includes(s.groupId));
    setSelectedStudentIds(relatedStudents.map(s => s.id));
  };

  // Student selection toggle
  const toggleStudent = (stdId: string) => {
    if (selectedStudentIds.includes(stdId)) {
      setSelectedStudentIds(selectedStudentIds.filter(id => id !== stdId));
    } else {
      setSelectedStudentIds([...selectedStudentIds, stdId]);
    }
  };

  const selectAllStudents = () => {
    setSelectedStudentIds(poolStudents.map(s => s.id));
  };

  const deselectAllStudents = () => {
    setSelectedStudentIds([]);
  };

  // Place toggle
  const togglePlace = (placeId: string) => {
    if (selectedPlaceIds.includes(placeId)) {
      setSelectedPlaceIds(selectedPlaceIds.filter(id => id !== placeId));
    } else {
      setSelectedPlaceIds([...selectedPlaceIds, placeId]);
    }
  };

  // Supervisor toggle
  const toggleSupervisor = (supId: string) => {
    if (selectedSupervisorIds.includes(supId)) {
      setSelectedSupervisorIds(selectedSupervisorIds.filter(id => id !== supId));
    } else {
      setSelectedSupervisorIds([...selectedSupervisorIds, supId]);
    }
  };

  // Clinic responsible toggle
  const toggleClinicResp = (respId: string) => {
    if (selectedClinicRespIds.includes(respId)) {
      setSelectedClinicRespIds(selectedClinicRespIds.filter(id => id !== respId));
    } else {
      setSelectedClinicRespIds([...selectedClinicRespIds, respId]);
    }
  };

  // Allocation item update
  const updateAllocationField = (stdId: string, field: keyof StudentAllocationDraft, value: string) => {
    setAllocations(prev => {
      const current = prev[stdId] || {
        studentId: stdId,
        placeId: selectedPlaceIds[0] || '',
        department: 'Terapiya',
        supervisorId: selectedSupervisorIds[0] || '',
        clinicResponsibleId: selectedClinicRespIds[0] || ''
      };

      const updated = { ...current, [field]: value };

      // If place changed, auto-suggest the matching clinic mentor
      if (field === 'placeId') {
        const matchingMentor = allClinicResponsibles.find(c => c.practicePlaceId === value);
        if (matchingMentor) {
          updated.clinicResponsibleId = matchingMentor.id;
        }
      }

      return {
        ...prev,
        [stdId]: updated
      };
    });
  };

  // Step navigation validations
  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!name.trim()) {
        showToast('warning', 'Ma\'lumot yetarli emas', 'Amaliyot nomini kiriting.');
        return false;
      }
      if (!startDate || !endDate) {
        showToast('warning', 'Sana kiritilmadi', 'Boshlanish va tugash sanasini belgilang.');
        return false;
      }
      if (!orderNumber.trim()) {
        showToast('warning', 'Buyruq raqami', 'Amaliyot asos bo\'lgan buyruq raqamini kiriting.');
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (selectedStudentIds.length === 0) {
        showToast('warning', 'Talabalar tanlanmadi', 'Amaliyotga kamida 1 nafar talabani biriktiring.');
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (selectedPlaceIds.length === 0) {
        showToast('warning', 'Baza tanlanmadi', 'Kamida bitta amaliyot bazasini (shifoxona) belgilang.');
        return false;
      }
      return true;
    }
    if (step === 4) {
      if (selectedSupervisorIds.length === 0) {
        showToast('warning', 'Rahbar tanlanmadi', 'Universitet amaliyot rahbarini belgilang.');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Final submit handler
  const handleFinalSubmit = () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      return;
    }

    const practiceId = `prac-${Date.now()}`;
    const newPractice: Practice = {
      id: practiceId,
      name: name.trim(),
      type,
      code: code.trim() || `PRAC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      startDate,
      endDate,
      academicYear,
      facultyId,
      directionId,
      courseLevel,
      groupIds: selectedGroupIds,
      practicePlaceIds: selectedPlaceIds,
      supervisorIds: selectedSupervisorIds,
      clinicResponsibleIds: selectedClinicRespIds,
      status: 'ACTIVE',
      orderNumber: orderNumber.trim(),
      orderDate,
      description: description.trim(),
      totalHours: Number(totalHours) || 180,
      credits: Number(credits) || 6,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Construct PracticeAssignment records
    const finalAssignments: PracticeAssignment[] = selectedStudentIds.map((stdId, index) => {
      const draft = allocations[stdId];
      const targetPlace = draft?.placeId || selectedPlaceIds[index % selectedPlaceIds.length];
      const targetSupervisor = draft?.supervisorId || selectedSupervisorIds[index % selectedSupervisorIds.length];
      const targetClinic = draft?.clinicResponsibleId || selectedClinicRespIds[0] || '';
      const targetDept = draft?.department || 'Terapiya';

      return {
        id: `asg-${Date.now()}-${index}`,
        practiceId,
        studentId: stdId,
        practicePlaceId: targetPlace,
        department: targetDept,
        supervisorId: targetSupervisor,
        clinicResponsibleId: targetClinic,
        startDate,
        endDate,
        status: 'in_progress',
        createdAt: new Date().toISOString()
      };
    });

    onComplete(newPractice, finalAssignments);
  };

  // Step Indicators metadata
  const steps = [
    { num: 1, label: 'Asosiy ma\'lumotlar', icon: FileText },
    { num: 2, label: 'Talabalar tanlovi', icon: Users },
    { num: 3, label: 'Amaliyot joylari', icon: Building2 },
    { num: 4, label: 'Rahbarlar', icon: UserCheck },
    { num: 5, label: 'Taqsimlash & Tasdiqlash', icon: CheckCircle2 }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Yangi amaliyot yaratish va talabalarni taqsimlash"
      subtitle="Amaliyot buyrug'i, talabalar kvotasi, klinik bazalar va taqsimotni tasdiqlash jarayoni"
      maxWidth="2xl"
    >
      <div className="flex flex-col h-[78vh] max-h-[820px]">
        {/* Step Progress Bar */}
        <div className="border-b border-slate-200 pb-3 mb-4 shrink-0">
          <div className="grid grid-cols-5 gap-2">
            {steps.map(s => {
              const Icon = s.icon;
              const isCurrent = currentStep === s.num;
              const isDone = currentStep > s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => {
                    if (s.num < currentStep) setCurrentStep(s.num);
                  }}
                  className={`flex flex-col items-center sm:items-start text-left p-2 rounded-lg transition-all ${
                    isCurrent
                      ? 'bg-blue-50/80 border border-blue-200 text-blue-700'
                      : isDone
                      ? 'bg-emerald-50/50 border border-emerald-200 text-emerald-700 cursor-pointer'
                      : 'bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-1.5 w-full">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : s.num}
                    </div>
                    <span className="hidden sm:inline text-xs font-semibold truncate">
                      {s.label}
                    </span>
                  </div>
                  <span className="text-[11px] sm:hidden text-slate-500 mt-1">
                    {s.num}-bosqich
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Body (Scrollable viewport) */}
        <div className="flex-1 overflow-y-auto px-1 pr-2 space-y-4">
          {/* STEP 1: ASOSIY MA'LUMOTLAR */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-600">
                  <strong className="font-semibold text-slate-800">1-BOSQICH: Asosiy ma'lumotlar. </strong>
                  O'quv rejasidagi amaliyot nomi, turi, muddatlari hamda tegishli rektorat buyrug'i ma'lumotlarini kiriting.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amaliyot nomi *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Masalan: 4-kurs Klinik ishlab chiqarish amaliyoti"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amaliyot turi *
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as PracticeType)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    {PRACTICE_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amaliyot kodi / identifikatori
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Boshlanish sanasi *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tugash sanasi *
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Buyruq raqami *
                  </label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={e => setOrderNumber(e.target.value)}
                    placeholder="BUYRUQ-№188/A"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Buyruq sanasi *
                  </label>
                  <input
                    type="date"
                    value={orderDate}
                    onChange={e => setOrderDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Yuklama soati (soat)
                  </label>
                  <input
                    type="number"
                    value={totalHours}
                    onChange={e => setTotalHours(Number(e.target.value))}
                    min={10}
                    max={1000}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kredit miqdori (ECTS)
                  </label>
                  <input
                    type="number"
                    value={credits}
                    onChange={e => setCredits(Number(e.target.value))}
                    min={1}
                    max={30}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Izoh va qo'shimcha ko'rsatmalar
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Amaliyotning asosiy vazifalari, klinik bazalar va maxsus talablar..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: TALABALARNI TANLASH */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-600">
                  <strong className="font-semibold text-slate-800">2-BOSQICH: Talabalarni tanlash. </strong>
                  Fakultet, yo'nalish va kursni tanlang, so'ng amaliyotga qatnashadigan guruhlar yoki alohida talabalarni belgilang.
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Fakultet
                  </label>
                  <select
                    value={facultyId}
                    onChange={e => {
                      setFacultyId(e.target.value);
                      const matchingDir = directions.find(d => d.facultyId === e.target.value);
                      if (matchingDir) setDirectionId(matchingDir.id);
                    }}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    {faculties.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Yo'nalish
                  </label>
                  <select
                    value={directionId}
                    onChange={e => setDirectionId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    {availableDirections.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Kurs bosqichi
                  </label>
                  <select
                    value={courseLevel}
                    onChange={e => setCourseLevel(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map(lvl => (
                      <option key={lvl} value={lvl}>{lvl}-kurs</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Groups Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Guruhlarni tanlash ({selectedGroupIds.length} ta tanlandi)
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableGroups.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Ushbu yo'nalishda guruhlar topilmadi.</p>
                  ) : (
                    availableGroups.map(grp => {
                      const isSelected = selectedGroupIds.includes(grp.id);
                      return (
                        <button
                          key={grp.id}
                          type="button"
                          onClick={() => toggleGroup(grp.id)}
                          className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <span>{grp.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded ${isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            {grp.language}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Students Selection Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-xs font-semibold text-slate-900">
                      Tanlangan talabalar:
                    </span>
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                      {selectedStudentIds.length} / {poolStudents.length} ta
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={studentSearchQuery}
                        onChange={e => setStudentSearchQuery(e.target.value)}
                        placeholder="F.I.Sh. yoki ID orqali qidirish..."
                        className="w-full pl-8 pr-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={selectAllStudents}
                      className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 shrink-0"
                    >
                      Barchasini tanlash
                    </button>
                    <button
                      type="button"
                      onClick={deselectAllStudents}
                      className="px-2 py-1 text-xs font-medium text-slate-600 bg-white hover:bg-slate-100 rounded border border-slate-200 shrink-0"
                    >
                      Tozalash
                    </button>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {displayedPoolStudents.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      Guruh tanlang yoki qidiruv so'zini tekshiring
                    </div>
                  ) : (
                    displayedPoolStudents.map(student => {
                      const isChecked = selectedStudentIds.includes(student.id);
                      const grp = groups.find(g => g.id === student.groupId);
                      return (
                        <label
                          key={student.id}
                          className={`flex items-center justify-between p-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                            isChecked ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleStudent(student.id)}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                            />
                            <div>
                              <div className="text-xs font-semibold text-slate-900">
                                {student.fullName}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                                <span className="font-mono">{student.studentId}</span>
                                <span>·</span>
                                <span>{grp?.name || 'Guruhsiz'}</span>
                                <span>·</span>
                                <span>{student.phone}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[11px] font-mono text-slate-400">
                              JSHSHIR: {student.pinfl}
                            </span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: AMALIYOT JOYLARI (HOSPITALS & CAPACITY) */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 flex items-start gap-3">
                <Building2 className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-600">
                  <strong className="font-semibold text-slate-800">3-BOSQICH: Amaliyot joylari. </strong>
                  Talabalar taqsimlanadigan klinik bazalar, poliklinikalar va ilmiy markazlarni tanlang.
                  Har bir baza uchun umumiy sig'im, bandlik va mavjud bo'sh joylar monitoring qilinadi.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allPlaces.map(place => {
                  const isSelected = selectedPlaceIds.includes(place.id);
                  const availableSpots = Math.max(0, place.capacity - place.activeStudentsCount);
                  const occupancyPercent = Math.round((place.activeStudentsCount / place.capacity) * 100);

                  return (
                    <div
                      key={place.id}
                      onClick={() => togglePlace(place.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                          />
                          <h4 className="text-xs font-bold text-slate-900">
                            {place.name}
                          </h4>
                        </div>
                        <StatusBadge
                          label={place.type}
                          variant={place.type === 'Shifoxona' ? 'active' : 'info'}
                        />
                      </div>

                      <p className="text-[11px] text-slate-500 mt-1 pl-6">
                        {place.address}, {place.city}
                      </p>

                      {/* Capacity meters */}
                      <div className="mt-3 pl-6 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-600">
                          <span>Sig'im: <strong className="font-mono text-slate-800">{place.capacity}</strong></span>
                          <span>Band: <strong className="font-mono text-amber-700">{place.activeStudentsCount}</strong></span>
                          <span>Bo'sh: <strong className="font-mono text-emerald-700">{availableSpots} ta</strong></span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              occupancyPercent > 85 ? 'bg-red-500' : occupancyPercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, occupancyPercent)}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-3 pl-6 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                        <span>Mas'ul: {place.contactPerson}</span>
                        <span className="font-mono">{place.contactPhone}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                <span className="text-slate-600 font-medium">
                  Tanlangan bazalar soni: <strong className="text-blue-700">{selectedPlaceIds.length} ta</strong>
                </span>
                <span className="text-slate-600">
                  Umumiy ajratilayotgan bo'sh o'rinlar:{' '}
                  <strong className="text-emerald-700 font-mono">
                    {allPlaces
                      .filter(p => selectedPlaceIds.includes(p.id))
                      .reduce((sum, p) => sum + Math.max(0, p.capacity - p.activeStudentsCount), 0)}{' '}
                    ta
                  </strong>
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: RAHBARLAR (UNIVERSITY SUPERVISORS & CLINIC MENTORS) */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 flex items-start gap-3">
                <UserCheck className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-600">
                  <strong className="font-semibold text-slate-800">4-BOSQICH: Rahbarlarni biriktirish. </strong>
                  Universitet amaliyot rahbarlari hamda shifoxonalardagi klinik mas'ullarni belgilang.
                  Ular talabalarning kundaliklarini, amaliy ko'nikmalarini tasdiqlab, yakuniy baholashni amalga oshiradi.
                </div>
              </div>

              {/* University Supervisors */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Universitet amaliyot rahbarlari ({selectedSupervisorIds.length} ta tanlandi)</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {allSupervisors.map(sup => {
                    const isSelected = selectedSupervisorIds.includes(sup.id);
                    return (
                      <div
                        key={sup.id}
                        onClick={() => toggleSupervisor(sup.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-900">{sup.fullName}</div>
                              <div className="text-[11px] text-slate-500">{sup.department} · {sup.academicDegree}</div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 pl-6 text-[11px] text-slate-600 flex items-center justify-between border-t border-slate-100 pt-1.5">
                          <span>Yuklama: <strong className="text-slate-800">{sup.assignedStudentsCount} talaba</strong></span>
                          <span className="font-mono text-slate-500">{sup.phone}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Clinic Responsibles */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Hospital className="w-4 h-4 text-emerald-600" />
                  <span>Klinik bazalardagi mas'ul shaxslar ({selectedClinicRespIds.length} ta tanlandi)</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {allClinicResponsibles.map(cresp => {
                    const isSelected = selectedClinicRespIds.includes(cresp.id);
                    const place = allPlaces.find(p => p.id === cresp.practicePlaceId);
                    return (
                      <div
                        key={cresp.id}
                        onClick={() => toggleClinicResp(cresp.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-900">{cresp.fullName}</div>
                              <div className="text-[11px] text-slate-500">{cresp.position}</div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 pl-6 text-[11px] text-slate-600 flex items-center justify-between border-t border-slate-100 pt-1.5">
                          <span className="truncate max-w-[180px]">{place?.name || cresp.department}</span>
                          <span className="font-mono text-slate-500">{cresp.phone}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: TAQSIMLASH VA TASDIQLASH (PRACTICE ASSIGNMENT GENERATION) */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="text-xs text-slate-700">
                    <strong className="font-semibold text-slate-900">5-BOSQICH: Taqsimlash va Yakuniy Tasdiqlash. </strong>
                    Har bir talabaga aniq shifoxona bazasi, bo'limi, universiteti amaliyot rahbari va klinik mas'uli biriktiriladi.
                    Tasdiqlangandan so'ng tizim davomat, elektron kundalik va ko'nikmalar modullari uchun rasmiy{' '}
                    <code className="text-emerald-800 font-mono font-semibold">PracticeAssignment</code> yozuvlarini yaratadi.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSmartAutoDistribute}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Avtomatik taqsimlash</span>
                </button>
              </div>

              {/* Department preset selector */}
              <div className="flex flex-wrap items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <span className="font-semibold text-slate-700">Asosiy klinik bo'lim:</span>
                {['Terapiya', 'Jarrohlik', 'Pediatriya', 'Reanimatsiya va anesteziologiya', 'Kardiologiya', 'Nevrologiya'].map(dept => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => {
                      setActiveDepartmentPreset(dept);
                      setAllocations(prev => {
                        const next = { ...prev };
                        Object.keys(next).forEach(k => {
                          next[k] = { ...next[k], department: dept };
                        });
                        return next;
                      });
                    }}
                    className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                      activeDepartmentPreset === dept
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>

              {/* Distribution Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-medium">
                  <span>Taqsimlanayotgan talabalar: <strong className="text-slate-900">{selectedStudentIds.length} nafar</strong></span>
                  <span>Biriktirilgan bazalar: <strong className="text-slate-900">{selectedPlaceIds.length} ta</strong></span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {selectedStudentIds.map((stdId, idx) => {
                    const student = allStudents.find(s => s.id === stdId);
                    const grp = groups.find(g => g.id === student?.groupId);
                    const draft = allocations[stdId] || {
                      studentId: stdId,
                      placeId: selectedPlaceIds[0] || '',
                      department: activeDepartmentPreset,
                      supervisorId: selectedSupervisorIds[0] || '',
                      clinicResponsibleId: selectedClinicRespIds[0] || ''
                    };

                    return (
                      <div key={stdId} className="p-3 hover:bg-slate-50/80 transition-colors grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                        <div className="md:col-span-4 flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-mono flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="text-xs font-semibold text-slate-900">
                              {student?.fullName || stdId}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {student?.studentId} · {grp?.name}
                            </div>
                          </div>
                        </div>

                        {/* Hospital place dropdown */}
                        <div className="md:col-span-3">
                          <label className="block md:hidden text-[10px] text-slate-500 mb-0.5">Amaliyot joyi:</label>
                          <select
                            value={draft.placeId}
                            onChange={e => updateAllocationField(stdId, 'placeId', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-blue-600"
                          >
                            {allPlaces
                              .filter(p => selectedPlaceIds.includes(p.id))
                              .map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                          </select>
                        </div>

                        {/* Supervisor dropdown */}
                        <div className="md:col-span-3">
                          <label className="block md:hidden text-[10px] text-slate-500 mb-0.5">Universitet rahbari:</label>
                          <select
                            value={draft.supervisorId}
                            onChange={e => updateAllocationField(stdId, 'supervisorId', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-blue-600"
                          >
                            {allSupervisors
                              .filter(s => selectedSupervisorIds.includes(s.id))
                              .map(s => (
                                <option key={s.id} value={s.id}>{s.fullName}</option>
                              ))}
                          </select>
                        </div>

                        {/* Department selector */}
                        <div className="md:col-span-2">
                          <label className="block md:hidden text-[10px] text-slate-500 mb-0.5">Bo'lim:</label>
                          <input
                            type="text"
                            value={draft.department}
                            onChange={e => updateAllocationField(stdId, 'department', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-blue-600 font-medium"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <div>
                  <div className="text-[11px] text-slate-500">Amaliyot muddati</div>
                  <div className="text-xs font-bold text-slate-800 font-mono mt-0.5">{startDate} - {endDate}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Talabalar soni</div>
                  <div className="text-xs font-bold text-blue-700 font-mono mt-0.5">{selectedStudentIds.length} nafar</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Klinik bazalar</div>
                  <div className="text-xs font-bold text-emerald-700 font-mono mt-0.5">{selectedPlaceIds.length} ta</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Buyruq hujjati</div>
                  <div className="text-xs font-bold text-slate-800 font-mono mt-0.5">{orderNumber}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Orqaga</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-transparent rounded-lg transition-colors cursor-pointer"
            >
              Bekor qilish
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Keyingisi</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Amaliyotni yaratish va Taqsimotni tasdiqlash</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
