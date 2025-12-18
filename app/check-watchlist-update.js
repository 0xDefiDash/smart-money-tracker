const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkWatchlist() {
  try {
    const items = await prisma.watchlistItem.findMany({
      include: {
        user: {
          select: {
            email: true,
            telegramUsername: true
          }
        }
      },
      orderBy: {
        lastChecked: 'desc'
      }
    });

    console.log('\n📋 Watchlist Items Status:\n');
    console.log(`Total items: ${items.length}\n`);
    
    items.forEach((item, index) => {
      console.log(`${index + 1}. ${item.address.substring(0, 10)}...${item.address.substring(item.address.length - 8)}`);
      console.log(`   Chain: ${item.chain}`);
      console.log(`   User: ${item.user.email}`);
      console.log(`   Last Checked: ${item.lastChecked.toISOString()}`);
      console.log(`   Created: ${item.createdAt.toISOString()}`);
      console.log('');
    });

    // Check for any alerts
    const alerts = await prisma.transactionAlert.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`\n🔔 Recent Alerts: ${alerts.length}\n`);
    
    if (alerts.length > 0) {
      alerts.forEach((alert, index) => {
        console.log(`${index + 1}. ${alert.type} - ${alert.chain}`);
        console.log(`   Wallet: ${alert.walletAddress.substring(0, 10)}...`);
        console.log(`   Hash: ${alert.transactionHash.substring(0, 10)}...`);
        console.log(`   Created: ${alert.createdAt.toISOString()}`);
        console.log('');
      });
    } else {
      console.log('No alerts found in database.\n');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkWatchlist();
