
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// This endpoint will be called by a cron job or scheduler
export async function POST(request: NextRequest) {
  try {
    // Verify request is from authorized source (cron job or admin)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key-here';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);

    // Execute the auto-posting script
    console.log('🤖 Running scheduled auto-post...');
    const { stdout, stderr } = await execPromise(
      'cd /home/ubuntu/smart_money_tracker/app && npx tsx scripts/auto-twitter-post.ts'
    );

    console.log('Script output:', stdout);
    if (stderr) console.error('Script errors:', stderr);

    return NextResponse.json({
      success: true,
      message: 'Auto-post script executed',
      output: stdout,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error running scheduled post:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    status: 'active',
    message: 'Twitter scheduling endpoint is ready',
    nextRun: 'Every 30 minutes',
    features: [
      'Whale movement alerts ($5M+)',
      'Token call tracking',
      'Daily market summaries',
      'Automated posting'
    ]
  });
}
