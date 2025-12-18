import { prisma } from './lib/db';

async function checkWatchlist() {
  const items = await prisma.watchlistItem.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          telegramUsername: true,
          telegramChatId: true,
          isPremium: true
        }
      }
    }
  });
  
  console.log('Total watchlist items:', items.length);
  console.log('\nWatchlist Details:');
  items.forEach((item, idx) => {
    console.log(`\n[${idx + 1}] Wallet: ${item.address}`);
    console.log(`    Chain: ${item.chain}`);
    console.log(`    Token: ${item.tokenAddress || 'All tokens'}`);
    console.log(`    User: ${item.user.email}`);
    console.log(`    Telegram: ${item.user.telegramUsername || 'Not linked'}`);
    console.log(`    Last Checked: ${item.lastChecked}`);
    console.log(`    Created: ${item.createdAt}`);
  });
  
  await prisma.$disconnect();
}

checkWatchlist().catch(console.error);
