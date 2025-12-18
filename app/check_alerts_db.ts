import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAlerts() {
  try {
    // Get all transaction alerts
    const alerts = await prisma.transactionAlert.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        watchlistItem: {
          include: {
            user: {
              select: {
                email: true,
                telegramId: true
              }
            }
          }
        }
      }
    });

    console.log(`\nTotal alerts in database: ${alerts.length}`);
    
    if (alerts.length > 0) {
      console.log('\nRecent alerts:');
      alerts.forEach((alert, idx) => {
        console.log(`\n${idx + 1}. Alert ID: ${alert.id}`);
        console.log(`   Wallet: ${alert.walletAddress}`);
        console.log(`   Chain: ${alert.chain}`);
        console.log(`   Type: ${alert.type}`);
        console.log(`   Amount: ${alert.amount}`);
        console.log(`   Token: ${alert.tokenSymbol || 'N/A'}`);
        console.log(`   Tx Hash: ${alert.transactionHash}`);
        console.log(`   Created: ${alert.createdAt}`);
        console.log(`   User Email: ${alert.watchlistItem.user.email}`);
        console.log(`   Telegram ID: ${alert.watchlistItem.user.telegramId || 'Not linked'}`);
      });
    } else {
      console.log('\nNo alerts found in database.');
    }

    // Get watchlist items
    const watchlistItems = await prisma.watchlistItem.findMany({
      include: {
        user: {
          select: {
            email: true,
            telegramId: true
          }
        }
      }
    });

    console.log(`\n\nTotal watchlist items: ${watchlistItems.length}`);
    watchlistItems.forEach((item, idx) => {
      console.log(`\n${idx + 1}. Watchlist Item ID: ${item.id}`);
      console.log(`   Wallet: ${item.walletAddress}`);
      console.log(`   Chain: ${item.chain}`);
      console.log(`   Label: ${item.label || 'N/A'}`);
      console.log(`   Active: ${item.isActive}`);
      console.log(`   Last Checked: ${item.lastChecked || 'Never'}`);
      console.log(`   User: ${item.user.email}`);
      console.log(`   Telegram: ${item.user.telegramId || 'Not linked'}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAlerts();
