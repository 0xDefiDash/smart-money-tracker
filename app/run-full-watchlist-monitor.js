const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mock functions for blockchain APIs (since we can't import TypeScript modules directly)
async function getWalletTransactions(address, chain, limit = 10) {
  console.log(`  Fetching ${limit} transactions for ${address} on ${chain}...`);
  // In a real implementation, this would call Alchemy, Moralis, or Etherscan
  // For now, return empty array to simulate no new transactions
  return [];
}

async function getSolanaTokenTransfers(address) {
  console.log(`  Fetching Solana token transfers for ${address}...`);
  // In a real implementation, this would call Helius API
  return [];
}

async function notifyWalletTransaction(data) {
  console.log(`  📱 Telegram notification sent to ${data.username} for ${data.type} transaction`);
  // In a real implementation, this would call Telegram Bot API
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
          userId: { in: expiredUsers.map(u => u.id) }
        }
      });
      console.log(`Cleaned up ${deleted.count} watchlist items from ${expiredUsers.length} expired users`);
    }

    // Step 2: Fetch all watchlist items
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
    const results = [];

    // Step 3: Check each watchlist item for new transactions
    for (const item of watchlistItems) {
      try {
        console.log(`\nChecking: ${item.address} on ${item.chain}`);
        console.log(`  Last checked: ${item.lastChecked.toISOString()}`);
        
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
            console.log(`  ✅ Alert created for transaction ${tx.hash}`);

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
              console.log(`  ⚠️  Duplicate alert skipped for ${tx.hash}`);
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
          label: item.label,
          newTransactions: newTransactions.length,
          status: 'success'
        });
      } catch (error) {
        console.error(`  ❌ Error checking ${item.address}:`, error.message);
        results.push({
          address: item.address,
          chain: item.chain,
          label: item.label,
          error: error.message,
          status: 'error'
        });
      }
    }

    const endTime = new Date();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`\n[${endTime.toISOString()}] Monitoring complete in ${duration}s`);
    console.log(`  Wallets checked: ${watchlistItems.length}`);
    console.log(`  Alerts created: ${alertsCreated}`);

    return {
      success: true,
      walletsChecked: watchlistItems.length,
      alertsCreated,
      duration,
      results,
      timestamp: endTime.toISOString()
    };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Monitoring failed:`, error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

monitorWatchlist()
  .then((result) => {
    console.log(`\n✅ Monitoring task completed successfully`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`\n❌ Fatal error:`, error);
    process.exit(1);
  });
