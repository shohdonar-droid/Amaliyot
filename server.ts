import express from 'express';
import cron from 'node-cron';
import { dailyJournalService } from './src/services/dailyJournalService.ts';

const app = express();
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

app.get('/health', (req, res) => res.send('OK'));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
