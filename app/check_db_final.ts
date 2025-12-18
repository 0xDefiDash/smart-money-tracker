import * as dotenv from 'dotenv';
dotenv.config();

import { prisma } from '@/lib/db';

async function checkData() {
  try {
    const watchlistCount = await prisma.watchlistItem.count();
    const alertsCount = await prisma.transactionAlert.count();
    const users = await prisma.user.findMany({
      select: { id: true, email: true, telegramUsername: true, telegramChatId: true }
    });
    
    console.log('Database Status:');
    console.log('- Watchlist Items:', watchlistCount);
    console.log('- Transaction Alerts:', alertsCount);
    console.log('- Users:', users.length);
    console.log('\nUsers with Telegram:');
    users.forEach((u: any) => {
      if (u.telegramUsername || u.telegramChatId) {
        console.log('  -', u.email, '| TG:', u.telegramUsername, '| Chat ID:', u.telegramChatId);
      }
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkData();
