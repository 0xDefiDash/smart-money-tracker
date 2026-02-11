import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  const items = await prisma.watchlistItem.findMany({
    orderBy: { lastChecked: 'desc' },
    select: {
      address: true,
      chain: true,
      lastChecked: true,
      createdAt: true
    }
  });

  console.log('\nWatchlist Items (Last Checked):');
  console.log('================================\n');
  
  items.forEach((item, i) => {
    console.log(`${i + 1}. ${item.address.substring(0, 20)}...`);
    console.log(`   Chain: ${item.chain}`);
    console.log(`   Last Checked: ${item.lastChecked.toISOString()}`);
    console.log(`   Created: ${item.createdAt.toISOString()}`);
    console.log('');
  });

  await prisma.$disconnect();
}

verify();
