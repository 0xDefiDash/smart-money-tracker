#!/usr/bin/env node
/**
 * Standalone Watchlist Monitor
 * Starts the dev server, runs monitoring, then stops the server
 */

const { spawn } = require('child_process');
const http = require('http');

let serverProcess = null;
let monitoringResults = null;

function startServer() {
  return new Promise((resolve, reject) => {
    console.log('[Monitor] Starting Next.js dev server...');
    
    serverProcess = spawn('npm', ['run', 'dev'], {
      cwd: '/home/ubuntu/smart_money_tracker',
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let output = '';
    
    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
      if (output.includes('Ready in')) {
        console.log('[Monitor] Server is ready');
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      output += data.toString();
      if (output.includes('Ready in')) {
        console.log('[Monitor] Server is ready');
        resolve();
      }
    });

    serverProcess.on('error', (error) => {
      reject(error);
    });

    // Timeout after 60 seconds
    setTimeout(() => {
      if (output.includes('Ready in')) {
        resolve();
      } else {
        reject(new Error('Server startup timeout'));
      }
    }, 60000);
  });
}

function checkServer() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', (res) => {
      resolve(true);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function monitorWatchlist() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({});
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/watchlist/check',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 30000
    };

    console.log('[Monitor] Calling /api/watchlist/check...');
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('[Monitor] API Response:', JSON.stringify(result, null, 2));
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(postData);
    req.end();
  });
}

function stopServer() {
  if (serverProcess) {
    console.log('[Monitor] Stopping server...');
    serverProcess.kill('SIGTERM');
    
    setTimeout(() => {
      if (serverProcess && !serverProcess.killed) {
        serverProcess.kill('SIGKILL');
      }
    }, 5000);
  }
}

async function main() {
  try {
    // Start server
    await startServer();
    
    // Wait a bit more for full initialization
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check if server is responding
    const isServerUp = await checkServer();
    if (!isServerUp) {
      throw new Error('Server is not responding');
    }
    
    // Run monitoring
    monitoringResults = await monitorWatchlist();
    
    console.log('\n[Monitor] Monitoring completed successfully');
    console.log(`Wallets checked: ${monitoringResults.walletsChecked || 0}`);
    console.log(`Alerts created: ${monitoringResults.alertsCreated || 0}`);
    
    // Output results for logging
    console.log('\n=== MONITORING RESULTS ===');
    console.log(JSON.stringify(monitoringResults, null, 2));
    
    stopServer();
    process.exit(0);
    
  } catch (error) {
    console.error('[Monitor] Error:', error.message);
    stopServer();
    process.exit(1);
  }
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  stopServer();
  process.exit(1);
});

process.on('SIGTERM', () => {
  stopServer();
  process.exit(1);
});

main();
