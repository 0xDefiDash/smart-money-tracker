import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkWatchlist() {
  const watchlistItems = await prisma.watchlistItem.findMany({
    include: {
      user: {
        select: {
          email: true,
          telegramChatId: true
        }
      }
    }
  });
  
  console.log('Total watchlist items:', watchlistItems.length);
  console.log('\nWatchlist Details:');
  watchlistItems.forEach((item: any, idx: number) => {
    console.log(`\n${idx + 1}. Wallet: ${item.address}`);
    console.log(`   Chain: ${item.chain}`);
    console.log(`   User: ${item.user.email}`);
    console.log(`   Telegram: ${item.user.telegramChatId ? 'Linked' : 'Not linked'}`);
    console.log(`   Last Checked: ${item.lastChecked}`);
    console.log(`   Token Filter: ${item.tokenSymbol || 'All tokens'}`);
  });
  
  await prisma.$disconnect();
}

checkWatchlist();
