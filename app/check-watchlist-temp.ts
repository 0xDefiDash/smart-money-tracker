import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkWatchlist() {
  const watchlist = await prisma.watchlistItem.findMany({
    include: {
      user: {
        select: {
          email: true,
          telegramChatId: true
        }
      }
    }
  });
  
  console.log('Total watchlist items:', watchlist.length);
  watchlist.forEach((item, idx) => {
    console.log(`\nItem ${idx + 1}:`);
    console.log('  Address:', item.address);
    console.log('  Chain:', item.chain);
    console.log('  Label:', item.label || 'N/A');
    console.log('  Token:', item.tokenSymbol || 'All tokens');
    console.log('  Last Checked:', item.lastChecked);
    console.log('  User Email:', item.user.email);
    console.log('  Telegram Chat ID:', item.user.telegramChatId || 'Not linked');
  });
  
  await prisma.$disconnect();
}

checkWatchlist().catch(console.error);
