import express from 'express';
import cron from 'node-cron';
import path from 'path';
import { fileURLToPath } from 'url';
import { dailyJournalService } from './src/services/dailyJournalService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Serve static files from the dist directory
app.use(express.static(path.resolve(__dirname, 'dist')));

// API health endpoint
app.get('/health', (req, res) => res.send('OK'));

// SPA Fallback: Serve index.html for all non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
