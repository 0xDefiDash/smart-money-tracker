#!/usr/bin/env ts-node
/**
 * Standalone Watchlist Monitor
 * Directly executes monitoring logic without requiring Next.js server
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp?: string;
  blockTimestamp?: string;
  tokenTransfers?: Array<{
    rawContract?: { address: string };
    contractAddress?: string;
    tokenAddress?: string;
    asset?: string;
    tokenSymbol?: string;
    valueFormatted?: string;
    value?: string;
  }>;
}

// Import monitoring functions
async function getWalletTransactions(address: string, chain: string, limit: number = 10): Promise<Transaction[]> {
  // Mock implementation - in production this would call Alchemy/Moralis/Etherscan
  console.log(`  Fetching transactions for ${address} on ${chain}...`);
  return [];
}

async function getSolanaTokenTransfers(address: string): Promise<Transaction[]> {
  // Mock implementation - in production this would call Helius
  console.log(`  Fetching Solana transactions for ${address}...`);
  return [];
}

async function notifyWalletTransaction(data: any) {
  // Mock implementation - in production this would send Telegram notification
  console.log(`  Would send Telegram notification to ${data.username}`);
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

    let cleanedUp = 0;
    if (expiredUsers.length > 0) {
      const deleted = await prisma.watchlistItem.deleteMany({
        where: {
          userId: { in: expiredUsers.map((u: any) => u.id) }
        }
      });
      cleanedUp = deleted.count;
      console.log(`✓ Cleaned up ${cleanedUp} watchlist items from ${expiredUsers.length} expired users\n`);
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

    console.log(`Found ${watchlistItems.length} watchlist items to monitor\n`);

    let alertsCreated = 0;
    const results = [];

    // Step 3: Check each watchlist item for new transactions
    for (const item of watchlistItems) {
      console.log(`Checking: ${item.address} (${item.chain})`);
      console.log(`  User: ${item.user.email}`);
      console.log(`  Last checked: ${item.lastChecked.toISOString()}`);
      
      try {
        let transactions: Transaction[] = [];

        // Fetch transactions based on chain
        if (item.chain === 'solana') {
          transactions = await getSolanaTokenTransfers(item.address);
        } else {
          transactions = await getWalletTransactions(item.address, item.chain, 10);
        }

        // Filter for new transactions (since lastChecked)
        const newTransactions = transactions.filter((tx: Transaction) => {
          const txTime = new Date(tx.timestamp || tx.blockTimestamp || 0);
          return txTime > item.lastChecked;
        });

        console.log(`  Found ${newTransactions.length} new transactions`);

        // Process each new transaction
        for (const tx of newTransactions) {
          // If token-specific monitoring, filter by token
          if (item.tokenAddress) {
            const hasTokenTransfer = tx.tokenTransfers?.some(
              (transfer: any) =>
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
          } catch (error: any) {
            // Skip if duplicate alert (same tx hash for same user)
            if (error.code === 'P2002') {
              console.log(`  ⊘ Skipped duplicate alert for ${tx.hash.substring(0, 10)}...`);
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
      } catch (error: any) {
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
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Monitoring Complete`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Duration: ${duration.toFixed(2)}s`);
    console.log(`Wallets checked: ${watchlistItems.length}`);
    console.log(`Alerts created: ${alertsCreated}`);
    console.log(`Watchlist items cleaned up: ${cleanedUp}`);
    console.log(`${'='.repeat(60)}\n`);

    return {
      success: true,
      walletsChecked: watchlistItems.length,
      alertsCreated,
      cleanedUp,
      results,
      duration,
      timestamp: endTime
    };
  } catch (error: any) {
    console.error(`\n❌ Monitoring failed: ${error.message}`);
    return {
      success: false,
      error: error.message,
      timestamp: new Date()
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Execute monitoring
monitorWatchlist()
  .then((result) => {
    // Write result to stdout as JSON for capture
    console.log('\n__RESULT_JSON__');
    console.log(JSON.stringify(result, null, 2));
    console.log('__END_RESULT_JSON__');
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error(`\n❌ Fatal error:`, error);
    process.exit(1);
  });
