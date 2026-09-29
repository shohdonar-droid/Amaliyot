import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Building,
  GraduationCap,
  Users,
  Search
} from 'lucide-react';
import { Supervisor, ClinicResponsible } from '../../../types';
import { storageService } from '../../../services/storageService';
import { useToast } from '../../../context/ToastContext';
import { Modal } from '../../common/Modal';
import { ConfirmDialog } from '../../common/ConfirmDialog';

export function SupervisorsModule() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'university' | 'clinic'>('university');

  const [supervisors, setSupervisors] = useState<Supervisor[]>(() => storageService.getSupervisors());
  const [clinicResponsibles, setClinicResponsibles] = useState<ClinicResponsible[]>(() => storageService.getClinicResponsibles());
  const places = storageService.getPracticePlaces();

  const [searchQuery, setSearchQuery] = useState('');
  const [supervisorToEdit, setSupervisorToEdit] = useState<Supervisor | null>(null);
  const [isSupervisorModalOpen, setIsSupervisorModalOpen] = useState(false);
  const [supervisorToDelete, setSupervisorToDelete] = useState<Supervisor | null>(null);

  const refreshList = () => {
    setSupervisors(storageService.getSupervisors());
    setClinicResponsibles(storageService.getClinicResponsibles());
  };

  const handleSaveSupervisor = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const sup: Supervisor = {
      id: supervisorToEdit?.id || `sup-${Date.now()}`,
      fullName: formData.get('fullName') as string,
      department: formData.get('department') as string,
      academicDegree: formData.get('academicDegree') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      type: formData.get('type') as any,
      practicePlaceId: (formData.get('practicePlaceId') as string) || undefined,
      assignedStudentsCount: supervisorToEdit?.assignedStudentsCount || 0
    };

    storageService.saveSupervisor(sup);
    refreshList();
    setIsSupervisorModalOpen(false);
    showToast('success', 'Rahbar saqlandi', sup.fullName);
  };

  const handleDeleteConfirm = () => {
    if (!supervisorToDelete) return;
    storageService.deleteSupervisor(supervisorToDelete.id);
    refreshList();
    showToast('info', 'O\'chirildi', `${supervisorToDelete.fullName} olib tashlandi.`);
    setSupervisorToDelete(null);
  };

  const filteredSupervisors = supervisors.filter(s => {
    if (activeTab === 'university' && s.type !== 'university') return false;
    if (activeTab === 'clinic' && s.type !== 'clinic') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.fullName.toLowerCase().includes(q);
      const matchDept = s.department.toLowerCase().includes(q);
      if (!matchName && !matchDept) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Amaliyot rahbarlari va mentorlar
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Universitet kafedralari o'qituvchilari va shifoxonalarning mas'ul shifokorlari
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSupervisorToEdit(null);
            setIsSupervisorModalOpen(true);
          }}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi rahbar qo'shish</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="F.I.Sh. yoki kafedra bo'yicha qidirish..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50/50 focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('university')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'university'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Universitet rahbarlari ({supervisors.filter(s => s.type === 'university').length})
          </button>
          <button
            onClick={() => setActiveTab('clinic')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'clinic'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Klinik mentorlar ({supervisors.filter(s => s.type === 'clinic').length})
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSupervisors.map(sup => {
          const place = places.find(p => p.id === sup.practicePlaceId);

          return (
            <div
              key={sup.id}
              className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                    sup.type === 'university'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {sup.type === 'university' ? 'Universitet kafedrasi' : 'Klinika mentori'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSupervisorToEdit(sup);
                        setIsSupervisorModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSupervisorToDelete(sup)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm shrink-0">
                    {sup.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {sup.fullName}
                    </h3>
                    <p className="text-[11px] text-blue-600 font-medium">
                      {sup.academicDegree}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-start gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{sup.department}</span>
                  </div>
                  {place && (
                    <div className="flex items-start gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{place.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{sup.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{sup.email}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Biriktirilgan talabalar:</span>
                <span className="font-bold text-blue-700 font-mono tabular-nums">
                  {sup.assignedStudentsCount} nafar
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isSupervisorModalOpen}
        onClose={() => setIsSupervisorModalOpen(false)}
        title={supervisorToEdit ? "Rahbar ma'lumotlarini tahrirlash" : "Yangi amaliyot rahbari qo'shish"}
        maxWidth="md"
      >
        <form onSubmit={handleSaveSupervisor} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">F.I.Sh. *</label>
            <input type="text" name="fullName" required defaultValue={supervisorToEdit?.fullName || ''} placeholder="Prof. Sobirov Alisher Tolipovich" className="w-full px-3 py-2 text-xs border rounded-lg" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rahbar turi</label>
              <select name="type" defaultValue={supervisorToEdit?.type || 'university'} className="w-full px-3 py-2 text-xs border rounded-lg">
                <option value="university">Universitet kafedrasi</option>
                <option value="clinic">Klinik baza mentori</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ilmiy daraja / unvon</label>
              <input type="text" name="academicDegree" defaultValue={supervisorToEdit?.academicDegree || 't.f.n., dotsent'} className="w-full px-3 py-2 text-xs border rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Kafedra yoki bo'lim *</label>
            <input type="text" name="department" required defaultValue={supervisorToEdit?.department || 'Gospital terapiya kafedrasi'} className="w-full px-3 py-2 text-xs border rounded-lg" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Klinik baza (agar shifoxona mentori bo'lsa)</label>
            <select name="practicePlaceId" defaultValue={supervisorToEdit?.practicePlaceId || ''} className="w-full px-3 py-2 text-xs border rounded-lg">
              <option value="">Tanlanmagan</option>
              {places.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Telefon</label>
              <input type="text" name="phone" defaultValue={supervisorToEdit?.phone || '+998 (90) '} className="w-full px-3 py-2 text-xs border rounded-lg font-mono" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input type="email" name="email" defaultValue={supervisorToEdit?.email || ''} className="w-full px-3 py-2 text-xs border rounded-lg" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={() => setIsSupervisorModalOpen(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">Bekor qilish</button>
            <button type="submit" className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Saqlash</button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={Boolean(supervisorToDelete)}
        onClose={() => setSupervisorToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Rahbarni o'chirish"
        message={`Haqiqatan ham "${supervisorToDelete?.fullName}" ni o'chirmoqchimisiz?`}
        confirmLabel="O'chirish"
        cancelLabel="Bekor qilish"
        isDestructive
      />
    </div>
  );
}
