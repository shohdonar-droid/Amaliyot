import React, { useState } from 'react';
import {
  Student,
  Faculty,
  Direction,
  Course,
  Group,
  Practice,
  PracticePlace,
  Attendance,
  DailyJournal,
  StudentSkill,
  Skill,
  Assessment
} from '../../../types';
import { storageService } from '../../../services/storageService';
import { Modal } from '../../common/Modal';
import { StatusBadge } from '../../common/Badge';
import {
  User,
  Phone,
  Mail,
  Send,
  Building2,
  Calendar,
  BookOpen,
  Stethoscope,
  Award,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export function StudentDetailModal({
  isOpen,
  onClose,
  student
}: StudentDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'journals' | 'skills' | 'assessments'>('overview');

  if (!student) return null;

  const faculties = storageService.getFaculties();
  const directions = storageService.getDirections();
  const courses = storageService.getCourses();
  const groups = storageService.getGroups();
  const practices = storageService.getPractices();
  const places = storageService.getPracticePlaces();
  const attendance = storageService.getAttendance().filter(a => a.studentId === student.id);
  const journals = storageService.getDailyJournals().filter(j => j.studentId === student.id);
  const studentSkills = storageService.getStudentSkills().filter(s => s.studentId === student.id);
  const allSkills = storageService.getSkills();
  const assessments = storageService.getAssessments().filter(a => a.studentId === student.id);
  const assignments = storageService.getAssignments().filter(a => a.studentId === student.id);

  const faculty = faculties.find(f => f.id === student.facultyId);
  const direction = directions.find(d => d.id === student.directionId);
  const course = courses.find(c => c.id === student.courseId);
  const group = groups.find(g => g.id === student.groupId);
  const currentPractice = practices.find(p => p.id === student.currentPracticeId);
  const currentPlace = places.find(p => p.id === student.currentPracticePlaceId);

  const statusVariant = 
    student.status === 'in_practice' ? 'success' :
    student.status === 'active' ? 'info' :
    student.status === 'suspended' ? 'danger' : 'neutral';

  const statusLabel = 
    student.status === 'in_practice' ? 'Amaliyotda' :
    student.status === 'active' ? 'Boshlanmagan' :
    student.status === 'suspended' ? 'Chetlashtirilgan' : 'Yakunlagan';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${student.fullName} — Amaliyot Pasporti`}
      subtitle={`AIDE Login: ${student.login || student.studentCode || 'T00001'} · HEMIS ID: ${student.hemisStudentId || student.studentId} · JSHSHIR: ${student.pinfl}`}
      maxWidth="3xl"
    >
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-lg shrink-0">
            {student.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">{student.fullName}</h4>
              <StatusBadge label={statusLabel} variant={statusVariant} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {faculty?.name} · {direction?.name} ({group?.name})
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-600 space-y-1">
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{student.phone}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-blue-600 font-mono">{student.telegram}</span>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-1 mt-4 border-b border-slate-200 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-700 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Umumiy & Amaliyotlar
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-3 py-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'attendance'
              ? 'border-blue-600 text-blue-700 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Davomat ({attendance.length})
        </button>
        <button
          onClick={() => setActiveTab('journals')}
          className={`px-3 py-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'journals'
              ? 'border-blue-600 text-blue-700 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Elektron kundalik ({journals.length})
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`px-3 py-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'skills'
              ? 'border-blue-600 text-blue-700 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Amaliy ko'nikmalar ({studentSkills.length})
        </button>
        <button
          onClick={() => setActiveTab('assessments')}
          className={`px-3 py-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'assessments'
              ? 'border-blue-600 text-blue-700 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Baholash natijalari
        </button>
      </div>

      {/* Tab Contents */}
      <div className="py-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Active Practice Card */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                Joriy faol amaliyot
              </span>
              {currentPractice ? (
                <div className="mt-2 space-y-2">
                  <h5 className="text-sm font-bold text-slate-900">
                    {currentPractice.name}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>
                      <span className="font-semibold text-slate-700">Muddati: </span>
                      {currentPractice.startDate} dan {currentPractice.endDate} gacha
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Amaliyot bazasi: </span>
                      {currentPlace?.name || 'Taqsimlanmagan'}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Buyruq raqami: </span>
                      {currentPractice.orderNumber}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Yuklama: </span>
                      {currentPractice.totalHours} soat ({currentPractice.credits} kredit)
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 mt-1">
                  Talaba hozirda hech qanday faol amaliyotga biriktirilmagan.
                </p>
              )}
            </div>

            {/* All Practices History */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Talabaning barcha amaliyotlari tarixi ({assignments.length})
              </h5>
              {assignments.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center border border-dashed rounded-lg">
                  Amaliyot tarixi mavjud emas.
                </p>
              ) : (
                <div className="space-y-2">
                  {assignments.map(asg => {
                    const prac = practices.find(p => p.id === asg.practiceId);
                    const plc = places.find(p => p.id === asg.practicePlaceId);
                    return (
                      <div key={asg.id} className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 line-clamp-1">
                            {prac?.name || 'Amaliyot'}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {plc?.name} · Bo'lim: {asg.department} · {asg.startDate} — {asg.endDate}
                          </p>
                        </div>
                        <StatusBadge
                          label={asg.status === 'in_progress' ? 'O\'talmoqda' : asg.status === 'completed' ? 'Yakunlangan' : 'Biriktirilgan'}
                          variant={asg.status === 'in_progress' ? 'active' : 'neutral'}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-3">
            {attendance.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">
                Davomat yozuvlari topilmadi.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {attendance.map(att => (
                  <div key={att.id} className="p-3 bg-white flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 font-mono">{att.date}</span>
                        {att.checkInTime && (
                          <span className="text-slate-500 font-mono">Keldi: {att.checkInTime}</span>
                        )}
                        {att.checkOutTime && (
                          <span className="text-slate-500 font-mono">Ketdi: {att.checkOutTime}</span>
                        )}
                      </div>
                      {att.notes && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{att.notes}</p>
                      )}
                    </div>
                    <StatusBadge
                      label={att.status === 'present' ? 'Kelgan' : att.status === 'absent' ? 'Kelmadi' : att.status === 'late' ? 'Kechikdi' : 'Sababli'}
                      variant={att.status === 'present' ? 'active' : att.status === 'absent' ? 'danger' : 'warning'}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'journals' && (
          <div className="space-y-3">
            {journals.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">
                Elektron kundalik yozuvlari topilmadi.
              </p>
            ) : (
              journals.map(journal => (
                <div key={journal.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold font-mono text-slate-800">{journal.date}</span>
                      <span className="text-xs text-slate-500 ml-2">Bo'lim: {journal.department}</span>
                    </div>
                    <StatusBadge
                      label={journal.status === 'approved' ? 'Tasdiqlangan' : journal.status === 'rejected' ? 'Qaytarilgan' : 'Kutilmoqda'}
                      variant={journal.status === 'approved' ? 'active' : journal.status === 'rejected' ? 'danger' : 'warning'}
                    />
                  </div>

                  <p className="text-xs text-slate-700">
                    <span className="font-semibold">Ko'rilgan bemorlar: </span>
                    {journal.patientsExaminedCount} nafar
                  </p>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <p className="font-semibold text-slate-800 mb-1">Bajarilgan muolajalar:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      {journal.proceduresDone.map((proc, i) => (
                        <li key={i}>{proc}</li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-xs text-slate-600">
                    <span className="font-semibold">Klinik tahlil: </span>
                    {journal.clinicalCasesSummary}
                  </p>

                  {journal.supervisorFeedback && (
                    <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                      <span className="font-bold">Rahbar xulosasi ({journal.supervisorRating} ball): </span>
                      {journal.supervisorFeedback}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-3">
            {studentSkills.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">
                Amaliy ko'nikmalar hisobi boshlanmagan.
              </p>
            ) : (
              studentSkills.map(ssk => {
                const skill = allSkills.find(s => s.id === ssk.skillId);
                const perf = ssk.performedCount ?? ssk.totalPerformedCount ?? 0;
                const target = ssk.requiredCount ?? ssk.targetCount ?? (skill?.requiredCount || 10);
                const progressPct = Math.min(100, Math.round((perf / (target || 1)) * 100));
                return (
                  <div key={ssk.id} className="p-3 rounded-lg border border-slate-200 bg-white">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h6 className="text-xs font-bold text-slate-800">
                          {skill?.name || 'Manipulyatsiya'}
                        </h6>
                        <p className="text-[11px] text-slate-500">{skill?.category}</p>
                      </div>
                      <StatusBadge
                        label={ssk.status === 'mastered' ? 'O\'zlashtirildi' : 'Jarayonda'}
                        variant={ssk.status === 'mastered' ? 'active' : 'info'}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-mono tabular-nums">
                        Bajarildi: {perf} / {target} marta
                      </span>
                      <span className="font-bold font-mono text-blue-600 tabular-nums">
                        {progressPct}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'assessments' && (
          <div className="space-y-3">
            {assessments.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">
                Talaba hali rasmiy baholanmagan.
              </p>
            ) : (
              assessments.map(ass => (
                <div key={ass.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h6 className="text-sm font-bold text-slate-800">Amaliyot yakuniy bahosi</h6>
                      <p className="text-xs text-slate-500">Baholovchi: {ass.assessorName} ({ass.assessmentDate})</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold font-mono text-blue-700">{ass.totalScore}</span>
                      <span className="text-xs text-slate-500"> / 100 ball</span>
                      <div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Baho: {ass.grade}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono">
                    <div>Davomat: <span className="font-bold">{ass.attendanceScore}/20</span></div>
                    <div>Kundalik: <span className="font-bold">{ass.journalScore}/20</span></div>
                    <div>Ko'nikmalar: <span className="font-bold">{ass.skillsScore}/30</span></div>
                    <div>Yakuniy sinov: <span className="font-bold">{ass.finalExamScore}/30</span></div>
                  </div>

                  {ass.feedback && (
                    <p className="text-xs text-slate-600 italic">
                      "{ass.feedback}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
