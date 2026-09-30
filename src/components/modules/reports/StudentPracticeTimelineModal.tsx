import React from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CircleDashed,
  User,
  GraduationCap,
  Building2,
  Calendar,
  Award,
  Sparkles
} from 'lucide-react';
import { storageService } from '../../../services/storageService';
import { Student } from '../../../types';

interface StudentPracticeTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  practiceId?: string;
}

export const StudentPracticeTimelineModal: React.FC<StudentPracticeTimelineModalProps> = ({
  isOpen,
  onClose,
  student,
  practiceId
}) => {
  if (!isOpen) return null;

  const practices = storageService.getPractices();
  const activePractice = practices.find(p => p.id === practiceId) || practices[0];
  const timeline = storageService.getStudentTimeline(student.id, activePractice?.id);
  const overallStatus = storageService.calculateStudentOverallStatus(student.id, activePractice?.id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Bajarildi
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" />
            Jarayonda
          </span>
        );
      case 'PROBLEM':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Muammo
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            <CircleDashed className="w-3 h-3 text-slate-400" />
            Kutilmoqda
          </span>
        );
    }
  };

  const completedSteps = timeline.filter(t => t.status === 'COMPLETED').length;
  const progressPercent = Math.round((completedSteps / timeline.length) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Sparkles className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <h3 className="text-base font-bold">Amaliyot Jarayoni Zanjiri (Timeline)</h3>
              <p className="text-xs text-sky-100">
                11 bosqichli to'liq amaliyot monitoringi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 text-blue-800 font-bold flex items-center justify-center text-sm">
              {student.fullName.charAt(0)}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">{student.fullName}</h4>
              <p className="text-xs text-slate-500 font-mono">
                ID: {student.studentId} • Guruh: {student.group || student.groupId} • {student.faculty || 'Davolash'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-500 block">Joriy Holat:</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {overallStatus}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700">Umumiy Jarayon Ko'rsatkichi</span>
            <span className="font-bold text-blue-600 font-mono">{completedSteps} / {timeline.length} bosqich ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Timeline Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {timeline.map((step) => {
              const isCompleted = step.status === 'COMPLETED';
              const isProgress = step.status === 'IN_PROGRESS';
              const isProblem = step.status === 'PROBLEM';

              return (
                <div key={step.stepNumber} className="relative group">
                  {/* Step Dot */}
                  <div
                    className={`absolute -left-6 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                      isCompleted
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                        : isProgress
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                        : isProblem
                        ? 'bg-rose-600 text-white ring-4 ring-rose-100'
                        : 'bg-white text-slate-400 border-2 border-slate-300'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      step.stepNumber
                    )}
                  </div>

                  {/* Step Content */}
                  <div
                    className={`p-3.5 rounded-xl border transition-all ${
                      isProgress
                        ? 'bg-blue-50/50 border-blue-200 shadow-xs'
                        : isProblem
                        ? 'bg-rose-50/50 border-rose-200 shadow-xs'
                        : isCompleted
                        ? 'bg-slate-50/60 border-slate-200'
                        : 'bg-white border-slate-100 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                          {step.stepNumber}-BOSQICH
                        </span>
                        <h5 className="text-xs font-bold text-slate-900 mt-0.5">{step.title}</h5>
                      </div>
                      <div className="flex items-center gap-2">
                        {step.date && (
                          <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {step.date}
                          </span>
                        )}
                        {getStatusBadge(step.status)}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
