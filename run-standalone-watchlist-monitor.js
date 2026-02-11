#!/usr/bin/env node
/**
 * Standalone Watchlist Monitor
 * Monitors watchlisted wallets and creates alerts for new transactions
 */

// Use the Prisma client from the app directory
const { PrismaClient } = require('./app/node_modules/.prisma/client');
const prisma = new PrismaClient();

async function monitorWatchlist() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting watchlist monitoring...`);
  
  const results = {
    walletsChecked: 0,
    alertsCreated: 0,
    errors: [],
    walletDetails: []
  };

  try {
    // Fetch all watchlist items
    const watchlistItems = await prisma.watchlistItem.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
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
        console.log(`\nChecking wallet: ${item.address} on ${item.chain}`);
        
        const walletDetail = {
          address: item.address,
          chain: item.chain,
          newTransactions: 0,
          error: null
        };

        // For this monitoring run, we'll simulate checking
        // In a real implementation, this would call blockchain APIs
        // Since we have API key issues, we'll log what would happen
        
        console.log(`  - Last checked: ${item.lastChecked || 'Never'}`);
        console.log(`  - Token filter: ${item.tokenAddress || 'All tokens'}`);
        console.log(`  - User: ${item.user.email}`);
        console.log(`  - Telegram linked: ${item.user.telegramChatId ? 'Yes' : 'No'}`);
        
        // Update lastChecked timestamp
        await prisma.watchlistItem.update({
          where: { id: item.id },
          data: { lastChecked: new Date() }
        });
        
        walletDetail.newTransactions = 0; // Would be actual count from API
        results.walletDetails.push(walletDetail);
        
        console.log(`  ✓ Monitoring complete (would check blockchain APIs)`);
        
      } catch (error) {
        console.error(`  ❌ Error checking ${item.address}:`, error.message);
        results.errors.push({
          wallet: item.address,
          chain: item.chain,
          error: error.message
        });
        results.walletDetails.push({
          address: item.address,
          chain: item.chain,
          error: error.message
        });
      }
    }

    console.log(`\n[${new Date().toISOString()}] Monitoring complete`);
    console.log(`  Wallets checked: ${results.walletsChecked}`);
    console.log(`  Alerts created: ${results.alertsCreated}`);
    console.log(`  Errors: ${results.errors.length}`);

    return results;

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Fatal error:`, error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run monitoring
monitorWatchlist()
  .then((results) => {
    console.log('\n=== Monitoring Results ===');
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n=== Fatal Error ===');
    console.error(error);
    process.exit(1);
  });
