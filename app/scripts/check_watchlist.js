const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkWatchlist() {
  try {
    const items = await prisma.watchlistItem.findMany({
      orderBy: { lastChecked: 'desc' },
      select: {
        id: true,
        address: true,
        chain: true,
        label: true,
        lastChecked: true,
        createdAt: true
      }
    });
    
    console.log('Watchlist Items:');
    items.forEach(item => {
      console.log(`\n- Address: ${item.address}`);
      console.log(`  Chain: ${item.chain}`);
      console.log(`  Label: ${item.label || 'N/A'}`);
      console.log(`  Last Checked: ${item.lastChecked}`);
      console.log(`  Created: ${item.createdAt}`);
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkWatchlist();
