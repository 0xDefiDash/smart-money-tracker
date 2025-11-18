import { prisma } from './lib/db';

async function checkWatchlist() {
  const items = await prisma.watchlistItem.findMany({
    include: {
      user: {
        select: {
          email: true,
          telegramUsername: true,
          isPremium: true
        }
      }
    }
  });
  
  console.log('Total watchlist items:', items.length);
  console.log('\nWatchlist items:');
  items.forEach((item: any, i: any) => {
    console.log(`\n${i+1}. Address: ${item.address}`);
    console.log(`   Chain: ${item.chain}`);
    console.log(`   User: ${item.user.email}`);
    console.log(`   Telegram: ${item.user.telegramUsername || 'Not linked'}`);
    console.log(`   Last Checked: ${item.lastChecked}`);
    console.log(`   Created: ${item.createdAt}`);
  });
  
  const alerts = await prisma.transactionAlert.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  
  console.log(`\n\nTotal alerts in database: ${alerts.length}`);
  if (alerts.length > 0) {
    console.log('Recent alerts:');
    alerts.forEach((alert: any, i: any) => {
      console.log(`\n${i+1}. ${alert.type} - ${alert.walletAddress}`);
      console.log(`   Chain: ${alert.chain}`);
      console.log(`   Hash: ${alert.transactionHash}`);
      console.log(`   Created: ${alert.createdAt}`);
    });
  }
  
  await prisma.$disconnect();
}

checkWatchlist();
