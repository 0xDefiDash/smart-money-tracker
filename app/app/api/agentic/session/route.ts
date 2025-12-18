import { NextResponse } from 'next/server';
import { agentManager } from '@/lib/ai-agents/agent-manager';

// GET - Get session info
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      const session = agentManager.getSession(sessionId);
      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(session);
    }

    // Return all sessions
    const sessions = agentManager.getAllSessions();
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Session GET error:', error);
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    );
  }
}

// POST - Create new session
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { totalCapital = 100000 } = body;

    const session = agentManager.createSession(totalCapital);
    
    // Start auto-update
    agentManager.startAutoUpdate(session.id, 30000);

    return NextResponse.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

// PUT - Update session status
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, action } = body;

    if (!sessionId || !action) {
      return NextResponse.json(
        { error: 'Missing sessionId or action' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'pause':
        agentManager.pauseSession(sessionId);
        break;
      case 'resume':
        agentManager.resumeSession(sessionId);
        break;
      case 'stop':
        agentManager.stopSession(sessionId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const session = agentManager.getSession(sessionId);
    return NextResponse.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Session update error:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}
