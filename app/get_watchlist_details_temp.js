const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getWatchlistDetails() {
  try {
    const watchlistItems = await prisma.watchlistItem.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            telegramUsername: true,
            telegramChatId: true,
            isPremium: true,
            trialEndsAt: true
          }
        }
      }
    });

    console.log(JSON.stringify(watchlistItems, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getWatchlistDetails();
