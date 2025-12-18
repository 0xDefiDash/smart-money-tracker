import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAlerts() {
  try {
    // Get all transaction alerts
    const alerts = await prisma.transactionAlert.findMany({
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
        console.log(`  Wallet: ${alert.walletAddress}`);
        console.log(`  Chain: ${alert.chain}`);
        console.log(`  Type: ${alert.type}`);
        console.log(`  Value: ${alert.value || 'N/A'}`);
        console.log(`  Token: ${alert.tokenSymbol || 'native'} (${alert.tokenAmount || 'N/A'})`);
        console.log(`  From: ${alert.fromAddress}`);
        console.log(`  To: ${alert.toAddress}`);
        console.log(`  Read: ${alert.isRead ? '✅' : '❌'}`);
        console.log(`  Notified: ${alert.notifiedAt}`);
        console.log(`  Created: ${alert.createdAt}`);
        console.log('');
      });
    } else {
      console.log('No transaction alerts found in the database.');
    }

    // Get watchlist items
    const watchlistItems = await prisma.watchlistItem.findMany({});

    console.log(`\n📋 Total Watchlist Items: ${watchlistItems.length}\n`);
    
    watchlistItems.forEach((item, index) => {
      console.log(`Watchlist #${index + 1}:`);
      console.log(`  Wallet: ${item.address}`);
      console.log(`  Chain: ${item.chain}`);
      console.log(`  Label: ${item.label || 'N/A'}`);
      console.log(`  Token: ${item.tokenSymbol || 'All tokens'}`);
      console.log(`  Last Checked: ${item.lastChecked}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAlerts();
