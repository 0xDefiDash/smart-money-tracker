import { PrismaClient } from '@prisma/client';

async function checkWatchlist() {
  const prisma = new PrismaClient();
  
  try {
    const watchlistItems = await prisma.watchlistItem.findMany({
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });
    
    console.log('=== WATCHLIST ITEMS ===');
    console.log('Total items:', watchlistItems.length);
    console.log('');
    
    watchlistItems.forEach((item, index) => {
      console.log(`Item ${index + 1}:`);
      console.log('  Address:', item.address);
      console.log('  Chain:', item.chain);
      console.log('  Token:', item.tokenAddress || 'All tokens');
      console.log('  Label:', item.label || 'No label');
      console.log('  Last Checked:', item.lastChecked);
      console.log('  User Email:', item.user?.email);
      console.log('');
    });
    
    const alerts = await prisma.transactionAlert.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('=== RECENT ALERTS ===');
    console.log('Total alerts in DB:', alerts.length);
    if (alerts.length > 0) {
      console.log('Most recent alert:', alerts[0].createdAt);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWatchlist();
