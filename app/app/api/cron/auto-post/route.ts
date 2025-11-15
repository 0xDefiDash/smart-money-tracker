
import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

/**
 * Cron endpoint for automated Twitter posting
 * Call this endpoint every 30 minutes via cron job or external service
 * 
 * Usage with cron:
 * *\/30 * * * * curl -X POST http://localhost:3000/api/cron/auto-post -H "Authorization: Bearer YOUR_SECRET"
 */

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'defidash-auto-post-2025';
    
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing authorization token' },
        { status: 401 }
      );
    }

    console.log('🤖 Starting automated Twitter post job...');
    
    // Run the auto-posting script
    const scriptPath = '/home/ubuntu/smart_money_tracker/app/scripts/auto-twitter-post.ts';
    
    return new Promise<NextResponse>((resolve) => {
      const child = spawn('npx', ['tsx', scriptPath], {
        cwd: '/home/ubuntu/smart_money_tracker/app',
        env: { ...process.env }
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        console.log(text);
      });

      child.stderr.on('data', (data) => {
        const text = data.toString();
        errorOutput += text;
        console.error(text);
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(NextResponse.json({
            success: true,
            message: 'Auto-post job completed successfully',
            output: output,
            timestamp: new Date().toISOString()
          }));
        } else {
          resolve(NextResponse.json({
            success: false,
            message: 'Auto-post job failed',
            output: output,
            error: errorOutput,
            exitCode: code,
            timestamp: new Date().toISOString()
          }, { status: 500 }));
        }
      });

      // Timeout after 4 minutes
      setTimeout(() => {
        child.kill();
        resolve(NextResponse.json({
          success: false,
          message: 'Auto-post job timed out',
          output: output,
          timestamp: new Date().toISOString()
        }, { status: 408 }));
      }, 240000);
    });
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error', 
        details: String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// GET endpoint for status check
export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/cron/auto-post',
    schedule: 'Every 30 minutes',
    features: [
      'Whale movement alerts ($5M+ transactions)',
      'Token call tracking from shot callers',
      'Daily market summaries (9 AM UTC)',
      'Automated posting with rate limiting'
    ],
    usage: {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_CRON_SECRET'
      }
    },
    setupInstructions: [
      '1. Set CRON_SECRET in environment variables',
      '2. Configure cron job or external scheduler',
      '3. Call this endpoint every 30 minutes',
      '4. Monitor logs for posting activity'
    ],
    testCommand: 'curl -X POST http://localhost:3000/api/cron/auto-post -H "Authorization: Bearer YOUR_SECRET"'
  });
}
