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
      timeout: 120000 // 2 minute timeout
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

          resolve(result);
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
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Execute monitoring
monitorWatchlist()
  .then((result) => {
    console.log(`\n[${new Date().toISOString()}] Monitoring task completed successfully`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`\n[${new Date().toISOString()}] Monitoring failed:`, error.message);
    process.exit(1);
  });
