const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLastChecked() {
  try {
    const items = await prisma.watchlistItem.findMany({
      select: {
        id: true,
        address: true,
        chain: true,
        lastChecked: true,
        createdAt: true
      }
    });
    
    console.log('\n=== Watchlist Items - Last Checked Status ===\n');
    items.forEach(item => {
      console.log(`Address: ${item.address}`);
      console.log(`Chain: ${item.chain}`);
      console.log(`Last Checked: ${item.lastChecked.toISOString()}`);
      console.log(`Created At: ${item.createdAt.toISOString()}`);
      console.log('---');
    });
    
    console.log(`\nTotal items: ${items.length}`);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkLastChecked();
