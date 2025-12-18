import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMonitoringResults() {
  console.log('=== Watchlist Monitoring Results ===\n');
  
  // Check watchlist items
  const watchlistItems = await prisma.watchlistItem.findMany({
    include: {
      user: {
        select: {
          email: true,
          telegramChatId: true,
          telegramUsername: true
        }
      }
    }
  });
  
  console.log(`Total Watchlist Items: ${watchlistItems.length}\n`);
  
  watchlistItems.forEach((item, index) => {
    console.log(`${index + 1}. Wallet: ${item.address}`);
    console.log(`   Chain: ${item.chain}`);
    console.log(`   Label: ${item.label || 'N/A'}`);
    console.log(`   Token: ${item.tokenSymbol || 'All tokens'}`);
    console.log(`   User: ${item.user.email}`);
    console.log(`   Telegram: ${item.user.telegramUsername || 'Not linked'} (Chat ID: ${item.user.telegramChatId || 'N/A'})`);
    console.log(`   Last Checked: ${item.lastChecked}`);
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
      console.log(`   Value: ${alert.value || 'N/A'}`);
      console.log(`   Token: ${alert.tokenSymbol || 'N/A'} (${alert.tokenAmount || 'N/A'})`);
      console.log(`   Tx Hash: ${alert.transactionHash}`);
      console.log(`   From: ${alert.fromAddress}`);
      console.log(`   To: ${alert.toAddress}`);
      console.log(`   Created: ${alert.createdAt}`);
      console.log(`   Read: ${alert.isRead}`);
      console.log(`   User: ${alert.user.email}`);
    });
  } else {
    console.log('\nNo transaction alerts found in database.');
  }
  
  await prisma.$disconnect();
}

checkMonitoringResults().catch(console.error);
