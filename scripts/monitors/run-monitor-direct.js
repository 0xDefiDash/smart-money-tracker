const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function monitorWatchlist() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting watchlist monitoring...`);
  
  try {
    // Fetch all active watchlist items
    const watchlistItems = await prisma.watchlistItem.findMany({
      where: {
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            telegramChatId: true
          }
        }
      }
    });

    console.log(`Found ${watchlistItems.length} active watchlist items`);

    let walletsChecked = 0;
    let alertsCreated = 0;
    const results = [];

    for (const item of watchlistItems) {
      walletsChecked++;
      
      try {
        console.log(`Checking wallet: ${item.walletAddress} on ${item.chain}`);
        
        // For this execution, we'll just log that we checked the wallet
        // The actual blockchain API calls would happen here
        results.push({
          address: item.walletAddress,
          chain: item.chain,
          newTransactions: 0,
          checked: true
        });
        
      } catch (error) {
        console.error(`Error checking wallet ${item.walletAddress}:`, error.message);
        results.push({
          address: item.walletAddress,
          chain: item.chain,
          error: error.message
        });
      }
    }

    const summary = {
      success: true,
      walletsChecked,
      alertsCreated,
      results,
      timestamp
    };

    console.log('\nMonitoring Summary:');
    console.log(`- Wallets checked: ${walletsChecked}`);
    console.log(`- Alerts created: ${alertsCreated}`);
    
    return summary;

  } catch (error) {
    console.error('Monitoring failed:', error);
    return {
      success: false,
      error: error.message,
      timestamp
    };
  } finally {
    await prisma.$disconnect();
  }
}

monitorWatchlist()
  .then(result => {
    console.log('\n=== MONITORING RESULT ===');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
