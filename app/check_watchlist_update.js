const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkWatchlistUpdate() {
  try {
    const watchlistItems = await prisma.watchlistItem.findMany({
      select: {
        id: true,
        address: true,
        chain: true,
        lastChecked: true,
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        lastChecked: 'desc'
      }
    });

    console.log('\n=== Watchlist Items Status ===\n');
    watchlistItems.forEach(item => {
      console.log(`Address: ${item.address}`);
      console.log(`Chain: ${item.chain}`);
      console.log(`User: ${item.user.email}`);
      console.log(`Last Checked: ${item.lastChecked.toISOString()}`);
      console.log('---');
    });

    console.log(`\nTotal watchlist items: ${watchlistItems.length}`);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkWatchlistUpdate();
