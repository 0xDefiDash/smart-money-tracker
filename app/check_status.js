const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStatus() {
  try {
    const watchlist = await prisma.watchlistItem.findMany({
      include: {
        user: {
          select: {
            email: true,
            telegramChatId: true
          }
        }
      }
    });
    
    console.log(`\n📊 Watchlist Status:`);
    console.log(`Total items: ${watchlist.length}\n`);
    
    watchlist.forEach((item, idx) => {
      console.log(`${idx + 1}. ${item.walletAddress} (${item.chain})`);
      console.log(`   User: ${item.user.email}`);
      console.log(`   Telegram: ${item.user.telegramChatId ? '✅ Linked' : '❌ Not linked'}`);
      console.log(`   Last checked: ${item.lastChecked}`);
      console.log(`   Active: ${item.isActive ? '✅' : '❌'}\n`);
    });
    
    const alerts = await prisma.transactionAlert.count();
    console.log(`\n🔔 Total alerts in database: ${alerts}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkStatus();
