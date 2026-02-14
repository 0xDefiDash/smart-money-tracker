const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkWatchlist() {
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
        
        // For now, we'll just log that we checked it
        // In a real implementation, this would call blockchain APIs
        results.push({
          address: item.walletAddress,
          chain: item.chain,
          newTransactions: 0,
          checked: true
        });
        
      } catch (error) {
        console.error(`Error checking ${item.walletAddress}:`, error.message);
        results.push({
          address: item.walletAddress,
          chain: item.chain,
          error: error.message
        });
      }
    }

    const endTimestamp = new Date().toISOString();
    console.log(`[${endTimestamp}] Monitoring complete`);
    console.log(`Wallets checked: ${walletsChecked}`);
    console.log(`Alerts created: ${alertsCreated}`);

    return {
      success: true,
      walletsChecked,
      alertsCreated,
      results,
      timestamp: endTimestamp
    };

  } catch (error) {
    console.error('Monitoring failed:', error);
    return {
      success: false,
      error: error.message,
      walletsChecked: 0,
      alertsCreated: 0,
      results: [],
      timestamp: new Date().toISOString()
    };
  } finally {
    await prisma.$disconnect();
  }
}

checkWatchlist()
  .then(result => {
    console.log('\nFinal Result:', JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
