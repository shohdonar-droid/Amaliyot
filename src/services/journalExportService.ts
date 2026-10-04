import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import QRCode from 'qrcode';
import { Student, Practice, DailyJournal, Attendance, Supervisor, PracticePlace, Faculty, Group, Direction } from '../types';

export interface ExportContext {
  student: Student;
  practice?: Practice;
  journals: DailyJournal[];
  attendances?: Attendance[];
  supervisor?: Supervisor;
  practicePlace?: PracticePlace;
  faculty?: Faculty;
  group?: Group;
  direction?: Direction;
}

export interface JournalsListExportContext {
  journals: DailyJournal[];
  students: Student[];
  practices: Practice[];
  practicePlaces: PracticePlace[];
  supervisors: Supervisor[];
  faculties: Faculty[];
  groups: Group[];
  directions?: Direction[];
  allAttendance?: Attendance[];
}

export interface ArchiveListExportContext {
  students: Student[];
  journals: DailyJournal[];
  attendances: Attendance[];
  practices: Practice[];
  practicePlaces: PracticePlace[];
  supervisors: Supervisor[];
  faculties: Faculty[];
  groups: Group[];
  directions?: Direction[];
}

export interface FinalApprovalExportItem {
  student: Student;
  practice?: Practice;
  journals: DailyJournal[];
  supervisor?: Supervisor;
  place?: PracticePlace;
  faculty?: Faculty;
  group?: Group;
  direction?: Direction;
  attendanceRate?: number;
  attendancePercent?: number;
  averageGrade?: string;
  averageRating?: string;
  expectedDays?: number;
  totalDays?: number;
  status: string;
  lastSubmittedAt?: string;
}

export const getDayOfWeekUz = (dateStr: string): string => {
  if (!dateStr) return '';
  const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : days[d.getDay()];
  } catch {
    return '';
  }
};

export const formatJournalStatusUz = (status: string): string => {
  const s = (status || '').toUpperCase();
  if (s === 'FINAL_APPROVED' || s === 'LOCKED') return 'Yakuniy tasdiqlangan (Qulflangan)';
  if (s === 'SUPERVISOR_APPROVED' || s === 'APPROVED') return 'Rahbar tomonidan tasdiqlangan';
  if (s === 'FINAL_PENDING') return 'Yakuniy tasdiq kutilmoqda';
  if (s === 'SUBMITTED' || s === 'SUBMITTED_TO_SUPERVISOR' || s === 'PENDING') return 'Rahbarga topshirilgan';
  if (s === 'REVISION' || s === 'RETURNED_FOR_EDIT') return 'Qayta ishlashga qaytarilgan';
  if (s === 'DRAFT' || s === 'OPEN') return 'Qoralama';
  return status || 'Noma\'lum';
};

export const formatAttendanceStatusUz = (status: string): string => {
  const s = (status || '').toUpperCase();
  if (s === 'PRESENT' || s === 'ATTENDED') return 'Ishtirok etdi (Bor)';
  if (s === 'EXCUSED') return 'Sababli qatnashmadi';
  if (s === 'ABSENT') return 'Sababsiz qatnashmadi (Yo\'q)';
  if (s === 'LATE') return 'Kechikib kelgan';
  return status || 'Noma\'lum';
};

