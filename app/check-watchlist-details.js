const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkWatchlistDetails() {
  try {
    const watchlistItems = await prisma.watchlistItem.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            telegramUsername: true,
            isPremium: true
          }
        }
      }
    });

    console.log(`\nFound ${watchlistItems.length} watchlist items:\n`);
    
    for (const item of watchlistItems) {
      console.log(`Wallet: ${item.address}`);
      console.log(`  Chain: ${item.chain}`);
      console.log(`  Last Checked: ${item.lastChecked}`);
      console.log(`  Token Address: ${item.tokenAddress || 'All tokens'}`);
      console.log(`  User: ${item.user.email}`);
      console.log(`  Telegram: ${item.user.telegramUsername || 'Not linked'}`);
      console.log(`  Premium: ${item.user.isPremium}`);
      console.log('');
    }

    // Check recent alerts
    const alerts = await prisma.transactionAlert.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { email: true }
        }
      }
    });

    console.log(`\nRecent alerts (${alerts.length}):\n`);
    for (const alert of alerts) {
      console.log(`${alert.createdAt.toISOString()} - ${alert.walletAddress} (${alert.chain})`);
      console.log(`  Type: ${alert.type}, Hash: ${alert.transactionHash.substring(0, 20)}...`);
      console.log(`  User: ${alert.user.email}`);
      console.log('');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWatchlistDetails();
