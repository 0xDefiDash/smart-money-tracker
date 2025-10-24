import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearSeededData() {
  try {
    console.log('Clearing seeded data from database...');
    
    // Delete token calls
    const deletedCalls = await prisma.tokenCall.deleteMany({});
    console.log(`✅ Deleted ${deletedCalls.count} token calls`);

    // Delete tweets
    const deletedTweets = await prisma.kOLTweet.deleteMany({});
    console.log(`✅ Deleted ${deletedTweets.count} tweets`);

    // Delete KOL stats
    const deletedStats = await prisma.kOLStats.deleteMany({});
    console.log(`✅ Deleted ${deletedStats.count} KOL stats`);

    console.log('\n✅ All seeded data cleared successfully!');
    console.log('The system will now fetch fresh data from X API.');
  } catch (error) {
    console.error('Error clearing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearSeededData();
