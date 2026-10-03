import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { DailyJournal, Student } from "../types";

export const generateJournalPDF = (journal: DailyJournal, student: Student, practiceName: string) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Elektron Amaliyot Kundaligi", 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Talaba: ${student.fullName} | ID: ${student.studentId}`, 20, 25);
    doc.text(`Amaliyot: ${practiceName}`, 20, 30);
    doc.text(`Sana: ${journal.date}`, 20, 35);
    doc.text(`Status: ${journal.status}`, 20, 40);
    doc.text("Bajarilgan ishlar:", 20, 50);
    doc.text(journal.workSummary || "Ma'lumot yo'q", 20, 55, { maxWidth: 170 });
    doc.save(`journal_${journal.id}.pdf`);
};

export const exportToExcel = (data: any[], fileName: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    if (data.length > 0) {
      const keys = Object.keys(data[0]);
      ws['!cols'] = keys.map(k => {
        let maxLen = k.length;
        for (const row of data) {
          const val = row[k];
          const str = val !== null && val !== undefined ? String(val) : '';
          if (str.length > maxLen) maxLen = str.length;
        }
        return { wch: Math.min(Math.max(maxLen + 3, 10), 60) };
      });
    }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hisobot");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const generateZip = async (journals: DailyJournal[], studentMap: Map<string, Student>, practiceName: string) => {
    const zip = new JSZip();
    for (const journal of journals) {
        if (journal.status === 'FINAL_APPROVED' || journal.status === 'LOCKED') {
            const student = studentMap.get(journal.studentId);
            if (student) {
                const doc = new jsPDF();
                doc.text(`Kundalik: ${journal.id}`, 20, 20);
                const pdfData = doc.output('blob');
                zip.file(`${student.fullName}_${journal.date}.pdf`, pdfData);
            }
        }
    }
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = "kundaliklar.zip";
    link.click();
};
