const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkWatchlist() {
  const items = await prisma.watchlistItem.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          telegramChatId: true
        }
      }
    }
  });
  
  console.log('=== WATCHLIST ITEMS DETAILS ===\n');
  console.log(`Total items: ${items.length}\n`);
  
  items.forEach((item, index) => {
    console.log(`Item ${index + 1}:`);
    console.log(`  ID: ${item.id}`);
    console.log(`  Address: ${item.address}`);
    console.log(`  Chain: ${item.chain}`);
    console.log(`  Label: ${item.label || 'N/A'}`);
    console.log(`  Token Address: ${item.tokenAddress || 'N/A'}`);
    console.log(`  Token Symbol: ${item.tokenSymbol || 'N/A'}`);
    console.log(`  Last Checked: ${item.lastChecked.toISOString()}`);
    console.log(`  Created: ${item.createdAt.toISOString()}`);
    console.log(`  User ID: ${item.userId}`);
    console.log(`  User Email: ${item.user.email || 'N/A'}`);
    console.log(`  User Username: ${item.user.username || 'N/A'}`);
    console.log(`  Telegram Chat ID: ${item.user.telegramChatId || 'N/A'}`);
    console.log('---\n');
  });
  
  await prisma.$disconnect();
}

checkWatchlist().catch(console.error);
