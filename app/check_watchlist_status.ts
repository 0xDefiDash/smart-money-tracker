import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkWatchlistStatus() {
  try {
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

    console.log(`\nTotal watchlist items: ${watchlistItems.length}\n`);
    
    watchlistItems.forEach((item: any, index: number) => {
      console.log(`${index + 1}. Wallet: ${item.address}`);
      console.log(`   Chain: ${item.chain}`);
      console.log(`   Token: ${item.tokenAddress || 'All tokens'}`);
      console.log(`   Label: ${item.label || 'No label'}`);
      console.log(`   User: ${item.user.email}`);
      console.log(`   Telegram: ${item.user.telegramChatId ? 'Linked' : 'Not linked'}`);
      console.log(`   Last checked: ${item.lastChecked}`);
      console.log('');
    });

    // Check for recent alerts
    const recentAlerts = await prisma.transactionAlert.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`\nRecent alerts (last 10): ${recentAlerts.length}\n`);
    
    recentAlerts.forEach((alert: any, index: number) => {
      console.log(`${index + 1}. ${alert.walletAddress} (${alert.chain})`);
      console.log(`   Type: ${alert.type}`);
      console.log(`   Hash: ${alert.transactionHash}`);
      console.log(`   Created: ${alert.createdAt}`);
      console.log(`   Read: ${alert.isRead}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWatchlistStatus();
