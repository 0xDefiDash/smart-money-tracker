#!/usr/bin/env ts-node
/**
 * Watchlist Monitor Script
 * 
 * This script runs on a schedule to monitor all watchlisted wallets
 * and send alerts when transactions are detected.
 */

async function monitorWatchlist() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  console.log(`[${new Date().toISOString()}] Starting watchlist monitoring...`);
  
  try {
    const response = await fetch(`${baseUrl}/api/watchlist/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    
    console.log(`[${new Date().toISOString()}] Monitoring complete:`, {
      walletsChecked: data.walletsChecked,
      alertsCreated: data.alertsCreated,
      success: data.success
    });

    // Log details for each wallet
    if (data.results && data.results.length > 0) {
      console.log('\nWallet Details:');
      data.results.forEach((result: any) => {
        if (result.error) {
          console.error(`  ❌ ${result.address} (${result.chain}): ${result.error}`);
        } else if (result.newTransactions > 0) {
          console.log(`  🔔 ${result.address} (${result.chain}): ${result.newTransactions} new transaction(s)`);
        } else {
          console.log(`  ✓ ${result.address} (${result.chain}): No new transactions`);
        }
      });
    }

    return {
      success: true,
      walletsChecked: data.walletsChecked,
      alertsCreated: data.alertsCreated
    };
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Monitoring failed:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Execute monitoring
monitorWatchlist()
  .then((result) => {
    console.log(`\n[${new Date().toISOString()}] Monitoring task completed`, result);
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error(`\n[${new Date().toISOString()}] Fatal error:`, error);
    process.exit(1);
  });
