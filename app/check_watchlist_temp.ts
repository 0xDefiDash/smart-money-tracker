import 'dotenv/config';
import { prisma } from './lib/db';

async function checkWatchlist() {
  const items = await prisma.watchlistItem.findMany({
    include: {
      user: {
        select: {
          email: true,
          telegramUsername: true,
          isPremium: true
        }
      }
    }
  });
  
  console.log('Watchlist Items:', JSON.stringify(items, null, 2));
  await prisma.$disconnect();
}

checkWatchlist();
