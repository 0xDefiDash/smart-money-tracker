#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getWatchlistResults() {
  try {
    // Get all watchlist items
    const watchlistItems = await prisma.watchlistItem.findMany({
      include: {
        user: {
          select: {
            id: true,
            telegramUsername: true,
            isPremium: true
          }
        }
      }
    });

    // Get recent alerts (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAlerts = await prisma.transactionAlert.findMany({
      where: {
        createdAt: {
          gte: oneDayAgo
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get alerts from the last monitoring run (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const lastRunAlerts = await prisma.transactionAlert.findMany({
      where: {
        createdAt: {
          gte: oneHourAgo
        }
      }
    });

    console.log('\n=== Watchlist Monitoring Results ===\n');
    console.log(`Total Watchlist Items: ${watchlistItems.length}`);
    console.log(`Alerts (Last 24h): ${recentAlerts.length}`);
    console.log(`Alerts (Last Hour): ${lastRunAlerts.length}`);
    
    console.log('\n=== Watchlist Items ===\n');
    for (const item of watchlistItems) {
      const itemAlerts = recentAlerts.filter(a => 
        a.walletAddress.toLowerCase() === item.address.toLowerCase() &&
        a.chain === item.chain
      );
      
      console.log(`Address: ${item.address}`);
      console.log(`  Chain: ${item.chain}`);
      console.log(`  Last Checked: ${item.lastChecked.toISOString()}`);
      console.log(`  Alerts (24h): ${itemAlerts.length}`);
      console.log(`  User: ${item.user.telegramUsername || 'No Telegram'} (${item.user.isPremium ? 'Premium' : 'Trial'})`);
      if (item.tokenAddress) {
        console.log(`  Token Filter: ${item.tokenAddress}`);
      }
      console.log('');
    }

    if (lastRunAlerts.length > 0) {
      console.log('\n=== Recent Alerts (Last Hour) ===\n');
      for (const alert of lastRunAlerts) {
        console.log(`[${alert.createdAt.toISOString()}]`);
        console.log(`  Wallet: ${alert.walletAddress}`);
        console.log(`  Chain: ${alert.chain}`);
        console.log(`  Type: ${alert.type}`);
        console.log(`  TX: ${alert.transactionHash}`);
        if (alert.tokenSymbol) {
          console.log(`  Token: ${alert.tokenAmount} ${alert.tokenSymbol}`);
        } else {
          console.log(`  Value: ${alert.value}`);
        }
        console.log('');
      }
    }

    return {
      walletsChecked: watchlistItems.length,
      alertsCreated: lastRunAlerts.length,
      totalAlerts24h: recentAlerts.length,
      watchlistItems: watchlistItems.map(item => ({
        address: item.address,
        chain: item.chain,
        lastChecked: item.lastChecked,
        tokenAddress: item.tokenAddress,
        alerts24h: recentAlerts.filter(a => 
          a.walletAddress.toLowerCase() === item.address.toLowerCase() &&
          a.chain === item.chain
        ).length
      })),
      recentAlerts: lastRunAlerts.map(alert => ({
        walletAddress: alert.walletAddress,
        chain: alert.chain,
        type: alert.type,
        transactionHash: alert.transactionHash,
        tokenSymbol: alert.tokenSymbol,
        tokenAmount: alert.tokenAmount,
        value: alert.value,
        createdAt: alert.createdAt
      }))
    };
  } catch (error) {
    console.error('Error querying database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

getWatchlistResults()
  .then(results => {
    console.log('\n=== Summary ===');
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
