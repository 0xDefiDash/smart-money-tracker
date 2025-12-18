import { NextResponse } from 'next/server';
import { agentManager } from '@/lib/ai-agents/agent-manager';

// GET - Get agents for a session
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

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

    return NextResponse.json({
      agents: session.agents,
      marketData: session.marketData
    });
  } catch (error) {
    console.error('Agents GET error:', error);
    return NextResponse.json(
      { error: 'Failed to get agents' },
      { status: 500 }
    );
  }
}

// PUT - Update agent status
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, agentId, status } = body;

    if (!sessionId || !agentId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    const agent = session.agents.find(a => a.id === agentId);
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    agent.status = status;

    return NextResponse.json({
      success: true,
      agent
    });
  } catch (error) {
    console.error('Agent update error:', error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}
