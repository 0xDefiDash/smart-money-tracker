const { PrismaClient } = require('@prisma/client');

async function checkAlerts() {
  const prisma = new PrismaClient();
  
  try {
    // Get transaction alerts
    const alerts = await prisma.transactionAlert.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('\n=== RECENT TRANSACTION ALERTS ===');
    console.log(`Total alerts: ${alerts.length}\n`);
    
    if (alerts.length === 0) {
      console.log('No alerts found in the database.');
    } else {
      alerts.forEach((alert, index) => {
        console.log(`${index + 1}. ${alert.transactionHash || 'N/A'}`);
        console.log(`   Type: ${alert.transactionType || 'N/A'}`);
        console.log(`   Amount: ${alert.amount || 'N/A'}`);
        console.log(`   Notified: ${alert.notified}`);
        console.log(`   Created: ${alert.createdAt}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAlerts();
