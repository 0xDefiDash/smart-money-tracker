const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n=== WATCHLIST STATUS ===\n');
  
  // Get all watchlist items
  const watchlistItems = await prisma.watchlistItem.findMany({
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
  
  console.log(`Total Watchlist Items: ${watchlistItems.length}\n`);
  
  watchlistItems.forEach((item, index) => {
    console.log(`${index + 1}. Wallet: ${item.address}`);
    console.log(`   Chain: ${item.chain}`);
    console.log(`   User: ${item.user.email || 'N/A'}`);
    console.log(`   Telegram: ${item.user.telegramUsername || 'Not linked'}`);
    console.log(`   Last Checked: ${item.lastChecked}`);
    console.log(`   Token Address: ${item.tokenAddress || 'All tokens'}`);
    console.log('');
  });
  
  // Get transaction alerts
  const alerts = await prisma.transactionAlert.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  
  console.log(`\n=== RECENT ALERTS (Last 10) ===\n`);
  console.log(`Total Alerts: ${alerts.length}\n`);
  
  alerts.forEach((alert, index) => {
    console.log(`${index + 1}. ${alert.type.toUpperCase()} - ${alert.chain}`);
    console.log(`   Wallet: ${alert.walletAddress}`);
    console.log(`   TX Hash: ${alert.transactionHash}`);
    console.log(`   Created: ${alert.createdAt}`);
    console.log('');
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
