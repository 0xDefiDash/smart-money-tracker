#!/usr/bin/env ts-node
/**
 * Standalone Watchlist Monitor
 * Directly monitors watchlisted wallets without requiring the Next.js server
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Import the necessary functions
async function getWalletTransactions(address: string, chain: string, limit: number = 10) {
  const { getWalletTransactions: getWalletTxs } = require('./lib/ethereum');
  return await getWalletTxs(address, chain, limit);
}

async function getSolanaTokenTransfers(address: string) {
  const { getSolanaTokenTransfers: getSolTransfers } = require('./lib/solana');
  return await getSolTransfers(address);
}

async function notifyWalletTransaction(params: any) {
  try {
    const { notifyWalletTransaction: notify } = require('./lib/telegram-client');
    await notify(params);
  } catch (error) {
    console.log('Telegram notification skipped:', error);
  }
}

interface MonitorResult {
  success: boolean;
  walletsChecked: number;
  alertsCreated: number;
  results: Array<{
    address: string;
    chain: string;
    newTransactions?: number;
    error?: string;
  }>;
  errors: string[];
}

async function monitorWatchlist(): Promise<MonitorResult> {
  console.log(`[${new Date().toISOString()}] Starting watchlist monitoring...`);
  
  const result: MonitorResult = {
    success: true,
    walletsChecked: 0,
    alertsCreated: 0,
    results: [],
    errors: []
  };

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
          userId: { in: expiredUsers.map((u: any) => u.id) }
        }
      });
      console.log(`[${new Date().toISOString()}] Cleaned up ${deleted.count} watchlist items from ${expiredUsers.length} expired users`);
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

    console.log(`[${new Date().toISOString()}] Found ${watchlistItems.length} watchlist items to check`);
    result.walletsChecked = watchlistItems.length;

    // Step 3: Check each watchlist item for new transactions
    for (const item of watchlistItems) {
      try {
        console.log(`[${new Date().toISOString()}] Checking ${item.address} on ${item.chain}...`);
        
        let transactions = [];

        // Fetch transactions based on chain
        if (item.chain === 'solana') {
          transactions = await getSolanaTokenTransfers(item.address);
        } else {
          transactions = await getWalletTransactions(item.address, item.chain, 10);
        }

        // Filter for new transactions (since lastChecked)
        const newTransactions = transactions.filter((tx: any) => {
          const txTime = new Date(tx.timestamp || tx.blockTimestamp);
          return txTime > item.lastChecked;
        });

        console.log(`[${new Date().toISOString()}] Found ${newTransactions.length} new transactions for ${item.address}`);

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

            result.alertsCreated++;
            console.log(`[${new Date().toISOString()}] Created alert for transaction ${tx.hash}`);

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
              console.log(`[${new Date().toISOString()}] Skipping duplicate alert for ${tx.hash}`);
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

        result.results.push({
          address: item.address,
          chain: item.chain,
          newTransactions: newTransactions.length
        });
      } catch (error: any) {
        console.error(`[${new Date().toISOString()}] Error checking watchlist item ${item.id}:`, error.message);
        result.errors.push(`${item.address} (${item.chain}): ${error.message}`);
        result.results.push({
          address: item.address,
          chain: item.chain,
          error: error.message
        });
      }
    }

    console.log(`[${new Date().toISOString()}] Monitoring complete: ${result.walletsChecked} wallets checked, ${result.alertsCreated} alerts created`);
    
    return result;
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Fatal error during monitoring:`, error.message);
    result.success = false;
    result.errors.push(`Fatal error: ${error.message}`);
    return result;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute monitoring
monitorWatchlist()
  .then((result) => {
    console.log(`\n[${new Date().toISOString()}] Monitoring task completed`);
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error(`\n[${new Date().toISOString()}] Fatal error:`, error);
    process.exit(1);
  });
