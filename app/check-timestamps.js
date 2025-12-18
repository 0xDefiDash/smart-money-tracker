const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTimestamps() {
  try {
    const watchlistItems = await prisma.watchlistItem.findMany({
      select: {
        id: true,
        address: true,
        chain: true,
        lastChecked: true
      }
    });

    console.log('\n=== Watchlist Items - Last Checked Timestamps ===\n');
    watchlistItems.forEach(item => {
      console.log(`ID: ${item.id}`);
      console.log(`Address: ${item.address}`);
      console.log(`Chain: ${item.chain}`);
      console.log(`Last Checked: ${item.lastChecked.toISOString()}`);
      console.log('---');
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkTimestamps();
