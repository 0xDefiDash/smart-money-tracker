const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkWatchlist() {
  const items = await prisma.watchlistItem.findMany({
    take: 3
  });
  console.log('Watchlist items:', JSON.stringify(items, null, 2));
  await prisma.$disconnect();
}

checkWatchlist().catch(console.error);
