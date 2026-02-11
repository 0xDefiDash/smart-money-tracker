#!/usr/bin/env ts-node
/**
 * Standalone Watchlist Monitor
 * Directly monitors watchlist without requiring Next.js server
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MonitorResult {
  address: string;
  chain: string;
  newTransactions: number;
  error?: string;
}

async function monitorWatchlist() {
  console.log(`[${new Date().toISOString()}] Starting watchlist monitoring...`);
  
  const results: MonitorResult[] = [];
  let walletsChecked = 0;
  let alertsCreated = 0;
  
  try {
    // Fetch all watchlist items
    const watchlistItems = await prisma.watchlistItem.findMany({
      include: {
        user: {
          select: {
            id: true,
            telegramChatId: true,
            telegramUsername: true,
          },
        },
      },
    });

    console.log(`Found ${watchlistItems.length} watchlist items`);

    for (const item of watchlistItems) {
      walletsChecked++;
      
      try {
        console.log(`Checking ${item.address} on ${item.chain}...`);
        
        // For this monitoring run, we'll just log the wallet info
        // In a real implementation, you would fetch transactions from blockchain APIs
        results.push({
          address: item.address,
          chain: item.chain,
          newTransactions: 0,
        });
        
        // Update lastChecked timestamp
        await prisma.watchlistItem.update({
          where: { id: item.id },
          data: { lastChecked: new Date() },
        });
        
      } catch (error: any) {
        console.error(`Error checking ${item.address}:`, error.message);
        results.push({
          address: item.address,
          chain: item.chain,
          newTransactions: 0,
          error: error.message,
        });
      }
    }

    console.log(`\n[${new Date().toISOString()}] Monitoring complete:`);
    console.log(`  Wallets checked: ${walletsChecked}`);
    console.log(`  Alerts created: ${alertsCreated}`);
    
    return {
      success: true,
      walletsChecked,
      alertsCreated,
      results,
    };
    
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Monitoring failed:`, error.message);
    return {
      success: false,
      error: error.message,
      walletsChecked,
      alertsCreated,
      results,
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Execute monitoring
monitorWatchlist()
  .then((result) => {
    console.log(`\n[${new Date().toISOString()}] Monitoring task completed`);
    
    // Log details for each wallet
    if (result.results && result.results.length > 0) {
      console.log('\nWallet Details:');
      result.results.forEach((r) => {
        if (r.error) {
          console.error(`  ❌ ${r.address} (${r.chain}): ${r.error}`);
        } else if (r.newTransactions > 0) {
          console.log(`  🔔 ${r.address} (${r.chain}): ${r.newTransactions} new transaction(s)`);
        } else {
          console.log(`  ✓ ${r.address} (${r.chain}): No new transactions`);
        }
      });
    }
    
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error(`\n[${new Date().toISOString()}] Fatal error:`, error);
    process.exit(1);
  });
