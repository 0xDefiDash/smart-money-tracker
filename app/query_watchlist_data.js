const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== WATCHLIST ITEMS ===\n');
  
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
  
  console.log(`Total watchlist items: ${watchlistItems.length}\n`);
  
  watchlistItems.forEach((item, index) => {
    console.log(`${index + 1}. Wallet: ${item.address}`);
    console.log(`   Chain: ${item.chain}`);
    console.log(`   User: ${item.user.email}`);
    console.log(`   Telegram: ${item.user.telegramUsername || 'Not linked'}`);
    console.log(`   Last Checked: ${item.lastChecked}`);
    console.log(`   Created: ${item.createdAt}`);
    console.log('');
  });
  
  console.log('\n=== TRANSACTION ALERTS ===\n');
  
  const alerts = await prisma.transactionAlert.findMany({
    include: {
      user: {
        select: {
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  });
  
  console.log(`Total alerts (showing last 10): ${alerts.length}\n`);
  
  alerts.forEach((alert, index) => {
    console.log(`${index + 1}. ${alert.type.toUpperCase()} - ${alert.chain}`);
    console.log(`   Wallet: ${alert.walletAddress}`);
    console.log(`   TX Hash: ${alert.transactionHash}`);
    console.log(`   User: ${alert.user.email}`);
    console.log(`   Created: ${alert.createdAt}`);
    console.log('');
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
