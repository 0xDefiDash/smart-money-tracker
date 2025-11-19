#!/usr/bin/env ts-node
import { prisma } from './lib/db';

async function checkWatchlist() {
  try {
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

    console.log('\n=== WATCHLIST ITEMS ===');
    console.log('Total:', watchlistItems.length, '\n');
    
    watchlistItems.forEach((item: any, idx: number) => {
      console.log(`${idx + 1}. Address: ${item.address}`);
      console.log(`   Chain: ${item.chain}`);
      console.log(`   User: ${item.user.email || 'N/A'}`);
      console.log(`   Telegram: ${item.user.telegramUsername || 'Not linked'}`);
      console.log(`   Last Checked: ${item.lastChecked}`);
      console.log(`   Created: ${item.createdAt}\n`);
    });

    const alertCount = await prisma.transactionAlert.count();
    const recentAlerts = await prisma.transactionAlert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    console.log('\n=== TRANSACTION ALERTS ===');
    console.log('Total alerts in database:', alertCount, '\n');
    
    if (recentAlerts.length > 0) {
      console.log('Recent alerts:');
      recentAlerts.forEach((alert: any, idx: number) => {
        console.log(`${idx + 1}. Wallet: ${alert.walletAddress}`);
        console.log(`   Chain: ${alert.chain}`);
        console.log(`   Type: ${alert.type}`);
        console.log(`   Created: ${alert.createdAt}\n`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWatchlist();
