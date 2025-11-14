const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkWatchlist() {
  try {
    const watchlistItems = await prisma.watchlistItem.findMany({
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
    
    console.log('\n=== WATCHLIST ITEMS ===');
    console.log(`Total: ${watchlistItems.length}\n`);
    
    watchlistItems.forEach((item, idx) => {
      console.log(`${idx + 1}. Wallet: ${item.address}`);
      console.log(`   Chain: ${item.chain}`);
      console.log(`   User: ${item.user.email || 'N/A'}`);
      console.log(`   Telegram: ${item.user.telegramUsername || 'Not linked'}`);
      console.log(`   Last Checked: ${item.lastChecked}`);
      console.log(`   Token: ${item.tokenAddress || 'All tokens'}`);
      console.log('');
    });
    
    const alerts = await prisma.transactionAlert.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('\n=== RECENT ALERTS ===');
    console.log(`Total: ${alerts.length}\n`);
    
    alerts.forEach((alert, idx) => {
      console.log(`${idx + 1}. ${alert.type.toUpperCase()} - ${alert.chain}`);
      console.log(`   Wallet: ${alert.walletAddress}`);
      console.log(`   Hash: ${alert.transactionHash}`);
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
