#!/usr/bin/env ts-node
/**
 * Watchlist Monitor Script - Using Moralis API
 * 
 * This script monitors all watchlisted wallets using Moralis API
 * and sends alerts when transactions are detected.
 */

import { PrismaClient } from '@prisma/client';
import { moralisClient } from '../lib/moralis-client';

const prisma = new PrismaClient();

interface MonitorResult {
  address: string;
  chain: string;
  newTransactions: number;
  error?: string;
}

async function monitorWatchlist() {
  console.log(`[${new Date().toISOString()}] Starting watchlist monitoring with Moralis...`);
  
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

    console.log(`Found ${watchlistItems.length} watchlist items to monitor`);

    let alertsCreated = 0;
    const results: MonitorResult[] = [];

    // Step 3: Check each watchlist item for new transactions
    for (const item of watchlistItems) {
      try {
        // Skip Solana for now (Moralis is EVM-focused)
        if (item.chain === 'solana') {
          results.push({
            address: item.address,
            chain: item.chain,
            newTransactions: 0,
            error: 'Solana monitoring not supported with Moralis'
          });
          continue;
        }

        // Get chain ID for Moralis
        const chainId = moralisClient.getChainId(item.chain);
        
        // Fetch transactions using Moralis
        const response = await moralisClient.getWalletTransactions(item.address, chainId, 10);
        const transactions = response.raw.result || [];

        console.log(`  Checking ${item.address} (${item.chain}): ${transactions.length} recent transactions`);

        // Filter for new transactions (since lastChecked)
        const newTransactions = transactions.filter((tx: any) => {
          const txTime = new Date(tx.block_timestamp);
          return txTime > item.lastChecked;
        });

        console.log(`    Found ${newTransactions.length} new transactions since ${item.lastChecked.toISOString()}`);

        // Process each new transaction
        for (const tx of newTransactions) {
          // Determine transaction type
          const isSent = tx.from_address?.toLowerCase() === item.address.toLowerCase();
          const isReceived = tx.to_address?.toLowerCase() === item.address.toLowerCase();
          const type = isSent ? 'sent' : isReceived ? 'received' : 'contract';

          // Extract value
          const value = moralisClient.formatWei(tx.value || '0', 18);

          // Create transaction alert
          try {
            await prisma.transactionAlert.create({
              data: {
                userId: item.userId,
                walletAddress: item.address,
                transactionHash: tx.hash,
                chain: item.chain,
                type: type,
                fromAddress: tx.from_address,
                toAddress: tx.to_address,
                value: value,
                isRead: false
              }
            });

            alertsCreated++;
            console.log(`    ✓ Created alert for transaction ${tx.hash.substring(0, 10)}...`);
          } catch (error: any) {
            if (error.code === 'P2002') {
              console.log(`    ⊘ Alert already exists for ${tx.hash.substring(0, 10)}...`);
            } else {
              console.error(`    ✗ Failed to create alert: ${error.message}`);
            }
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
        console.error(`  ✗ Error checking ${item.address} (${item.chain}):`, error.message);
        results.push({
          address: item.address,
          chain: item.chain,
          newTransactions: 0,
          error: error.message
        });
      }
    }

    console.log(`\n[${new Date().toISOString()}] Monitoring complete`);
    console.log(`  Wallets checked: ${watchlistItems.length}`);
    console.log(`  Alerts created: ${alertsCreated}`);

    return {
      success: true,
      walletsChecked: watchlistItems.length,
      alertsCreated,
      results
    };

  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Monitoring failed:`, error.message);
    return {
      success: false,
      error: error.message,
      walletsChecked: 0,
      alertsCreated: 0,
      results: []
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Execute monitoring
monitorWatchlist()
  .then((result) => {
    console.log(`\n[${new Date().toISOString()}] Monitoring task completed`);
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error(`\n[${new Date().toISOString()}] Fatal error:`, error);
    process.exit(1);
  });
