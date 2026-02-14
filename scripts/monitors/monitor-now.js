#!/usr/bin/env node
/**
 * Standalone Watchlist Monitor
 * Calls the API endpoint to check watchlisted wallets
 */

const http = require('http');

async function monitorWatchlist() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting watchlist monitoring...`);
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/watchlist/check',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 60000 // 60 second timeout
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log(`[${new Date().toISOString()}] Monitoring complete:`, {
            walletsChecked: result.walletsChecked,
            alertsCreated: result.alertsCreated,
            success: result.success
          });

          // Log details for each wallet
          if (result.results && result.results.length > 0) {
            console.log('\nWallet Details:');
            result.results.forEach((item) => {
              if (item.error) {
                console.error(`  ❌ ${item.address} (${item.chain}): ${item.error}`);
              } else if (item.newTransactions > 0) {
                console.log(`  🔔 ${item.address} (${item.chain}): ${item.newTransactions} new transaction(s)`);
              } else {
                console.log(`  ✓ ${item.address} (${item.chain}): No new transactions`);
              }
            });
          }

          resolve({
            success: true,
            walletsChecked: result.walletsChecked,
            alertsCreated: result.alertsCreated,
            results: result.results || []
          });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout after 60 seconds'));
    });

    req.end();
  });
}

// Execute monitoring
monitorWatchlist()
  .then((result) => {
    console.log(`\n[${new Date().toISOString()}] Monitoring task completed successfully`);
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error(`\n[${new Date().toISOString()}] Monitoring failed:`, error.message);
    process.exit(1);
  });
