const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStatus() {
  try {
    // Get watchlist items
    const watchlistItems = await prisma.watchlistItem.findMany({
      include: {
        user: {
          select: {
            email: true,
            telegramChatId: true
          }
        }
      }
    });
    
    console.log('\n=== WATCHLIST ITEMS ===');
    console.log(`Total items: ${watchlistItems.length}\n`);
    
    watchlistItems.forEach((item, idx) => {
      console.log(`${idx + 1}. ${item.address} (${item.chain})`);
      console.log(`   User: ${item.user.email}`);
      console.log(`   Telegram: ${item.user.telegramChatId ? 'Connected' : 'Not connected'}`);
      console.log(`   Last checked: ${item.lastChecked}`);
      console.log(`   Active: ${item.isActive}`);
      console.log('');
    });
    
    // Get recent alerts
    const alerts = await prisma.transactionAlert.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        watchlistItem: {
          select: {
            address: true,
            chain: true
          }
        }
      }
    });
    
    console.log('\n=== RECENT ALERTS ===');
    console.log(`Total alerts in system: ${alerts.length}\n`);
    
    if (alerts.length > 0) {
      alerts.forEach((alert, idx) => {
        console.log(`${idx + 1}. ${alert.watchlistItem.address} (${alert.watchlistItem.chain})`);
        console.log(`   Type: ${alert.type}`);
        console.log(`   Amount: ${alert.amount} ${alert.tokenSymbol || ''}`);
        console.log(`   Created: ${alert.createdAt}`);
        console.log(`   Telegram sent: ${alert.telegramSent}`);
        console.log('');
      });
    } else {
      console.log('No alerts created yet. This is normal if no new transactions were detected.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkStatus();
