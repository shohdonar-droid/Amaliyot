import React, { useState } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Users,
  Sparkles,
  Layers
} from 'lucide-react';
import { Student } from '../../../types';
import { storageService } from '../../../services/storageService';
import { studentService } from '../../../services/studentService';
import { getNextStudentLogin } from '../../../services/loginGeneratorService';
import { useToast } from '../../../context/ToastContext';
import { Modal } from '../../common/Modal';

interface BulkStudentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedStudentRow {
  fullName: string;
  studentId: string;
  hemisStudentId?: string;
  pinfl: string;
  groupName: string;
  phone: string;
  email: string;
  isValid: boolean;
  error?: string;
}

export function BulkStudentImportModal({
  isOpen,
  onClose,
  onSuccess
}: BulkStudentImportModalProps) {
  const { showToast } = useToast();

  const faculties = storageService.getFaculties();
  const directions = storageService.getDirections();
  const courses = storageService.getCourses();
  const groups = storageService.getGroups();

  const [selectedFacultyId, setSelectedFacultyId] = useState(faculties[0]?.id || '');
  const [selectedDirectionId, setSelectedDirectionId] = useState(directions[0]?.id || '');
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || '');

  const [pasteText, setRawPasteText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'paste' | 'file'>('paste');

  // Generate and download CSV template file
  const handleDownloadTemplate = () => {
    const csvContent = "\uFEFF" + [
      "F.I.SH,Student ID,HEMIS ID,PINFL,Guruh,Telefon,Email",
      "Sobirov Jamshid Alisherovich,MED-2026-2001,10002001,31405991230099,401-A (Davolash),+998901234567,jamshid@student.uz",
      "Karimova Malika Nodir qizi,MED-2026-2002,10002002,32007011450077,401-A (Davolash),+998912345678,malika@student.uz",
      "Ergashev Odil Mirzayevich,MED-2026-2003,10002003,31508982340012,401-A (Davolash),+998933456789,odil@student.uz"
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'namuna_talabalar_royxati.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('info', 'Namuna yuklandi', 'namuna_talabalar_royxati.csv fayli yuklab olindi.');
  };

  // Parse raw text or file content
  const parseRawContent = (text: string) => {
    if (!text.trim()) {
      setParsedRows([]);
      return;
    }

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const rows: ParsedStudentRow[] = [];

    lines.forEach((line, index) => {
      // Skip header line if present
      if (index === 0 && (line.toLowerCase().includes('f.i.sh') || line.toLowerCase().includes('fullname') || line.toLowerCase().includes('student id'))) {
        return;
      }

      // Support tab separated (copied from Excel) or comma separated (CSV)
      const delimiter = line.includes('\t') ? '\t' : ',';
      const parts = line.split(delimiter).map(p => p.trim().replace(/^["']|["']$/g, ''));

      if (parts.length > 0 && parts[0]) {
        const fullName = parts[0] || '';
        const studentId = parts[1] || `MED-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const hemisStudentId = parts[2] || `${Math.floor(10000000 + Math.random() * 90000000)}`;
        const pinfl = parts[3] || `${Math.floor(30000000000000 + Math.random() * 9000000000000)}`;
        const groupName = parts[4] || '';
        const phone = parts[5] || '+998 (90) 000-00-00';
        const email = parts[6] || `${studentId.toLowerCase()}@student.uz`;

        const isValid = fullName.length >= 3;

        rows.push({
          fullName,
          studentId,
          hemisStudentId,
          pinfl,
          groupName,
          phone,
          email,
          isValid,
          error: isValid ? undefined : 'F.I.SH kamida 3 belgidan iborat bo\'lishi kerak'
        });
      }
    });

    setParsedRows(rows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawPasteText(content);
      parseRawContent(content);
    };
    reader.readAsText(file);
  };

  const handleTextPasteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setRawPasteText(text);
    parseRawContent(text);
  };

  const handleImportSubmit = async () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      showToast("warning", "Yuklash uchun talabalar yo'q", "Iltimos, kamida bitta to'g'ri talaba ma'lumotlarini kiriting.");
      return;
    }

    setIsProcessing(true);

    try {
      let importedCount = 0;
      const targetGroup = groups.find(g => g.id === selectedGroupId) || groups[0];

      for (const row of validRows) {
        const studentCode = getNextStudentLogin(storageService.getStudents(), storageService.getUsers());
        
        await studentService.createStudent({
          userId: `uid-std-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          studentId: row.studentId,
          studentCode,
          login: studentCode,
          hemisStudentId: row.hemisStudentId,
          pinfl: row.pinfl,
          fullName: row.fullName,
          facultyId: selectedFacultyId,
          directionId: selectedDirectionId,
          courseId: selectedCourseId,
          groupId: targetGroup?.id || selectedGroupId,
          phone: row.phone,
          email: row.email,
          status: 'active'
        }).catch(err => console.error("Error creating student in bulk import:", err));

        importedCount++;
      }

      setIsProcessing(false);
      showToast('success', 'Ommaviy yuklash yakunlandi', `${importedCount} nafar talaba tizimga muvaffaqiyatli yuklandi.`);
      setRawPasteText('');
      setParsedRows([]);
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsProcessing(false);
      showToast('error', 'Yuklashda xatolik', err.message || 'Talabalarni saqlashda xatolik yuz berdi.');
    }
  };

  const validCount = parsedRows.filter(r => r.isValid).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Talabalarni Ommaviy (Bittada) Yuklash"
    >
      <div className="space-y-5 text-xs">
        {/* Banner with download sample button */}
        <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div>
            <p className="font-extrabold text-sm flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-blue-300" />
              Excel / CSV orqali bittada import qilish
            </p>
            <p className="text-[11px] text-blue-200 mt-0.5">
              Yuzlab talabalarni bitta bosishda guruhlarga biriktirib yuklang.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all shrink-0"
          >
            <Download className="w-4 h-4 text-blue-300" />
            <span>Namuna faylni yuklab olish</span>
          </button>
        </div>

        {/* Global Selectors: Faculty, Direction, Course, Group */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <p className="font-bold text-slate-800 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            Biriktiriladigan Birlamchi Tuzilma (Fakultet va Guruh):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Fakultet</label>
              <select
                value={selectedFacultyId}
                onChange={e => setSelectedFacultyId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium"
              >
                {faculties.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Yo'nalish</label>
              <select
                value={selectedDirectionId}
                onChange={e => setSelectedDirectionId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium"
              >
                {directions.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Kurs</label>
              <select
                value={selectedCourseId}
                onChange={e => setSelectedCourseId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Guruh</label>
              <select
                value={selectedGroupId}
                onChange={e => setSelectedGroupId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-blue-800"
              >
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Input Methods Tab */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`px-4 py-2 font-bold text-xs border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'paste'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Excel'dan Nusxalab Qo'yish (Copy & Paste)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`px-4 py-2 font-bold text-xs border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'file'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>CSV / Excel Faylini Yuklash</span>
          </button>
        </div>

        {/* Input Controls */}
        {activeTab === 'paste' ? (
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Excel / Google Sheets jadvalidan nusxalangan qatorlarni shu yerga qo'ying:
            </label>
            <textarea
              rows={5}
              value={pasteText}
              onChange={handleTextPasteChange}
              placeholder="Masalan:&#10;Olimov Sardor Botir o'g'li	MED-2026-1084	12345678	31405991230045	401-A	+998901112233	sardor@student.uz&#10;Karimova Dilnoza Sanjar qizi	MED-2026-1085	12345679	32007011450089	401-A	+998932223344	dilnoza@student.uz"
              className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors bg-slate-50/50">
            <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="font-bold text-slate-800">CSV yoki TXT faylni tanlang</p>
            <p className="text-[11px] text-slate-400 mt-1 mb-3">Kompyuteringizdagi tayyor talabalar ro'yxatini yuklang</p>
            <input
              type="file"
              accept=".csv,.txt,.xlsx"
              onChange={handleFileUpload}
              className="block mx-auto text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>
        )}

        {/* Preview Section */}
        {parsedRows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                Aniqlangan Talabalar Preview Ro'yxati ({parsedRows.length} nafar):
              </p>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {validCount} nafar yuklashga tayyor
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl bg-white">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 font-bold text-slate-600">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">F.I.SH</th>
                    <th className="py-2 px-3">Student ID</th>
                    <th className="py-2 px-3">PINFL</th>
                    <th className="py-2 px-3">Aloqa</th>
                    <th className="py-2 px-3">Holat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.map((row, idx) => (
                    <tr key={idx} className={row.isValid ? 'hover:bg-slate-50' : 'bg-red-50/50'}>
                      <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{row.fullName}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{row.studentId}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{row.pinfl}</td>
                      <td className="py-2 px-3 text-slate-500">{row.phone}</td>
                      <td className="py-2 px-3">
                        {row.isValid ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Tayyor
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 font-semibold" title={row.error}>
                            <AlertCircle className="w-3.5 h-3.5" />
                            Xato
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
          >
            Bekor qilish
          </button>

          <button
            type="button"
            disabled={validCount === 0 || isProcessing}
            onClick={handleImportSubmit}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {isProcessing
                ? 'Yuklanmoqda...'
                : validCount > 0
                ? `${validCount} Nafar Talabani Tizimga Yuklash`
                : 'Talabalarni Yuklash'}
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
