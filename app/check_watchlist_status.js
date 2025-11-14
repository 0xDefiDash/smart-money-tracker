const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkWatchlistStatus() {
  try {
    console.log('=== WATCHLIST STATUS ===\n');
    
    // Get all watchlist items
    const watchlistItems = await prisma.watchlist.findMany({
      include: {
        user: {
          select: {
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Total Watchlist Items: ${watchlistItems.length}\n`);
    
    if (watchlistItems.length > 0) {
      console.log('Watchlist Details:');
      watchlistItems.forEach((item, index) => {
        console.log(`\n${index + 1}. Wallet: ${item.walletAddress}`);
        console.log(`   Chain: ${item.chain}`);
        console.log(`   User: ${item.user?.username || 'N/A'} (${item.user?.email || 'N/A'})`);
        console.log(`   Token: ${item.tokenAddress || 'All tokens'}`);
        console.log(`   Active: ${item.isActive}`);
        console.log(`   Last Checked: ${item.lastChecked || 'Never'}`);
        console.log(`   Created: ${item.createdAt}`);
      });
    }
    
    // Get transaction alerts
    const alerts = await prisma.transactionAlert.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        watchlist: {
          select: {
            walletAddress: true,
            chain: true
          }
        }
      }
    });
    
    console.log(`\n\n=== RECENT ALERTS ===`);
    console.log(`Total Alerts: ${alerts.length}\n`);
    
    if (alerts.length > 0) {
      alerts.forEach((alert, index) => {
        console.log(`\n${index + 1}. Alert ID: ${alert.id}`);
        console.log(`   Wallet: ${alert.watchlist?.walletAddress}`);
        console.log(`   Chain: ${alert.watchlist?.chain}`);
        console.log(`   Transaction: ${alert.transactionHash}`);
        console.log(`   Type: ${alert.transactionType}`);
        console.log(`   Amount: ${alert.amount} ${alert.tokenSymbol || ''}`);
        console.log(`   Notified: ${alert.notified}`);
        console.log(`   Created: ${alert.createdAt}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWatchlistStatus();
