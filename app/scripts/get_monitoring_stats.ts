import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getMonitoringStats() {
  try {
    // Get all watchlist items with their latest check time
    const watchlistItems = await prisma.watchlistItem.findMany({
      include: {
        user: {
          select: {
            email: true,
            telegramUsername: true,
            isPremium: true
          }
        }
      }
    });

    // Get all transaction alerts created in the last monitoring run
    const recentAlerts = await prisma.transactionAlert.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get total alerts count
    const totalAlerts = await prisma.transactionAlert.count();

    console.log(JSON.stringify({
      watchlistItems: watchlistItems.map(item => ({
        address: item.address,
        chain: item.chain,
        lastChecked: item.lastChecked,
        userId: item.userId,
        userEmail: item.user.email,
        telegramUsername: item.user.telegramUsername,
        isPremium: item.user.isPremium
      })),
      recentAlerts: recentAlerts.map(alert => ({
        id: alert.id,
        walletAddress: alert.walletAddress,
        chain: alert.chain,
        transactionHash: alert.transactionHash,
        type: alert.type,
        fromAddress: alert.fromAddress,
        toAddress: alert.toAddress,
        value: alert.value,
        createdAt: alert.createdAt
      })),
      totalAlerts,
      timestamp: new Date().toISOString()
    }, null, 2));

  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getMonitoringStats();
