import React, { useState, useEffect } from 'react';
import { dailyJournalService } from '../../../services/dailyJournalService';
import { storageService } from '../../../services/storageService';
import { DailyJournal } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

export function FinalApprovalModule() {
  const [journals, setJournals] = useState<DailyJournal[]>([]);
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    loadJournals();
  }, []);

  const loadJournals = () => {
    const all = storageService.getDailyJournals();
    // Filter for FINAL_PENDING (Logic: all days for student are SUPERVISOR_APPROVED)
    setJournals(all.filter(j => j.status === 'FINAL_PENDING'));
  };

  const handleFinalApprove = async (journal: DailyJournal) => {
    if (!currentUser) return;
    await dailyJournalService.finalApproveJournal(journal.id, currentUser.uid);
    showToast('success', 'Tasdiqlandi', 'Kundalik yakuniy tasdiqlandi va quliflandi.');
    loadJournals();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Yakuniy tasdiqlash (Final Approval)</h2>
      <table className="min-w-full bg-white border border-slate-200">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Talaba</th>
            <th className="py-2 px-4 border-b">Sana</th>
            <th className="py-2 px-4 border-b">Amallar</th>
          </tr>
        </thead>
        <tbody>
          {journals.map(j => (
            <tr key={j.id}>
              <td className="py-2 px-4 border-b">{j.studentId}</td>
              <td className="py-2 px-4 border-b">{j.date}</td>
              <td className="py-2 px-4 border-b">
                <button 
                    onClick={() => handleFinalApprove(j)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                >
                    Final Approve
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
