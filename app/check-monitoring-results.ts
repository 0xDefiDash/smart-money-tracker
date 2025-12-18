import { PrismaClient } from '@prisma/client';

async function checkAlerts() {
  const prisma = new PrismaClient();
  
  try {
    // Check watchlist items
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
    watchlistItems.forEach(item => {
      console.log(`\nWallet: ${item.address}`);
      console.log(`Chain: ${item.chain}`);
      console.log(`Label: ${item.label || 'N/A'}`);
      console.log(`Last Checked: ${item.lastChecked}`);
      console.log(`User Email: ${item.user.email}`);
    });
    
    // Check transaction alerts
    const alerts = await prisma.transactionAlert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log('\n\n=== TRANSACTION ALERTS ===');
    console.log('Total alerts:', alerts.length);
    alerts.forEach(alert => {
      console.log(`\nAlert ID: ${alert.id}`);
      console.log(`Wallet: ${alert.walletAddress}`);
      console.log(`Chain: ${alert.chain}`);
      console.log(`Transaction Hash: ${alert.transactionHash}`);
      console.log(`Type: ${alert.type}`);
      console.log(`Value: ${alert.value || 'N/A'}`);
      console.log(`Token: ${alert.tokenSymbol || 'N/A'}`);
      console.log(`Token Amount: ${alert.tokenAmount || 'N/A'}`);
      console.log(`Is Read: ${alert.isRead}`);
      console.log(`Created: ${alert.createdAt}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAlerts();
