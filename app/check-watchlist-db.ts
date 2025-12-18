import { PrismaClient } from '@prisma/client';

async function checkWatchlist() {
  const prisma = new PrismaClient();
  
  try {
    const watchlistCount = await prisma.watchlistItem.count();
    const alertsCount = await prisma.transactionAlert.count();
    
    console.log('Database Status:');
    console.log('- Watchlist items:', watchlistCount);
    console.log('- Transaction alerts:', alertsCount);
    
    if (watchlistCount > 0) {
      const watchlistItems = await prisma.watchlistItem.findMany({
        take: 5,
        include: {
          user: {
            select: {
              email: true,
              telegramChatId: true
            }
          }
        }
      });
      
      console.log('\nRecent watchlist items:');
      watchlistItems.forEach((item: any, i: number) => {
        console.log(`${i+1}. ${item.address} (${item.chain}) - Label: ${item.label || 'N/A'}`);
        console.log(`   User: ${item.user?.email || 'N/A'}, Telegram: ${item.user?.telegramChatId ? 'Linked' : 'Not linked'}`);
        console.log(`   Last checked: ${item.lastChecked}`);
      });
    }
    
    if (alertsCount > 0) {
      const recentAlerts = await prisma.transactionAlert.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' }
      });
      
      console.log('\nRecent alerts:');
      recentAlerts.forEach((alert: any, i: number) => {
        console.log(`${i+1}. ${alert.transactionHash} - ${alert.type} - Read: ${alert.isRead}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWatchlist();
