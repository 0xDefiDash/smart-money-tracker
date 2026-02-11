const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkWatchlist() {
  try {
    const items = await prisma.watchlistItem.findMany({
      include: {
        user: {
          select: {
            email: true,
            telegramUsername: true
          }
        }
      }
    });
    
    console.log(`\nFound ${items.length} watchlist items:\n`);
    items.forEach((item, i) => {
      console.log(`${i + 1}. ${item.address} (${item.chain})`);
      console.log(`   User: ${item.user.email || 'N/A'}`);
      console.log(`   Telegram: ${item.user.telegramUsername || 'Not linked'}`);
      console.log(`   Last Checked: ${item.lastChecked}`);
      console.log(`   Token: ${item.tokenAddress || 'All tokens'}`);
      console.log('');
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkWatchlist();
