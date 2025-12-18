const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTimestamps() {
  const items = await prisma.watchlistItem.findMany({
    select: {
      address: true,
      chain: true,
      lastChecked: true
    }
  });
  
  console.log('Watchlist Items Last Checked Timestamps:');
  console.log('=========================================\n');
  
  items.forEach(item => {
    console.log(`Address: ${item.address}`);
    console.log(`Chain: ${item.chain}`);
    console.log(`Last Checked: ${item.lastChecked.toISOString()}`);
    console.log('---');
  });
  
  await prisma.$disconnect();
}

checkTimestamps().catch(console.error);
