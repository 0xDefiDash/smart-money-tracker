import { PrismaClient } from '@prisma/client';

async function checkMonitoring() {
  const prisma = new PrismaClient();
  
  try {
    // Check watchlist items
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
    
    console.log('=== WATCHLIST ITEMS ===');
    console.log('Total items:', watchlistItems.length);
    watchlistItems.forEach((item, idx) => {
      console.log(`\n[${idx + 1}] Wallet: ${item.address}`);
      console.log(`    Chain: ${item.chain}`);
      console.log(`    Token: ${item.tokenAddress || 'All tokens'}`);
      console.log(`    Last Checked: ${item.lastChecked}`);
      console.log(`    User Email: ${item.user.email}`);
      console.log(`    Telegram: ${item.user.telegramChatId ? 'Linked' : 'Not linked'}`);
    });
    
    // Check transaction alerts
    const alerts = await prisma.transactionAlert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log('\n\n=== TRANSACTION ALERTS ===');
    console.log('Total alerts:', alerts.length);
    alerts.forEach((alert, idx) => {
      console.log(`\n[${idx + 1}] Alert ID: ${alert.id}`);
      console.log(`    Wallet: ${alert.walletAddress}`);
      console.log(`    Chain: ${alert.chain}`);
      console.log(`    Tx Hash: ${alert.transactionHash}`);
      console.log(`    Created: ${alert.createdAt}`);
      console.log(`    Read: ${alert.isRead}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMonitoring();
