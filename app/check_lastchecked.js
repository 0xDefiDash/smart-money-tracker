const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLastChecked() {
  try {
    const items = await prisma.watchlistItem.findMany({
      select: {
        id: true,
        address: true,
        chain: true,
        lastChecked: true,
        user: {
          select: {
            email: true
          }
        }
      }
    });
    
    console.log('Watchlist Items with lastChecked timestamps:\n');
    items.forEach(item => {
      console.log(`ID: ${item.id}`);
      console.log(`Address: ${item.address}`);
      console.log(`Chain: ${item.chain}`);
      console.log(`User: ${item.user.email}`);
      console.log(`Last Checked: ${item.lastChecked}`);
      console.log('---');
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkLastChecked();