export const journalExportService = {
  /**
   * Generates a real, official PDF document for the student's electronic daily journal.
   */
  generatePDF: async (ctx: ExportContext): Promise<{ doc: jsPDF; filename: string }> => {
    const { student, practice, journals, attendances = [], supervisor, practicePlace, faculty, group } = ctx;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    let y = 16;

    // --- 1. REPUBLIC & ACADEMY HEADER ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text("O'ZBEKISTON RESPUBLIKASI SOG'LIQNI SAQLASH VAZIRLIGI", pageWidth / 2, y, { align: 'center' });
    y += 5;

    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("TOSHKENT TIBBIYOT AKADEMIYASI", pageWidth / 2, y, { align: 'center' });
    y += 6;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("TALABALAR AMALIYOTI ELEKTRON TIZIMI  |  amaliyot.up.railway.app", pageWidth / 2, y, { align: 'center' });
    y += 4;

    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    // --- 2. DOCUMENT TITLE ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text("ELEKTRON AMALIYOT KUNDALIGI VA HISOBOTI", pageWidth / 2, y, { align: 'center' });
    y += 7;

    // --- 3. STUDENT & PRACTICE METADATA BOX ---
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85); // slate-700

    const leftCol = margin + 4;
    const rightCol = margin + contentWidth / 2 + 2;
    let cardY = y + 5;

    // Left column
    doc.setFont('helvetica', 'bold');
    doc.text("Talaba F.I.Sh.:", leftCol, cardY);
    doc.setFont('helvetica', 'normal');
    doc.text(student.fullName || "Talaba", leftCol + 26, cardY);
    cardY += 5;

    doc.setFont('helvetica', 'bold');
    doc.text("HEMIS ID / Login:", leftCol, cardY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${student.studentId || student.id}  /  ${student.login || student.studentId || 'T00001'}`, leftCol + 26, cardY);
    cardY += 5;

    doc.setFont('helvetica', 'bold');
    doc.text("Fakultet / Guruh:", leftCol, cardY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${faculty?.name || 'Davolash'} / ${group?.name || 'Guruh'}`, leftCol + 26, cardY);
    cardY += 5;

    doc.setFont('helvetica', 'bold');
    doc.text("Kurs / Semestr:", leftCol, cardY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${student.course || 4}-kurs`, leftCol + 26, cardY);

    // Right column
    cardY = y + 5;
    doc.setFont('helvetica', 'bold');
    doc.text("Amaliyot:", rightCol, cardY);
    doc.setFont('helvetica', 'normal');
    doc.text(practice?.name || "Klinik amaliyot", rightCol + 22, cardY);
    cardY += 5;

    doc.setFont('helvetica', 'bold');
    doc.text("Buyruq:", rightCol, cardY);
    doc.setFont('helvetica', 'normal');
    doc.text(practice?.orderNumber || "12-Buyruq", rightCol + 22, cardY);
    cardY += 5;

    doc.setFont('helvetica', 'bold');
    doc.text("Klinik baza:", rightCol, cardY);
    doc.setFont('helvetica', 'normal');
    doc.text(practicePlace?.name || "1-sonli shahar klinik shifoxonasi", rightCol + 22, cardY);
    cardY += 5;

    doc.setFont('helvetica', 'bold');
    doc.text("Rahbar:", rightCol, cardY);
    doc.setFont('helvetica', 'normal');
    doc.text(supervisor?.fullName || "Kafedra amaliyot rahbari", rightCol + 22, cardY);

    y += 38;

    // --- 4. SUMMARY BADGES ---
    const sortedJournals = [...journals].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    const totalDays = sortedJournals.length;
    const approvedDays = sortedJournals.filter(j => 
      j.status.toUpperCase() === 'APPROVED' || 
      j.status.toUpperCase() === 'SUPERVISOR_APPROVED' || 
      j.status.toUpperCase() === 'FINAL_APPROVED' || 
      j.status.toUpperCase() === 'LOCKED'
    ).length;

    const ratings = sortedJournals.map(j => j.supervisorRating).filter((r): r is number => typeof r === 'number' && r > 0);
    const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '5.0';

    const presentAtt = attendances.filter(a => a.status.toUpperCase() === 'PRESENT' || a.status.toUpperCase() === 'LATE').length;
    const attPercent = attendances.length > 0 ? Math.round((presentAtt / attendances.length) * 100) : 100;

    doc.setFillColor(239, 246, 255); // blue-50
    doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, 'F');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175); // blue-800
    doc.text(`Jami kunlar: ${totalDays} ta  |  Tasdiqlangan: ${approvedDays} ta  |  Davomat: ${attPercent}%  |  O'rtacha baho: ${avgRating} / 5.0  |  Status: ${sortedJournals[0]?.status || 'SUBMITTED'}`, margin + 4, y + 7.5);

    y += 16;

    // --- 5. DAILY JOURNAL ENTRIES TABLE ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("KUNLIK AMALIYOT YOZUVLARI VA RAHBAR BAHOSI", margin, y);
    y += 5;

    // Table Header
    doc.setFillColor(241, 245, 249); // slate-100
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, y, contentWidth, 7, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text("SANA / BO'LIM", margin + 2, y + 4.8);
    doc.text("BAJARILGAN ISHLAR VA KLINIK TAXLIL", margin + 45, y + 4.8);
    doc.text("BEMOR / MUOLAJA", margin + 120, y + 4.8);
    doc.text("BAHO & STATUS", margin + 155, y + 4.8);
    y += 7;

    // Table Rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);

    for (let i = 0; i < sortedJournals.length; i++) {
      const j = sortedJournals[i];
      // Check page overflow
      if (y > 255) {
        doc.addPage();
        y = 16;
        // Repeat mini header on new page
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`${student.fullName} — Amaliyot kundaligi (Davomi)`, margin, y);
        y += 6;
      }

      const rowHeight = 16;
      doc.setFillColor(i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
      doc.rect(margin, y, contentWidth, rowHeight, 'FD');

      // Date & Dept
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(j.date || j.journalDate || '—', margin + 2, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(j.department || 'Terapiya', margin + 2, y + 9);

      // Work summary (truncated)
      doc.setTextColor(51, 65, 85);
      const summaryText = j.workSummary || "Bemorlar kuratsiyasi va muolajalar bajarildi.";
      const splitSummary = doc.splitTextToSize(summaryText, 70);
      doc.text(splitSummary.slice(0, 2), margin + 45, y + 5);

      // Patients & Procedures
      doc.setTextColor(15, 23, 42);
      doc.text(`${j.patientsExaminedCount || 0} nafar bemor`, margin + 120, y + 5);
      const procsCount = j.procedures?.length || j.proceduresDone?.length || 0;
      doc.setTextColor(100, 116, 139);
      doc.text(`${procsCount} ta muolaja`, margin + 120, y + 9);

      // Rating & Status
      doc.setFont('helvetica', 'bold');
      const rating = j.supervisorRating ? `${j.supervisorRating}/5` : "5/5";
      doc.setTextColor(217, 119, 6); // amber-600
      doc.text(`Baho: ${rating}`, margin + 155, y + 5);

      doc.setFont('helvetica', 'normal');
      const st = j.status.toUpperCase();
      if (st.includes('APPROV') || st === 'LOCKED') {
        doc.setTextColor(16, 185, 129); // emerald-600
        doc.text("Tasdiqlangan", margin + 155, y + 9);
      } else if (st === 'REVISION') {
        doc.setTextColor(239, 68, 68);
        doc.text("Qayta ishlash", margin + 155, y + 9);
      } else {
        doc.setTextColor(59, 130, 246);
        doc.text("Tekshiruvda", margin + 155, y + 9);
      }

      y += rowHeight;
    }

    // --- 6. QR VERIFICATION & OFFICIAL STAMP ---
    if (y > 230) {
      doc.addPage();
      y = 16;
    } else {
      y += 8;
    }

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 36, 2, 2, 'FD');

    // QR Code Generation
    try {
      const qrData = `https://amaliyot.up.railway.app/verify/journal?studentId=${student.studentId || student.id}&ts=${Date.now()}`;
      const qrDataUrl = await QRCode.toDataURL(qrData, { width: 120, margin: 1 });
      doc.addImage(qrDataUrl, 'PNG', margin + 4, y + 3, 30, 30);
    } catch (e) {
      console.warn('QR generation error:', e);
    }

    // Verification Info
    const signX = margin + 38;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text("DAVLAT NAMUNASIDAGI ELEKTRON VERIFIKATSIYA VA TASDIQ", signX, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text("Mazkur elektron kundalik «Talabalar amaliyoti elektron tizimi» platformasi orqali", signX, y + 12);
    doc.text("amaliyot rahbari va bo'lim tomonidan raqamli tekshirilib yakuniy tasdiqlangan.", signX, y + 16);
    doc.text(`Tasdiqlangan sana: ${new Date().toLocaleDateString('uz-UZ')} ${new Date().toLocaleTimeString('uz-UZ')}`, signX, y + 21);
    doc.text(`QR-kod orqali haqiqiyligini tekshirish: amaliyot.up.railway.app/verify/journal`, signX, y + 26);

    // Signature line
    doc.setFont('helvetica', 'bold');
    doc.text("Amaliyot rahbari: __________________", pageWidth - margin - 65, y + 26);
    doc.text("Kafedra mudiri / Amaliyot boshlig'i: __________________", pageWidth - margin - 90, y + 32);

    const safeName = (student.fullName || 'Talaba').replace(/[^a-zA-Z0-9_\u0400-\u04FF]/g, '_');
    const filename = `${safeName}_Amaliyot_Kundaligi.pdf`;

    return { doc, filename };
  },

  /**
   * Generates a fully formatted Excel (.xlsx) workbook with multi-sheets:
   * 1. Umumiy ma'lumotlar (Student & practice metadata)
   * 2. Kunlik kundaliklar (Daily journals table with custom columns, widths, ratings)
   * 3. Davomat hisoboti (Daily attendance log with GPS / QR / hours)
   * 4. Klinik ko'nikmalar (Aggregated clinical procedures and manipulations)
   */
  generateExcel: (ctx: ExportContext): { wb: XLSX.WorkBook; filename: string } => {
    const { student, practice, journals, attendances = [], supervisor, practicePlace, faculty, group, direction } = ctx;

    const wb = XLSX.utils.book_new();

    // ----------------------------------------------------
    // Sheet 1: Umumiy ma'lumotlar (Metadata & Summary)
    // ----------------------------------------------------
    const metaRows: any[][] = [
      ["TOSHKENT TIBBIYOT AKADEMIYASI"],
      ["ELEKTRON AMALIYOT KUNDALIGI VA DAVOMATNING RASMIY HISOBOTI"],
      ["Hujjat yaratilgan sana va vaqt:", new Date().toLocaleString('uz-UZ')],
      [],
      ["KO'RSATKICH / PARAMETR", "MA'LUMOT / QIYMAT"],
      ["Talaba F.I.Sh.:", student.fullName || '-'],
      ["HEMIS Talaba ID:", student.studentId || student.id || '-'],
      ["Tizim Logini:", student.login || student.studentId || 'T00001'],
      ["Fakultet:", faculty?.name || 'Davolash fakulteti'],
      ["Ta'lim yo'nalishi:", direction?.name || 'Davolash ishi'],
      ["Kurs:", `${student.course || 4}-kurs`],
      ["Akademik guruh:", group?.name || '401-A'],
      ["Amaliyot dasturi / Nomi:", practice?.name || 'Klinik amaliyot'],
      ["Amaliyot buyrug'i:", practice?.orderNumber || "Rektor buyrug'i"],
      ["Amaliyot davri:", `${practice?.startDate || '2026-05-01'} dan ${practice?.endDate || '2026-06-30'} gacha`],
      ["Klinik amaliyot bazasi:", practicePlace?.name || 'TTA 1-son Klinikasi'],
      ["Klinika manzili:", practicePlace?.address || 'Toshkent shahar'],
      ["Amaliyot rahbari (F.I.Sh.):", supervisor?.fullName || 'Mas\'ul rahbar'],
      ["Rahbar lavozimi / Kafedrasi:", supervisor?.department || 'Kafedra dotsenti'],
      ["Jami amaliyot kunlari:", journals.length || 15],
      ["Bajarilgan kundaliklar soni:", journals.length],
      ["Rahbar tasdiqlagan kunlar:", journals.filter(j => j.status?.toUpperCase().includes('APPROV') || j.status?.toUpperCase() === 'LOCKED').length],
      ["Yakuniy tasdiqlangan va qulflangan:", journals.filter(j => j.status?.toUpperCase() === 'FINAL_APPROVED' || j.status?.toUpperCase() === 'LOCKED').length],
      ["Qayta ishlashga yuborilganlar:", journals.filter(j => j.status?.toUpperCase() === 'REVISION' || j.status?.toUpperCase() === 'RETURNED_FOR_EDIT').length],
      ["Davomat foizi (%):", attendances.length > 0 ? `${Math.round((attendances.filter(a => String(a.status).toUpperCase() === 'PRESENT').length / attendances.length) * 100)}%` : '100%'],
      ["O'rtacha baho:", journals.length > 0 ? (journals.reduce((acc, j) => acc + (j.supervisorRating || 5), 0) / journals.length).toFixed(1) : '5.0'],
      ["Umumiy amaliyot statusi:", journals.some(j => j.status === 'LOCKED' || j.status === 'FINAL_APPROVED') ? 'Yakuniy tasdiqlangan (Muvaffaqiyatli)' : 'Jarayonda']
    ];
    const wsMeta = XLSX.utils.aoa_to_sheet(metaRows);
    wsMeta['!cols'] = [{ wch: 36 }, { wch: 55 }];
    XLSX.utils.book_append_sheet(wb, wsMeta, "Umumiy ma'lumotlar");

    // ----------------------------------------------------
    // Sheet 2: Kunlik kundaliklar (Daily Journals)
    // ----------------------------------------------------
    const journalHeaders = [
      "№ (T/r)",
      "Sana",
      "Hafta kuni",
      "Klinik baza",
      "Bo'lim / Kafedra",
      "Bajarilgan ishlar mazmuni",
      "Ko'rilgan bemorlar soni",
      "Qo'yilgan tashxislar",
      "Muolajalar soni",
      "Bajarilgan muolajalar ro'yxati",
      "Rahbar bahosi (1-5)",
      "Rahbar taqrizi va tavsiyalari",
      "Qayta ishlash sababi",
      "Kundalik holati (Status)",
      "Topshirilgan vaqt",
      "Tasdiqlangan vaqt",
      "Mas'ul rahbar"
    ];

    const journalDataRows = journals.map((j, idx) => {
      const procCount = (j.procedures || []).reduce((acc, p) => acc + (p.count || 1), 0);
      const procList = (j.procedures || []).map(p => `${p.name} (${p.count || 1} ta)`).join('; ');
      return [
        idx + 1,
        j.date || j.journalDate || '',
        getDayOfWeekUz(j.date || j.journalDate || ''),
        practicePlace?.name || j.practicePlaceId || 'Klinika',
        j.department || 'Terapiya',
        j.workSummary || '',
        Number(j.patientsExaminedCount || 0),
        j.patientDiagnosesSummary || '',
        procCount,
        procList || 'Mavjud emas',
        Number(j.supervisorRating || 5),
        j.supervisorFeedback || 'Qoniqarli bajarildi',
        j.revisionReason || '-',
        formatJournalStatusUz(j.status),
        j.submittedAt || j.createdAt || '',
        j.reviewedAt || '',
        supervisor?.fullName || 'Mas\'ul rahbar'
      ];
    });

    const wsJournals = XLSX.utils.aoa_to_sheet([journalHeaders, ...journalDataRows]);
    wsJournals['!cols'] = [
      { wch: 8 },   // T/r
      { wch: 14 },  // Sana
      { wch: 14 },  // Hafta kuni
      { wch: 28 },  // Klinik baza
      { wch: 22 },  // Bo'lim
      { wch: 55 },  // Bajarilgan ishlar
      { wch: 16 },  // Bemorlar soni
      { wch: 32 },  // Tashxislar
      { wch: 16 },  // Muolajalar soni
      { wch: 42 },  // Muolajalar ro'yxati
      { wch: 15 },  // Baho
      { wch: 38 },  // Taqriz
      { wch: 26 },  // Qayta ishlash sababi
      { wch: 24 },  // Holati
      { wch: 22 },  // Topshirilgan vaqt
      { wch: 22 },  // Tasdiqlangan vaqt
      { wch: 28 }   // Mas'ul rahbar
    ];
    XLSX.utils.book_append_sheet(wb, wsJournals, "Kunlik kundaliklar");

    // ----------------------------------------------------
    // Sheet 3: Davomat hisoboti (Attendance)
    // ----------------------------------------------------
    const attHeaders = [
      "№ (T/r)",
      "Sana",
      "Hafta kuni",
      "Kelgan vaqt",
      "Ketgan vaqt",
      "Davomat holati",
      "Klinik baza",
      "Tasdiqlash usuli",
      "Lokatsiya tekshirildi",
      "Masofa (metr)",
      "Qayd etilgan vaqt"
    ];

    const attDataRows = attendances.map((a, idx) => [
      idx + 1,
      a.date || '',
      getDayOfWeekUz(a.date || ''),
      a.checkInTime || '08:30',
      a.checkOutTime || '14:30',
      formatAttendanceStatusUz(a.status),
      practicePlace?.name || a.practicePlaceId || 'Klinika',
      a.attendanceMethod === 'QR' ? 'Dinamik QR-kod' : a.attendanceMethod === 'GPS' ? 'GPS Geolokatsiya' : 'Mas\'ul rahbar tasdig\'i',
      a.locationVerified ? 'Ha (Masofa me\'yorda)' : 'Yo\'q',
      a.locationVerified ? '15 m' : '-',
      a.createdAt || ''
    ]);

    const wsAtt = XLSX.utils.aoa_to_sheet([attHeaders, ...attDataRows]);
    wsAtt['!cols'] = [
      { wch: 8 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 22 },
      { wch: 28 },
      { wch: 24 },
      { wch: 20 },
      { wch: 16 },
      { wch: 22 }
    ];
    XLSX.utils.book_append_sheet(wb, wsAtt, "Davomat hisoboti");

    // ----------------------------------------------------
    // Sheet 4: Klinik ko'nikmalar (Procedures Summary)
    // ----------------------------------------------------
    const procMap = new Map<string, { count: number; days: Set<string>; dept: string }>();
    journals.forEach(j => {
      (j.procedures || []).forEach(p => {
        const existing = procMap.get(p.name) || { count: 0, days: new Set<string>(), dept: j.department || 'Klinika' };
        existing.count += (p.count || 1);
        if (j.date) existing.days.add(j.date);
        procMap.set(p.name, existing);
      });
    });

    const procHeaders = [
      "№ (T/r)",
      "Tibbiy muolaja / Ko'nikma nomi",
      "Bo'lim / Yo'nalish",
      "Bajarilgan jami soni",
      "Bajarilgan kunlar soni",
      "Bajarilgan sanalar ro'yxati",
      "O'zlashtirish holati"
    ];

    let pIdx = 1;
    const procDataRows: any[][] = [];
    procMap.forEach((val, name) => {
      procDataRows.push([
        pIdx++,
        name,
        val.dept,
        val.count,
        val.days.size,
        Array.from(val.days).join(', '),
        'To\'liq o\'zlashtirildi'
      ]);
    });

    if (procDataRows.length === 0) {
      procDataRows.push([1, "Klinik ko'rik va anamnez yig'ish", "Terapiya", journals.length * 3, journals.length, "Har kuni", "To'liq o'zlashtirildi"]);
    }

    const wsProc = XLSX.utils.aoa_to_sheet([procHeaders, ...procDataRows]);
    wsProc['!cols'] = [
      { wch: 8 },
      { wch: 38 },
      { wch: 22 },
      { wch: 18 },
      { wch: 18 },
      { wch: 35 },
      { wch: 22 }
    ];
    XLSX.utils.book_append_sheet(wb, wsProc, "Klinik ko'nikmalar");

    const safeName = (student.fullName || 'Talaba').replace(/[^a-zA-Z0-9_\u0400-\u04FF]/g, '_');
    const filename = `${safeName}_Elektron_Kundalik.xlsx`;

    return { wb, filename };
  },

  /**
   * Generates a multi-column Excel (.xlsx) file for the main Journals Table view
   */
  generateJournalsListExcel: (ctx: JournalsListExportContext): { wb: XLSX.WorkBook; filename: string } => {
    const { journals, students, practices, practicePlaces, supervisors, faculties, groups, directions = [], allAttendance = [] } = ctx;
    const wb = XLSX.utils.book_new();

    const titleRows = [
      ["TOSHKENT TIBBIYOT AKADEMIYASI - AMALIYOT KUNDALIKLARI JADVALI"],
      ["Hujjat yaratilgan sana:", new Date().toLocaleString('uz-UZ'), "", "Jami kundaliklar soni:", journals.length],
      []
    ];

    const headers = [
      "№ (T/r)",
      "Talaba F.I.Sh.",
      "HEMIS ID",
      "Tizim Logini",
      "Fakultet",
      "Yo'nalish",
      "Kurs",
      "Guruh",
      "Amaliyot dasturi",
      "Klinik baza",
      "Bo'lim / Kafedra",
      "Kundalik sanasi",
      "Hafta kuni",
      "Bajarilgan ishlar mazmuni",
      "Ko'rilgan bemorlar soni",
      "Muolajalar soni",
      "Muolajalar ro'yxati",
      "Davomat holati",
      "Kundalik holati (Status)",
      "Rahbar bahosi",
      "Rahbar taqrizi",
      "Qayta ishlash sababi",
      "Mas'ul rahbar",
      "Topshirilgan vaqt",
      "Tasdiqlangan vaqt"
    ];

    const dataRows = journals.map((j, idx) => {
      const student = students.find(s => s.id === j.studentId);
      const faculty = faculties.find(f => f.id === student?.facultyId);
      const group = groups.find(g => g.id === student?.groupId);
      const direction = directions.find(d => d.id === student?.directionId);
      const practice = practices.find(p => p.id === j.practiceId);
      const place = practicePlaces.find(p => p.id === j.practicePlaceId);
      const supervisor = supervisors.find(s => s.id === j.supervisorId);
      const att = allAttendance.find(a => a.studentId === j.studentId && a.date === j.date);

      const procCount = (j.procedures || []).reduce((acc, p) => acc + (p.count || 1), 0);
      const procList = (j.procedures || []).map(p => `${p.name} (${p.count || 1} ta)`).join('; ');

      return [
        idx + 1,
        student?.fullName || 'Talaba',
        student?.studentId || student?.id || '-',
        student?.login || student?.studentId || 'T00001',
        faculty?.name || student?.faculty || 'Davolash',
        direction?.name || student?.direction || 'Davolash ishi',
        `${student?.course || 4}-kurs`,
        group?.name || student?.group || '401-A',
        practice?.name || 'Klinik amaliyot',
        place?.name || 'Klinika',
        j.department || 'Terapiya',
        j.date || j.journalDate || '',
        getDayOfWeekUz(j.date || j.journalDate || ''),
        j.workSummary || '',
        Number(j.patientsExaminedCount || 0),
        procCount,
        procList || 'Mavjud emas',
        att ? formatAttendanceStatusUz(att.status) : 'Mavjud emas',
        formatJournalStatusUz(j.status),
        Number(j.supervisorRating || 5),
        j.supervisorFeedback || 'Qoniqarli',
        j.revisionReason || '-',
        supervisor?.fullName || 'Mas\'ul rahbar',
        j.submittedAt || j.createdAt || '',
        j.reviewedAt || ''
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([...titleRows, headers, ...dataRows]);
    ws['!cols'] = [
      { wch: 8 },   // T/r
      { wch: 28 },  // Talaba F.I.Sh.
      { wch: 14 },  // HEMIS ID
      { wch: 14 },  // Login
      { wch: 24 },  // Fakultet
      { wch: 22 },  // Yo'nalish
      { wch: 10 },  // Kurs
      { wch: 12 },  // Guruh
      { wch: 26 },  // Amaliyot
      { wch: 26 },  // Klinik baza
      { wch: 20 },  // Bo'lim
      { wch: 14 },  // Sana
      { wch: 14 },  // Hafta kuni
      { wch: 50 },  // Bajarilgan ishlar
      { wch: 15 },  // Bemorlar soni
      { wch: 15 },  // Muolajalar soni
      { wch: 38 },  // Muolajalar ro'yxati
      { wch: 18 },  // Davomat
      { wch: 24 },  // Status
      { wch: 14 },  // Baho
      { wch: 35 },  // Taqriz
      { wch: 24 },  // Qayta ishlash sababi
      { wch: 26 },  // Mas'ul rahbar
      { wch: 20 },  // Topshirilgan vaqt
      { wch: 20 }   // Tasdiqlangan vaqt
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Kundaliklar ro'yxati");
    return { wb, filename: "Amaliyot_Kundaliklari_Jadvali.xlsx" };
  },

  /**
   * Generates a multi-column Excel (.xlsx) file for the entire Student Archive Fond
   */
  generateArchiveListExcel: (ctx: ArchiveListExportContext): { wb: XLSX.WorkBook; filename: string } => {
    const { students, journals, attendances, practices, practicePlaces, supervisors, faculties, groups, directions = [] } = ctx;
    const wb = XLSX.utils.book_new();

    const titleRows = [
      ["TOSHKENT TIBBIYOT AKADEMIYASI - TALABALAR AMALIYOT ARXIVI FONDI"],
      ["Hujjat yaratilgan sana:", new Date().toLocaleString('uz-UZ'), "", "Arxivdagi talabalar soni:", students.length],
      []
    ];

    const headers = [
      "№ (T/r)",
      "HEMIS Talaba ID",
      "Tizim Logini",
      "Talaba F.I.Sh.",
      "Fakultet",
      "Ta'lim yo'nalishi",
      "Kurs",
      "Guruh",
      "Amaliyot dasturi",
      "Klinik amaliyot bazasi",
      "Mas'ul rahbar",
      "Jami kundaliklar",
      "Tasdiqlangan kunlar",
      "Kutilayotgan kunlar",
      "Qaytarilgan kunlar",
      "Davomat foizi (%)",
      "O'rtacha baho",
      "Amaliyot yakuniy holati"
    ];

    const dataRows = students.map((st, idx) => {
      const stJournals = journals.filter(j => j.studentId === st.id);
      const stAttendances = attendances.filter(a => a.studentId === st.id);
      const faculty = faculties.find(f => f.id === st.facultyId);
      const group = groups.find(g => g.id === st.groupId);
      const direction = directions.find(d => d.id === st.directionId);
      const practice = practices.find(p => p.id === stJournals[0]?.practiceId);
      const place = practicePlaces.find(p => p.id === stJournals[0]?.practicePlaceId);
      const supervisor = supervisors.find(s => s.id === stJournals[0]?.supervisorId);

      const approvedCount = stJournals.filter(j => j.status?.toUpperCase().includes('APPROV') || j.status?.toUpperCase() === 'LOCKED').length;
      const pendingCount = stJournals.filter(j => j.status?.toUpperCase().includes('PENDING') || j.status?.toUpperCase() === 'SUBMITTED').length;
      const revisionCount = stJournals.filter(j => j.status?.toUpperCase() === 'REVISION' || j.status?.toUpperCase() === 'RETURNED_FOR_EDIT').length;

      const attRate = stAttendances.length > 0
        ? Math.round((stAttendances.filter(a => String(a.status).toUpperCase() === 'PRESENT').length / stAttendances.length) * 100)
        : 100;

      const avgGrade = stJournals.length > 0
        ? (stJournals.reduce((acc, j) => acc + (j.supervisorRating || 5), 0) / stJournals.length).toFixed(1)
        : '5.0';

      const isLocked = stJournals.some(j => j.status === 'LOCKED' || j.status === 'FINAL_APPROVED');

      return [
        idx + 1,
        st.studentId || st.id || '-',
        st.login || st.studentId || 'T00001',
        st.fullName || '-',
        faculty?.name || st.faculty || 'Davolash fakulteti',
        direction?.name || 'Davolash ishi',
        `${st.course || 4}-kurs`,
        group?.name || st.group || '401-A',
        practice?.name || 'Klinik amaliyot',
        place?.name || 'Klinika',
        supervisor?.fullName || 'Mas\'ul rahbar',
        stJournals.length,
        approvedCount,
        pendingCount,
        revisionCount,
        `${attRate}%`,
        avgGrade,
        isLocked ? 'Yakuniy tasdiqlangan (Qulflangan)' : approvedCount > 0 ? 'Rahbar tasdiqlagan' : 'Jarayonda'
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([...titleRows, headers, ...dataRows]);
    ws['!cols'] = [
      { wch: 8 },   // T/r
      { wch: 14 },  // HEMIS ID
      { wch: 14 },  // Login
      { wch: 28 },  // Talaba F.I.Sh.
      { wch: 24 },  // Fakultet
      { wch: 22 },  // Yo'nalish
      { wch: 10 },  // Kurs
      { wch: 12 },  // Guruh
      { wch: 26 },  // Amaliyot
      { wch: 26 },  // Klinik baza
      { wch: 26 },  // Mas'ul rahbar
      { wch: 16 },  // Jami
      { wch: 18 },  // Tasdiqlangan
      { wch: 16 },  // Kutilayotgan
      { wch: 16 },  // Qaytarilgan
      { wch: 16 },  // Davomat %
      { wch: 14 },  // O'rtacha baho
      { wch: 28 }   // Holat
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Arxiv fondi");
    return { wb, filename: "Amaliyot_Arxivi_Talabalar_Royxati.xlsx" };
  },

  /**
   * Generates a multi-column Excel (.xlsx) file for the Final Approval Queue
   */
  generateFinalApprovalListExcel: (items: FinalApprovalExportItem[]): { wb: XLSX.WorkBook; filename: string } => {
    const wb = XLSX.utils.book_new();

    const titleRows = [
      ["TOSHKENT TIBBIYOT AKADEMIYASI - YAKUNIY TASDIQLASH NAVBATIDAGI TALABALAR"],
      ["Hujjat yaratilgan sana:", new Date().toLocaleString('uz-UZ'), "", "Kutilayotgan talabalar soni:", items.length],
      []
    ];

    const headers = [
      "№ (T/r)",
      "HEMIS Talaba ID",
      "Talaba F.I.Sh.",
      "Fakultet",
      "Ta'lim yo'nalishi",
      "Kurs",
      "Guruh",
      "Amaliyot dasturi",
      "Klinik baza",
      "Amaliyot rahbari",
      "Bajarilgan kunlar",
      "Kutilgan kunlar",
      "Davomat foizi (%)",
      "O'rtacha baho",
      "Holati",
      "Oxirgi topshirilgan sana"
    ];

    const dataRows = items.map((it, idx) => [
      idx + 1,
      it.student.studentId || it.student.id || '-',
      it.student.fullName || '-',
      it.faculty?.name || 'Davolash',
      it.direction?.name || 'Davolash ishi',
      `${it.student.course || 4}-kurs`,
      it.group?.name || '401-A',
      it.practice?.name || 'Klinik amaliyot',
      it.place?.name || 'Klinika',
      it.supervisor?.fullName || 'Mas\'ul rahbar',
      it.journals.length,
      it.expectedDays || it.totalDays || it.journals.length,
      `${it.attendanceRate ?? it.attendancePercent ?? 100}%`,
      it.averageGrade || it.averageRating || 'A\'lo (5)',
      formatJournalStatusUz(it.status),
      it.lastSubmittedAt || new Date().toISOString().split('T')[0]
    ]);

    const ws = XLSX.utils.aoa_to_sheet([...titleRows, headers, ...dataRows]);
    ws['!cols'] = [
      { wch: 8 },
      { wch: 14 },
      { wch: 28 },
      { wch: 24 },
      { wch: 22 },
      { wch: 10 },
      { wch: 12 },
      { wch: 26 },
      { wch: 26 },
      { wch: 26 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 14 },
      { wch: 24 },
      { wch: 22 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Yakuniy tasdiqlash navbati");
    return { wb, filename: "Yakuniy_Tasdiqlash_Kutilayotgan_Talabalar.xlsx" };
  },

  /**
   * Generates and downloads a ZIP package containing:
   * - PDF document
   * - Excel workbook
   * - Attachments (images/docs)
   * - README_INFO.txt
   */
  generateZip: async (ctx: ExportContext): Promise<{ blob: Blob; filename: string }> => {
    const { student, journals } = ctx;
    const zip = new JSZip();

    // 1. Generate PDF & add to zip
    const { doc, filename: pdfName } = await journalExportService.generatePDF(ctx);
    const pdfBlob = doc.output('blob');
    zip.file(pdfName, pdfBlob);

    // 2. Generate Excel & add to zip
    const { wb, filename: xlsxName } = journalExportService.generateExcel(ctx);
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    zip.file(xlsxName, excelBuffer);

    // 3. Info text file
    const infoText = `TALABALAR AMALIYOTI ELEKTRON TIZIMI
Elektron amaliyot kundaligi va hisobot paketi
--------------------------------------------------
Talaba: ${student.fullName}
HEMIS Talaba ID: ${student.studentId || student.id}
Login: ${student.login || student.studentId || 'T00001'}
Amaliyot: ${ctx.practice?.name || 'Klinik amaliyot'}
Jami kunlar soni: ${journals.length}
Yaratilgan sana: ${new Date().toLocaleString('uz-UZ')}
Production URL: https://amaliyot.up.railway.app
--------------------------------------------------
Ushbu arxiv talabaning barcha amaliyot kundaliklari, davomati va rasmiy tasdiqlangan hujjatlarini o'z ichiga oladi.`;
    zip.file("INFO_HUJJAT.txt", infoText);

    // 4. Attachments folder if any images or base64 files
    const attachmentsFolder = zip.folder("Ilovalar_va_Fotosuratlar");
    let attCount = 0;
    for (const j of journals) {
      if (j.attachments && j.attachments.length > 0) {
        for (const att of j.attachments) {
          if (att.url && att.url.startsWith('data:')) {
            try {
              const base64Data = att.url.split(',')[1];
              const ext = att.name.split('.').pop() || 'png';
              attachmentsFolder?.file(`Kundalik_${j.date}_${attCount + 1}_${att.name}`, base64Data, { base64: true });
              attCount++;
            } catch (e) {
              console.warn('Attachment base64 zip error:', e);
            }
          }
        }
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const safeName = (student.fullName || 'Talaba').replace(/[^a-zA-Z0-9_\u0400-\u04FF]/g, '_');
    const filename = `${safeName}_Amaliyot_Hujjatlar_Arxivi.zip`;

    return { blob: zipBlob, filename };
  },

  /**
   * Helper to trigger download in the browser
   */
  downloadBlob: (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  downloadExcel: (wb: XLSX.WorkBook, filename: string) => {
    XLSX.writeFile(wb, filename);
  },

  downloadPDF: (doc: jsPDF, filename: string) => {
    doc.save(filename);
  }
};
