import { PrismaClient } from '@prisma/client';

async function checkData() {
  const prisma = new PrismaClient();
  
  try {
    const watchlistCount = await prisma.watchlistItem.count();
    const alertsCount = await prisma.transactionAlert.count();
    
    console.log('Database Status:');
    console.log('- Watchlist items:', watchlistCount);
    console.log('- Transaction alerts:', alertsCount);
    
    if (watchlistCount > 0) {
      const watchlists = await prisma.watchlistItem.findMany({
        take: 5,
        select: {
          id: true,
          address: true,
          chain: true,
          lastChecked: true,
        }
      });
      console.log('\nRecent watchlist items:');
      watchlists.forEach((w: any) => {
        console.log(`  - ${w.address} (${w.chain}) - Last checked: ${w.lastChecked}`);
      });
    }
    
    if (alertsCount > 0) {
      const alerts = await prisma.transactionAlert.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          walletAddress: true,
          chain: true,
          transactionHash: true,
          createdAt: true,
        }
      });
      console.log('\nRecent alerts:');
      alerts.forEach((a: any) => {
        console.log(`  - ${a.walletAddress} (${a.chain}) - Tx: ${a.transactionHash?.substring(0, 10)}... at ${a.createdAt}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
