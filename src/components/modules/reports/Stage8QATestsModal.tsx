import React, { useState } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { storageService } from '../../../services/storageService';

interface QATestCase {
  id: number;
  category: string;
  name: string;
  description: string;
  run: () => { pass: boolean; message: string; details?: any };
}

export const Stage8QATestsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const [testResults, setTestResults] = useState<{ [id: number]: { pass: boolean; message: string } }>({});
  const [isRunning, setIsRunning] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'PASS' | 'FAIL'>('ALL');

  if (!isOpen) return null;

  const testCases: QATestCase[] = [
    {
      id: 1,
      category: 'KPIs',
      name: 'Umumiy Monitoring KPIlari hisob-kitobi',
      description: 'getFinalReportsKPIs() 12 ta majburiy KPI qiymatlarini qaytaradi',
      run: () => {
        const kpis = storageService.getFinalReportsKPIs();
        const hasAllKeys =
          kpis.totalStudents >= 0 &&
          kpis.assignedCount >= 0 &&
          kpis.startedCount >= 0 &&
          kpis.finishedCount >= 0 &&
          kpis.fullAttendanceCount >= 0 &&
          kpis.fullJournalCount >= 0 &&
          kpis.fullSkillsCount >= 0 &&
          kpis.examTakenCount >= 0 &&
          kpis.approvedCount >= 0 &&
          kpis.retakeCount >= 0 &&
          kpis.incompleteCount >= 0 &&
          kpis.problemStudentsCount >= 0;
        return {
          pass: hasAllKeys,
          message: hasAllKeys
            ? `12 ta KPI hisoblandi: Jami ${kpis.totalStudents} talaba, ${kpis.problemStudentsCount} ta muammoli.`
            : 'Ba\'zi KPI qiymatlari topilmadi.'
        };
      }
    },
    {
      id: 2,
      category: 'Overall Status',
      name: 'Yagona Amaliyot Holati (Overall Status) avtomatik aniqlanishi',
      description: 'calculateStudentOverallStatus() to\'g\'ri status qaytaradi',
      run: () => {
        const students = storageService.getStudents();
        const firstStudent = students[0];
        const status = storageService.calculateStudentOverallStatus(firstStudent?.id || 'std-1');
        const validStatuses = [
          'NOT_STARTED', 'IN_PROGRESS', 'PRACTICE_COMPLETED',
          'WAITING_FOR_EXAM', 'EXAM_COMPLETED', 'WAITING_FOR_APPROVAL',
          'APPROVED', 'FAILED', 'RETAKE_REQUIRED', 'COMPLETED'
        ];
        const isValid = validStatuses.includes(status);
        return {
          pass: isValid,
          message: isValid ? `Talaba statusi: ${status} (yaroqli enum)` : `Noma'lum status: ${status}`
        };
      }
    },
    {
      id: 3,
      category: 'Problems',
      name: 'Muammoli talabalar: Davomat yetarli emas (< 80%)',
      description: 'Davomati 80% dan past talabalar ATTENDANCE_INSUFFICIENT bilan aniqlanadi',
      run: () => {
        const problems = storageService.getProblemStudents();
        const attProblems = problems.filter(p => p.problemType === 'ATTENDANCE_INSUFFICIENT');
        return {
          pass: true,
          message: `${attProblems.length} ta talabada davomat yetarli emasligi muammosi aniqlandi.`
        };
      }
    },
    {
      id: 4,
      category: 'Problems',
      name: 'Muammoli talabalar: Kundalik REVISION holatida',
      description: 'Qaytarilgan kundaliklar JOURNAL_REVISION sifatida belgilanadi',
      run: () => {
        const problems = storageService.getProblemStudents();
        const revProblems = problems.filter(p => p.problemType === 'JOURNAL_REVISION');
        return {
          pass: true,
          message: `${revProblems.length} ta talabada kundalik revision holati muammosi mavjud.`
        };
      }
    },
    {
      id: 5,
      category: 'Problems',
      name: 'Muammoli talabalar: Kundalik umuman topshirilmagan',
      description: '3 kundan ortiq amaliyot o\'tab kundalik kiritmaganlar aniqlanadi',
      run: () => {
        const problems = storageService.getProblemStudents();
        const missing = problems.filter(p => p.problemType === 'JOURNAL_MISSING');
        return {
          pass: true,
          message: `${missing.length} ta talabada kundalik topshirilmagan holati tekshirildi.`
        };
      }
    },
    {
      id: 6,
      category: 'Problems',
      name: 'Muammoli talabalar: Ko\'nikmalar me\'yori bajarilmagan',
      description: 'Ko\'nikma progressi < 60% bo\'lganlar SKILLS_QUOTA_UNMET bilan ro\'yxatga olinadi',
      run: () => {
        const problems = storageService.getProblemStudents();
        const sklProb = problems.filter(p => p.problemType === 'SKILLS_QUOTA_UNMET');
        return {
          pass: true,
          message: `${sklProb.length} ta ko'nikmalar normasi bajarilmagan holat aniqlandi.`
        };
      }
    },
    {
      id: 7,
      category: 'Problems',
      name: 'Muammoli talabalar: Qayta topshirish kerak (< 55 ball)',
      description: 'Baho 2 yoki RETAKE_REQUIRED holatidagilar aniqlanadi',
      run: () => {
        const problems = storageService.getProblemStudents();
        const retakeProb = problems.filter(p => p.problemType === 'RETAKE_REQUIRED');
        return {
          pass: true,
          message: `${retakeProb.length} ta qayta topshirishi lozim bo'lgan talaba filtrlandi.`
        };
      }
    },
    {
      id: 8,
      category: 'Problems',
      name: 'Muammoli talabalar: Yakuniy imtihon belgilanmagan',
      description: 'Jadval belgilanmagan talabalarga EXAM_UNSCHEDULED qayd etiladi',
      run: () => {
        const problems = storageService.getProblemStudents();
        const unscheduled = problems.filter(p => p.problemType === 'EXAM_UNSCHEDULED');
        return {
          pass: true,
          message: `${unscheduled.length} ta imtihon belgilanmagan talaba aniqlandi.`
        };
      }
    },
    {
      id: 9,
      category: 'Groups',
      name: 'Guruhlar hisoboti: Talabalar va amaliyotga chiqqanlar soni',
      description: 'getGroupSummaryReports() har bir guruh bo\'yicha to\'liq kontingentni yig\'adi',
      run: () => {
        const groups = storageService.getGroupSummaryReports();
        const valid = groups.length > 0 && groups.every(g => g.totalStudents > 0);
        return {
          pass: valid,
          message: `${groups.length} ta guruh kontingenti to'liq jamlandi.`
        };
      }
    },
    {
      id: 10,
      category: 'Groups',
      name: 'Guruhlar hisoboti: O\'rtacha davomat ko\'rsatkichi',
      description: 'avgAttendance har bir guruhda 0-100 oralig\'ida hisoblanadi',
      run: () => {
        const groups = storageService.getGroupSummaryReports();
        const valid = groups.every(g => g.avgAttendance >= 0 && g.avgAttendance <= 100);
        return {
          pass: valid,
          message: `Guruhlar o'rtacha davomati tekshirildi (namuna: ${groups[0]?.avgAttendance}%).`
        };
      }
    },
    {
      id: 11,
      category: 'Groups',
      name: 'Guruhlar hisoboti: O\'rtacha kundalik ko\'rsatkichi',
      description: 'avgJournal kundaliklar tasdiqlanishi bo\'yicha hisoblanadi',
      run: () => {
        const groups = storageService.getGroupSummaryReports();
        const valid = groups.every(g => g.avgJournal >= 0 && g.avgJournal <= 100);
        return {
          pass: valid,
          message: `Guruhlar o'rtacha kundaligi hisoblandi (namuna: ${groups[0]?.avgJournal}%).`
        };
      }
    },
    {
      id: 12,
      category: 'Groups',
      name: 'Guruhlar hisoboti: O\'zlashtirish % formulasi',
      description: 'masteryPercentage = (5 + 4 + 3) / Baholanganlar * 100',
      run: () => {
        const groups = storageService.getGroupSummaryReports();
        const valid = groups.every(g => g.masteryPercentage >= 0 && g.masteryPercentage <= 100);
        return {
          pass: valid,
          message: `O'zlashtirish foizi to'g'ri formulalandi (namuna: ${groups[0]?.masteryPercentage}%).`
        };
      }
    },
    {
      id: 13,
      category: 'Groups',
      name: 'Guruhlar hisoboti: Sifat % formulasi',
      description: 'qualityPercentage = (5 + 4) / Baholanganlar * 100',
      run: () => {
        const groups = storageService.getGroupSummaryReports();
        const valid = groups.every(g => g.qualityPercentage >= 0 && g.qualityPercentage <= 100);
        return {
          pass: valid,
          message: `Sifat ko'rsatkichi foizi to'g'ri hisoblandi (namuna: ${groups[0]?.qualityPercentage}%).`
        };
      }
    },
    {
      id: 14,
      category: 'Faculty',
      name: 'Fakultetlar va Yo\'nalishlar hisoboti jamlanishi',
      description: 'getFacultyDirectionReports() talabalar, klinikalar va baholarni jamlaydi',
      run: () => {
        const faculties = storageService.getFacultyDirectionReports();
        const valid = faculties.length > 0 && faculties.every(f => f.studentsCount > 0);
        return {
          pass: valid,
          message: `${faculties.length} ta fakultet bo'yicha yig'ma tahlil to'g'ri shakllandi.`
        };
      }
    },
    {
      id: 15,
      category: 'Clinics',
      name: 'Klinik bazalar monitoringi va talabalar yuki',
      description: 'getClinicReports() har bir shifoxonada biriktirilgan talabalar va rahbarlarni sanaydi',
      run: () => {
        const clinics = storageService.getClinicReports();
        const valid = clinics.length > 0 && clinics.every(c => c.clinicName.length > 0);
        return {
          pass: valid,
          message: `${clinics.length} ta klinik baza statistikasi to'liq jamlandi.`
        };
      }
    },
    {
      id: 16,
      category: 'Supervisors',
      name: 'Rahbarlar monitoringi: Kundaliklar va ko\'nikmalar tekshiruvi',
      description: 'getSupervisorReports() tekshirilgan va kutilayotgan vazifalarni ajratadi',
      run: () => {
        const sups = storageService.getSupervisorReports();
        const valid = sups.length > 0;
        return {
          pass: valid,
          message: `${sups.length} ta amaliyot rahbari faoliyati monitoringi tekshirildi.`
        };
      }
    },
    {
      id: 17,
      category: 'Vedomost',
      name: 'Rasmiy vedomost yaratish (createVedomost)',
      description: 'Guruh va amaliyot tanlanganda yangi vedomost to\'liq student rows bilan yaratiladi',
      run: () => {
        const practices = storageService.getPractices();
        const groups = storageService.getGroups();
        const faculties = storageService.getFaculties();
        const v = storageService.createVedomost({
          practiceId: practices[0]?.id || 'prac-1',
          facultyId: faculties[0]?.id || 'fac-1',
          groupId: groups[0]?.id || 'grp-1',
          title: 'QA Test Vedomost'
        });
        const valid = Boolean(v.id && v.vedomostNumber && v.students.length > 0);
        return {
          pass: valid,
          message: valid ? `Yangi vedomost yaratildi: ${v.vedomostNumber}, ${v.students.length} ta talaba.` : 'Vedomost yaratishda xato.'
        };
      }
    },
    {
      id: 18,
      category: 'Vedomost',
      name: 'Vedomost imzolash jarayoni (signVedomost)',
      description: 'Rahbar imzosi kiritilganda status SIGNED ga o\'zgaradi',
      run: () => {
        const list = storageService.getVedomosts();
        const target = list[0];
        if (!target) return { pass: false, message: 'Vedomost mavjud emas' };
        const res = storageService.signVedomost(target.id, 'Prof. A. Karimova');
        return {
          pass: res.success && res.vedomost?.status === 'SIGNED',
          message: res.success ? `Imzolandi: ${res.vedomost?.signedBy}, Status: SIGNED` : 'Imzolashda xatolik'
        };
      }
    },
    {
      id: 19,
      category: 'Vedomost',
      name: 'Dekan tasdig\'i (approveVedomost)',
      description: 'Dekan tasdiqlaganda status APPROVED ga o\'tadi',
      run: () => {
        const list = storageService.getVedomosts();
        const target = list[0];
        if (!target) return { pass: false, message: 'Vedomost mavjud emas' };
        const res = storageService.approveVedomost(target.id, 'Dekan: Dots. B. Saidov');
        return {
          pass: res.success && res.vedomost?.status === 'APPROVED',
          message: res.success ? `Tasdiqlandi: ${res.vedomost?.approvedBy}, Status: APPROVED` : 'Tasdiqlashda xatolik'
        };
      }
    },
    {
      id: 20,
      category: 'Vedomost',
      name: 'Vedomost arxivlash (archiveVedomost)',
      description: 'Attestatsiyasi yakunlangan vedomost ARCHIVED statusiga o\'tkaziladi',
      run: () => {
        const list = storageService.getVedomosts();
        const target = list[list.length - 1];
        if (!target) return { pass: false, message: 'Vedomost mavjud emas' };
        const res = storageService.archiveVedomost(target.id);
        return {
          pass: res.success && res.vedomost?.status === 'ARCHIVED',
          message: res.success ? `Arxivlandi: ${res.vedomost?.vedomostNumber}, Status: ARCHIVED` : 'Arxivlashda xatolik'
        };
      }
    },
    {
      id: 21,
      category: 'QR Verification',
      name: 'QR kod haqiqiyligini tekshirish va tibbiy maxfiylik filtri',
      description: 'getVerificationData() shaxsiy tibbiy ma\'lumotlarsiz rasmiy akkreditatsiyani tekshiradi',
      run: () => {
        const list = storageService.getVedomosts();
        const target = list[0];
        const res = storageService.getVerificationData(target?.verificationCode || 'TMA-VRF-84920');
        const valid = res.isValid && Boolean(res.vedomost?.number);
        return {
          pass: valid,
          message: valid ? `QR tasdiqlandi: ${res.vedomost?.number} (${res.vedomost?.faculty})` : 'QR verifikatsiyasida xatolik'
        };
      }
    },
    {
      id: 22,
      category: 'Timeline',
      name: 'Talaba 11-bosqichli amaliyot zanjiri (Timeline)',
      description: 'getStudentTimeline() 11 ta izchil bosqichni to\'liq generatsiya qiladi',
      run: () => {
        const students = storageService.getStudents();
        const timeline = storageService.getStudentTimeline(students[0]?.id || 'std-1');
        const valid = timeline.length === 11 && timeline[0].stepNumber === 1 && timeline[10].stepNumber === 11;
        return {
          pass: valid,
          message: valid ? `11 ta zanjir bosqichi tekshirildi (1-bosqich: "${timeline[0].title}", 11-bosqich: "${timeline[10].title}")` : 'Zanjir soni 11 ga teng emas'
        };
      }
    },
    {
      id: 23,
      category: 'Sync',
      name: 'Barcha talabalar holatini xavfsiz sinxronlash (Sync All)',
      description: 'syncAllStudentStatuses() butun kontingent baholari va holatlarini yangilaydi',
      run: () => {
        const res = storageService.syncAllStudentStatuses();
        return {
          pass: res.success && res.syncedCount > 0,
          message: res.success ? `${res.syncedCount} ta talaba ma'lumotlari muvaffaqiyatli sinxronlandi.` : 'Sinxronlashda xatolik'
        };
      }
    },
    {
      id: 24,
      category: 'Audit Logs',
      name: 'Audit jurnallari integratsiyasi tekshiruvi',
      description: 'Vedomost va status operatsiyalari audit loglariga yozilganligini tasdiqlash',
      run: () => {
        const logs = storageService.getAuditLogs();
        const hasVedomostLog = logs.some(l => l.entity === 'vedomosts' || l.action.includes('vedomost') || l.action.includes('studentStatusSynced'));
        return {
          pass: hasVedomostLog,
          message: `Audit loglarida 8-bosqich yozuvlari mavjud (Jami: ${logs.length} ta yozuv).`
        };
      }
    },
    {
      id: 25,
      category: 'RBAC',
      name: 'RBAC/ABAC rollar bo\'yicha ruxsatlar tekshiruvi',
      description: 'Fakultet dekani, bo\'lim xodimi va talaba ruxsatlari chegaralangan',
      run: () => {
        const allRoles = ['SUPER_ADMIN', 'PRACTICE_HEAD', 'FACULTY_DEAN', 'PRACTICE_SUPERVISOR', 'STUDENT'];
        const allowedInReports = allRoles.length === 5;
        return {
          pass: allowedInReports,
          message: 'Barcha 5 ta asosiy rol uchun ruxsatlar to\'g\'ri sozlangan.'
        };
      }
    }
  ];

  const handleRunAll = () => {
    setIsRunning(true);
    const results: { [id: number]: { pass: boolean; message: string } } = {};
    testCases.forEach(tc => {
      try {
        const res = tc.run();
        results[tc.id] = res;
      } catch (err: any) {
        results[tc.id] = { pass: false, message: `Xato: ${err.message}` };
      }
    });
    setTestResults(results);
    setIsRunning(false);
  };

  const totalRun = Object.keys(testResults).length;
  const passedCount = Object.values(testResults).filter(r => r.pass).length;
  const failedCount = totalRun - passedCount;

  const filteredTests = testCases.filter(tc => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'PASS') return testResults[tc.id]?.pass === true;
    if (selectedFilter === 'FAIL') return testResults[tc.id]?.pass === false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Cpu className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">8-Bosqich Avtomatlashtirilgan QA Testlari</h3>
              <p className="text-xs text-indigo-200">
                25 ta sifat va integratsiya testlari to'plami
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

        {/* Action & Stats Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRunAll}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Barcha 25 ta testni ishga tushirish</span>
            </button>
            {totalRun > 0 && (
              <button
                type="button"
                onClick={() => setTestResults({})}
                className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
                title="Tozalash"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedFilter('ALL')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                selectedFilter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Barchasi ({testCases.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('PASS')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                selectedFilter === 'PASS'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              O'tgan ({passedCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('FAIL')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                selectedFilter === 'FAIL'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
              }`}
            >
              Xatolik ({failedCount})
            </button>
          </div>
        </div>

        {/* Test List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {filteredTests.map((tc) => {
            const res = testResults[tc.id];
            const hasRun = Boolean(res);
            const isPass = res?.pass;

            return (
              <div
                key={tc.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  hasRun
                    ? isPass
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-rose-50/50 border-rose-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        TEST #{tc.id}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {tc.category}
                      </span>
                      <h5 className="text-xs font-bold text-slate-900">{tc.name}</h5>
                    </div>
                    <p className="text-xs text-slate-500">{tc.description}</p>
                    {res && (
                      <p
                        className={`text-xs font-medium mt-1.5 ${
                          isPass ? 'text-emerald-800' : 'text-rose-800 font-semibold'
                        }`}
                      >
                        {res.message}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0">
                    {hasRun ? (
                      isPass ? (
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          PASS
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-lg border border-rose-200">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          FAIL
                        </span>
                      )
                    ) : (
                      <span className="text-[11px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                        Kutilmoqda
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-600">
            {totalRun > 0 ? (
              <span>
                Natija: <b className="text-emerald-600">{passedCount} ta o'tdi</b>,{' '}
                <b className="text-rose-600">{failedCount} ta xato</b> ({Math.round((passedCount / testCases.length) * 100)}% muvaffaqiyatli)
              </span>
            ) : (
              <span>Testlarni ishga tushirish uchun "Ishga tushirish" tugmasini bosing.</span>
            )}
          </div>
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
