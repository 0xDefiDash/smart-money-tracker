
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Fetch all KOL profiles with their stats
    const kolProfiles = await prisma.kOLProfile.findMany({
      include: {
        stats: true,
        _count: {
          select: {
            tweets: true,
            tokenCalls: true
          }
        }
      },
      where: {
        isTracked: true
      },
      orderBy: {
        influenceScore: 'desc'
      }
    });

    const kols = kolProfiles.map((kol: any) => ({
      id: kol.id,
      username: kol.username,
      displayName: kol.displayName,
      avatar: kol.profileImageUrl || `/images/${kol.username.toLowerCase()}.jpg`,
      followers: kol.followersCount,
      category: kol.category || 'Crypto Influencer',
      influence: kol.influenceScore || Math.min(95, 50 + kol.followersCount / 10000),
      winRate: kol.stats?.winRate || 0,
      totalCalls: kol.stats?.totalCalls || kol._count.tokenCalls,
      avgROI: kol.stats?.averageROI || 0,
      isTracked: kol.isTracked,
      isVerified: kol.isVerified,
      tweetCount: kol._count.tweets,
    }));

    return NextResponse.json({
      kols,
      count: kols.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching KOLs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KOL profiles', kols: [] },
      { status: 500 }
    );
  }
}
