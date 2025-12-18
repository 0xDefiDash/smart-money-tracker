import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkWatchlist() {
  try {
    const count = await prisma.watchlistItem.count();
    console.log('Total watchlist items:', count);
    
    const items = await prisma.watchlistItem.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('\nRecent watchlist items:');
    items.forEach((item: any) => {
      console.log(`- ${item.address} (${item.chain}) - Last checked: ${item.lastChecked}`);
    });
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkWatchlist();
