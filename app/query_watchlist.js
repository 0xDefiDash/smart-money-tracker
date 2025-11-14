const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    const watchlistItems = await prisma.watchlistItem.findMany({
      take: 10,
      include: {
        user: {
          select: {
            email: true,
            telegramChatId: true
          }
        }
      }
    });
    
    console.log('Watchlist Items:', JSON.stringify(watchlistItems, null, 2));
    
    const alertCount = await prisma.transactionAlert.count();
    console.log('\nTotal Transaction Alerts:', alertCount);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
