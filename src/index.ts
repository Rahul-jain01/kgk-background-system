import cron from 'node-cron';    
import { assetsPreCheck } from './assets-pre-check';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

    
// Schedule a assets pre check every hour
cron.schedule('0 */2 * * *',async () => {

    // Get the current time in UTC
    const now = new Date();

    // Convert the time to IST (UTC + 5:30)
    let currentHourIST = now.getUTCHours() + 5;
    let currentMinutesIST = now.getUTCMinutes() + 30;

    // Adjust if minutes go beyond 60
    if (currentMinutesIST >= 60) {
        currentHourIST += 1;
        currentMinutesIST -= 60;
    }

    // Adjust if hours go beyond 24
    if (currentHourIST >= 24) {
        currentHourIST -= 24;
    }

    // Skip the task if the current time is between 8 PM (20:00) and 10 PM (22:00) IST
    if (currentHourIST >= 20 && currentHourIST < 22) {
        console.log('Skipping assets pre-check task between 8 PM and 10 PM IST');
        return;
    }

    console.log('Running a task every 4 hour to do assets pre check');
    await assetsPreCheck()
}, {
    timezone: "Etc/UTC"
});
