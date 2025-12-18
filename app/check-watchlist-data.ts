import { config } from 'dotenv';
config();

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkWatchlist() {
  const watchlistItems = await prisma.watchlistItem.findMany({
    include: {
      user: {
        select: { email: true }
      }
    }
  });
  
  console.log('Total Watchlist Items:', watchlistItems.length);
  console.log('\nWatchlist Details:');
  watchlistItems.forEach((item, idx) => {
    console.log(`\n${idx + 1}. Wallet: ${item.address}`);
    console.log(`   Chain: ${item.chain}`);
    console.log(`   User: ${item.user.email}`);
    console.log(`   Label: ${item.label || 'None'}`);
    console.log(`   Token: ${item.tokenSymbol || 'All tokens'}`);
    console.log(`   Last Checked: ${item.lastChecked.toISOString()}`);
  });
  
  const alerts = await prisma.transactionAlert.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  
  console.log('\n\nRecent Transaction Alerts:', alerts.length);
  
  await prisma.$disconnect();
}

checkWatchlist();
