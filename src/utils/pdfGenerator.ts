import { jsPDF } from "jspdf";
import { DailyJournal } from "../types";

export const generateJournalPDF = (journal: DailyJournal, studentName: string, practiceName: string) => {
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text("Elektron Amaliyot Kundaligi", 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Talaba: ${studentName}`, 20, 40);
  doc.text(`Amaliyot: ${practiceName}`, 20, 50);
  doc.text(`Sana: ${journal.journalDate}`, 20, 60);
  
  doc.text("Bajarilgan ishlar:", 20, 80);
  doc.text(journal.workSummary || "Ma'lumot yo'q", 20, 90);
  
  doc.save(`journal_${journal.id}.pdf`);
};
