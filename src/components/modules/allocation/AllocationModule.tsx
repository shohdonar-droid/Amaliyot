import React, { useState, useMemo } from 'react';
import {
  Split,
  Building2,
  Users,
  CheckCircle2,
  UserCheck,
  Zap,
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
  FileCheck
} from 'lucide-react';
import { Practice, PracticeAssignment, Student, PracticePlace, Supervisor, ClinicResponsible } from '../../../types';
import { storageService } from '../../../services/storageService';
import { useToast } from '../../../context/ToastContext';
import { StatusBadge } from '../../common/Badge';
import { Modal } from '../../common/Modal';

export function AllocationModule() {
  const { showToast } = useToast();

  const practices = storageService.getPractices();
  const places = storageService.getPracticePlaces();
  const supervisors = storageService.getSupervisors();
  const clinicResponsibles = storageService.getClinicResponsibles();
  const students = storageService.getStudents();
  const groups = storageService.getGroups();
  const [assignments, setAssignments] = useState<PracticeAssignment[]>(() => storageService.getAssignments());

  const [selectedPracticeId, setSelectedPracticeId] = useState<string>(practices[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroupId, setFilterGroupId] = useState('all');
  const [filterPlaceId, setFilterPlaceId] = useState('all');
  const [activeTab, setActiveTab] = useState<'assigned' | 'unassigned'>('assigned');

  // Auto distribute modal
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
  const [autoPlaceIds, setAutoPlaceIds] = useState<string[]>(places.slice(0, 2).map(p => p.id));
  const [autoSupervisorIds, setAutoSupervisorIds] = useState<string[]>(supervisors.slice(0, 2).map(s => s.id));
  const [autoDepartment, setAutoDepartment] = useState('Terapiya');

  // Manual assign or edit assignment modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState<PracticeAssignment | null>(null);
  const [manualStudentId, setManualStudentId] = useState('');
  const [manualPlaceId, setManualPlaceId] = useState(places[0]?.id || '');
  const [manualSupervisorId, setManualSupervisorId] = useState(supervisors[0]?.id || '');
  const [manualClinicRespId, setManualClinicRespId] = useState(clinicResponsibles[0]?.id || '');
  const [manualDepartment, setManualDepartment] = useState('Terapiya');

  const selectedPractice = practices.find(p => p.id === selectedPracticeId);

  const refreshList = () => {
    setAssignments(storageService.getAssignments());
  };

  // Assignments for selected practice
  const currentPracticeAssignments = useMemo(() => {
    return assignments.filter(a => a.practiceId === selectedPracticeId);
  }, [assignments, selectedPracticeId]);

  // Eligible students for this practice
  const eligibleStudents = useMemo(() => {
    if (!selectedPractice) return [];
    if (selectedPractice.groupIds && selectedPractice.groupIds.length > 0) {
      return students.filter(s => selectedPractice.groupIds.includes(s.groupId));
    }
    return students;
  }, [students, selectedPractice]);

  const unassignedStudents = useMemo(() => {
    return eligibleStudents.filter(
      s => !currentPracticeAssignments.some(a => a.studentId === s.id)
    );
  }, [eligibleStudents, currentPracticeAssignments]);

  // Filtered assigned records
  const filteredAssignments = useMemo(() => {
    return currentPracticeAssignments.filter(asg => {
      const student = students.find(s => s.id === asg.studentId);
      if (filterGroupId !== 'all' && student?.groupId !== filterGroupId) return false;
      if (filterPlaceId !== 'all' && asg.practicePlaceId !== filterPlaceId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (student?.fullName || '').toLowerCase().includes(q);
        const matchId = (student?.studentId || '').toLowerCase().includes(q);
        const matchDept = (asg.department || '').toLowerCase().includes(q);
        if (!matchName && !matchId && !matchDept) return false;
      }
      return true;
    });
  }, [currentPracticeAssignments, students, filterGroupId, filterPlaceId, searchQuery]);

  // Filtered unassigned records
  const filteredUnassigned = useMemo(() => {
    return unassignedStudents.filter(s => {
      if (filterGroupId !== 'all' && s.groupId !== filterGroupId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = s.fullName.toLowerCase().includes(q);
        const matchId = s.studentId.toLowerCase().includes(q);
        if (!matchName && !matchId) return false;
      }
      return true;
    });
  }, [unassignedStudents, filterGroupId, searchQuery]);

  // Auto distribute action
  const handleAutoDistribute = () => {
    if (!selectedPracticeId) return;
    if (autoPlaceIds.length === 0) {
      showToast('warning', 'Bazalar tanlanmagan', 'Kamida bitta shifoxonani tanlang.');
      return;
    }

    const res = storageService.autoDistributeStudents(
      selectedPracticeId,
      autoPlaceIds,
      autoSupervisorIds,
      autoDepartment
    );

    refreshList();
    setIsAutoModalOpen(false);
    showToast('success', 'Avtomatik taqsimlash yakunlandi', `${res.assignedCount} nafar talaba muvaffaqiyatli taqsimlandi.`);
  };

  // Open manual assign modal
  const handleOpenManualAssign = (preselectedStudentId?: string) => {
    setAssignmentToEdit(null);
    setManualStudentId(preselectedStudentId || unassignedStudents[0]?.id || '');
    setManualPlaceId(places[0]?.id || '');
    setManualSupervisorId(supervisors[0]?.id || '');
    const firstMatchingClinic = clinicResponsibles.find(c => c.practicePlaceId === places[0]?.id);
    setManualClinicRespId(firstMatchingClinic?.id || clinicResponsibles[0]?.id || '');
    setManualDepartment('Terapiya');
    setIsManualModalOpen(true);
  };

  // Open edit assignment modal
  const handleOpenEditAssignment = (asg: PracticeAssignment) => {
    setAssignmentToEdit(asg);
    setManualStudentId(asg.studentId);
    setManualPlaceId(asg.practicePlaceId);
    setManualSupervisorId(asg.supervisorId);
    setManualClinicRespId(asg.clinicResponsibleId || '');
    setManualDepartment(asg.department || 'Terapiya');
    setIsManualModalOpen(true);
  };

  // Save manual assignment or update
  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualStudentId || !selectedPractice) return;

    const payload: PracticeAssignment = {
      id: assignmentToEdit?.id || `asg-${Date.now()}`,
      practiceId: selectedPractice.id,
      studentId: manualStudentId,
      practicePlaceId: manualPlaceId,
      department: manualDepartment,
      supervisorId: manualSupervisorId,
      clinicResponsibleId: manualClinicRespId,
      startDate: selectedPractice.startDate,
      endDate: selectedPractice.endDate,
      status: 'in_progress',
      createdAt: assignmentToEdit?.createdAt || new Date().toISOString()
    };

    storageService.assignStudent(payload);
    refreshList();
    setIsManualModalOpen(false);
    setAssignmentToEdit(null);
    showToast('success', 'Taqsimot saqlandi', 'Talabaning amaliyot joyi va rahbarlari muvaffaqiyatli biriktirildi.');
  };

  // Remove assignment
  const handleRemoveAssignment = (id: string) => {
    storageService.removeAssignment(id);
    refreshList();
    showToast('info', 'Taqsimot bekor qilindi', 'Talaba qaytadan taqsimlanmaganlar ro\'yxatiga o\'tdi.');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Talabalarni amaliyot joylariga taqsimlash
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Klinik bazalar, bo'limlar, universitet rahbarlari va klinik mas'ullarni biriktirish
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Qaydnomani chop etish"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Chop etish</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenManualAssign()}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Qo'lda taqsimlash</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAutoModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Avtomatik taqsimlash</span>
          </button>
        </div>
      </div>

      {/* Practice Selector Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Amaliyot buyrug'ini tanlang
          </label>
          <select
            value={selectedPracticeId}
            onChange={e => setSelectedPracticeId(e.target.value)}
            className="w-full sm:max-w-xl px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 font-semibold text-slate-800 bg-white"
          >
            {practices.map(p => (
              <option key={p.id} value={p.id}>
                {p.code} — {p.name} ({p.startDate} - {p.endDate})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="text-center px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
            <p className="text-[10px] text-emerald-700 uppercase font-semibold">Taqsimlangan</p>
            <p className="text-base font-bold font-mono text-emerald-800 tabular-nums">
              {currentPracticeAssignments.length} ta
            </p>
          </div>
          <div className="text-center px-4 py-2 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-[10px] text-amber-700 uppercase font-semibold">Taqsimlanmagan</p>
            <p className="text-base font-bold font-mono text-amber-800 tabular-nums">
              {unassignedStudents.length} ta
            </p>
          </div>
        </div>
      </div>

      {/* Hospital Distribution Quotas Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {places.map(place => {
          const inThisPracticeCount = currentPracticeAssignments.filter(a => a.practicePlaceId === place.id).length;
          const occupancy = Math.round((place.activeStudentsCount / place.capacity) * 100);
          return (
            <div key={place.id} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-xs text-slate-900 line-clamp-1">{place.name}</span>
                <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">{place.type} · {place.city}</p>
              
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-600">Amaliyotda:</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {inThisPracticeCount} talaba
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${occupancy > 85 ? 'bg-red-500' : 'bg-blue-600'}`}
                  style={{ width: `${Math.min(occupancy, 100)}%` }}
                />
              </div>
              <div className="mt-2 text-[10px] text-slate-400 flex justify-between">
                <span>Sig'im: {place.capacity}</span>
                <span>Bandlik: {occupancy}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('assigned')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'assigned'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Taqsimlanganlar ({currentPracticeAssignments.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('unassigned')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'unassigned'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Taqsimlanmaganlar ({unassignedStudents.length})
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Group filter */}
          <select
            value={filterGroupId}
            onChange={e => setFilterGroupId(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="all">Barcha guruhlar</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          {/* Place filter */}
          {activeTab === 'assigned' && (
            <select
              value={filterPlaceId}
              onChange={e => setFilterPlaceId(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">Barcha shifoxonalar</option>
              {places.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Qidiruv..."
              className="pl-8 pr-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-600 w-44"
            />
          </div>
        </div>
      </div>

      {/* Main Table View */}
      {activeTab === 'assigned' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 flex items-center justify-between text-xs">
            <h3 className="font-bold text-slate-900">
              Biriktirilgan talabalar ro'yxati ({filteredAssignments.length})
            </h3>
            <span className="text-slate-500 font-mono">
              Amaliyot: {selectedPractice?.startDate} dan {selectedPractice?.endDate} gacha
            </span>
          </div>

          {filteredAssignments.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              Ushbu filtr bo'yicha taqsimlangan talabalar mavjud emas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Talaba (F.I.Sh.)</th>
                    <th className="py-3 px-3">Guruh & ID</th>
                    <th className="py-3 px-3">Amaliyot bazasi (Shifoxona)</th>
                    <th className="py-3 px-3">Bo'lim</th>
                    <th className="py-3 px-3">Universitet rahbari</th>
                    <th className="py-3 px-3">Klinik mas'ul</th>
                    <th className="py-3 px-3">Holat</th>
                    <th className="py-3 px-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAssignments.map(asg => {
                    const student = students.find(s => s.id === asg.studentId);
                    const place = places.find(p => p.id === asg.practicePlaceId);
                    const supervisor = supervisors.find(s => s.id === asg.supervisorId);
                    const clinicResp = clinicResponsibles.find(c => c.id === asg.clinicResponsibleId);
                    const grp = groups.find(g => g.id === student?.groupId);

                    return (
                      <tr key={asg.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {student?.fullName || 'Noma\'lum talaba'}
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                          <div>{grp?.name}</div>
                          <div>{student?.studentId}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-800 font-medium">
                          {place?.name || '—'}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {asg.department || 'Terapiya'}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {supervisor?.fullName || '—'}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {clinicResp?.fullName || '—'}
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge label="Biriktirilgan" variant="active" />
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditAssignment(asg)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                              title="Taqsimotni tahrirlash"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveAssignment(asg.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                              title="Taqsimotni bekor qilish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* UNASSIGNED STUDENTS VIEW */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 flex items-center justify-between text-xs">
            <h3 className="font-bold text-amber-800 flex items-center gap-1.5">
              <span>Hali biriktirilmagan talabalar ({filteredUnassigned.length})</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsAutoModalOpen(true)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Hammasini avtomatik taqsimlash →
            </button>
          </div>

          {filteredUnassigned.length === 0 ? (
            <div className="p-12 text-center text-xs text-emerald-600 font-medium">
              Barcha talabalar amaliyot bazalariga to'liq taqsimlangan!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Talaba (F.I.Sh.)</th>
                    <th className="py-3 px-3">Guruh</th>
                    <th className="py-3 px-3">Talaba ID</th>
                    <th className="py-3 px-3">Telefon</th>
                    <th className="py-3 px-3">Holat</th>
                    <th className="py-3 px-4 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUnassigned.map(student => {
                    const grp = groups.find(g => g.id === student.groupId);
                    return (
                      <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {student.fullName}
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-medium">
                          {grp?.name}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {student.studentId}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {student.phone}
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge label="Kutilmoqda" variant="warning" />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenManualAssign(student.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors cursor-pointer"
                          >
                            Biriktirish
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Auto Distribute Modal */}
      <Modal
        isOpen={isAutoModalOpen}
        onClose={() => setIsAutoModalOpen(false)}
        title="Avtomatik taqsimlash ustasi"
        subtitle={`Kutilayotgan talabalar: ${unassignedStudents.length} nafar`}
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Tizim amaliyot guruhlaridagi hali biriktirilmagan barcha talabalarni tanlangan klinik bazalarga teng va adolatli taqsimlaydi.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Taqsimlanadigan shifoxonalar
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto border p-2.5 rounded-lg bg-slate-50">
              {places.map(place => (
                <label key={place.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoPlaceIds.includes(place.id)}
                    onChange={() => {
                      if (autoPlaceIds.includes(place.id)) {
                        setAutoPlaceIds(autoPlaceIds.filter(id => id !== place.id));
                      } else {
                        setAutoPlaceIds([...autoPlaceIds, place.id]);
                      }
                    }}
                    className="w-3.5 h-3.5 text-blue-600 rounded"
                  />
                  <span>{place.name} ({place.capacity} o'rin)</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Boshlang'ich klinik bo'lim
            </label>
            <select
              value={autoDepartment}
              onChange={e => setAutoDepartment(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-lg bg-white"
            >
              <option value="Terapiya">Terapiya bo'limi</option>
              <option value="Umumiy xirurgiya">Umumiy xirurgiya bo'limi</option>
              <option value="Kardiologiya">Kardiologiya bo'limi</option>
              <option value="Shoshilinch yordam">Shoshilinch yordam bo'limi</option>
              <option value="Pediatriya">Pediatriya bo'limi</option>
              <option value="Reanimatsiya">Reanimatsiya bo'limi</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsAutoModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={handleAutoDistribute}
              className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
            >
              Taqsimlashni boshlash
            </button>
          </div>
        </div>
      </Modal>

      {/* Manual Assign & Edit Assignment Modal */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => {
          setIsManualModalOpen(false);
          setAssignmentToEdit(null);
        }}
        title={assignmentToEdit ? "Taqsimotni o'zgartirish" : "Talabani qo'lda biriktirish"}
        subtitle={selectedPractice ? `${selectedPractice.name} (${selectedPractice.orderNumber})` : ''}
        maxWidth="md"
      >
        <form onSubmit={handleSaveManual} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Talaba *</label>
            <select
              value={manualStudentId}
              disabled={Boolean(assignmentToEdit)}
              onChange={e => setManualStudentId(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-lg bg-white disabled:bg-slate-100"
              required
            >
              {assignmentToEdit ? (
                <option value={assignmentToEdit.studentId}>
                  {students.find(s => s.id === assignmentToEdit.studentId)?.fullName}
                </option>
              ) : (
                unassignedStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.studentId})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Amaliyot bazasi (Shifoxona) *</label>
            <select
              value={manualPlaceId}
              onChange={e => {
                setManualPlaceId(e.target.value);
                const matchingClinic = clinicResponsibles.find(c => c.practicePlaceId === e.target.value);
                if (matchingClinic) setManualClinicRespId(matchingClinic.id);
              }}
              className="w-full px-3 py-2 text-xs border rounded-lg bg-white"
            >
              {places.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bo'lim *</label>
            <input
              type="text"
              value={manualDepartment}
              onChange={e => setManualDepartment(e.target.value)}
              placeholder="Masalan: Terapiya, Jarrohlik"
              className="w-full px-3 py-2 text-xs border rounded-lg bg-white font-medium"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Universitet amaliyot rahbari *</label>
            <select
              value={manualSupervisorId}
              onChange={e => setManualSupervisorId(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-lg bg-white"
            >
              {supervisors.map(s => (
                <option key={s.id} value={s.id}>{s.fullName} ({s.department})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Klinik mas'ul shaxs (Shifoxonadan)</label>
            <select
              value={manualClinicRespId}
              onChange={e => setManualClinicRespId(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-lg bg-white"
            >
              {clinicResponsibles.map(c => (
                <option key={c.id} value={c.id}>{c.fullName} ({c.position})</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => {
                setIsManualModalOpen(false);
                setAssignmentToEdit(null);
              }}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
            >
              {assignmentToEdit ? "Saqlash" : "Biriktirish"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
