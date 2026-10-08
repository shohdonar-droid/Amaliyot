import React, { useState, useMemo, useEffect } from 'react';
import {
  CalendarRange,
  Plus,
  Play,
  Pause,
  CheckCircle,
  Archive,
  Edit2,
  Trash2,
  Building2,
  Users,
  Clock,
  FileText,
  Search,
  Copy,
  Eye,
  LayoutGrid,
  Table as TableIcon,
  ShieldAlert,
  AlertTriangle,
  GraduationCap
} from 'lucide-react';
import { Practice, PracticeStatus, PracticeAssignment, PracticePlace } from '../../../types';
import { storageService } from '../../../services/storageService';
import { organizationService } from '../../../services/organizationService';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';
import { StatusBadge, StatusVariant } from '../../common/Badge';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { PracticeFormModal } from './PracticeFormModal';
import { PracticeWizardModal } from './PracticeWizardModal';
import { PracticeDetailModal } from './PracticeDetailModal';
import { EmptyState } from '../../common/EmptyState';
import {
  Hospital,
  MapPin,
  Calendar,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Split
} from 'lucide-react';

export function PracticesModule() {
  const { showToast } = useToast();
  const { canonicalRole, currentUser } = useAuth();
  const isStudent = canonicalRole === 'STUDENT';
  const studentId = currentUser?.studentId || (isStudent ? 'std-1' : undefined);

  const [practices, setPractices] = useState<Practice[]>(() => storageService.getPractices());
  const faculties = storageService.getFaculties();
  const directions = storageService.getDirections();
  const groups = storageService.getGroups();
  const [places, setPlaces] = useState<PracticePlace[]>(() => storageService.getPracticePlaces());
  const supervisors = storageService.getSupervisors();
  const allAssignments = storageService.getAssignments();

  useEffect(() => {
    organizationService.getOrganizations().then(fresh => {
      if (fresh && fresh.length > 0) setPlaces(fresh);
    });

    const handleSync = () => {
      setPractices(storageService.getPractices());
      setPlaces(storageService.getPracticePlaces());
      organizationService.getOrganizations().then(fresh => {
        if (fresh && fresh.length > 0) setPlaces(fresh);
      });
    };
    window.addEventListener('tma_state_changed', handleSync);
    return () => window.removeEventListener('tma_state_changed', handleSync);
  }, []);

  const studentDetails = useMemo(() => {
    if (!isStudent || !studentId) return null;
    return storageService.getStudentActivePracticeDetails(studentId);
  }, [isStudent, studentId, practices, allAssignments]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPlaceId, setFilterPlaceId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [practiceToView, setPracticeToView] = useState<Practice | null>(null);
  const [practiceToEdit, setPracticeToEdit] = useState<Practice | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [practiceToDelete, setPracticeToDelete] = useState<Practice | null>(null);
  const [editWarningModal, setEditWarningModal] = useState<Practice | null>(null);

  const refreshList = () => {
    setPractices(storageService.getPractices());
  };

  const getNormStatus = (status: PracticeStatus): string => {
    return (status || '').toUpperCase();
  };

  const handleStatusChange = (id: string, newStatus: PracticeStatus) => {
    storageService.setPracticeStatus(id, newStatus);
    refreshList();
    if (practiceToView && practiceToView.id === id) {
      setPracticeToView({ ...practiceToView, status: newStatus });
    }
    const statusLabels: Record<string, string> = {
      ACTIVE: 'Faollashtirildi',
      PAUSED: 'Vaqtincha to\'xtatildi',
      COMPLETED: 'Amaliyot muvaffaqiyatli yakunlandi',
      DRAFT: 'Loyiha holatiga o\'tkazildi',
      ARCHIVED: 'Arxivlandi'
    };
    showToast('info', 'Amaliyot holati o\'zgartirildi', statusLabels[newStatus] || newStatus);
  };

  // Duplicate practice
  const handleDuplicate = (id: string) => {
    const duplicated = storageService.duplicatePractice(id);
    if (duplicated) {
      refreshList();
      showToast('success', 'Amaliyot nusxalandi', `"${duplicated.name}" yangi loyiha sifatida yaratildi.`);
    }
  };

  // Safe edit check
  const handleInitiateEdit = (practice: Practice) => {
    const norm = getNormStatus(practice.status);
    if (norm === 'COMPLETED' || norm === 'ARCHIVED') {
      setEditWarningModal(practice);
    } else {
      setPracticeToEdit(practice);
      setIsFormModalOpen(true);
    }
  };

  // Save from standard form modal
  const handleSavePractice = (saved: Practice) => {
    storageService.savePractice(saved);
    refreshList();
    showToast('success', 'Amaliyot saqlandi', `"${saved.name}" muvaffaqiyatli saqlandi.`);
  };

  // Complete 5-step wizard
  const handleWizardComplete = (newPractice: Practice, newAssignments: PracticeAssignment[]) => {
    storageService.savePractice(newPractice);
    if (newAssignments.length > 0) {
      storageService.bulkAssignStudents(newAssignments);
    }
    refreshList();
    setIsWizardOpen(false);
    showToast('success', 'Amaliyot yaratildi va taqsimlandi', `"${newPractice.name}" yaratildi. ${newAssignments.length} nafar talaba bazalarga taqsimlandi.`);
  };

  const handleDeleteConfirm = () => {
    if (!practiceToDelete) return;
    storageService.deletePractice(practiceToDelete.id);
    refreshList();
    showToast('info', 'Amaliyot o\'chirildi', `"${practiceToDelete.name}" o'chirib tashlandi.`);
    setPracticeToDelete(null);
  };

  const filteredPractices = practices.filter(p => {
    const norm = getNormStatus(p.status);
    if (filterStatus !== 'all' && norm !== filterStatus.toUpperCase()) {
      return false;
    }
    if (filterPlaceId !== 'all') {
      const matchPlace = (p.practicePlaceIds || []).includes(filterPlaceId);
      if (!matchPlace) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCode = (p.code || '').toLowerCase().includes(q);
      const matchOrder = (p.orderNumber || '').toLowerCase().includes(q);
      const matchType = (p.type || '').toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchOrder && !matchType) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Student Dedicated "AMALIYOTIM" Section (Requirement 15) */}
      {isStudent && (
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-blue-900/50 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-800/60 pb-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                Talaba Shaxsiy Profili · Rasmiy Biriktiruv
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
                AMALIYOTIM
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-1 bg-blue-900/80 text-blue-200 border border-blue-700/60 rounded-lg">
                Taqsimot ID: {studentDetails?.distribution?.distributionCode || studentDetails?.assignment?.distributionCode || 'TAQ-2026-00125'}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500 text-white">
                FAOL AMALIYOT
              </span>
            </div>
          </div>

          {studentDetails?.hasActivePractice ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Amaliyot Nomi & Kurs */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-semibold text-blue-300 uppercase tracking-wider block">
                  Amaliyot va O'quv Rejasi
                </span>
                <div className="font-bold text-white text-sm">
                  {studentDetails.practice?.name || '4-kurs Davolash amaliyoti'}
                </div>
                <div className="text-[11px] text-slate-300">
                  {studentDetails.practice?.courseLevel || 4}-kurs · {directions.find(d => d.id === studentDetails.practice?.directionId)?.name || 'Davolash ishi'}
                </div>
                <div className="text-[11px] text-blue-400 font-semibold">
                  Guruh: {groups.find(g => g.id === studentDetails.assignment?.groupId)?.name || '401-guruh'}
                </div>
              </div>

              {/* Tashkilot & Tashkilot ID */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-semibold text-blue-300 uppercase tracking-wider block">
                  Tashkilot (Klinik Baza)
                </span>
                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Hospital className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>{studentDetails.organization?.name || 'Chirchiq shahar tibbiyot birlashmasi'}</span>
                </div>
                <div className="font-mono text-xs text-blue-300 font-bold">
                  Tashkilot ID: {studentDetails.organization?.organizationCode || 'TASH-000125'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {studentDetails.organization?.address || 'Chirchiq shahri'}
                </div>
              </div>

              {/* Amaliyot Rahbari & Bo'lim */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-semibold text-blue-300 uppercase tracking-wider block">
                  Rahbar va Biriktirilgan Bo'lim
                </span>
                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{studentDetails.supervisor?.fullName || 'Prof. Sobirov Alisher'}</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  {studentDetails.supervisor?.phone || '+998 90 811-22-33'}
                </div>
                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Klinik Bo'lim:</span>
                  <span className="inline-block px-2 py-0.5 rounded bg-blue-600/80 text-white font-semibold text-[11px]">
                    {studentDetails.assignment?.department || 'Rahbar tomonidan taqsimlanmoqda'}
                  </span>
                </div>
              </div>

              {/* Muddat, Kunlar, Ish Vaqti */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-semibold text-blue-300 uppercase tracking-wider block">
                  Muddat va Ish Vaqti
                </span>
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>
                    {studentDetails.assignment?.startDate || studentDetails.distribution?.startDate || '05.10.2026'} — {studentDetails.assignment?.endDate || studentDetails.distribution?.endDate || '30.10.2026'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    {studentDetails.assignment?.startTime || studentDetails.distribution?.startTime || '08:00'} — {studentDetails.assignment?.endTime || studentDetails.distribution?.endTime || '14:00'}
                  </span>
                </div>
                <div className="text-[11px] text-blue-300">
                  Kunlar: {(studentDetails.assignment?.practiceDays || studentDetails.distribution?.practiceDays || ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma']).join(', ')}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-white/5 rounded-xl text-center text-slate-300 text-xs">
              Siz hozircha amaliyotga biriktirilmagansiz. Amaliyot bo'limi tomonidan taqsimot amalga oshirilganda bu yerda barcha ma'lumotlar ko'rinadi.
            </div>
          )}
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {isStudent ? "Universitet amaliyotlari katalogi" : "Amaliyotlar boshqaruvi"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            O'quv-tanishuv, klinik ishlab chiqarish va malakaviy amaliyotlar monitoringi
          </p>
        </div>

        {!isStudent && (
          <button
            type="button"
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi amaliyot (Wizard)</span>
          </button>
        )}
      </div>

      {/* Filter, search and view controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Amaliyot nomi, turi, kodi yoki buyruq raqami..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50/50 focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {/* Amaliyot bazasi filtri */}
          <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterPlaceId}
              onChange={e => setFilterPlaceId(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option value="all">Barcha bazalar</option>
              {places.map(pl => (
                <option key={pl.id} value={pl.id}>{pl.name}</option>
              ))}
            </select>
          </div>

          {/* Segmented status controls: DRAFT, ACTIVE, PAUSED, COMPLETED, ARCHIVED */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            {[
              { id: 'all', label: 'Barchasi' },
              { id: 'draft', label: 'DRAFT' },
              { id: 'active', label: 'ACTIVE' },
              { id: 'paused', label: 'PAUSED' },
              { id: 'completed', label: 'COMPLETED' },
              { id: 'archived', label: 'ARCHIVED' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Table / Grid view switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Jadval ko'rinishi"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Karta ko'rinishi"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering: Empty State or Table/Grid View */}
      {filteredPractices.length === 0 ? (
        <EmptyState
          title="Amaliyot topilmadi"
          description="Tanlangan mezon yoki qidiruv so'rovi bo'yicha amaliyot mavjud emas."
          actionLabel="+ Yangi amaliyot yaratish"
          onAction={() => setIsWizardOpen(true)}
        />
      ) : viewMode === 'table' ? (
        /* TABLE VIEW WITH ALL REQUIRED COLUMNS */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3.5">Amaliyot nomi & turi</th>
                  <th className="py-3 px-3">Fakultet & Yo'nalish</th>
                  <th className="py-3 px-3 text-center">Kurs</th>
                  <th className="py-3 px-3">Muddatlari</th>
                  <th className="py-3 px-3 text-center">Talabalar</th>
                  <th className="py-3 px-3 text-center">Bazalar</th>
                  <th className="py-3 px-3 text-center">Rahbarlar</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPractices.map(practice => {
                  const norm = getNormStatus(practice.status);
                  const faculty = faculties.find(f => f.id === practice.facultyId);
                  const direction = directions.find(d => d.id === practice.directionId);
                  const studentCount = allAssignments.filter(a => a.practiceId === practice.id).length;
                  const placesCount = (practice.practicePlaceIds || []).length;
                  const supervisorsCount = (practice.supervisorIds || []).length;

                  const statusVariant: StatusVariant =
                    norm === 'ACTIVE' ? 'success' :
                    norm === 'DRAFT' ? 'info' :
                    norm === 'PAUSED' ? 'warning' :
                    norm === 'COMPLETED' ? 'purple' : 'neutral';

                  const statusLabel =
                    norm === 'ACTIVE' ? 'ACTIVE' :
                    norm === 'DRAFT' ? 'DRAFT' :
                    norm === 'PAUSED' ? 'PAUSED' :
                    norm === 'COMPLETED' ? 'COMPLETED' : 'ARCHIVED';

                  const isLocked = norm === 'COMPLETED' || norm === 'ARCHIVED';

                  return (
                    <tr key={practice.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Type */}
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-slate-900 leading-tight">
                          {practice.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                          <span className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                            {practice.code}
                          </span>
                          <span>·</span>
                          <span className="text-slate-600 font-medium">{practice.type}</span>
                        </div>
                      </td>

                      {/* Faculty & Direction */}
                      <td className="py-3 px-3 max-w-[200px]">
                        <div className="font-medium text-slate-800 truncate" title={faculty?.name}>
                          {faculty?.name || '—'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate" title={direction?.name}>
                          {direction?.name || '—'}
                        </div>
                      </td>

                      {/* Course */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700 font-mono text-[11px]">
                          {practice.courseLevel}-kurs
                        </span>
                      </td>

                      {/* Dates */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-mono text-slate-700 tabular-nums">
                          {practice.startDate}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 tabular-nums">
                          {practice.endDate} gacha
                        </div>
                      </td>

                      {/* Student Count */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-xs">
                          {studentCount}
                        </span>
                      </td>

                      {/* Places Count */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-bold text-slate-700">
                          {placesCount} ta
                        </span>
                      </td>

                      {/* Supervisors Count */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-bold text-slate-700">
                          {supervisorsCount} nafar
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge label={statusLabel} variant={statusVariant} />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* View */}
                          <button
                            type="button"
                            onClick={() => setPracticeToView(practice)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            title="Ko'rish"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit (guarded if completed/archived) */}
                          <button
                            type="button"
                            onClick={() => handleInitiateEdit(practice)}
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                              isLocked
                                ? 'text-slate-300 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                            title={isLocked ? "Tahrirlash yopilgan (Ogohlantirish)" : "Tahrirlash"}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Duplicate */}
                          <button
                            type="button"
                            onClick={() => handleDuplicate(practice.id)}
                            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors cursor-pointer"
                            title="Nusxalash"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Status Actions */}
                          {norm !== 'ACTIVE' && norm !== 'ARCHIVED' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(practice.id, 'ACTIVE')}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                              title="Faollashtirish (ACTIVE)"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}

                          {norm === 'ACTIVE' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(practice.id, 'PAUSED')}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                              title="Pauza qilish (PAUSED)"
                            >
                              <Pause className="w-4 h-4" />
                            </button>
                          )}

                          {norm !== 'COMPLETED' && norm !== 'ARCHIVED' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(practice.id, 'COMPLETED')}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                              title="Yakunlash (COMPLETED)"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {norm === 'COMPLETED' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(practice.id, 'ARCHIVED')}
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                              title="Arxivlash (ARCHIVED)"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setPracticeToDelete(practice)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW (RICH CARDS) */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredPractices.map(practice => {
            const norm = getNormStatus(practice.status);
            const faculty = faculties.find(f => f.id === practice.facultyId);
            const direction = directions.find(d => d.id === practice.directionId);
            const practiceGroups = groups.filter(g => practice.groupIds.includes(g.id));
            const practicePlaces = places.filter(pl => practice.practicePlaceIds.includes(pl.id));
            const studentCount = allAssignments.filter(a => a.practiceId === practice.id).length;

            const statusVariant: StatusVariant =
              norm === 'ACTIVE' ? 'success' :
              norm === 'DRAFT' ? 'info' :
              norm === 'PAUSED' ? 'warning' :
              norm === 'COMPLETED' ? 'purple' : 'neutral';

            const statusLabel =
              norm === 'ACTIVE' ? 'ACTIVE' :
              norm === 'DRAFT' ? 'DRAFT' :
              norm === 'PAUSED' ? 'PAUSED' :
              norm === 'COMPLETED' ? 'COMPLETED' : 'ARCHIVED';

            const isLocked = norm === 'COMPLETED' || norm === 'ARCHIVED';

            return (
              <div
                key={practice.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {practice.code}
                    </span>
                    <StatusBadge label={statusLabel} variant={statusVariant} />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {practice.name}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    {faculty?.name} · {direction?.name} ({practice.courseLevel}-kurs)
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span className="font-mono tabular-nums">{practice.startDate} dan {practice.endDate} gacha</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span>{practice.totalHours} soat ({practice.credits} kredit)</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="font-mono">{practice.orderNumber}</span>
                  </div>

                  {/* Summary indicators */}
                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <div className="text-[10px] text-slate-500">Talabalar</div>
                      <div className="font-bold text-blue-700 font-mono mt-0.5">{studentCount} ta</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <div className="text-[10px] text-slate-500">Bazalar</div>
                      <div className="font-bold text-slate-800 font-mono mt-0.5">{practicePlaces.length} ta</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <div className="text-[10px] text-slate-500">Rahbarlar</div>
                      <div className="font-bold text-slate-800 font-mono mt-0.5">{practice.supervisorIds?.length || 0} ta</div>
                    </div>
                  </div>
                </div>

                {/* Card footer actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPracticeToView(practice)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ko'rish</span>
                    </button>

                    {norm !== 'ACTIVE' && norm !== 'ARCHIVED' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(practice.id, 'ACTIVE')}
                        className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Faollashtirish</span>
                      </button>
                    )}

                    {norm === 'ACTIVE' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(practice.id, 'PAUSED')}
                        className="px-2.5 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pauza</span>
                      </button>
                    )}

                    {norm !== 'COMPLETED' && norm !== 'ARCHIVED' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(practice.id, 'COMPLETED')}
                        className="px-2.5 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Yakunlash</span>
                      </button>
                    )}

                    {norm === 'COMPLETED' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(practice.id, 'ARCHIVED')}
                        className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>Arxiv</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDuplicate(practice.id)}
                      className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors cursor-pointer"
                      title="Nusxalash"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInitiateEdit(practice)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                      title="Tahrirlash"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPracticeToDelete(practice)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5-Step Practice Wizard Modal */}
      <PracticeWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={handleWizardComplete}
      />

      {/* Practice Detail Modal */}
      <PracticeDetailModal
        isOpen={Boolean(practiceToView)}
        onClose={() => setPracticeToView(null)}
        practice={practiceToView}
        onEdit={(p) => {
          setPracticeToView(null);
          handleInitiateEdit(p);
        }}
        onStatusChange={handleStatusChange}
      />

      {/* Standard Edit Modal */}
      <PracticeFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setPracticeToEdit(null);
        }}
        onSave={handleSavePractice}
        practiceToEdit={practiceToEdit}
      />

      {/* Edit Warning for COMPLETED or ARCHIVED practices */}
      {editWarningModal && (
        <ConfirmDialog
          isOpen={Boolean(editWarningModal)}
          onClose={() => setEditWarningModal(null)}
          onConfirm={() => {
            const target = editWarningModal;
            setEditWarningModal(null);
            setPracticeToEdit(target);
            setIsFormModalOpen(true);
          }}
          title="Diqqat: Himoyalangan amaliyot"
          message={`"${editWarningModal.name}" amaliyoti ${getNormStatus(editWarningModal.status)} holatida. Ushbu amaliyot yakunlangan yoki arxivlanganligi sababli uni o'zgartirish talabalar baholari va davomatiga ta'sir qilishi mumkin. Davom ettirishni xohlaysizmi?`}
          confirmLabel="Baribir tahrirlash"
          cancelLabel="Bekor qilish"
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(practiceToDelete)}
        onClose={() => setPracticeToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Amaliyotni o'chirish"
        message={`Haqiqatan ham "${practiceToDelete?.name}" amaliyotini o'chirmoqchimisiz? Ushbu amaliyotga tegishli barcha taqsimotlar ham bekor qilinadi.`}
        confirmLabel="O'chirish"
        cancelLabel="Bekor qilish"
        isDestructive
      />
    </div>
  );
}
