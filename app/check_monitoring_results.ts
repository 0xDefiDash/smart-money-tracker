import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMonitoringResults() {
  console.log('=== Watchlist Monitoring Results ===\n');
  
  // Check watchlist items
  const watchlistItems = await prisma.watchlist.findMany({
    include: {
      user: {
        select: {
          email: true,
          telegramId: true
        }
      }
    }
  });
  
  console.log(`Total Watchlist Items: ${watchlistItems.length}\n`);
  
  watchlistItems.forEach((item, index) => {
    console.log(`${index + 1}. Wallet: ${item.walletAddress}`);
    console.log(`   Chain: ${item.chain}`);
    console.log(`   User: ${item.user.email}`);
    console.log(`   Telegram: ${item.user.telegramId || 'Not linked'}`);
    console.log(`   Last Checked: ${item.lastChecked}`);
    console.log(`   Active: ${item.isActive}`);
    console.log('');
  });
  
  // Check transaction alerts
  const alerts = await prisma.transactionAlert.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    take: 10,
    include: {
      user: {
        select: {
          email: true
        }
      }
    }
  });
  
  console.log(`\nTotal Transaction Alerts: ${alerts.length}`);
  
  if (alerts.length > 0) {
    console.log('\nRecent Alerts:');
    alerts.forEach((alert, index) => {
      console.log(`\n${index + 1}. Alert ID: ${alert.id}`);
      console.log(`   Wallet: ${alert.walletAddress}`);
      console.log(`   Chain: ${alert.chain}`);
      console.log(`   Type: ${alert.type}`);
      console.log(`   Amount: ${alert.amount}`);
      console.log(`   Token: ${alert.tokenSymbol || 'N/A'}`);
      console.log(`   Tx Hash: ${alert.txHash}`);
      console.log(`   Created: ${alert.createdAt}`);
      console.log(`   Telegram Sent: ${alert.telegramSent}`);
      console.log(`   User: ${alert.user.email}`);
    });
  } else {
    console.log('\nNo transaction alerts found in database.');
  }
  
  await prisma.$disconnect();
}

checkMonitoringResults().catch(console.error);
