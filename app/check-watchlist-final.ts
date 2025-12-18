import { PrismaClient } from '@prisma/client';

async function checkWatchlistStatus() {
  const prisma = new PrismaClient();
  
  try {
    // Get watchlist items
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
      console.log(`    Label: ${item.label || 'N/A'}`);
      console.log(`    Last Checked: ${item.lastChecked}`);
      console.log(`    User Email: ${item.user?.email || 'N/A'}`);
      console.log(`    Telegram: ${item.user?.telegramChatId ? 'Connected' : 'Not connected'}`);
    });
    
    // Get transaction alerts
    const alerts = await prisma.transactionAlert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log('\n\n=== RECENT TRANSACTION ALERTS ===');
    console.log('Total alerts:', alerts.length);
    alerts.forEach((alert, idx) => {
      console.log(`\n[${idx + 1}] ${alert.type} - ${alert.chain}`);
      console.log(`    Hash: ${alert.transactionHash}`);
      console.log(`    Value: ${alert.value}`);
      console.log(`    Created: ${alert.createdAt}`);
      console.log(`    Notified At: ${alert.notifiedAt}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWatchlistStatus();
