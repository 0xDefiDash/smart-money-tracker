const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/watchlist/check',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000
};

console.log(`[${new Date().toISOString()}] Starting watchlist monitoring...`);

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

      // Write results to file
      const fs = require('fs');
      const path = require('path');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const logDir = '/home/ubuntu/watchlist_logs';
      
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const logFile = path.join(logDir, `monitor_${timestamp}.json`);
      fs.writeFileSync(logFile, JSON.stringify(result, null, 2));
      console.log(`\nResults written to: ${logFile}`);
      
      process.exit(result.success ? 0 : 1);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Failed to parse response:`, error.message);
      console.error('Raw response:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error(`[${new Date().toISOString()}] Request failed:`, error.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error(`[${new Date().toISOString()}] Request timed out`);
  req.destroy();
  process.exit(1);
});

req.end();
