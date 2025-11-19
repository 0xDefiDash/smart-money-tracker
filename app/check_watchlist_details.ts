import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkWatchlist() {
  try {
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

    console.log(`Total watchlist items: ${watchlistItems.length}\n`);
    
    watchlistItems.forEach((item, index) => {
      console.log(`Item ${index + 1}:`);
      console.log(`  Address: ${item.address}`);
      console.log(`  Chain: ${item.chain}`);
      console.log(`  Token: ${item.tokenAddress || 'All tokens'}`);
      console.log(`  User Email: ${item.user.email}`);
      console.log(`  Telegram Linked: ${item.user.telegramChatId ? 'Yes' : 'No'}`);
      console.log(`  Last Checked: ${item.lastChecked}`);
      console.log(`  Created: ${item.createdAt}`);
      console.log('');
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkWatchlist();
