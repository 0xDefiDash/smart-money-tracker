const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAlerts() {
  try {
    const watchlistCount = await prisma.watchlistItem.count();
    const alertCount = await prisma.transactionAlert.count();
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        telegramUsername: true,
        telegramUsername: true,
        isPremium: true
      }
    });
    
    const watchlistItems = await prisma.watchlistItem.findMany({
      include: {
        user: {
          select: {
            email: true,
            telegramUsername: true
          }
        }
      }
    });
    
    console.log('\n=== Database Status ===');
    console.log('Total Users:', users.length);
    console.log('Total Watchlist Items:', watchlistCount);
    console.log('Total Transaction Alerts:', alertCount);
    
    console.log('\n=== Watchlist Items ===');
    watchlistItems.forEach(item => {
      console.log('- Address:', item.address);
      console.log('  Chain:', item.chain);
      console.log('  User:', item.user.email);
      console.log('  Last Checked:', item.lastChecked);
      console.log('  Token:', item.tokenAddress || 'All tokens');
      console.log('');
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkAlerts();
