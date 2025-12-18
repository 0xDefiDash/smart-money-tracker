#!/usr/bin/env ts-node
/**
 * Direct Watchlist Monitor Execution
 * Runs the watchlist monitoring logic directly without requiring the dev server
 */

import { PrismaClient } from '@prisma/client';
import { getWalletTransactions } from '../lib/ethereum';
import { getSolanaTokenTransfers } from '../lib/solana';
import { notifyWalletTransaction } from '../lib/telegram-client';

const prisma = new PrismaClient();

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
  error?: string;
}

async function monitorWatchlist(): Promise<MonitorResult> {
  console.log(`[${new Date().toISOString()}] Starting watchlist monitoring...`);
  
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
      console.log(`Cleaned up ${deleted.count} watchlist items from ${expiredUsers.length} expired users`);
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

    console.log(`Found ${watchlistItems.length} watchlist items to check`);

    let alertsCreated = 0;
    const results = [];

    // Step 3: Check each watchlist item for new transactions
    for (const item of watchlistItems) {
      try {
        console.log(`Checking wallet: ${item.address} on ${item.chain}`);
        
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
            console.log(`  ✓ Created alert for transaction ${tx.hash}`);

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
              console.log(`  ✓ Sent Telegram notification to ${item.user.telegramUsername}`);
            }
          } catch (error: any) {
            // Skip if duplicate alert (same tx hash for same user)
            if (error.code === 'P2002') {
              console.log(`  ⊘ Skipped duplicate alert for ${tx.hash}`);
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
          newTransactions: newTransactions.length
        });
      } catch (error: any) {
        console.error(`  ✗ Error checking wallet ${item.address}:`, error.message);
        results.push({
          address: item.address,
          chain: item.chain,
          error: error.message
        });
      }
    }

    await prisma.$disconnect();

    return {
      success: true,
      walletsChecked: watchlistItems.length,
      alertsCreated,
      results
    };
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Monitoring failed:`, error.message);
    await prisma.$disconnect();
    
    return {
      success: false,
      walletsChecked: 0,
      alertsCreated: 0,
      results: [],
      error: error.message
    };
  }
}

// Execute monitoring
monitorWatchlist()
  .then((result) => {
    console.log(`\n[${new Date().toISOString()}] Monitoring complete:`);
    console.log(`  Wallets checked: ${result.walletsChecked}`);
    console.log(`  Alerts created: ${result.alertsCreated}`);
    console.log(`  Success: ${result.success}`);
    
    if (result.error) {
      console.error(`  Error: ${result.error}`);
    }
    
    // Output JSON for parsing
    console.log('\n--- JSON OUTPUT ---');
    console.log(JSON.stringify(result, null, 2));
    
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error(`\n[${new Date().toISOString()}] Fatal error:`, error);
    process.exit(1);
  });
