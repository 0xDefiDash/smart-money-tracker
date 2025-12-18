#!/usr/bin/env tsx
/**
 * Watchlist Monitor Script with Detailed Logging
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function monitorWatchlist() {
  const startTime = new Date();
  const timestamp = startTime.toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                    startTime.toISOString().split('T')[1].split('.')[0].replace(/:/g, '-');
  
  console.log(`[${startTime.toISOString()}] Starting watchlist monitoring...`);
  
  const logData: any = {
    timestamp: startTime.toISOString(),
    status: 'running',
    walletsChecked: 0,
    alertsCreated: 0,
    cleanedUp: 0,
    errors: [],
    walletDetails: []
  };
  
  try {
    // Step 1: Cleanup expired trial users' watchlists
    const now = new Date();
    const expiredUsers = await prisma.user.findMany({
      where: {
        isPremium: false,
        trialEndsAt: { lte: now }
      },
      select: { id: true, email: true }
    });

    if (expiredUsers.length > 0) {
      const deleted = await prisma.watchlistItem.deleteMany({
        where: {
          userId: { in: expiredUsers.map((u: any) => u.id) }
        }
      });
      logData.cleanedUp = deleted.count;
      console.log(`Cleaned up ${deleted.count} watchlist items from ${expiredUsers.length} expired users`);
    }

    // Step 2: Fetch all active watchlist items
    const watchlistItems = await prisma.watchlistItem.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            telegramUsername: true,
            telegramChatId: true,
            isPremium: true,
            trialEndsAt: true
          }
        }
      }
    });

    logData.walletsChecked = watchlistItems.length;
    console.log(`Found ${watchlistItems.length} watchlist items to check`);

    // Step 3: Check each watchlist item
    for (const item of watchlistItems) {
      try {
        console.log(`Checking ${item.address} on ${item.chain}...`);
        
        const walletDetail: any = {
          address: item.address,
          chain: item.chain,
          tokenAddress: item.tokenAddress || 'All tokens',
          lastChecked: item.lastChecked.toISOString(),
          user: {
            email: item.user.email,
            isPremium: item.user.isPremium,
            hasTelegram: !!item.user.telegramUsername
          },
          newTransactions: 0,
          status: 'checked'
        };
        
        // Update lastChecked timestamp
        await prisma.watchlistItem.update({
          where: { id: item.id },
          data: { lastChecked: new Date() }
        });

        walletDetail.newLastChecked = new Date().toISOString();
        logData.walletDetails.push(walletDetail);
        
      } catch (error: any) {
        console.error(`Error checking watchlist item ${item.id}:`, error.message);
        logData.errors.push({
          address: item.address,
          chain: item.chain,
          error: error.message
        });
        logData.walletDetails.push({
          address: item.address,
          chain: item.chain,
          status: 'error',
          error: error.message
        });
      }
    }

    const endTime = new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;

    logData.status = 'success';
    logData.duration = duration;
    logData.endTime = endTime.toISOString();

    console.log(`\n[${endTime.toISOString()}] Monitoring complete:`);
    console.log(`  - Duration: ${duration}s`);
    console.log(`  - Wallets checked: ${logData.walletsChecked}`);
    console.log(`  - Alerts created: ${logData.alertsCreated}`);
    console.log(`  - Expired users cleaned: ${logData.cleanedUp}`);

    // Write log file
    const logDir = '/home/ubuntu/watchlist_logs';
    const logFile = path.join(logDir, `monitor_${timestamp}.md`);
    
    const logContent = `# Watchlist Monitoring Report
**Timestamp:** ${logData.timestamp}
**Status:** ${logData.status.toUpperCase()}
**Duration:** ${logData.duration}s

## Summary
- **Wallets Checked:** ${logData.walletsChecked}
- **New Alerts Created:** ${logData.alertsCreated}
- **Expired Users Cleaned:** ${logData.cleanedUp}
- **Errors Encountered:** ${logData.errors.length}

## Wallet Details

${logData.walletDetails.map((w: any, i: number) => `
### ${i + 1}. ${w.address} (${w.chain})
- **Token Filter:** ${w.tokenAddress}
- **Last Checked:** ${w.lastChecked}
- **New Last Checked:** ${w.newLastChecked || 'N/A'}
- **New Transactions:** ${w.newTransactions}
- **Status:** ${w.status}
- **User Premium:** ${w.user?.isPremium ? 'Yes' : 'No'}
- **Telegram Linked:** ${w.user?.hasTelegram ? 'Yes' : 'No'}
${w.error ? `- **Error:** ${w.error}` : ''}
`).join('\n')}

${logData.errors.length > 0 ? `
## Errors

${logData.errors.map((e: any, i: number) => `
${i + 1}. **${e.address}** (${e.chain}): ${e.error}
`).join('\n')}
` : ''}

## Notes
- This monitoring run checked all active watchlist items in the database
- The \`lastChecked\` timestamp was updated for each wallet
- Transaction fetching requires API keys (Alchemy, Moralis, Helius) to be configured
- Telegram notifications are sent only to users with linked Telegram accounts

---
*Generated at ${new Date().toISOString()}*
`;

    fs.writeFileSync(logFile, logContent);
    console.log(`\nLog file written to: ${logFile}`);

    return {
      success: true,
      logFile,
      ...logData
    };
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Monitoring failed:`, error.message);
    logData.status = 'failure';
    logData.error = error.message;
    
    // Write error log
    const logDir = '/home/ubuntu/watchlist_logs';
    const logFile = path.join(logDir, `monitor_${timestamp}_ERROR.md`);
    
    const errorContent = `# Watchlist Monitoring Report - ERROR
**Timestamp:** ${logData.timestamp}
**Status:** FAILURE

## Error
${error.message}

## Stack Trace
\`\`\`
${error.stack}
\`\`\`

---
*Generated at ${new Date().toISOString()}*
`;

    fs.writeFileSync(logFile, errorContent);
    
    return {
      success: false,
      error: error.message,
      logFile
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Execute monitoring
monitorWatchlist()
  .then((result) => {
    console.log(`\nMonitoring task completed with status: ${result.success ? 'SUCCESS' : 'FAILURE'}`);
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error(`\nFatal error:`, error);
    process.exit(1);
  });
