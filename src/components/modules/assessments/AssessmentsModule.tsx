import React, { useState } from 'react';
import {
  Award,
  Plus,
  Edit2,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import { Assessment, Student, Practice } from '../../../types';
import { storageService } from '../../../services/storageService';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { StatusBadge } from '../../common/Badge';
import { Modal } from '../../common/Modal';

export function AssessmentsModule() {
  const { showToast } = useToast();
  const { currentUser } = useAuth();

  const practices = storageService.getPractices();
  const students = storageService.getStudents();
  const [assessments, setAssessments] = useState<Assessment[]>(() => storageService.getAssessments());

  const [selectedPracticeId, setSelectedPracticeId] = useState<string>(practices[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  // Assessment form modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetStudentId, setTargetStudentId] = useState<string>(students[0]?.id || '');
  const [attScore, setAttScore] = useState<number>(18);
  const [journalScore, setJournalScore] = useState<number>(18);
  const [skillsScore, setSkillsScore] = useState<number>(27);
  const [finalScore, setFinalScore] = useState<number>(27);
  const [feedback, setFeedback] = useState('Amaliy dastur to\'liq bajarildi, klinik ko\'nikmalar yuqori darajada o\'zlashtirildi.');

  const refreshList = () => {
    setAssessments(storageService.getAssessments());
  };

  const totalScore = Math.min(Number(attScore) + Number(journalScore) + Number(skillsScore) + Number(finalScore), 100);
  const grade: '5' | '4' | '3' | '2' = 
    totalScore >= 86 ? '5' :
    totalScore >= 71 ? '4' :
    totalScore >= 55 ? '3' : '2';

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudentId || !selectedPracticeId) return;

    const payload: Assessment = {
      id: `ass-${Date.now()}`,
      practiceId: selectedPracticeId,
      studentId: targetStudentId,
      attendanceScore: Number(attScore),
      journalScore: Number(journalScore),
      skillsScore: Number(skillsScore),
      finalExamScore: Number(finalScore),
      totalScore,
      grade,
      assessorId: currentUser?.id || 'sup-1',
      assessorName: currentUser?.fullName || 'Prof. Sobirov Alisher',
      assessmentDate: new Date().toISOString().split('T')[0],
      feedback,
      status: 'graded'
    };

    storageService.saveAssessment(payload);
    refreshList();
    setIsModalOpen(false);
    showToast('success', 'Baho qo\'yildi', `Jami: ${totalScore} ball (Baho: ${grade})`);
  };

  const selectedPractice = practices.find(p => p.id === selectedPracticeId);
  const practiceStudents = students.filter(s => 
    selectedPractice ? selectedPractice.groupIds.includes(s.groupId) : true
  );

  const filteredStudents = practiceStudents.filter(s => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return s.fullName.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Amaliyot baholash va attestatsiya
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Oraliq va yakuniy sinov ballari, mezonlar va amaliyot vedomosti
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Talabani baholash</span>
        </button>
      </div>

      {/* Selector & Search */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Amaliyot buyrug'i
          </label>
          <select
            value={selectedPracticeId}
            onChange={e => setSelectedPracticeId(e.target.value)}
            className="w-full sm:max-w-md px-3 py-1.5 text-xs border rounded-lg font-medium"
          >
            {practices.map(p => (
              <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Talaba F.I.Sh..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg bg-slate-50"
          />
        </div>
      </div>

      {/* Assessment Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Talaba (F.I.Sh.)</th>
                <th className="py-3 px-4">Davomat (20)</th>
                <th className="py-3 px-4">Kundalik (20)</th>
                <th className="py-3 px-4">Ko'nikmalar (30)</th>
                <th className="py-3 px-4">Yakuniy sinov (30)</th>
                <th className="py-3 px-4">Jami ball (100)</th>
                <th className="py-3 px-4">Baho</th>
                <th className="py-3 px-4 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map(student => {
                const assessment = assessments.find(
                  a => a.studentId === student.id && a.practiceId === selectedPracticeId
                );

                return (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{student.fullName}</p>
                      <p className="text-[11px] font-mono text-slate-400">{student.studentId}</p>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {assessment ? `${assessment.attendanceScore} ball` : '—'}
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {assessment ? `${assessment.journalScore} ball` : '—'}
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {assessment ? `${assessment.skillsScore} ball` : '—'}
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {assessment ? `${assessment.finalExamScore} ball` : '—'}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-blue-700 text-sm">
                      {assessment ? `${assessment.totalScore}` : '—'}
                    </td>

                    <td className="py-3 px-4">
                      {assessment ? (
                        <span className={`px-2.5 py-0.5 rounded font-bold text-xs ${
                          assessment.grade === '5' ? 'bg-emerald-100 text-emerald-800' :
                          assessment.grade === '4' ? 'bg-blue-100 text-blue-800' :
                          assessment.grade === '3' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          Baho: {assessment.grade}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Baholanmagan</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setTargetStudentId(student.id);
                          if (assessment) {
                            setAttScore(assessment.attendanceScore);
                            setJournalScore(assessment.journalScore);
                            setSkillsScore(assessment.skillsScore);
                            setFinalScore(assessment.finalExamScore);
                            setFeedback(assessment.feedback);
                          }
                          setIsModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        {assessment ? 'Tahrirlash' : 'Baholash'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Amaliyot attestatsiyasi va baholash"
        subtitle="100 balllik mezonlar asosida yakuniy attestatsiya"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveAssessment} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Talaba *</label>
            <select
              value={targetStudentId}
              onChange={e => setTargetStudentId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg font-medium"
            >
              {practiceStudents.map(s => (
                <option key={s.id} value={s.id}>{s.fullName} ({s.studentId})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Davomat (max 20)</label>
              <input
                type="number"
                min={0}
                max={20}
                required
                value={attScore}
                onChange={e => setAttScore(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kundalik (max 20)</label>
              <input
                type="number"
                min={0}
                max={20}
                required
                value={journalScore}
                onChange={e => setJournalScore(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ko'nikmalar (max 30)</label>
              <input
                type="number"
                min={0}
                max={30}
                required
                value={skillsScore}
                onChange={e => setSkillsScore(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Yakuniy sinov (max 30)</label>
              <input
                type="number"
                min={0}
                max={30}
                required
                value={finalScore}
                onChange={e => setFinalScore(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
              />
            </div>
          </div>

          {/* Computed Score Banner */}
          <div className="p-3 bg-slate-50 border rounded-lg flex items-center justify-between">
            <span className="font-semibold text-slate-700">Jami to'plangan ball:</span>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold font-mono text-blue-700">{totalScore} / 100</span>
              <span className="px-2 py-0.5 rounded font-bold text-xs bg-emerald-100 text-emerald-800">
                Baho: {grade} ({grade === '5' ? 'A\'lo' : grade === '4' ? 'Yaxshi' : grade === '3' ? 'Qoniqarli' : 'Qoniqarsiz'})
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Baholovchi taqrizi va fikr-mulohazasi</label>
            <textarea
              rows={3}
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              Bahoni qayd etish
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
