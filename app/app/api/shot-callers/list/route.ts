
import { NextResponse } from 'next/server';

// Mock data of Shot Callers - in production, this would come from your database
const SHOT_CALLERS = [
  {
    username: '0xsweep',
    displayName: '0xSweep',
    isVerified: true,
    profileImage: '/images/0xsweep.jpg',
  },
  {
    username: '100xdarren',
    displayName: '100xDarren',
    isVerified: true,
    profileImage: '/images/100xdarren.jpg',
  },
  {
    username: 'cryptowendyo',
    displayName: 'Crypto Wendy-O',
    isVerified: true,
    profileImage: '/images/cryptowendyo.jpg',
  },
  {
    username: 'bullrun_gravano',
    displayName: 'Bullrun Gravano',
    isVerified: true,
    profileImage: '/images/bullrun-gravano.jpg',
  },
  {
    username: '1crypticpoet',
    displayName: 'Cryptic Poet',
    isVerified: true,
    profileImage: '/images/1crypticpoet.jpg',
  },
  {
    username: 'aixbt_agent',
    displayName: 'aixbt Agent',
    isVerified: true,
    profileImage: '/images/aixbt-agent.jpg',
  },
  {
    username: 'james_wynn',
    displayName: 'James Wynn',
    isVerified: true,
    profileImage: '/images/james-wynn.jpg',
  },
  {
    username: 'jesse_pollak',
    displayName: 'Jesse Pollak',
    isVerified: true,
    profileImage: '/images/jesse-pollak.jpg',
  },
];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      shotCallers: SHOT_CALLERS,
    });
  } catch (error) {
    console.error('Error fetching shot callers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shot callers' },
      { status: 500 }
    );
  }
}
