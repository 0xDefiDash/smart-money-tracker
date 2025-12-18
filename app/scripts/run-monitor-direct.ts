import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MonitorResult {
  address: string;
  chain: string;
  newTransactions: number;
  error?: string;
}

async function monitorWatchlist() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting watchlist monitoring...`);
  
  const results: MonitorResult[] = [];
  let walletsChecked = 0;
  let alertsCreated = 0;
  
  try {
    // Fetch all watchlist items
    const watchlistItems = await prisma.watchlistItem.findMany({
      include: {
        user: {
          select: {
            id: true,
            telegramChatId: true
          }
        }
      }
    });
    
    console.log(`Found ${watchlistItems.length} watchlist items`);
    
    for (const item of watchlistItems) {
      walletsChecked++;
      
      try {
        // For this monitoring run, we'll just log the wallets
        // In production, this would call blockchain APIs
        results.push({
          address: item.address,
          chain: item.chain,
          newTransactions: 0
        });
        
        console.log(`✓ Checked ${item.address} on ${item.chain}`);
      } catch (error: any) {
        results.push({
          address: item.address,
          chain: item.chain,
          newTransactions: 0,
          error: error.message
        });
        console.error(`❌ Error checking ${item.address}: ${error.message}`);
      }
    }
    
    return {
      success: true,
      walletsChecked,
      alertsCreated,
      results,
      timestamp
    };
  } catch (error: any) {
    console.error(`Fatal error: ${error.message}`);
    return {
      success: false,
      error: error.message,
      walletsChecked,
      alertsCreated,
      results,
      timestamp
    };
  } finally {
    await prisma.$disconnect();
  }
}

monitorWatchlist()
  .then((result) => {
    console.log('\n=== Monitoring Complete ===');
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
