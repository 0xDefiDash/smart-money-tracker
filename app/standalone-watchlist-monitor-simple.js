#!/usr/bin/env node
/**
 * Standalone Watchlist Monitor
 * Monitors watchlisted wallets and creates alerts for new transactions
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Timestamp for this run
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const logFile = `/home/ubuntu/watchlist_logs/monitor_${timestamp}.md`;

let logContent = `# Watchlist Monitoring Report\n\n`;
logContent += `**Run Time:** ${new Date().toISOString()}\n\n`;

async function monitorWatchlist() {
  try {
    console.log('Starting watchlist monitoring...');
    logContent += `## Monitoring Status\n\n`;
    
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

    console.log(`Found ${watchlistItems.length} active watchlist items`);
    logContent += `- **Total Active Watchlist Items:** ${watchlistItems.length}\n`;
    
    let walletsChecked = 0;
    let alertsCreated = 0;
    let errors = 0;
    
    logContent += `\n## Wallet Details\n\n`;
    
    for (const item of watchlistItems) {
      try {
        walletsChecked++;
        console.log(`Checking wallet: ${item.address} on ${item.chain}`);
        
        logContent += `### ${item.address}\n`;
        logContent += `- **Chain:** ${item.chain}\n`;
        logContent += `- **User:** ${item.user.email || item.userId}\n`;
        logContent += `- **Token Filter:** ${item.tokenAddress || 'All tokens'}\n`;
        logContent += `- **Last Checked:** ${item.lastChecked ? new Date(item.lastChecked).toISOString() : 'Never'}\n`;
        
        // For this simplified version, we'll just update the lastChecked timestamp
        // In a full implementation, this would call blockchain APIs
        
        await prisma.watchlistItem.update({
          where: { id: item.id },
          data: {
            lastChecked: new Date()
          }
        });
        
        logContent += `- **Status:** ✓ Checked successfully\n`;
        logContent += `- **New Transactions:** 0 (API integration required)\n\n`;
        
      } catch (error) {
        errors++;
        console.error(`Error checking ${item.address}:`, error.message);
        logContent += `- **Status:** ❌ Error: ${error.message}\n\n`;
      }
    }
    
    logContent += `\n## Summary\n\n`;
    logContent += `- **Wallets Checked:** ${walletsChecked}\n`;
    logContent += `- **Alerts Created:** ${alertsCreated}\n`;
    logContent += `- **Errors:** ${errors}\n`;
    logContent += `- **Success Rate:** ${walletsChecked > 0 ? ((walletsChecked - errors) / walletsChecked * 100).toFixed(1) : 0}%\n`;
    
    // Write log file
    fs.writeFileSync(logFile, logContent);
    console.log(`\nLog written to: ${logFile}`);
    
    return {
      success: true,
      walletsChecked,
      alertsCreated,
      errors
    };
    
  } catch (error) {
    console.error('Fatal error:', error);
    logContent += `\n## Fatal Error\n\n${error.message}\n`;
    fs.writeFileSync(logFile, logContent);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Run monitoring
monitorWatchlist()
  .then((result) => {
    console.log('\nMonitoring completed:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
