import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAndLink() {
  console.log('🔍 Checking for username: only1denis\n');

  // Find user with this username
  const user = await prisma.user.findFirst({
    where: {
      telegramUsername: 'only1denis',
    },
  });

  if (user) {
    console.log('✅ Found user:', {
      email: user.email || 'No email',
      telegramUsername: user.telegramUsername,
      telegramChatId: user.telegramChatId,
    });
  } else {
    console.log('❌ No user found with username "only1denis"');
    console.log('\n📝 Creating a test entry...');
    
    // Create a user with this username so the /connect will work
    const newUser = await prisma.user.create({
      data: {
        telegramUsername: 'only1denis',
        telegramNotificationSettings: {
          whaleAlerts: true,
          shotCallersAlerts: true,
          blockWarsAlerts: true,
          marketAlerts: false,
          dailySummary: true,
          selectedShotCallers: [],
        },
      },
    });
    
    console.log('✅ Created user entry:', {
      id: newUser.id,
      telegramUsername: newUser.telegramUsername,
    });
  }

  await prisma.$disconnect();
}

checkAndLink().catch(console.error);
