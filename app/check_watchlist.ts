import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkWatchlist() {
  const items = await prisma.watchlistItem.findMany({
    orderBy: { lastChecked: 'desc' },
    select: {
      address: true,
      chain: true,
      label: true,
      lastChecked: true,
      createdAt: true,
    },
  });
  
  console.log('Watchlist Items (ordered by lastChecked):');
  console.log('==========================================');
  items.forEach((item, idx) => {
    console.log(`\n${idx + 1}. ${item.address}`);
    console.log(`   Chain: ${item.chain}`);
    console.log(`   Label: ${item.label || 'N/A'}`);
    console.log(`   Last Checked: ${item.lastChecked.toISOString()}`);
    console.log(`   Created At: ${item.createdAt.toISOString()}`);
  });
  
  await prisma.$disconnect();
}

checkWatchlist().catch(console.error);
