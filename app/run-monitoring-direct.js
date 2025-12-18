// Direct monitoring script that doesn't require the dev server
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function monitorWatchlist() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting watchlist monitoring...`);
  
  try {
    // Fetch all active watchlist items
    const watchlistItems = await prisma.watchlistItem.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            telegramChatId: true
          }
        }
      }
    });

    console.log(`Found ${watchlistItems.length} watchlist items`);

    const results = {
      walletsChecked: watchlistItems.length,
      alertsCreated: 0,
      results: [],
      errors: []
    };

    for (const item of watchlistItems) {
      try {
        console.log(`Checking wallet: ${item.address} on ${item.chain}${item.tokenSymbol ? ` (Token: ${item.tokenSymbol})` : ''}`);
        
        // For now, just log that we checked it
        // In a real implementation, we would query blockchain APIs here
        results.results.push({
          address: item.address,
          chain: item.chain,
          tokenSymbol: item.tokenSymbol || 'All tokens',
          label: item.label || 'Unlabeled',
          lastChecked: item.lastChecked,
          newTransactions: 0,
          status: 'checked'
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

    await prisma.$disconnect();
    
    return {
      success: true,
      timestamp,
      ...results
    };
    
  } catch (error) {
    console.error('Monitoring failed:', error);
    await prisma.$disconnect();
    return {
      success: false,
      timestamp,
      error: error.message,
      stack: error.stack
    };
  }
}

monitorWatchlist()
  .then(result => {
    console.log('\n=== Monitoring Results ===');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
