import { prisma } from './lib/db';

async function checkWatchlist() {
  const items = await prisma.watchlistItem.findMany({
    include: {
      user: {
        select: {
          email: true,
          telegramUsername: true,
          telegramChatId: true,
          isPremium: true
        }
      }
    }
  });
  
  console.log('Total watchlist items:', items.length);
  console.log('\nWatchlist details:');
  items.forEach((item, i) => {
    console.log(`\n[${i+1}] Address: ${item.address}`);
    console.log(`    Chain: ${item.chain}`);
    console.log(`    Token: ${item.tokenAddress || 'All tokens'}`);
    console.log(`    Last Checked: ${item.lastChecked}`);
    console.log(`    User Email: ${item.user.email}`);
    console.log(`    Telegram: ${item.user.telegramUsername || 'Not linked'}`);
    console.log(`    Premium: ${item.user.isPremium}`);
  });
  
  // Check alerts
  const alerts = await prisma.transactionAlert.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  
  console.log('\n\nRecent alerts:', alerts.length);
  alerts.forEach((alert, i) => {
    console.log(`\n[${i+1}] ${alert.type} - ${alert.chain}`);
    console.log(`    Hash: ${alert.transactionHash}`);
    console.log(`    Created: ${alert.createdAt}`);
  });
  
  await prisma.$disconnect();
}

checkWatchlist();
