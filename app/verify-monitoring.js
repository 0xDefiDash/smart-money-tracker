const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyMonitoring() {
  try {
    const watchlistItems = await prisma.watchlistItem.findMany({
      select: {
        address: true,
        chain: true,
        lastChecked: true,
        label: true
      },
      orderBy: {
        lastChecked: 'desc'
      }
    });

    console.log('\n=== Watchlist Items Status ===\n');
    watchlistItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.address} (${item.chain})`);
      console.log(`   Label: ${item.label || 'N/A'}`);
      console.log(`   Last Checked: ${item.lastChecked}`);
      console.log('');
    });

    console.log(`Total watchlist items: ${watchlistItems.length}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyMonitoring();
