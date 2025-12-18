import { NextResponse } from 'next/server';
import { agentManager } from '@/lib/ai-agents/agent-manager';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    const session = agentManager.getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get latest CEO decisions
    const decisions = session.ceoDecisions
      .slice(-limit)
      .reverse();

    return NextResponse.json({
      decisions,
      totalDecisions: session.ceoDecisions.length
    });
  } catch (error) {
    console.error('CEO decisions error:', error);
    return NextResponse.json(
      { error: 'Failed to get CEO decisions' },
      { status: 500 }
    );
  }
}
