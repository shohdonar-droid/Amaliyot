import React, { useState, useMemo, useEffect } from 'react';
import {
  CalendarRange,
  Search,
  Building2,
  Users,
  UserCheck,
  Calendar,
  Clock,
  Eye,
  Edit2,
  Plus,
  Play,
  Pause,
  CheckCircle,
  Archive,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  ExternalLink,
  Split,
  Hospital,
  GraduationCap,
  FileText,
  BadgeAlert
} from 'lucide-react';
import { Practice, PracticeStatus, PracticePlace, Group, Supervisor, Faculty, Direction } from '../../../types';
import { storageService } from '../../../services/storageService';
import { organizationService } from '../../../services/organizationService';
import { StatusBadge, StatusVariant } from '../../common/Badge';
import { useToast } from '../../../context/ToastContext';
import { PracticeDetailModal } from './PracticeDetailModal';
import { PracticeFormModal } from './PracticeFormModal';
import { ActiveModule } from '../../layout/Sidebar';

interface PracticesListOverviewProps {
  onNavigate?: (module: ActiveModule) => void;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export function PracticesListOverview({
  onNavigate,
  title = "Tizimda shu vaqtgacha yaratilgan amaliyotlar ro'yxati",
  subtitle = "Barcha o'quv-tanishuv, klinik ishlab chiqarish va malakaviy amaliyotlar monitoringi",
  compact = false
}: PracticesListOverviewProps) {
  const { showToast } = useToast();

  const [practices, setPractices] = useState<Practice[]>(() => storageService.getPractices() || []);
  const [places, setPlaces] = useState<PracticePlace[]>(() => storageService.getPracticePlaces() || []);
  const [groups, setGroups] = useState<Group[]>(() => storageService.getGroups() || []);
  const [supervisors, setSupervisors] = useState<Supervisor[]>(() => storageService.getSupervisors() || []);
  const [faculties, setFaculties] = useState<Faculty[]>(() => storageService.getFaculties() || []);
  const [directions, setDirections] = useState<Direction[]>(() => storageService.getDirections() || []);
  const [assignments, setAssignments] = useState(() => storageService.getAssignments() || []);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals state
  const [selectedPracticeForView, setSelectedPracticeForView] = useState<Practice | null>(null);
  const [selectedPracticeForEdit, setSelectedPracticeForEdit] = useState<Practice | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const refreshData = () => {
    setPractices(storageService.getPractices() || []);
    setPlaces(storageService.getPracticePlaces() || []);
    setGroups(storageService.getGroups() || []);
    setSupervisors(storageService.getSupervisors() || []);
    setFaculties(storageService.getFaculties() || []);
    setDirections(storageService.getDirections() || []);
    setAssignments(storageService.getAssignments() || []);
  };

  useEffect(() => {
    organizationService.getOrganizations().then(fresh => {
      if (fresh && fresh.length > 0) setPlaces(fresh);
    });

    const handleSync = () => {
      refreshData();
      organizationService.getOrganizations().then(fresh => {
        if (fresh && fresh.length > 0) setPlaces(fresh);
      });
    };

    window.addEventListener('tma_state_changed', handleSync);
    return () => window.removeEventListener('tma_state_changed', handleSync);
  }, []);

  const getNormStatus = (status: PracticeStatus): string => {
    return (status || '').toUpperCase();
  };

  const handleStatusChange = (id: string, newStatus: PracticeStatus) => {
    storageService.setPracticeStatus(id, newStatus);
    refreshData();
    if (selectedPracticeForView && selectedPracticeForView.id === id) {
      setSelectedPracticeForView({ ...selectedPracticeForView, status: newStatus });
    }
    const statusLabels: Record<string, string> = {
      ACTIVE: 'Faollashtirildi',
      PAUSED: 'Vaqtincha to\'xtatildi',
      COMPLETED: 'Muvaffaqiyatli yakunlandi',
      DRAFT: 'Loyiha holatiga o\'tkazildi',
      ARCHIVED: 'Arxivlandi'
    };
    showToast('info', 'Amaliyot holati o\'zgartirildi', statusLabels[newStatus] || newStatus);
  };

  const handleSavePractice = (saved: Practice) => {
    storageService.savePractice(saved);
    refreshData();
    setIsFormModalOpen(false);
    setSelectedPracticeForEdit(null);
    showToast('success', 'Amaliyot saqlandi', `"${saved.name}" muvaffaqiyatli saqlandi.`);
  };

  // Counts for tabs
  const counts = useMemo(() => {
    const total = practices.length;
    const active = practices.filter(p => getNormStatus(p.status) === 'ACTIVE').length;
    const draft = practices.filter(p => getNormStatus(p.status) === 'DRAFT').length;
    const paused = practices.filter(p => getNormStatus(p.status) === 'PAUSED').length;
    const completed = practices.filter(p => getNormStatus(p.status) === 'COMPLETED').length;
    return { total, active, draft, paused, completed };
  }, [practices]);

  // Filtered practices
  const filteredPractices = useMemo(() => {
    return practices.filter(p => {
      const norm = getNormStatus(p.status);
      if (statusFilter !== 'all' && norm !== statusFilter.toUpperCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchCode = (p.code || '').toLowerCase().includes(q);
        const matchOrder = (p.orderNumber || '').toLowerCase().includes(q);
        const matchType = (p.type || '').toLowerCase().includes(q);
        
        // Match groups
        const pGroups = groups.filter(g => (p.groupIds || []).includes(g.id));
        const matchGroup = pGroups.some(g => g.name.toLowerCase().includes(q));

        // Match organization
        const pPlaces = places.filter(pl => (p.practicePlaceIds || []).includes(pl.id));
        const matchPlace = pPlaces.some(pl => 
          pl.name.toLowerCase().includes(q) || 
          (pl.organizationCode || '').toLowerCase().includes(q) || 
          (pl.organizationId || '').toLowerCase().includes(q)
        );

        // Match supervisor
        const pSups = supervisors.filter(s => (p.supervisorIds || []).includes(s.id));
        const matchSup = pSups.some(s => s.fullName.toLowerCase().includes(q));

        if (!matchName && !matchCode && !matchOrder && !matchType && !matchGroup && !matchPlace && !matchSup) {
          return false;
        }
      }
      return true;
    });
  }, [practices, statusFilter, searchQuery, groups, places, supervisors]);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-5">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0 shadow-2xs">
            <CalendarRange className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {title}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 font-mono">
                {practices.length} ta
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setSelectedPracticeForEdit(null);
              setIsFormModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi amaliyot</span>
          </button>

          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('practices')}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Amaliyotlar to'liq bo'limiga o'tish"
            >
              <span>Barchasi</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Nomi, kodi, buyruq, guruh, baza yoki rahbar..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          {/* Status filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl shrink-0">
            {[
              { id: 'all', label: `Barchasi (${counts.total})` },
              { id: 'active', label: `Faol (${counts.active})` },
              { id: 'draft', label: `Reja (${counts.draft})` },
              { id: 'paused', label: `To'xtatilgan (${counts.paused})` },
              { id: 'completed', label: `Yakunlangan (${counts.completed})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Jadval ko'rinishi"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Karta ko'rinishi"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredPractices.length === 0 ? (
        <div className="py-12 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
          <CalendarRange className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">Amaliyotlar topilmadi</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Tanlangan mezon yoki qidiruv so'rovi bo'yicha tizimda amaliyot mavjud emas.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            Filtrlarni tozalash
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3 text-center w-10">№</th>
                  <th className="py-3 px-3.5">Amaliyot nomi & kodi</th>
                  <th className="py-3 px-3">Guruh(lar)</th>
                  <th className="py-3 px-3">Amaliyot bazasi (Tashkilot)</th>
                  <th className="py-3 px-3">Rahbar</th>
                  <th className="py-3 px-3">Muddat & Reja</th>
                  <th className="py-3 px-3 text-center">Talabalar</th>
                  <th className="py-3 px-3">Holati</th>
                  <th className="py-3 px-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPractices.map((practice, idx) => {
                  const norm = getNormStatus(practice.status);
                  const pGroups = groups.filter(g => (practice.groupIds || []).includes(g.id));
                  const pPlaces = places.filter(pl => (practice.practicePlaceIds || []).includes(pl.id));
                  const pSupervisors = supervisors.filter(s => (practice.supervisorIds || []).includes(s.id));
                  const studentCount = assignments.filter(a => a.practiceId === practice.id).length;
                  const faculty = faculties.find(f => f.id === practice.facultyId);
                  const direction = directions.find(d => d.id === practice.directionId);

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

                  return (
                    <tr key={practice.id} className="hover:bg-blue-50/40 transition-colors">
                      {/* # */}
                      <td className="py-3 px-3 text-center font-mono text-slate-400 font-bold">
                        {idx + 1}
                      </td>

