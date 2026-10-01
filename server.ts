import express from 'express';
import cron from 'node-cron';
import { dailyJournalService } from './src/services/dailyJournalService.ts';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
}
const db = getFirestore();

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

// Scheduled job to close expired journals
cron.schedule('0 0 * * *', async () => {
    console.log('Running daily journal expiry job...');
    try {
        await dailyJournalService.closeExpiredJournals();
        console.log('Daily journal expiry job completed successfully.');
    } catch (error) {
        console.error('Error running daily journal expiry job:', error);
    }
}, {
    timezone: 'Asia/Tashkent'
});

// Admin endpoint to run expiry job
app.post('/api/admin/cron/run-expiry', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).send('Unauthorized');
    
    const idToken = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        const userData = userDoc.data();
        
        if (!userData || !['PRACTICE_HEAD', 'SUPER_ADMIN'].includes(userData.role)) {
            return res.status(403).send('Forbidden');
        }
        
        await dailyJournalService.closeExpiredJournals();
        res.status(200).send('Expiry job triggered');
    } catch (error) {
        console.error('Admin job error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/health', (req, res) => res.send('OK'));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
