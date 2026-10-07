import React, { useState, useEffect } from 'react';
import { Printer, X, Download } from 'lucide-react';
import { DailyJournal, Student, Practice, PracticePlace, Supervisor, Faculty, Group, JournalTemplate } from '../../../types';
import { journalTemplateService } from '../../../services/journalTemplateService';
import { storageService } from '../../../services/storageService';

interface DailyJournalPrintViewProps {
  journal: DailyJournal;
  student?: Student;
  practice?: Practice;
  practicePlace?: PracticePlace;
  supervisor?: Supervisor;
  faculty?: Faculty;
  group?: Group;
  onClose: () => void;
}

export function DailyJournalPrintView({
  journal,
  student,
  practice,
  practicePlace,
  supervisor,
  faculty,
  group,
  onClose
}: DailyJournalPrintViewProps) {
  const [template, setTemplate] = useState<JournalTemplate | null>(null);

  useEffect(() => {
      if (journal.templateId) {
          journalTemplateService.getTemplateById(journal.templateId).then(setTemplate);
      }
  }, [journal.templateId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      {/* Control bar */}
      <div className="fixed top-4 right-4 flex items-center gap-2 z-50 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg font-bold text-xs transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Chop etish (Print / PDF)</span>
        </button>
        <button
          onClick={onClose}
          className="p-2 bg-white/90 hover:bg-white text-slate-700 rounded-lg shadow-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Printable Sheet (Standard A4 Medical Diary Blank) */}
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl p-8 sm:p-12 my-8 print:m-0 print:p-6 print:shadow-none print:w-full print:max-w-none text-slate-900 font-serif leading-relaxed">
        {/* Header */}
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
          <p className="text-[11px] uppercase tracking-widest font-sans font-bold text-slate-700">
            O'ZBEKISTON RESPUBLIKASI SOG'LIQNI SAQLASH VAZIRLIGI
          </p>
          <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 mt-1">
            TOSHKENT TIBBIYOT AKADEMIYASI
          </h2>
          <p className="text-xs italic text-slate-600 font-sans mt-0.5">
            O'quv-uslubiy boshqarma • Talabalar amaliyoti bo'limi
          </p>
          <div className="inline-block mt-3 px-4 py-1 border border-slate-900 font-sans font-black text-xs uppercase tracking-widest">
            TALABANING KUNLIK AMALIYOT KUNDALIGI (DIARY)
          </div>
        </div>

        {/* Student & Practice Meta Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs font-sans border-b border-slate-300 pb-4 mb-5">
          <div>
            <span className="text-slate-500 font-normal">Talaba F.I.Sh.: </span>
            <strong className="text-slate-900 font-bold">{student?.fullName || 'Olimov Sardor Botir o\'g\'li'}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-normal">Sana va kun: </span>
            <strong className="text-slate-900 font-bold">{journal.date}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-normal">Fakultet / Guruh: </span>
            <span className="font-semibold text-slate-800">{faculty?.name || '1-Davolash fakulteti'} / {group?.name || '401-guruh'}</span>
          </div>
          <div>
            <span className="text-slate-500 font-normal">Davomat vaqti: </span>
            <span className="font-semibold text-slate-800 font-mono">
              Kelish: {journal.attendanceSnapshot?.checkInTime || '08:15'} — Ketish: {journal.attendanceSnapshot?.checkOutTime || '14:30'} ({journal.attendanceSnapshot?.status || 'PRESENT'})
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-normal">Klinik baza (shifoxona): </span>
            <span className="font-semibold text-slate-800">{practicePlace?.name || journal.attendanceSnapshot?.practicePlaceName || 'Respublika 1-son Klinik Shifoxonasi'}</span>
          </div>
          <div>
            <span className="text-slate-500 font-normal">Klinik bo'lim: </span>
            <span className="font-semibold text-slate-800">{journal.department}</span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-500 font-normal">Amaliyot rahbari: </span>
            <span className="font-semibold text-slate-800">{supervisor?.fullName || journal.attendanceSnapshot?.supervisorName || 'Prof. Sobirov Alisher Tolipovich'}</span>
          </div>
        </div>

        {/* Content Section */}
        {template && template.id === 'PSYCHOLOGY_DAILY' ? (
          <div className="space-y-4 mb-6">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              3. Amaliyot kundaligi (Psixologiya)
            </h4>
            {template.fields.sort((a, b) => a.order - b.order).map(field => (
                <div key={field.key} className="border-b border-slate-100 pb-2">
                    <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">{field.label}:</p>
                    <p className="text-xs text-slate-800 font-serif leading-relaxed mt-1">
                        {String(journal.activityData?.[field.key] || '---')}
                    </p>
                </div>
            ))}
          </div>
        ) : (
          <>
            {/* 1. Bajarilgan ishlar */}
            <div className="space-y-2 mb-5">
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                1. Bugun bajarilgan ishlar tavsifi
              </h4>
              <p className="text-xs text-justify leading-relaxed whitespace-pre-wrap pl-2">
                {journal.workSummary || 'Ishlar tavsifi ko\'rsatilmagan.'}
              </p>
            </div>

            {/* 2. Ko'rilgan bemorlar va Muolajalar Jadvali */}
            <div className="space-y-2 mb-5 font-sans">
              <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  2. Bajarilgan muolajalar va ko'rilgan bemorlar
                </h4>
                <span className="text-xs font-semibold text-slate-700">
                  Bemorlar soni: {journal.patientsExaminedCount} nafar
                </span>
              </div>

              <table className="w-full text-xs border border-slate-300 text-left">
                <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-300 w-12 text-center">№</th>
                    <th className="p-2 border-r border-slate-300">Muolaja / Manipulyatsiya nomi</th>
                    <th className="p-2 border-r border-slate-300 w-20 text-center">Soni</th>
                    <th className="p-2 w-36 text-center">Ishtirok darajasi</th>
                  </tr>
                </thead>
                <tbody>
                  {journal.procedures && journal.procedures.length > 0 ? (
                    journal.procedures.map((p, idx) => (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="p-2 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                        <td className="p-2 border-r border-slate-300 font-medium">{p.name}</td>
                        <td className="p-2 border-r border-slate-300 text-center font-bold">{p.count}</td>
                        <td className="p-2 text-center text-slate-600">{p.participationType}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-3 text-center text-slate-400 italic">
                        Bajarilgan muolajalar qayd etilmagan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 3. Klinik holatlar tahlili */}
            {journal.clinicalCases && journal.clinicalCases.length > 0 && (
              <div className="space-y-2 mb-5">
                <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                  3. Klinik holatlar tahlili (Keys kuratsiyasi)
                </h4>
                {journal.clinicalCases.map((c, i) => (
                  <div key={i} className="text-xs pl-2 space-y-1">
                    <p>
                      <strong>Klinik tashxis:</strong> {c.caseTitle} {c.patientAgeGender ? `(${c.patientAgeGender})` : ''}
                    </p>
                    {c.complaints && <p><strong>Shikoyat va anamnez:</strong> {c.complaints} {c.anamnesis}</p>}
                    {c.treatmentTactics && <p><strong>Davo taktikasi:</strong> {c.treatmentTactics}</p>}
                    {c.learnedAspect && <p className="italic text-slate-700"><strong>Talabaning xulosasi:</strong> {c.learnedAspect}</p>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* 4. O'z-o'zini tahlil va nazariya */}
        <div className="grid grid-cols-2 gap-4 text-xs font-sans border-t border-slate-200 pt-3 mb-6">
          <div>
            <h5 className="font-bold text-[11px] uppercase text-slate-800 mb-1">O'rganilgan mavzular:</h5>
            <p className="text-slate-700 font-serif leading-relaxed">
              {journal.topicsLearned || journal.questionsLearned || 'Klinik protokol va metodik tavsiyalar.'}
            </p>
          </div>
          <div>
            <h5 className="font-bold text-[11px] uppercase text-slate-800 mb-1">Talabaning o'z-o'zini baholashi:</h5>
            <p className="text-slate-700 font-serif leading-relaxed">
              {typeof journal.selfReflection === 'object' && journal.selfReflection !== null
                ? ((journal.selfReflection as any).whatLearned || (journal.selfReflection as any).skillsImproved || 'Amaliy ko\'nikmalar mustahkamlandi.')
                : (journal.selfReflection || 'Amaliy ko\'nikmalar mustahkamlandi.')}
            </p>
          </div>
        </div>

        {/* 5. Rahbar xulosasi va Bahosi */}
        <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-sans space-y-2 mb-8">
          <div className="flex justify-between items-center font-bold">
            <span>AMALIYOT RAHBARI XULOSASI VA TAQRIZI:</span>
            <span className="text-sm font-black text-slate-900">
              BAHO: {journal.supervisorRating ? `${journal.supervisorRating} (Beshta)` : '5 (Baho qo\'yildi)'}
            </span>
          </div>
          <p className="italic font-serif text-slate-800">
            "{journal.supervisorFeedback || 'Kundalik to\'g\'ri yuritilgan. Bemorlar kuratsiyasi va klinik tafakkur talabga javob beradi.'}"
          </p>
          <p className="text-[11px] text-slate-500">
            Tekshirdi: {journal.reviewedBy || supervisor?.fullName || 'Prof. Sobirov Alisher Tolipovich'}
          </p>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-6 text-xs font-sans text-center pt-4 border-t border-slate-400">
          <div>
            <div className="border-b border-slate-400 h-8 mb-1"></div>
            <span className="text-slate-600 block text-[10px]">Talaba imzosi</span>
            <strong className="text-slate-800 text-[11px]">{student?.fullName}</strong>
          </div>
          <div>
            <div className="border-b border-slate-400 h-8 mb-1"></div>
            <span className="text-slate-600 block text-[10px]">Bo'lim mas'uli / Rahbar imzosi</span>
            <strong className="text-slate-800 text-[11px]">{journal.reviewedBy || supervisor?.fullName}</strong>
          </div>
          <div>
            <div className="border-b border-slate-400 h-8 mb-1"></div>
            <span className="text-slate-600 block text-[10px]">Klinik baza muhri (M.O'.)</span>
            <span className="text-[10px] text-slate-400 italic">Muhr o'rni</span>
          </div>
        </div>
      </div>
    </div>
  );
}
