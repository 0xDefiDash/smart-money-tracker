#!/usr/bin/env node
/**
 * Watchlist Monitor Script with Logging
 * Monitors watchlisted wallets and writes results to a log file
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Mock implementations for external dependencies
async function getWalletTransactions(address, chain, limit) {
  console.log(`  Fetching ${limit} transactions for ${address} on ${chain}...`);
  // Return empty array as we don't have real API keys configured
  return [];
}

async function getSolanaTokenTransfers(address) {
  console.log(`  Fetching Solana token transfers for ${address}...`);
  // Return empty array as we don't have real API keys configured
  return [];
}

async function notifyWalletTransaction(data) {
  console.log(`  📱 Would send Telegram notification to ${data.username}`);
  // Mock notification - actual implementation requires Telegram bot token
}

async function monitorWatchlist() {
  const startTime = new Date();
  console.log(`[${startTime.toISOString()}] Starting watchlist monitoring...\n`);
  
  try {
    // Step 1: Cleanup expired trial users' watchlists
    const now = new Date();
    const expiredUsers = await prisma.user.findMany({
      where: {
        isPremium: false,
        trialEndsAt: { lte: now }
      },
      select: { id: true }
    });

    let cleanupInfo = null;
    if (expiredUsers.length > 0) {
      const deleted = await prisma.watchlistItem.deleteMany({
        where: {
          userId: { in: expiredUsers.map(u => u.id) }
        }
      });
      cleanupInfo = {
        expiredUsers: expiredUsers.length,
        deletedItems: deleted.count
      };
      console.log(`✓ Cleaned up ${deleted.count} watchlist items from ${expiredUsers.length} expired users\n`);
    }

    // Step 2: Fetch all active watchlist items
    const watchlistItems = await prisma.watchlistItem.findMany({
      include: {
        user: {
          select: {
            id: true,
            telegramUsername: true,
            telegramChatId: true,
            isPremium: true,
            trialEndsAt: true
          }
        }
      }
    });

    console.log(`Found ${watchlistItems.length} watchlist items to monitor\n`);

    let alertsCreated = 0;
    const results = [];
    const errors = [];

    // Step 3: Check each watchlist item for new transactions
    for (const item of watchlistItems) {
      console.log(`Checking: ${item.address} (${item.chain})`);
      
      try {
        let transactions = [];

        // Fetch transactions based on chain
        if (item.chain === 'solana') {
          transactions = await getSolanaTokenTransfers(item.address);
        } else {
          transactions = await getWalletTransactions(item.address, item.chain, 10);
        }

        // Filter for new transactions (since lastChecked)
        const newTransactions = transactions.filter(tx => {
          const txTime = new Date(tx.timestamp || tx.blockTimestamp);
          return txTime > item.lastChecked;
        });

        console.log(`  Found ${newTransactions.length} new transactions`);

        // Process each new transaction
        for (const tx of newTransactions) {
          // If token-specific monitoring, filter by token
          if (item.tokenAddress) {
            const hasTokenTransfer = tx.tokenTransfers?.some(
              transfer =>
                transfer.rawContract?.address?.toLowerCase() ===
                item.tokenAddress?.toLowerCase() ||
                transfer.contractAddress?.toLowerCase() ===
                item.tokenAddress?.toLowerCase() ||
                transfer.tokenAddress?.toLowerCase() ===
                item.tokenAddress?.toLowerCase()
            );
            if (!hasTokenTransfer) continue;
          }

          // Determine transaction type
          const isSent = tx.from?.toLowerCase() === item.address.toLowerCase();
          const isReceived = tx.to?.toLowerCase() === item.address.toLowerCase();
          const type = isSent ? 'sent' : isReceived ? 'received' : 'contract';

          // Extract token transfer details
          let tokenTransfer = null;
          if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
            const transfer = tx.tokenTransfers[0];
            tokenTransfer = {
              address: transfer.rawContract?.address || transfer.contractAddress || transfer.tokenAddress,
              symbol: transfer.asset || transfer.tokenSymbol,
              amount: transfer.valueFormatted || transfer.value
            };
          }

          // Create transaction alert
          try {
            const alert = await prisma.transactionAlert.create({
              data: {
                userId: item.user.id,
                walletAddress: item.address,
                chain: item.chain,
                transactionHash: tx.hash,
                fromAddress: tx.from,
                toAddress: tx.to,
                value: tx.value,
                tokenAddress: tokenTransfer?.address,
                tokenSymbol: tokenTransfer?.symbol,
                tokenAmount: tokenTransfer?.amount,
                type
              }
            });

            alertsCreated++;
            console.log(`  ✓ Created alert for transaction ${tx.hash.substring(0, 10)}...`);

            // Send Telegram notification
            if (item.user.telegramUsername) {
              await notifyWalletTransaction({
                username: item.user.telegramUsername,
                walletAddress: item.address,
                chain: item.chain,
                transactionHash: tx.hash,
                type,
                value: tx.value,
                tokenSymbol: tokenTransfer?.symbol,
                tokenAmount: tokenTransfer?.amount
              });
            }
          } catch (error) {
            // Skip if duplicate alert (same tx hash for same user)
            if (error.code === 'P2002') {
              console.log(`  ⚠ Duplicate alert skipped for ${tx.hash.substring(0, 10)}...`);
              continue;
            }
            throw error;
          }
        }

        // Update lastChecked timestamp
        await prisma.watchlistItem.update({
          where: { id: item.id },
          data: { lastChecked: new Date() }
        });

        results.push({
          address: item.address,
          chain: item.chain,
          tokenAddress: item.tokenAddress || null,
          newTransactions: newTransactions.length,
          lastChecked: new Date().toISOString(),
          success: true
        });

        console.log(`  ✓ Updated lastChecked timestamp\n`);
      } catch (error) {
        console.error(`  ❌ Error: ${error.message}\n`);
        const errorInfo = {
          address: item.address,
          chain: item.chain,
          error: error.message,
          success: false
        };
        results.push(errorInfo);
        errors.push(errorInfo);
      }
    }

    const endTime = new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Monitoring Complete`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Duration: ${duration.toFixed(2)}s`);
    console.log(`Wallets Checked: ${watchlistItems.length}`);
    console.log(`Alerts Created: ${alertsCreated}`);
    console.log(`Successful: ${results.filter(r => r.success).length}`);
    console.log(`Failed: ${results.filter(r => !r.success).length}`);
    console.log(`${'='.repeat(60)}\n`);

    return {
      success: true,
      walletsChecked: watchlistItems.length,
      alertsCreated,
      results,
      errors,
      cleanupInfo,
      duration,
      startTime,
      endTime
    };
  } catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    console.error(error.stack);
    return {
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date()
    };
  } finally {
    await prisma.$disconnect();
  }
}

function generateMarkdownReport(result) {
  const timestamp = result.startTime || result.timestamp;
  const formattedDate = new Date(timestamp).toISOString().replace(/[:.]/g, '-').split('T')[0];
  const formattedTime = new Date(timestamp).toISOString().replace(/[:.]/g, '-').split('T')[1].split('Z')[0];
  
  let markdown = `# Watchlist Monitoring Report\n\n`;
  markdown += `**Date:** ${new Date(timestamp).toLocaleString()}\n\n`;
  
  if (!result.success) {
    markdown += `## ❌ Monitoring Failed\n\n`;
    markdown += `**Error:** ${result.error}\n\n`;
    if (result.stack) {
      markdown += `### Stack Trace\n\n\`\`\`\n${result.stack}\n\`\`\`\n\n`;
    }
    return markdown;
  }
  
  markdown += `## Summary\n\n`;
  markdown += `| Metric | Value |\n`;
  markdown += `|--------|-------|\n`;
  markdown += `| Duration | ${result.duration.toFixed(2)}s |\n`;
  markdown += `| Wallets Checked | ${result.walletsChecked} |\n`;
  markdown += `| Alerts Created | ${result.alertsCreated} |\n`;
  markdown += `| Successful | ${result.results.filter(r => r.success).length} |\n`;
  markdown += `| Failed | ${result.results.filter(r => !r.success).length} |\n\n`;
  
  if (result.cleanupInfo) {
    markdown += `## Cleanup\n\n`;
    markdown += `- Expired trial users: ${result.cleanupInfo.expiredUsers}\n`;
    markdown += `- Watchlist items deleted: ${result.cleanupInfo.deletedItems}\n\n`;
  }
  
  markdown += `## Wallet Details\n\n`;
  
  if (result.results.length === 0) {
    markdown += `*No wallets monitored*\n\n`;
  } else {
    for (const wallet of result.results) {
      const icon = wallet.success ? '✅' : '❌';
      markdown += `### ${icon} ${wallet.address}\n\n`;
      markdown += `- **Chain:** ${wallet.chain}\n`;
      
      if (wallet.tokenAddress) {
        markdown += `- **Token Address:** ${wallet.tokenAddress}\n`;
      }
      
      if (wallet.success) {
        markdown += `- **New Transactions:** ${wallet.newTransactions}\n`;
        markdown += `- **Last Checked:** ${wallet.lastChecked}\n`;
      } else {
        markdown += `- **Error:** ${wallet.error}\n`;
      }
      
      markdown += `\n`;
    }
  }
  
  if (result.errors && result.errors.length > 0) {
    markdown += `## Errors Encountered\n\n`;
    for (const error of result.errors) {
      markdown += `- **${error.address}** (${error.chain}): ${error.error}\n`;
    }
    markdown += `\n`;
  }
  
  markdown += `---\n\n`;
  markdown += `*Report generated at ${new Date().toISOString()}*\n`;
  
  return markdown;
}

// Execute monitoring and write log
monitorWatchlist()
  .then((result) => {
    // Generate markdown report
    const markdown = generateMarkdownReport(result);
    
    // Create log filename with timestamp
    const timestamp = (result.startTime || result.timestamp).toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0];
    const logDir = '/home/ubuntu/watchlist_logs';
    const logFile = path.join(logDir, `monitor_${timestamp}.md`);
    
    // Write to file
    fs.writeFileSync(logFile, markdown);
    console.log(`\n📝 Log file written to: ${logFile}\n`);
    
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error(`\nFatal error:`, error);
    process.exit(1);
  });
