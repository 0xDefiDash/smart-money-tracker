import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkWatchlist() {
  const watchlistItems = await prisma.watchlistItem.findMany({
    include: {
      user: {
        select: { email: true }
      }
    }
  });
  
  console.log('Total Watchlist Items:', watchlistItems.length);
  console.log('\nWatchlist Details:');
  watchlistItems.forEach((item: any, idx: number) => {
    console.log(`\n${idx + 1}. Wallet: ${item.address}`);
    console.log(`   Chain: ${item.chain}`);
    console.log(`   Label: ${item.label || 'N/A'}`);
    console.log(`   User: ${item.user?.email || 'N/A'}`);
    console.log(`   Token: ${item.tokenSymbol || 'All tokens'}`);
    console.log(`   Last Checked: ${item.lastChecked.toISOString()}`);
  });
  
  const alerts = await prisma.transactionAlert.count();
  console.log(`\nTotal Transaction Alerts: ${alerts}`);
  
  await prisma.$disconnect();
}

checkWatchlist().catch(console.error);
