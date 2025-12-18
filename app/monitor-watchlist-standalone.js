const { PrismaClient } = require('@prisma/client');
const https = require('https');
const http = require('http');

const prisma = new PrismaClient();

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function monitorWatchlist() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting watchlist monitoring...`);
  
  const results = {
    timestamp,
    walletsChecked: 0,
    alertsCreated: 0,
    walletDetails: [],
    errors: []
  };

  try {
    // Cleanup expired trial users' watchlists
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

    // Fetch all active watchlist items
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

    results.walletsChecked = watchlistItems.length;
    console.log(`Found ${watchlistItems.length} watchlist items to check`);

    for (const item of watchlistItems) {
      try {
        console.log(`Checking ${item.address} on ${item.chain}...`);
        
        // For this standalone version, we'll just update lastChecked
        // In production, this would call blockchain APIs
        await prisma.watchlistItem.update({
          where: { id: item.id },
          data: { lastChecked: new Date() }
        });

        results.walletDetails.push({
          address: item.address,
          chain: item.chain,
          status: 'checked',
          newTransactions: 0
        });
      } catch (error) {
        console.error(`Error checking ${item.address}:`, error.message);
        results.errors.push({
          address: item.address,
          chain: item.chain,
          error: error.message
        });
      }
    }

    console.log(`\nMonitoring complete:`);
    console.log(`- Wallets checked: ${results.walletsChecked}`);
    console.log(`- Alerts created: ${results.alertsCreated}`);
    console.log(`- Errors: ${results.errors.length}`);

    return results;
  } catch (error) {
    console.error('Fatal error:', error);
    results.errors.push({ error: error.message });
    return results;
  } finally {
    await prisma.$disconnect();
  }
}

monitorWatchlist()
  .then(results => {
    console.log('\nResults:', JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
