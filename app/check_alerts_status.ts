import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAlerts() {
  try {
    // Get all transaction alerts
    const alerts = await prisma.transactionAlert.findMany({
      include: {
        watchlistItem: {
          include: {
            user: {
              select: {
                email: true,
                telegramUserId: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    console.log(`\n📊 Total Transaction Alerts: ${alerts.length}\n`);

    if (alerts.length > 0) {
      alerts.forEach((alert, index) => {
        console.log(`Alert #${index + 1}:`);
        console.log(`  Transaction Hash: ${alert.transactionHash}`);
        console.log(`  Wallet: ${alert.watchlistItem.walletAddress}`);
        console.log(`  Chain: ${alert.watchlistItem.chain}`);
        console.log(`  Type: ${alert.transactionType}`);
        console.log(`  Amount: ${alert.amount} ${alert.tokenSymbol || 'native'}`);
        console.log(`  USD Value: $${alert.usdValue || 'N/A'}`);
        console.log(`  Telegram Sent: ${alert.telegramSent ? '✅' : '❌'}`);
        console.log(`  Created: ${alert.createdAt}`);
        console.log(`  User Email: ${alert.watchlistItem.user.email}`);
        console.log(`  Telegram ID: ${alert.watchlistItem.user.telegramUserId || 'Not linked'}`);
        console.log('');
      });
    } else {
      console.log('No transaction alerts found in the database.');
    }

    // Get watchlist items
    const watchlistItems = await prisma.watchlistItem.findMany({
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });

    console.log(`\n📋 Total Watchlist Items: ${watchlistItems.length}\n`);
    
    watchlistItems.forEach((item, index) => {
      console.log(`Watchlist #${index + 1}:`);
      console.log(`  Wallet: ${item.walletAddress}`);
      console.log(`  Chain: ${item.chain}`);
      console.log(`  Active: ${item.isActive ? '✅' : '❌'}`);
      console.log(`  Last Checked: ${item.lastChecked || 'Never'}`);
      console.log(`  User: ${item.user.email}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAlerts();
