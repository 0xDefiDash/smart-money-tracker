const { PrismaClient } = require('@prisma/client');

async function checkWatchlist() {
  const prisma = new PrismaClient();
  
  try {
    // Get all watchlist items
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
    
    watchlistItems.forEach((item, index) => {
      console.log(`${index + 1}. Wallet: ${item.walletAddress}`);
      console.log(`   Chain: ${item.chain}`);
      console.log(`   Token: ${item.tokenAddress || 'All tokens'}`);
      console.log(`   Active: ${item.isActive}`);
      console.log(`   Last Checked: ${item.lastChecked}`);
      console.log(`   User Email: ${item.user?.email || 'N/A'}`);
      console.log(`   Telegram: ${item.user?.telegramChatId ? 'Connected' : 'Not connected'}`);
      console.log('');
    });
    
    // Get all transaction alerts
    const alerts = await prisma.transactionAlert.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
    
    console.log('\n=== RECENT TRANSACTION ALERTS ===');
    console.log(`Total alerts: ${alerts.length}\n`);
    
    alerts.forEach((alert, index) => {
      console.log(`${index + 1}. ${alert.type} - ${alert.tokenSymbol || 'Unknown'}`);
      console.log(`   Amount: ${alert.amount}`);
      console.log(`   Value: $${alert.valueUsd}`);
      console.log(`   Wallet: ${alert.walletAddress}`);
      console.log(`   Chain: ${alert.chain}`);
      console.log(`   Read: ${alert.isRead}`);
      console.log(`   Created: ${alert.createdAt}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWatchlist();
