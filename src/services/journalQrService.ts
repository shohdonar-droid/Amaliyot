export interface JournalQrSignature {
  journalId: string;
  supervisorId: string;
  timestamp: string;
  token: string;
  qrPayload: string;
}

export const journalQrService = {
  generateSignature(journalId: string, supervisorId: string): JournalQrSignature {
    const timestamp = new Date().toISOString();
    const cleanJId = (journalId || 'jrn').substring(0, 10);
    const cleanSupId = (supervisorId || 'sup').substring(0, 8);
    const token = `TMA-JRN-SIG-${cleanJId}-${cleanSupId}-${Date.now().toString(36).toUpperCase()}`;
    
    const qrPayload = JSON.stringify({
      type: 'TMA_JOURNAL_SUPERVISOR_SIGNATURE',
      journalId,
      supervisorId,
      timestamp,
      token,
      verifiedUrl: `https://ais-dev-jfkrtatp7imduu6bfeocus-226016755915.asia-east1.run.app/verify/journal/${journalId}?token=${token}`
    });

    return {
      journalId,
      supervisorId,
      timestamp,
      token,
      qrPayload
    };
  },

  verifySignature(qrPayloadOrToken: string, targetJournalId?: string): { isValid: boolean; details?: any; error?: string } {
    try {
      let data: any;
      if (qrPayloadOrToken.startsWith('{')) {
        data = JSON.parse(qrPayloadOrToken);
      } else {
        data = { token: qrPayloadOrToken, journalId: targetJournalId };
      }

      if (!data.token && !data.journalId) {
        return { isValid: false, error: 'Yaroqsiz QR imzo ma\'lumotlari.' };
      }

      return {
        isValid: true,
        details: {
          journalId: data.journalId || targetJournalId,
          supervisorId: data.supervisorId || 'Amaliyot rahbari',
          timestamp: data.timestamp || new Date().toISOString(),
          token: data.token || qrPayloadOrToken,
          verifiedAt: new Date().toISOString()
        }
      };
    } catch (e) {
      return { isValid: false, error: 'QR kodni deshifrlashda xatolik yuz berdi.' };
    }
  }
};
