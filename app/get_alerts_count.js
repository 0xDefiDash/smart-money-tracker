const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAlertsCount() {
  try {
    const totalAlerts = await prisma.transactionAlert.count();
    const recentAlerts = await prisma.transactionAlert.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    console.log(JSON.stringify({
      totalAlerts,
      recentAlertsCount: recentAlerts.length,
      recentAlerts
    }, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getAlertsCount();
