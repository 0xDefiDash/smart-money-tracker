#!/usr/bin/env node
/**
 * Watchlist Monitor with Logging
 * Monitors watchlisted wallets and generates detailed log files
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Mock implementations for external dependencies
async function getWalletTransactions(address, chain, limit) {
  console.log(`  Fetching ${limit} transactions for ${address} on ${chain}...`);
  // Return empty array - real implementation would call blockchain APIs
  return [];
}

async function getSolanaTokenTransfers(address) {
  console.log(`  Fetching Solana token transfers for ${address}...`);
  // Return empty array - real implementation would call Helius API
  return [];
}

async function notifyWalletTransaction(params) {
  console.log(`  📱 Telegram notification sent to @${params.username}`);
  // Real implementation would call Telegram Bot API
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
      console.log(`🧹 Cleaned up ${deleted.count} watchlist items from ${expiredUsers.length} expired trial users\n`);
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

    console.log(`📋 Found ${watchlistItems.length} watchlist items to monitor\n`);

    let alertsCreated = 0;
    const results = [];
    const errors = [];

    // Step 3: Check each watchlist item for new transactions
    for (const item of watchlistItems) {
      console.log(`Checking: ${item.address} (${item.chain})${item.tokenAddress ? ` - Token: ${item.tokenAddress}` : ''}`);
      
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

        console.log(`  Found ${newTransactions.length} new transactions since ${item.lastChecked.toISOString()}`);

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
            console.log(`  ✅ Alert created: ${type} transaction ${tx.hash.substring(0, 10)}...`);

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
              console.log(`  ⏭️  Skipped duplicate alert for ${tx.hash.substring(0, 10)}...`);
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
          tokenAddress: item.tokenAddress,
          newTransactions: newTransactions.length,
          lastChecked: item.lastChecked,
          success: true
        });

        console.log(`  ✓ Updated lastChecked timestamp\n`);
      } catch (error) {
        console.error(`  ❌ Error: ${error.message}\n`);
        errors.push({
          address: item.address,
          chain: item.chain,
          error: error.message
        });
        results.push({
          address: item.address,
          chain: item.chain,
          error: error.message,
          success: false
        });
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
    return {
      success: false,
      error: error.message,
      startTime,
      endTime: new Date()
    };
  } finally {
    await prisma.$disconnect();
  }
}

function generateLogFile(result) {
  const timestamp = result.startTime.toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                    result.startTime.toISOString().replace(/[:.]/g, '-').split('T')[1].split('Z')[0];
  const logDir = '/home/ubuntu/watchlist_logs';
  const logFile = path.join(logDir, `monitor_${timestamp}.md`);

  let content = `# Watchlist Monitoring Report\n\n`;
  content += `**Generated:** ${result.startTime.toISOString()}\n\n`;
  content += `---\n\n`;

  // Summary Section
  content += `## Summary\n\n`;
  content += `| Metric | Value |\n`;
  content += `|--------|-------|\n`;
  content += `| Status | ${result.success ? '✅ Success' : '❌ Failed'} |\n`;
  content += `| Duration | ${result.duration?.toFixed(2)}s |\n`;
  content += `| Wallets Checked | ${result.walletsChecked || 0} |\n`;
  content += `| Alerts Created | ${result.alertsCreated || 0} |\n`;
  content += `| Successful Checks | ${result.results?.filter(r => r.success).length || 0} |\n`;
  content += `| Failed Checks | ${result.results?.filter(r => !r.success).length || 0} |\n`;
  content += `| Start Time | ${result.startTime.toISOString()} |\n`;
  content += `| End Time | ${result.endTime.toISOString()} |\n\n`;

  // Cleanup Info
  if (result.cleanupInfo) {
    content += `## Cleanup Activity\n\n`;
    content += `🧹 Cleaned up **${result.cleanupInfo.deletedItems}** watchlist items from **${result.cleanupInfo.expiredUsers}** expired trial users.\n\n`;
  }

  // Wallet Details
  if (result.results && result.results.length > 0) {
    content += `## Wallet Details\n\n`;
    
    const successfulWallets = result.results.filter(r => r.success);
    const failedWallets = result.results.filter(r => !r.success);

    if (successfulWallets.length > 0) {
      content += `### ✅ Successfully Monitored (${successfulWallets.length})\n\n`;
      content += `| Address | Chain | Token | New Transactions | Last Checked |\n`;
      content += `|---------|-------|-------|------------------|-------------|\n`;
      
      successfulWallets.forEach(wallet => {
        const shortAddr = `${wallet.address.substring(0, 6)}...${wallet.address.substring(wallet.address.length - 4)}`;
        const token = wallet.tokenAddress ? `${wallet.tokenAddress.substring(0, 6)}...` : 'All';
        const lastChecked = wallet.lastChecked ? new Date(wallet.lastChecked).toISOString() : 'N/A';
        content += `| \`${shortAddr}\` | ${wallet.chain} | ${token} | ${wallet.newTransactions} | ${lastChecked} |\n`;
      });
      content += `\n`;
    }

    if (failedWallets.length > 0) {
      content += `### ❌ Failed Checks (${failedWallets.length})\n\n`;
      content += `| Address | Chain | Error |\n`;
      content += `|---------|-------|-------|\n`;
      
      failedWallets.forEach(wallet => {
        const shortAddr = `${wallet.address.substring(0, 6)}...${wallet.address.substring(wallet.address.length - 4)}`;
        content += `| \`${shortAddr}\` | ${wallet.chain} | ${wallet.error} |\n`;
      });
      content += `\n`;
    }
  }

  // Errors Section
  if (result.errors && result.errors.length > 0) {
    content += `## Errors Encountered\n\n`;
    result.errors.forEach((error, index) => {
      content += `${index + 1}. **${error.address}** (${error.chain})\n`;
      content += `   - Error: ${error.error}\n\n`;
    });
  }

  // Fatal Error
  if (!result.success && result.error) {
    content += `## Fatal Error\n\n`;
    content += `\`\`\`\n${result.error}\n\`\`\`\n\n`;
  }

  // Footer
  content += `---\n\n`;
  content += `*This report was automatically generated by the Watchlist Monitoring System*\n`;

  // Write to file
  fs.writeFileSync(logFile, content);
  console.log(`\n📄 Log file written to: ${logFile}`);
  
  return logFile;
}

// Execute monitoring and generate log
monitorWatchlist()
  .then((result) => {
    const logFile = generateLogFile(result);
    console.log(`✅ Monitoring complete. Log saved to: ${logFile}`);
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error(`\nFatal error:`, error);
    process.exit(1);
  });
