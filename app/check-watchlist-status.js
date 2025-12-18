const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStatus() {
  const items = await prisma.watchlistItem.findMany({
    include: {
      user: {
        select: {
          id: true,
          telegramUsername: true,
          telegramChatId: true
        }
      }
    }
  });

  console.log('\n=== Watchlist Status ===\n');
  items.forEach((item, i) => {
    console.log(`${i + 1}. ${item.address}`);
    console.log(`   Chain: ${item.chain}`);
    console.log(`   Last Checked: ${item.lastChecked}`);
    console.log(`   User ID: ${item.user.id}`);
    console.log(`   Telegram: ${item.user.telegramUsername || 'Not linked'}`);
    console.log('');
  });

  const alerts = await prisma.transactionAlert.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  console.log('=== Recent Alerts ===\n');
  if (alerts.length === 0) {
    console.log('No alerts found');
  } else {
    alerts.forEach((alert, i) => {
      console.log(`${i + 1}. ${alert.walletAddress} - ${alert.type}`);
      console.log(`   Chain: ${alert.chain}`);
      console.log(`   TX: ${alert.transactionHash}`);
      console.log(`   Created: ${alert.createdAt}`);
      console.log('');
    });
  }

  await prisma.$disconnect();
}

checkStatus().catch(console.error);
