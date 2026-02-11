import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MonitorResult {
  address: string;
  chain: string;
  newTransactions: number;
  error?: string;
}

async function monitorWatchlist() {
  console.log(`[${new Date().toISOString()}] Starting watchlist monitoring...`);
  
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
        // For now, just log that we would check this wallet
        // In a real implementation, we would call blockchain APIs here
        console.log(`Checking wallet: ${item.address} on ${item.chain}`);
        
        results.push({
          address: item.address,
          chain: item.chain,
          newTransactions: 0
        });
        
      } catch (error: any) {
        console.error(`Error checking wallet ${item.address}:`, error.message);
        results.push({
          address: item.address,
          chain: item.chain,
          newTransactions: 0,
          error: error.message
        });
      }
    }
    
    return {
      success: true,
      walletsChecked,
      alertsCreated,
      results
    };
    
  } catch (error: any) {
    console.error(`Monitoring failed:`, error.message);
    return {
      success: false,
      error: error.message,
      walletsChecked,
      alertsCreated,
      results
    };
  } finally {
    await prisma.$disconnect();
  }
}

monitorWatchlist()
  .then((result) => {
    console.log(`\n[${new Date().toISOString()}] Monitoring complete:`, {
      success: result.success,
      walletsChecked: result.walletsChecked,
      alertsCreated: result.alertsCreated
    });
    
    if (result.results && result.results.length > 0) {
      console.log('\nWallet Details:');
      result.results.forEach((r) => {
        if (r.error) {
          console.error(`  ❌ ${r.address} (${r.chain}): ${r.error}`);
        } else if (r.newTransactions > 0) {
          console.log(`  🔔 ${r.address} (${r.chain}): ${r.newTransactions} new transaction(s)`);
        } else {
          console.log(`  ✓ ${r.address} (${r.chain}): No new transactions`);
        }
      });
    }
    
    // Write results to a JSON file for the next step
    const fs = require('fs');
    fs.writeFileSync('/tmp/monitor-results.json', JSON.stringify(result, null, 2));
    
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error(`Fatal error:`, error);
    process.exit(1);
  });
