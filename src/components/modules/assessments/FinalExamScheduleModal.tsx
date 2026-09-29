import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Building2,
  Users,
  GraduationCap,
  CheckSquare,
  Square,
  AlertCircle
} from 'lucide-react';
import { Practice, Student, AttestationCommission, Supervisor } from '../../../types';
import { storageService } from '../../../services/storageService';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

interface FinalExamScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  practiceId: string;
  onExamCreated: () => void;
  preselectedStudentId?: string;
}

export const FinalExamScheduleModal: React.FC<FinalExamScheduleModalProps> = ({
  isOpen,
  onClose,
  practiceId,
  onExamCreated,
  preselectedStudentId
}) => {
  const { currentUser, role } = useAuth();
  const { showToast } = useToast();

  const practices = storageService.getPractices();
  const commissions = storageService.getAttestationCommissions().filter(c => c.isActive);
  const supervisors = storageService.getSupervisors();
  const places = storageService.getPracticePlaces();
  const allStudents = storageService.getStudents();
  const assignments = storageService.getPracticeAssignments();

  const selectedPractice = practices.find(p => p.id === practiceId) || practices[0];
  const practiceStudents = allStudents.filter(s => {
    const hasAssignment = assignments.some(a => a.studentId === s.id && a.practiceId === selectedPractice?.id);
    const inGroup = selectedPractice ? selectedPractice.groupIds.includes(s.groupId) : true;
    return hasAssignment || inGroup;
  });

  const [examDate, setExamDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [examTime, setExamTime] = useState<string>('10:00');
  const [placeName, setPlaceName] = useState<string>(places[0]?.name || 'Respublika 1-son Shifoxonasi');
  const [departmentName, setDepartmentName] = useState<string>('Gospital terapiya');
  const [selectedCommissionId, setSelectedCommissionId] = useState<string>(commissions[0]?.id || '');
  const [selectedExaminerIds, setSelectedExaminerIds] = useState<string[]>([supervisors[0]?.id || 'sup-1']);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(
    preselectedStudentId ? [preselectedStudentId] : practiceStudents.map(s => s.id)
  );
  const [comments, setComments] = useState<string>('Yakuniy amaliyot klinik imtihoni. 5 ta mezon bo\'yicha baholanadi.');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleToggleStudent = (stdId: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(stdId) ? prev.filter(id => id !== stdId) : [...prev, stdId]
    );
  };

  const handleSelectAllStudents = () => {
    if (selectedStudentIds.length === practiceStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(practiceStudents.map(s => s.id));
    }
  };

  const handleToggleExaminer = (supId: string) => {
    setSelectedExaminerIds(prev =>
      prev.includes(supId) ? prev.filter(id => id !== supId) : [...prev, supId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentIds.length === 0) {
      showToast('error', 'Xatolik', 'Kamida bitta talaba tanlanishi kerak.');
      return;
    }
    if (!examDate) {
      showToast('error', 'Xatolik', 'Imtihon sanasini kiriting.');
      return;
    }

    setSubmitting(true);
    try {
      const examinerNames = selectedExaminerIds.map(
        id => supervisors.find(s => s.id === id)?.fullName || 'Imtihonchi'
      );

      let createdCount = 0;
      selectedStudentIds.forEach(stdId => {
        const asg = assignments.find(a => a.studentId === stdId && a.practiceId === selectedPractice?.id);
        storageService.createFinalExam(
          {
            practiceId: selectedPractice?.id || 'prac-1',
            studentId: stdId,
            assignmentId: asg?.id,
            examDate,
            examTime,
            placeName,
            departmentName,
            examinerIds: selectedExaminerIds,
            examinerNames,
            commissionId: selectedCommissionId,
            comments
          },
          currentUser?.id || 'sys',
          role || 'PRACTICE_SUPERVISOR'
        );
        createdCount++;
      });

      showToast('success', 'Imtihon belgilandi', `${createdCount} nafar talabaga ${examDate} kuni soat ${examTime} da imtihon rejalashtirildi.`);
      onExamCreated();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
              <GraduationCap className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Yangi amaliyot imtihoni belgilash</h3>
              <p className="text-xs text-slate-300">{selectedPractice?.name || 'Klinik amaliyot'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Imtihon sanasi *
              </label>
              <input
                type="date"
                required
                value={examDate}
                onChange={e => setExamDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Vaqti *
              </label>
              <input
                type="time"
                required
                value={examTime}
                onChange={e => setExamTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                Klinika / Baza *
              </label>
              <input
                type="text"
                required
                value={placeName}
                onChange={e => setPlaceName(e.target.value)}
                placeholder="Shifoxona nomi..."
                className="w-full px-3 py-2 border rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bo'lim / Kafedra</label>
              <input
                type="text"
                value={departmentName}
                onChange={e => setDepartmentName(e.target.value)}
                placeholder="Bo'lim..."
                className="w-full px-3 py-2 border rounded-xl font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Attestatsiya komissiyasi</label>
            <select
              value={selectedCommissionId}
              onChange={e => setSelectedCommissionId(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl font-medium bg-white"
            >
              <option value="">Komissiyasiz (Faqat rahbar)</option>
              {commissions.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} (Raisi: {c.chairpersonName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Imtihonchi rahbarlar (Kamida 1 ta)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded-xl bg-slate-50">
              {supervisors.map(sup => {
                const isChecked = selectedExaminerIds.includes(sup.id);
                return (
                  <button
                    key={sup.id}
                    type="button"
                    onClick={() => handleToggleExaminer(sup.id)}
                    className={`p-2 rounded-lg text-left text-xs border flex items-center gap-2 transition-colors ${
                      isChecked ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {isChecked ? <CheckSquare className="w-3.5 h-3.5 text-blue-600 shrink-0" /> : <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                    <span className="truncate">{sup.fullName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Student Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Imtihon topshiruvchi talabalar ({selectedStudentIds.length} / {practiceStudents.length}) *
              </label>
              <button
                type="button"
                onClick={handleSelectAllStudents}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
              >
                {selectedStudentIds.length === practiceStudents.length ? 'Barchasini bekor qilish' : 'Barchasini tanlash'}
              </button>
            </div>

            <div className="max-h-40 overflow-y-auto p-2 border rounded-xl bg-slate-50 space-y-1">
              {practiceStudents.map(std => {
                const isSelected = selectedStudentIds.includes(std.id);
                return (
                  <div
                    key={std.id}
                    onClick={() => handleToggleStudent(std.id)}
                    className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/70 border-blue-200 text-blue-950 font-medium' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isSelected ? <CheckSquare className="w-3.5 h-3.5 text-blue-600" /> : <Square className="w-3.5 h-3.5 text-slate-400" />}
                      <span className="text-xs">{std.fullName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({std.studentId})</span>
                    </div>
                    <span className="text-[11px] text-slate-500">{std.group}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Izoh va talablarga ko'rsatma</label>
            <textarea
              rows={2}
              value={comments}
              onChange={e => setComments(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl"
            />
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
              className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Belgilanmoqda...' : 'Imtihonni rejalashtirish'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
