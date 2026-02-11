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
            name: true
          }
        }
      }
    });
    
    console.log('\n=== WATCHLIST ITEMS ===');
    console.log(`Total items: ${watchlistItems.length}\n`);
    
    watchlistItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.walletAddress} (${item.chain})`);
      console.log(`   User: ${item.user?.email || 'N/A'}`);
      console.log(`   Active: ${item.isActive}`);
      console.log(`   Last Checked: ${item.lastChecked || 'Never'}`);
      console.log(`   Created: ${item.createdAt}`);
      console.log('');
    });
    
    // Get transaction alerts
    const alerts = await prisma.transactionAlert.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        watchlistItem: {
          select: {
            walletAddress: true,
            chain: true
          }
        }
      }
    });
    
    console.log('\n=== RECENT TRANSACTION ALERTS ===');
    console.log(`Total alerts: ${alerts.length}\n`);
    
    alerts.forEach((alert, index) => {
      console.log(`${index + 1}. ${alert.transactionHash}`);
      console.log(`   Wallet: ${alert.watchlistItem?.walletAddress}`);
      console.log(`   Chain: ${alert.watchlistItem?.chain}`);
      console.log(`   Type: ${alert.transactionType}`);
      console.log(`   Amount: ${alert.amount} ${alert.tokenSymbol || ''}`);
      console.log(`   Notified: ${alert.notified}`);
      console.log(`   Created: ${alert.createdAt}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkWatchlist();
