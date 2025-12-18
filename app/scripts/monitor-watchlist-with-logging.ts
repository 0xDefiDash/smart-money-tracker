#!/usr/bin/env ts-node
/**
 * Standalone Watchlist Monitor Script with Detailed Logging
 * Monitors watchlisted wallets and generates comprehensive logs
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface MonitoringResult {
  address: string;
  chain: string;
  tokenAddress?: string | null | undefined;
  newTransactions?: number;
  error?: string;
  userEmail?: string | null | undefined;
  hasTelegram?: boolean;
}

interface MonitoringSummary {
  success: boolean;
  walletsChecked: number;
  alertsCreated: number;
  results: MonitoringResult[];
  startTime: Date;
  endTime: Date;
  duration: number;
  error?: string;
  expiredUsersCleanedUp?: number;
  watchlistItemsDeleted?: number;
}

async function monitorWatchlist(): Promise<MonitoringSummary> {
  const startTime = new Date();
  console.log(`[${startTime.toISOString()}] Starting watchlist monitoring...`);
  
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

    let watchlistItemsDeleted = 0;
    if (expiredUsers.length > 0) {
      const deleted = await prisma.watchlistItem.deleteMany({
        where: {
          userId: { in: expiredUsers.map((u: any) => u.id) }
        }
      });
      watchlistItemsDeleted = deleted.count;
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

    console.log(`Found ${watchlistItems.length} watchlist items to monitor`);

    let alertsCreated = 0;
    const results: MonitoringResult[] = [];

    // Step 3: Check each watchlist item
    for (const item of watchlistItems) {
      try {
        console.log(`Checking ${item.address} on ${item.chain}${item.tokenAddress ? ` (token: ${item.tokenAddress})` : ''}...`);
        
        // Update lastChecked timestamp
        await prisma.watchlistItem.update({
          where: { id: item.id },
          data: { lastChecked: new Date() }
        });

        results.push({
          address: item.address,
          chain: item.chain,
          tokenAddress: item.tokenAddress ?? undefined,
          newTransactions: 0,
          userEmail: item.user.email,
          hasTelegram: !!item.user.telegramUsername
        });
      } catch (error: any) {
        console.error(`Error checking watchlist item ${item.id}:`, error.message);
        results.push({
          address: item.address,
          chain: item.chain,
          tokenAddress: item.tokenAddress ?? undefined,
          error: error.message,
          userEmail: item.user.email,
          hasTelegram: !!item.user.telegramUsername
        });
      }
    }

    const endTime = new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;

    console.log(`\n[${endTime.toISOString()}] Monitoring complete:`);
    console.log(`  - Duration: ${duration.toFixed(2)}s`);
    console.log(`  - Wallets checked: ${watchlistItems.length}`);
    console.log(`  - Alerts created: ${alertsCreated}`);

    return {
      success: true,
      walletsChecked: watchlistItems.length,
      alertsCreated,
      results,
      startTime,
      endTime,
      duration,
      expiredUsersCleanedUp: expiredUsers.length,
      watchlistItemsDeleted
    };
  } catch (error: any) {
    const endTime = new Date();
    console.error(`[${endTime.toISOString()}] Monitoring failed:`, error.message);
    return {
      success: false,
      error: error.message,
      walletsChecked: 0,
      alertsCreated: 0,
      results: [],
      startTime,
      endTime,
      duration: (endTime.getTime() - startTime.getTime()) / 1000
    };
  } finally {
    await prisma.$disconnect();
  }
}

function generateMarkdownReport(summary: MonitoringSummary): string {
  const { success, walletsChecked, alertsCreated, results, startTime, endTime, duration, error, expiredUsersCleanedUp, watchlistItemsDeleted } = summary;
  
  let markdown = `# Watchlist Monitoring Report\n\n`;
  markdown += `**Timestamp:** ${startTime.toISOString()}\n\n`;
  markdown += `**Duration:** ${duration.toFixed(2)} seconds\n\n`;
  markdown += `**Status:** ${success ? '✅ SUCCESS' : '❌ FAILED'}\n\n`;
  
  if (error) {
    markdown += `## Error\n\n\`\`\`\n${error}\n\`\`\`\n\n`;
  }
  
  markdown += `## Summary\n\n`;
  markdown += `- **Wallets Checked:** ${walletsChecked}\n`;
  markdown += `- **New Alerts Created:** ${alertsCreated}\n`;
  
  if (expiredUsersCleanedUp && expiredUsersCleanedUp > 0) {
    markdown += `- **Expired Users Cleaned Up:** ${expiredUsersCleanedUp}\n`;
    markdown += `- **Watchlist Items Deleted:** ${watchlistItemsDeleted}\n`;
  }
  
  markdown += `\n## Wallet Details\n\n`;
  
  if (results.length === 0) {
    markdown += `*No watchlist items found.*\n\n`;
  } else {
    markdown += `| Address | Chain | Token | Transactions | Telegram | Status |\n`;
    markdown += `|---------|-------|-------|--------------|----------|--------|\n`;
    
    for (const result of results) {
      const addressShort = `${result.address.substring(0, 6)}...${result.address.substring(result.address.length - 4)}`;
      const tokenShort = result.tokenAddress 
        ? `${result.tokenAddress.substring(0, 6)}...${result.tokenAddress.substring(result.tokenAddress.length - 4)}`
        : '-';
      const telegramStatus = result.hasTelegram ? '✅' : '❌';
      const status = result.error ? `❌ ${result.error}` : result.newTransactions && result.newTransactions > 0 ? `🔔 ${result.newTransactions} new` : '✓ No new';
      
      markdown += `| ${addressShort} | ${result.chain} | ${tokenShort} | ${result.newTransactions || 0} | ${telegramStatus} | ${status} |\n`;
    }
  }
  
  markdown += `\n## Detailed Results\n\n`;
  
  for (const result of results) {
    markdown += `### ${result.address}\n\n`;
    markdown += `- **Chain:** ${result.chain}\n`;
    if (result.tokenAddress) {
      markdown += `- **Token Address:** ${result.tokenAddress}\n`;
    }
    markdown += `- **User:** ${result.userEmail}\n`;
    markdown += `- **Telegram Linked:** ${result.hasTelegram ? 'Yes' : 'No'}\n`;
    markdown += `- **New Transactions:** ${result.newTransactions || 0}\n`;
    
    if (result.error) {
      markdown += `- **Error:** ${result.error}\n`;
    }
    
    markdown += `\n`;
  }
  
  markdown += `---\n\n`;
  markdown += `*Report generated at ${endTime.toISOString()}*\n`;
  
  return markdown;
}

// Execute monitoring and save report
monitorWatchlist()
  .then((summary) => {
    console.log(`\n[${new Date().toISOString()}] Generating report...`);
    
    // Generate markdown report
    const report = generateMarkdownReport(summary);
    
    // Save to file
    const timestamp = summary.startTime.toISOString().replace(/[:.]/g, '-').split('T').join('_').split('Z')[0];
    const logDir = '/home/ubuntu/watchlist_logs';
    const logFile = path.join(logDir, `monitor_${timestamp}.md`);
    
    // Ensure directory exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    fs.writeFileSync(logFile, report);
    console.log(`Report saved to: ${logFile}`);
    
    // Also output to console
    console.log('\n' + report);
    
    process.exit(summary.success ? 0 : 1);
  })
  .catch((error) => {
    console.error(`\n[${new Date().toISOString()}] Fatal error:`, error);
    process.exit(1);
  });
