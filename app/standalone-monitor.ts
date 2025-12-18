import { PrismaClient } from '@prisma/client';
import { getWalletTransactions } from './lib/ethereum';
import { getSolanaTokenTransfers } from './lib/solana';
import { notifyWalletTransaction } from './lib/telegram-client';

const prisma = new PrismaClient();

interface MonitorResult {
  address: string;
  chain: string;
  newTransactions: number;
  error?: string;
}

async function monitorWatchlist() {
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
            email: true,
            telegramUsername: true,
            telegramChatId: true,
            isPremium: true,
            trialEndsAt: true
          }
        }
      }
    });

    console.log(`Found ${watchlistItems.length} active watchlist items to monitor`);

    let alertsCreated = 0;
    const results: MonitorResult[] = [];

    // Step 3: Check each watchlist item for new transactions
    for (const item of watchlistItems) {
      try {
        console.log(`\nChecking ${item.address} on ${item.chain}...`);
        let transactions = [];

        // Fetch transactions based on chain
        if (item.chain === 'solana') {
          transactions = await getSolanaTokenTransfers(item.address);
        } else {
          transactions = await getWalletTransactions(item.address, item.chain, 10);
        }

        console.log(`  Found ${transactions.length} recent transactions`);

        // Filter for new transactions (since lastChecked)
        const newTransactions = transactions.filter((tx: any) => {
          const txTime = new Date(tx.timestamp || tx.blockTimestamp);
          return txTime > item.lastChecked;
        });

        console.log(`  ${newTransactions.length} new transactions since last check`);

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
            console.log(`  ✓ Created alert for ${type} transaction: ${tx.hash.substring(0, 10)}...`);

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
              console.log(`  ✓ Sent Telegram notification to @${item.user.telegramUsername}`);
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
          newTransactions: newTransactions.length
        });
      } catch (error: any) {
        console.error(`  ✗ Error checking ${item.address}:`, error.message);
        results.push({
          address: item.address,
          chain: item.chain,
          newTransactions: 0,
          error: error.message
        });
      }
    }

    const endTime = new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;

    return {
      success: true,
      walletsChecked: watchlistItems.length,
      alertsCreated,
      results,
      timestamp: startTime.toISOString(),
      duration: `${duration.toFixed(2)}s`
    };
  } catch (error: any) {
    console.error('Monitoring failed:', error.message);
    return {
      success: false,
      error: error.message,
      walletsChecked: 0,
      alertsCreated: 0,
      results: [],
      timestamp: startTime.toISOString()
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Execute monitoring
monitorWatchlist()
  .then((result) => {
    console.log('\n=== MONITORING SUMMARY ===');
    console.log(`Status: ${result.success ? '✓ SUCCESS' : '✗ FAILED'}`);
    console.log(`Wallets Checked: ${result.walletsChecked}`);
    console.log(`Alerts Created: ${result.alertsCreated}`);
    console.log(`Duration: ${result.duration || 'N/A'}`);
    
    if (result.results && result.results.length > 0) {
      console.log('\nWallet Details:');
      result.results.forEach((r: MonitorResult) => {
        if (r.error) {
          console.log(`  ✗ ${r.address} (${r.chain}): ${r.error}`);
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
    console.error('\n=== FATAL ERROR ===');
    console.error(error);
    process.exit(1);
  });
