const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkWatchlist() {
  const items = await prisma.watchlistItem.findMany({
    include: {
      user: {
        select: {
          id: true,
          telegramUsername: true,
          isPremium: true
        }
      }
    }
  });
  
  console.log('Watchlist Items:');
  items.forEach(item => {
    console.log(`- ${item.address} (${item.chain})`);
    console.log(`  Last Checked: ${item.lastChecked}`);
    console.log(`  User: ${item.user.telegramUsername || 'No Telegram'}`);
    console.log('');
  });
  
  await prisma.$disconnect();
}

checkWatchlist();
