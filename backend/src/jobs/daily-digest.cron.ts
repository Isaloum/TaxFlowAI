import * as cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { NotificationService } from '../services/notifications/notification.service';

const prisma = new PrismaClient();

// Run daily at 8 AM
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
