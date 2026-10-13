import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import {
  FileText,
  Plus,
  Download,
  Printer,
  FileCheck,
  Search,
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import { DocumentRecord } from '../../../types';
import { storageService } from '../../../services/storageService';
import { useToast } from '../../../context/ToastContext';
import { Modal } from '../../common/Modal';

export function DocumentsModule() {
  const { showToast } = useToast();
  const [documents, setDocuments] = useState<DocumentRecord[]>(() => storageService.getDocuments());
  const practices = storageService.getPractices();
  const students = storageService.getStudents();
  const places = storageService.getPracticePlaces();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // New Document modal
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
  // Referral letter print modal
  const [referralStudentId, setReferralStudentId] = useState<string | null>(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyInput, setVerifyInput] = useState('');
  const [verifiedResult, setVerifiedResult] = useState<{ student: any; practice: any; place: any } | null>(null);

  const refreshList = () => {
    setDocuments(storageService.getDocuments());
  };

  const handleVerifyReferral = (e: React.FormEvent) => {
    e.preventDefault();
    const query = verifyInput.trim().toLowerCase();
    if (!query) return;
    const found = students.find(s => 
      s.id.toLowerCase() === query || 
      s.studentId.toLowerCase() === query || 
      s.fullName.toLowerCase().includes(query)
    );
    if (found) {
      const p = practices.find(prac => prac.id === found.currentPracticeId) || practices[0];
      const pl = places.find(place => place.id === found.currentPracticePlaceId) || places[0];
      setVerifiedResult({ student: found, practice: p, place: pl });
      showToast('success', 'Yo\'llanma tasdiqlandi', `${found.fullName} yo'llanmasi haqiqiy va faol.`);
    } else {
      setVerifiedResult(null);
      showToast('error', 'Topilmadi', 'Bunday ID yoki talaba bo\'yicha yo\'llanma topilmadi.');
    }
  };

  const handleCreateDocument = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newDoc: DocumentRecord = {
      id: `doc-${Date.now()}`,
      title: formData.get('title') as string,
      type: formData.get('type') as any,
      docNumber: formData.get('docNumber') as string,
      issueDate: formData.get('issueDate') as string,
      practiceId: (formData.get('practiceId') as string) || undefined,
      description: formData.get('description') as string,
      status: 'active'
    };

    storageService.saveDocument(newDoc);
    refreshList();
    setIsNewDocModalOpen(false);
    showToast('success', 'Hujjat saqlandi', newDoc.title);
  };

  const filteredDocs = documents.filter(d => {
    if (filterType !== 'all' && d.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return d.title.toLowerCase().includes(q) || d.docNumber.toLowerCase().includes(q);
    }
    return true;
  });

  const referralStudent = students.find(s => s.id === referralStudentId);
  const studentPractice = practices.find(p => p.id === referralStudent?.currentPracticeId) || practices[0];
  const studentPlace = places.find(p => p.id === referralStudent?.currentPracticePlaceId) || places[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Hujjatlar va amaliyot buyruqlari
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rektor buyruqlari, klinik hamkorlik shartnomalari va yo'llanma xatlari
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsVerifyModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <FileCheck className="w-4 h-4 text-blue-600" />
            <span>Yo'llanma tekshirish</span>
          </button>
          <button
            type="button"
            onClick={() => setReferralStudentId(students[0]?.id || '')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            <span>Yo'llanma blankasi</span>
          </button>
          <button
            type="button"
            onClick={() => setIsNewDocModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Hujjat kiritish</span>
          </button>
        </div>
      </div>

      {/* Filter and search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Hujjat nomi yoki raqami bo'yicha..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
          {[
            { id: 'all', label: 'Barchasi' },
            { id: 'order', label: 'Buyruqlar' },
            { id: 'contract', label: 'Shartnomalar' },
            { id: 'referral', label: 'Yo\'llanmalar' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map(doc => (
          <div
            key={doc.id}
            className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {doc.docNumber}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">{doc.issueDate}</span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {doc.title}
              </h4>

              <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                {doc.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 capitalize">{doc.type}</span>
              <button
                type="button"
                onClick={() => showToast('info', 'Hujjat yuklab olinmoqda', `${doc.docNumber} fayli yuklab olindi.`)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Yuklab olish</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Document Modal */}
      <Modal
        isOpen={isNewDocModalOpen}
        onClose={() => setIsNewDocModalOpen(false)}
        title="Yangi hujjat ro'yxatdan o'tkazish"
        maxWidth="md"
      >
        <form onSubmit={handleCreateDocument} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hujjat nomi *</label>
            <input type="text" name="title" required placeholder="Masalan: 4-kurs amaliyoti to'g'risida buyruq" className="w-full px-3 py-2 border rounded-lg" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hujjat turi</label>
              <select name="type" className="w-full px-3 py-2 border rounded-lg">
                <option value="order">Buyruq (Order)</option>
                <option value="contract">Hamkorlik shartnomasi (Contract)</option>
                <option value="referral">Yo'llanma (Referral)</option>
                <option value="syllabus">O'quv dasturi (Syllabus)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hujjat raqami *</label>
              <input type="text" name="docNumber" required placeholder="BUYRUQ-№188/A" className="w-full px-3 py-2 border rounded-lg font-mono" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Sanasi</label>
            <input type="date" name="issueDate" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border rounded-lg font-mono" />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Qisqacha tavsif</label>
            <textarea rows={3} name="description" placeholder="Hujjatning qisqacha mazmuni va maqsadlari..." className="w-full px-3 py-2 border rounded-lg" />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={() => setIsNewDocModalOpen(false)} className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg">Bekor qilish</button>
            <button type="submit" className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs">Saqlash</button>
          </div>
        </form>
      </Modal>

      {/* Referral Letter Preview and Print Modal */}
      <Modal
        isOpen={Boolean(referralStudentId)}
        onClose={() => setReferralStudentId(null)}
        title="Talaba amaliyot yo'llanmasi (Rasmiy blanka)"
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-2 mb-3">
            <label className="font-semibold text-slate-700">Talabani tanlang:</label>
            <select
              value={referralStudentId || ''}
              onChange={e => setReferralStudentId(e.target.value)}
              className="px-3 py-1.5 border rounded-lg max-w-sm"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.fullName} ({s.studentId})</option>
              ))}
            </select>
          </div>

          {/* Printable Official Letter Box */}
          <div className="p-6 bg-white border-2 border-slate-300 rounded-xl shadow-xs space-y-4 print:border-none print:shadow-none font-serif">
            <div className="text-center border-b pb-4">
              <p className="text-xs uppercase tracking-widest font-bold text-slate-800">
                O'zbekiston Respublikasi Sog'liqni Saqlash Vazirligi
              </p>
              <h3 className="text-sm font-extrabold uppercase mt-1 text-slate-900 leading-tight">
                Toshkent davlat tibbiyot universiteti Chirchiq filiali
              </h3>
              <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                O'quv-amaliyot bo'limi · Tel: +998 (71) 214-89-01 · Toshkent sh.
              </p>
            </div>

            <div className="text-center py-2">
              <h4 className="text-sm font-bold uppercase tracking-wider underline">
                AMALIYOT YO'LLANMA XATI № YOL-2026/{referralStudent?.id.slice(-4) || '001'}
              </h4>
              <p className="text-slate-500 font-sans text-[11px] mt-1">Sana: 2026-yil 01-sentyabr</p>
            </div>

            <div className="space-y-3 leading-relaxed text-slate-800 text-xs">
              <p>
                <strong>{studentPlace?.name}</strong> bosh shifokori nomiga:
              </p>
              <p className="text-justify indent-6">
                Universitet rektorining <strong>{studentPractice?.orderNumber}</strong> sonli buyrug'iga asosan, Davolash fakulteti talabasi <strong>{referralStudent?.fullName}</strong> (Talaba ID: {referralStudent?.studentId}) siz rahbarlik qilayotgan tibbiyot muassasasida <strong>"{studentPractice?.name}"</strong> dasturi bo'yicha klinik amaliyot o'tash uchun yuborilmoqda.
              </p>
              <p className="text-justify indent-6">
                Amaliyot davri: <strong>{studentPractice?.startDate}</strong> dan <strong>{studentPractice?.endDate}</strong> gacha. Talabaga xavfsizlik texnikasi qoidalarini tushuntirish va klinik bo'limlarda kuratsiya jarayonini tashkil etishingizni so'raymiz.
              </p>
            </div>

            <div className="pt-6 flex items-center justify-between text-xs font-sans">
              <div>
                <p className="font-bold">Amaliyot bo'limi boshlig'i:</p>
                <p className="text-slate-500 mt-4">{storageService.getUsers().find(u => u.role === 'PRACTICE_HEAD')?.fullName || 'Amaliyot bo\'limi boshlig\'i'} (Imzo)</p>
              </div>
              <div className="flex flex-col items-center">
                <QRCodeSVG value={`http://tma.uz/referral/${referralStudent?.id}`} size={60} />
                <p className="text-[10px] mt-1">Tekshirish kodi</p>
              </div>
              <div className="text-right">
                <p className="font-bold">Klinika mas'uli:</p>
                <p className="text-slate-500 mt-4">(Imzo)</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setReferralStudentId(null)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Yopish
            </button>
            <button
              type="button"
              onClick={() => {
                const doc = new jsPDF();
                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.text("O'ZBEKISTON RESPUBLIKASI SOG'LIQLIYNI SAQLASH VAZIRLIGI", 105, 15, { align: 'center' });
                doc.setFontSize(10);
                doc.text("TOSHKENT DAVLAT TIBBIYOT UNIVERSITETI CHIRCHIQ FILIALI", 105, 22, { align: 'center' });
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.text("O'quv-amaliyot bo'limi · Tel: +998 (71) 214-89-01", 105, 28, { align: 'center' });

                doc.setLineWidth(0.5);
                doc.line(20, 33, 190, 33);

                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.text(`AMALIYOT YO'LLANMA XATI № YOL-2026/${referralStudent?.id.slice(-4) || '001'}`, 105, 42, { align: 'center' });
                doc.setFontSize(9);
                doc.text("Sana: 2026-yil 01-sentyabr", 105, 48, { align: 'center' });

                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.text(`${studentPlace?.name || 'Tibbiyot muassasasi'} bosh shifokori nomiga:`, 20, 60);

                const textBody = `Universitet rektorining ${studentPractice?.orderNumber || '№188'} sonli buyrug'iga asosan, Davolash fakulteti talabasi ${referralStudent?.fullName || 'Talaba'} (Talaba ID: ${referralStudent?.studentId || 'N/A'}) siz rahbarlik qilayotgan tibbiyot muassasasida "${studentPractice?.name || 'Klinik amaliyot'}" dasturi bo'yicha klinik amaliyot o'tash uchun yuborilmoqda.`;
                doc.text(textBody, 20, 70, { maxWidth: 170, align: 'justify' });

                const textBody2 = `Amaliyot davri: ${studentPractice?.startDate || '2026-09-01'} dan ${studentPractice?.endDate || '2026-10-01'} gacha. Talabaga xavfsizlik texnikasi qoidalarini tushuntirish va klinik bo'limlarda kuratsiya jarayonini tashkil etishingizni so'raymiz.`;
                doc.text(textBody2, 20, 95, { maxWidth: 170, align: 'justify' });

                doc.setFont("helvetica", "bold");
                doc.text("Amaliyot bo'limi boshlig':", 20, 130);
                doc.setFont("helvetica", "normal");
                doc.text("(Imzo, M.O'.)", 20, 136);

                doc.setFont("helvetica", "bold");
                doc.text("Klinika mas'uli:", 140, 130);
                doc.setFont("helvetica", "normal");
                doc.text("(Imzo)", 140, 136);

                doc.setFontSize(8);
                doc.setTextColor(100);
                doc.text(`Haqiqiylik QR kodi: http://tma.uz/referral/${referralStudent?.id}`, 20, 160);

                doc.save(`yollanma_${referralStudent?.fullName || 'talaba'}.pdf`);
                showToast('success', 'Yo\'llanma PDF yuklab olindi', `${referralStudent?.fullName} yo'llanmasi muvaffaqiyatli saqlandi.`);
              }}
              className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>PDF yuklab olish</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* QR & Referral Verification Modal */}
      <Modal
        isOpen={isVerifyModalOpen}
        onClose={() => {
          setIsVerifyModalOpen(false);
          setVerifiedResult(null);
          setVerifyInput('');
        }}
        title="Yo'llanma haqiqiyligini tekshirish (QR / ID)"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Talaba yo'llanmasi yoki QR kodining haqiqiyligini tekshirish uchun talabaning ID raqami, F.I.Sh yoki tizim identifikatorini kiriting:
          </p>

          <form onSubmit={handleVerifyReferral} className="flex gap-2">
            <input
              type="text"
              value={verifyInput}
              onChange={e => setVerifyInput(e.target.value)}
              placeholder="Masalan: STU-101 yoki F.I.Sh..."
              className="flex-1 px-3 py-2 border rounded-lg font-mono text-xs"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>Tekshirish</span>
            </button>
          </form>

          {verifiedResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm border-b border-emerald-200 pb-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <span>🟢 YO'LLANMA HAQIQIY VA TASDIQLANGAN</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-800">
                <div>
                  <span className="text-slate-500 block text-[11px]">Talaba F.I.Sh:</span>
                  <strong className="text-slate-900">{verifiedResult.student.fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Talaba ID:</span>
                  <span className="font-mono">{verifiedResult.student.studentId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Amaliyot bazasi:</span>
                  <strong>{verifiedResult.place?.name}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Amaliyot dasturi:</span>
                  <span>{verifiedResult.practice?.name}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[11px]">Amaliyot muddatlari:</span>
                  <span className="font-mono font-semibold text-blue-700">
                    {verifiedResult.practice?.startDate} — {verifiedResult.practice?.endDate} (Buyruq: {verifiedResult.practice?.orderNumber})
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200 text-[11px] text-emerald-700 flex items-center justify-between">
                <span>Toshkent davlat tibbiyot universiteti Chirchiq filiali rasmiy bazasi</span>
                <span className="font-semibold">Status: FAOL</span>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
