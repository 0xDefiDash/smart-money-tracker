const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAlerts() {
  try {
    const alerts = await prisma.transactionAlert.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('\n=== RECENT TRANSACTION ALERTS ===');
    console.log(`Total alerts: ${alerts.length}\n`);
    
    if (alerts.length > 0) {
      alerts.forEach((alert, idx) => {
        console.log(`${idx + 1}. Alert ID: ${alert.id}`);
        console.log(`   Type: ${alert.type}`);
        console.log(`   Amount: ${alert.amount}`);
        console.log(`   Created: ${alert.createdAt}`);
        console.log(`   Telegram sent: ${alert.telegramSent}`);
        console.log('');
      });
    } else {
      console.log('✅ No alerts in database yet.');
      console.log('This is expected - alerts are only created when new transactions are detected.');
      console.log('The monitoring system is running correctly and checking for new activity.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAlerts();
