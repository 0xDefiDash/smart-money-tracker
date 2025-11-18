
import { NextResponse } from 'next/server';
import { getNansenStatus, isNansenConfigured } from '@/lib/nansen-client';

/**
 * Nansen API Status Check
 * 
 * Verifies Nansen API configuration and connectivity
 */
export async function GET() {
  try {
    const status = await getNansenStatus();

    return NextResponse.json({
      configured: status.configured,
      working: status.working,
      error: status.error,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        configured: isNansenConfigured(),
        working: false,
        error: error.message || 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
