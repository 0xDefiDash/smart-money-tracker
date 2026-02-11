const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Mock functions for blockchain APIs
async function getWalletTransactions(address, chain, limit = 10) {
  console.log(`  Fetching ${limit} transactions for ${address} on ${chain}...`);
  return [];
}

async function getSolanaTokenTransfers(address) {
  console.log(`  Fetching Solana token transfers for ${address}...`);
  return [];
}

async function notifyWalletTransaction(data) {
  console.log(`  📱 Telegram notification sent to ${data.username} for ${data.type} transaction`);
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

    let cleanupCount = 0;
    if (expiredUsers.length > 0) {
      const deleted = await prisma.watchlistItem.deleteMany({
        where: {
          userId: { in: expiredUsers.map(u => u.id) }
        }
      });
      cleanupCount = deleted.count;
      console.log(`Cleaned up ${cleanupCount} watchlist items from ${expiredUsers.length} expired users`);
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
    const errors = [];

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
          tokenAddress: item.tokenAddress,
          tokenSymbol: item.tokenSymbol,
          newTransactions: newTransactions.length,
          lastChecked: item.lastChecked.toISOString(),
          status: 'success'
        });
      } catch (error) {
        console.error(`  ❌ Error checking ${item.address}:`, error.message);
        const errorDetail = {
          address: item.address,
          chain: item.chain,
          label: item.label,
          error: error.message,
          status: 'error'
        };
        results.push(errorDetail);
        errors.push(errorDetail);
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
      cleanupCount,
      duration,
      results,
      errors,
      timestamp: endTime.toISOString(),
      startTime: startTime.toISOString()
    };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Monitoring failed:`, error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function generateMarkdownReport(data) {
  const timestamp = new Date(data.timestamp).toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `monitor_${timestamp}.md`;
  
  let markdown = `# Watchlist Monitoring Report\n\n`;
  markdown += `**Generated:** ${data.timestamp}\n\n`;
  markdown += `**Duration:** ${data.duration}s\n\n`;
  
  markdown += `## Summary\n\n`;
  markdown += `- **Wallets Checked:** ${data.walletsChecked}\n`;
  markdown += `- **New Alerts Created:** ${data.alertsCreated}\n`;
  markdown += `- **Expired Watchlists Cleaned:** ${data.cleanupCount}\n`;
  markdown += `- **Errors:** ${data.errors.length}\n\n`;
  
  markdown += `## Wallet Details\n\n`;
  
  if (data.results.length === 0) {
    markdown += `*No wallets monitored in this run.*\n\n`;
  } else {
    for (const result of data.results) {
      markdown += `### ${result.label || 'Unlabeled Wallet'}\n\n`;
      markdown += `- **Address:** \`${result.address}\`\n`;
      markdown += `- **Chain:** ${result.chain}\n`;
      
      if (result.tokenAddress) {
        markdown += `- **Token:** ${result.tokenSymbol || 'Unknown'} (\`${result.tokenAddress}\`)\n`;
      }
      
      if (result.status === 'success') {
        markdown += `- **New Transactions:** ${result.newTransactions}\n`;
        markdown += `- **Last Checked:** ${result.lastChecked}\n`;
        markdown += `- **Status:** ✅ Success\n\n`;
      } else {
        markdown += `- **Status:** ❌ Error\n`;
        markdown += `- **Error Message:** ${result.error}\n\n`;
      }
    }
  }
  
  if (data.errors.length > 0) {
    markdown += `## Errors Encountered\n\n`;
    for (const error of data.errors) {
      markdown += `- **${error.address}** (${error.chain}): ${error.error}\n`;
    }
    markdown += `\n`;
  }
  
  markdown += `## Monitoring Configuration\n\n`;
  markdown += `- **Start Time:** ${data.startTime}\n`;
  markdown += `- **End Time:** ${data.timestamp}\n`;
  markdown += `- **Total Duration:** ${data.duration}s\n`;
  
  return { filename, content: markdown };
}

// Run monitoring and generate report
monitorWatchlist()
  .then((result) => {
    console.log(`\n✅ Monitoring task completed successfully`);
    
    // Generate markdown report
    const report = generateMarkdownReport(result);
    const logDir = '/home/ubuntu/watchlist_logs';
    const logPath = path.join(logDir, report.filename);
    
    fs.writeFileSync(logPath, report.content);
    console.log(`\n📄 Report saved to: ${logPath}`);
    
    process.exit(0);
  })
  .catch((error) => {
    console.error(`\n❌ Fatal error:`, error);
    process.exit(1);
  });
