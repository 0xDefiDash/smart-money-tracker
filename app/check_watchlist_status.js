const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkWatchlistStatus() {
  try {
    const items = await prisma.watchlistItem.findMany({
      select: {
        id: true,
        address: true,
        chain: true,
        lastChecked: true,
        createdAt: true,
        user: {
          select: {
            telegramUsername: true,
            telegramChatId: true,
          }
        }
      },
      orderBy: {
        lastChecked: 'desc'
      }
    });
    
    console.log('\n=== Watchlist Status ===\n');
    console.log(`Total watchlist items: ${items.length}\n`);
    
    items.forEach((item, index) => {
      console.log(`${index + 1}. ${item.address.substring(0, 10)}...${item.address.substring(item.address.length - 8)}`);
      console.log(`   Chain: ${item.chain}`);
      console.log(`   Last Checked: ${item.lastChecked.toISOString()}`);
      console.log(`   Created: ${item.createdAt.toISOString()}`);
      console.log(`   Telegram: ${item.user.telegramUsername || 'Not linked'}`);
      console.log('');
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkWatchlistStatus();
