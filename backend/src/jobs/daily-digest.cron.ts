import * as cron from 'node-cron';
import prisma from '../config/database';
import { NotificationService } from '../services/notifications/notification.service';

// Run daily at 8 AM (server local time - configure server timezone as needed)
export function startDailyDigestCron() {
  cron.schedule('0 8 * * *', async () => {
    console.log('Running daily digest job...');

    const accountants = await prisma.accountant.findMany({
      where: { dailyDigest: true }
    });

    for (const accountant of accountants) {
      await NotificationService.sendDailyDigest(accountant.id);
    }

    console.log('Daily digest sent to all accountants');
  });
}
