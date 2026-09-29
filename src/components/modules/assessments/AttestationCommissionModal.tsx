import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Shield,
  Building,
  UserCheck,
  CheckSquare,
  Square
} from 'lucide-react';
import { AttestationCommission } from '../../../types';
import { storageService } from '../../../services/storageService';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

interface AttestationCommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editCommission?: AttestationCommission | null;
  onCommissionSaved: () => void;
}

export const AttestationCommissionModal: React.FC<AttestationCommissionModalProps> = ({
  isOpen,
  onClose,
  editCommission,
  onCommissionSaved
}) => {
  const { currentUser, role } = useAuth();
  const { showToast } = useToast();

  const faculties = storageService.getFaculties();
  const supervisors = storageService.getSupervisors();

  const [name, setName] = useState('');
  const [chairpersonId, setChairpersonId] = useState('');
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [department, setDepartment] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [position, setPosition] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editCommission) {
      setName(editCommission.name);
      setChairpersonId(editCommission.chairpersonId);
      setMemberIds(editCommission.memberIds || []);
      setDepartment(editCommission.department || '');
      setFacultyId(editCommission.facultyId || faculties[0]?.id || '');
      setPosition(editCommission.position || '');
      setIsActive(editCommission.isActive);
    } else {
      setName('Klinik attestatsiya komissiyasi №');
      setChairpersonId(supervisors[0]?.id || '');
      setMemberIds(supervisors.slice(0, 2).map(s => s.id));
      setDepartment('Ichki kasalliklar kafedrasi');
      setFacultyId(faculties[0]?.id || '');
      setPosition('Kafedra mudiri, professor');
      setIsActive(true);
    }
  }, [editCommission, isOpen]);

  if (!isOpen) return null;

  const handleToggleMember = (supId: string) => {
    setMemberIds(prev => 
      prev.includes(supId) ? prev.filter(id => id !== supId) : [...prev, supId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Xatolik', 'Komissiya nomini kiriting.');
      return;
    }
    if (!chairpersonId) {
      showToast('error', 'Xatolik', 'Komissiya raisini tanlang.');
      return;
    }

    setSubmitting(true);
    try {
      const chair = supervisors.find(s => s.id === chairpersonId);
      const memberNames = memberIds.map(
        id => supervisors.find(s => s.id === id)?.fullName || 'A\'zo'
      );
      const faculty = faculties.find(f => f.id === facultyId);

      storageService.saveAttestationCommission(
        {
          id: editCommission?.id,
          name,
          chairpersonId,
          chairpersonName: chair?.fullName || 'Komissiya raisi',
          memberIds,
          memberNames,
          department,
          facultyId,
          facultyName: faculty?.name,
          position,
          isActive
        },
        currentUser?.id || 'sys',
        role || 'PRACTICE_HEAD'
      );

      showToast(
        'success',
        editCommission ? 'Komissiya yangilandi' : 'Yangi komissiya yaratildi',
        `${name} muvaffaqiyatli saqlandi.`
      );
      onCommissionSaved();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
              <Users className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {editCommission ? 'Komissiyani tahrirlash' : 'Yangi attestatsiya komissiyasi'}
              </h3>
              <p className="text-xs text-slate-300">Amaliyot yakuniy sinovlarini baholovchi hay'at</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Komissiya nomi *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Masalan: Davolash ishi 4-kurs Yakuniy attestatsiya komissiyasi №1"
              className="w-full px-3 py-2 border rounded-xl font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fakultet</label>
              <select
                value={facultyId}
                onChange={e => setFacultyId(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-medium bg-white"
              >
                {faculties.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kafedra / Bo'lim</label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                placeholder="Gospital terapiya..."
                className="w-full px-3 py-2 border rounded-xl font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                Komissiya raisi *
              </label>
              <select
                value={chairpersonId}
                onChange={e => setChairpersonId(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-medium bg-white"
              >
                {supervisors.map(s => (
                  <option key={s.id} value={s.id}>{s.fullName} ({s.position})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lavozim / Ilmiy unvon</label>
              <input
                type="text"
                value={position}
                onChange={e => setPosition(e.target.value)}
                placeholder="Kafedra mudiri, professor"
                className="w-full px-3 py-2 border rounded-xl font-medium"
              />
            </div>
          </div>

          {/* Members Multi-select */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Komissiya a'zolari ({memberIds.length} nafar tanlandi)
            </label>
            <div className="max-h-36 overflow-y-auto p-2 border rounded-xl bg-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {supervisors.map(sup => {
                const isSelected = memberIds.includes(sup.id);
                return (
                  <button
                    key={sup.id}
                    type="button"
                    onClick={() => handleToggleMember(sup.id)}
                    className={`p-2 rounded-lg text-left text-xs border flex items-center gap-2 transition-colors ${
                      isSelected ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-semibold' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {isSelected ? <CheckSquare className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> : <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                    <span className="truncate">{sup.fullName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_comm_active"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600"
            />
            <label htmlFor="is_comm_active" className="font-semibold text-slate-700 cursor-pointer">
              Komissiya faol holatda
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Saqlanmoqda...' : 'Komissiyani saqlash'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
