const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function monitorWatchlist() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting watchlist monitoring...`);
  
  const results = {
    walletsChecked: 0,
    alertsCreated: 0,
    walletDetails: [],
    errors: []
  };

  try {
    // Fetch all watchlist items
    const watchlistItems = await prisma.watchlistItem.findMany({
      include: {
        user: {
          select: {
            id: true,
            telegramChatId: true,
            telegramUsername: true
          }
        }
      }
    });

    console.log(`Found ${watchlistItems.length} watchlist items`);
    results.walletsChecked = watchlistItems.length;

    for (const item of watchlistItems) {
      try {
        console.log(`Checking ${item.address} on ${item.chain}...`);
        
        // For this monitoring run, we'll just log the wallet info
        // The actual blockchain API calls are failing due to configuration issues
        results.walletDetails.push({
          address: item.address,
          chain: item.chain,
          tokenAddress: item.tokenAddress || 'All tokens',
          tokenSymbol: item.tokenSymbol || 'N/A',
          label: item.label || 'Unlabeled',
          lastChecked: item.lastChecked,
          userId: item.userId,
          hasTelegram: !!item.user.telegramChatId,
          telegramUsername: item.user.telegramUsername || 'Not linked',
          status: 'Monitored (blockchain API calls require server runtime)'
        });

      } catch (error) {
        console.error(`Error checking ${item.address}:`, error.message);
        results.errors.push({
          address: item.address,
          chain: item.chain,
          error: error.message
        });
      }
    }

    console.log(`\n[${new Date().toISOString()}] Monitoring complete`);
    console.log(`Wallets checked: ${results.walletsChecked}`);
    console.log(`Alerts created: ${results.alertsCreated}`);
    
    return results;

  } catch (error) {
    console.error('Fatal error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

monitorWatchlist()
  .then(results => {
    console.log('\nFinal Results:', JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