                      {/* Name & Code */}
                      <td className="py-3 px-3.5 max-w-xs">
                        <div className="font-bold text-slate-900 text-xs hover:text-blue-600 transition-colors cursor-pointer" onClick={() => setSelectedPracticeForView(practice)}>
                          {practice.name}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px]">
                          <span className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 font-bold text-[10px]">
                            {practice.code}
                          </span>
                          {practice.orderNumber && (
                            <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-mono">
                              {practice.orderNumber}
                            </span>
                          )}
                          <span className="text-slate-500 font-medium text-[10px]">
                            · {practice.type}
                          </span>
                        </div>
                      </td>

                      {/* Groups */}
                      <td className="py-3 px-3 max-w-[150px]">
                        <div className="flex flex-wrap gap-1">
                          {pGroups.length > 0 ? (
                            pGroups.map(g => (
                              <span key={g.id} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-bold font-mono text-[10px]">
                                {g.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Biriktirilmagan</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 font-medium">
                          {practice.courseLevel}-kurs · {practice.academicYear || '2026-2027'}
                        </div>
                      </td>

                      {/* Practice Place Organization */}
                      <td className="py-3 px-3 max-w-[180px]">
                        {pPlaces.length > 0 ? (
                          pPlaces.map(pl => (
                            <div key={pl.id} className="space-y-0.5">
                              <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1 truncate" title={pl.name}>
                                <Hospital className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span className="truncate">{pl.name}</span>
                              </div>
                              <div className="font-mono text-[10px] text-blue-600 font-semibold pl-4">
                                {pl.code || pl.organizationCode || 'Tash-1'}
                              </div>
                            </div>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Baza tanlanmagan</span>
                        )}
                      </td>

                      {/* Supervisor */}
                      <td className="py-3 px-3 max-w-[160px]">
                        {pSupervisors.length > 0 ? (
                          pSupervisors.map(s => (
                            <div key={s.id} className="space-y-0.5">
                              <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1 truncate" title={s.fullName}>
                                <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate">{s.fullName}</span>
                              </div>
                              {s.phone && (
                                <div className="text-[10px] text-slate-500 pl-4 font-mono">
                                  {s.phone}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Rahbar biriktirilmagan</span>
                        )}
                      </td>

                      {/* Muddat & Reja */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-mono text-slate-800 text-[11px] font-bold">
                          {practice.startDate}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {practice.endDate} gacha
                        </div>
                      </td>

                      {/* Student Count */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-xs border border-blue-200/60 inline-flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {studentCount}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge label={statusLabel} variant={statusVariant} />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedPracticeForView(practice)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Batafsil ko'rish"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {onNavigate && (
                            <button
                              type="button"
                              onClick={() => onNavigate('allocation')}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Taqsimotga o'tish"
                            >
                              <Split className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPracticeForEdit(practice);
                              setIsFormModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Tahrirlash"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {norm !== 'ACTIVE' && norm !== 'ARCHIVED' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(practice.id, 'ACTIVE')}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Faollashtirish (ACTIVE)"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}

                          {norm === 'ACTIVE' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(practice.id, 'PAUSED')}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="To'xtatib turish (PAUSED)"
                            >
                              <Pause className="w-4 h-4" />
                            </button>
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
      ) : (
        /* GRID / CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPractices.map(practice => {
            const norm = getNormStatus(practice.status);
            const pGroups = groups.filter(g => (practice.groupIds || []).includes(g.id));
            const pPlaces = places.filter(pl => (practice.practicePlaceIds || []).includes(pl.id));
            const pSupervisors = supervisors.filter(s => (practice.supervisorIds || []).includes(s.id));
            const studentCount = assignments.filter(a => a.practiceId === practice.id).length;

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

            return (
              <div
                key={practice.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                      {practice.code}
                    </span>
                    <StatusBadge label={statusLabel} variant={statusVariant} />
                  </div>

                  <h3
                    className="font-bold text-slate-900 text-sm mt-2 hover:text-blue-600 transition-colors cursor-pointer line-clamp-2"
                    onClick={() => setSelectedPracticeForView(practice)}
                  >
                    {practice.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {practice.type} · {practice.courseLevel}-kurs
                  </p>
                </div>

                <div className="space-y-2 text-xs border-t border-slate-100 pt-2.5">
                  {/* Guruhlar */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Guruhlar:</span>
                    <div className="flex flex-wrap gap-1 justify-end max-w-[70%]">
                      {pGroups.map(g => (
                        <span key={g.id} className="font-bold font-mono px-1.5 py-0.2 bg-slate-100 rounded text-slate-700">
                          {g.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Amaliyot bazasi */}
                  <div className="flex items-start justify-between text-[11px] gap-2">
                    <span className="text-slate-500 shrink-0">Baza:</span>
                    <span className="font-semibold text-slate-800 text-right truncate">
                      {pPlaces[0]?.name || 'Tanlanmagan'}
                    </span>
                  </div>

                  {/* Rahbar */}
                  <div className="flex items-start justify-between text-[11px] gap-2">
                    <span className="text-slate-500 shrink-0">Rahbar:</span>
                    <span className="font-semibold text-slate-800 text-right truncate">
                      {pSupervisors[0]?.fullName || 'Biriktirilmagan'}
                    </span>
                  </div>

                  {/* Muddat */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Muddat:</span>
                    <span className="font-mono text-slate-700 font-medium">
                      {practice.startDate} — {practice.endDate}
                    </span>
                  </div>

                  {/* Talabalar soni */}
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100/60">
                    <span className="text-slate-500">Biriktirilgan talabalar:</span>
                    <span className="font-bold font-mono text-blue-700">
                      {studentCount} nafar
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedPracticeForView(practice)}
                    className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold text-xs rounded-xl transition-colors text-center cursor-pointer"
                  >
                    Batafsil
                  </button>

                  {onNavigate && (
                    <button
                      type="button"
                      onClick={() => onNavigate('allocation')}
                      className="py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                      title="Taqsimotga o'tish"
                    >
                      Taqsimot
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPracticeForEdit(practice);
                      setIsFormModalOpen(true);
                    }}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                    title="Tahrirlash"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {selectedPracticeForView && (
        <PracticeDetailModal
          isOpen={!!selectedPracticeForView}
          onClose={() => setSelectedPracticeForView(null)}
          practice={selectedPracticeForView}
          onEdit={practice => {
            setSelectedPracticeForView(null);
            setSelectedPracticeForEdit(practice);
            setIsFormModalOpen(true);
          }}
          onStatusChange={handleStatusChange}
          onOpenAllocation={onNavigate ? () => {
            setSelectedPracticeForView(null);
            onNavigate('allocation');
          } : undefined}
        />
      )}

      {isFormModalOpen && (
        <PracticeFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setSelectedPracticeForEdit(null);
          }}
          onSave={handleSavePractice}
          practiceToEdit={selectedPracticeForEdit}
        />
      )}
    </div>
  );
}
