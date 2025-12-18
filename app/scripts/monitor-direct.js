#!/usr/bin/env node
/**
 * Direct Watchlist Monitor Script
 * Runs the monitoring logic directly without requiring the Next.js server
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mock implementations for external services
async function getWalletTransactions(address, chain, limit = 10) {
  console.log(`  Fetching transactions for ${address} on ${chain}...`);
  // In production, this would call Alchemy/Moralis/Etherscan APIs
  return [];
}

async function getSolanaTokenTransfers(address) {
  console.log(`  Fetching Solana transactions for ${address}...`);
  // In production, this would call Helius API
  return [];
}

async function notifyWalletTransaction(data) {
  console.log(`  📱 Telegram notification sent to @${data.username}`);
  // In production, this would call Telegram Bot API
  return true;
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

    if (expiredUsers.length > 0) {
      const deleted = await prisma.watchlistItem.deleteMany({
        where: {
          userId: { in: expiredUsers.map(u => u.id) }
        }
      });
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

        console.log(`  Found ${newTransactions.length} new transaction(s)`);

        // Process each new transaction
        for (const tx of newTransactions) {
          // If token-specific monitoring, filter by token
          if (item.tokenAddress) {
            const hasTokenTransfer = tx.tokenTransfers?.some(
              transfer =>
                transfer.rawContract?.address?.toLowerCase() === item.tokenAddress?.toLowerCase() ||
                transfer.contractAddress?.toLowerCase() === item.tokenAddress?.toLowerCase() ||
                transfer.tokenAddress?.toLowerCase() === item.tokenAddress?.toLowerCase()
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
            console.log(`  ✓ Alert created: ${tx.hash.substring(0, 10)}...`);

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
              console.log(`  ⚠ Duplicate alert skipped`);
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
          newTransactions: newTransactions.length,
          success: true
        });

        console.log(`  ✓ Updated lastChecked timestamp\n`);
      } catch (error) {
        console.error(`  ❌ Error: ${error.message}\n`);
        results.push({
          address: item.address,
          chain: item.chain,
          error: error.message,
          success: false
        });
      }
    }

    const endTime = new Date();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Monitoring Complete`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Duration: ${duration}s`);
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
      duration
    };
  } catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Execute monitoring
monitorWatchlist()
  .then(result => {
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error(`Fatal error:`, error);
    process.exit(1);
  });
