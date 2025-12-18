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
  
  console.log('Total Watchlist Items:', watchlist.length);
  console.log('\nWatchlist Details:');
  watchlist.forEach((item, idx) => {
    console.log(`\n[${idx + 1}] Address: ${item.address}`);
    console.log(`    Chain: ${item.chain}`);
    console.log(`    Label: ${item.label || 'N/A'}`);
    console.log(`    Token: ${item.tokenSymbol || 'All tokens'}`);
    console.log(`    User Email: ${item.user.email}`);
    console.log(`    Telegram: ${item.user.telegramChatId ? 'Connected' : 'Not connected'}`);
    console.log(`    Last Checked: ${item.lastChecked.toISOString()}`);
  });
  
  await prisma.$disconnect();
}

checkWatchlist().catch(console.error);
