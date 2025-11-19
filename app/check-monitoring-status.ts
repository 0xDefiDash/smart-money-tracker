import { prisma } from './lib/db';

async function checkData() {
  const watchlistCount = await prisma.watchlistItem.count();
  const alertsCount = await prisma.transactionAlert.count();
  const users = await prisma.user.findMany({
    select: { id: true, email: true, telegramUsername: true, isPremium: true }
  });
  
  const watchlistItems = await prisma.watchlistItem.findMany({
    select: {
      id: true,
      address: true,
      chain: true,
      lastChecked: true,
      user: {
        select: { email: true, telegramUsername: true }
      }
    }
  });
  
  console.log('=== Database Status ===\n');
  console.log('Watchlist Items:', watchlistCount);
  console.log('Transaction Alerts:', alertsCount);
  console.log('Users:', users.length);
  console.log('\n=== Watchlist Details ===');
  watchlistItems.forEach((item, i) => {
    console.log(`\n${i + 1}. ${item.address}`);
    console.log(`   Chain: ${item.chain}`);
    console.log(`   Last Checked: ${item.lastChecked}`);
    console.log(`   User: ${item.user.email || 'N/A'}`);
    console.log(`   Telegram: ${item.user.telegramUsername || 'Not linked'}`);
  });
  
  await prisma.$disconnect();
}

checkData().catch(console.error);
