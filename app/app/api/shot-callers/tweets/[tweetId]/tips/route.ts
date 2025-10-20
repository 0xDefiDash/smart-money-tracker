
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { tweetId: string } }
) {
  try {
    const { tweetId } = params;
    const body = await request.json();
    const { 
      kolUsername, 
      fromUserAddress, 
      fromUserName, 
      amount, 
      cryptocurrency, 
      amountUsd, 
      message,
      txHash 
    } = body;

    if (!kolUsername || !fromUserAddress || !amount || !cryptocurrency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if KOL wallet exists
    const kolWallet = await db.kOLWallet.findUnique({
      where: { kolUsername }
    });

    if (!kolWallet) {
      return NextResponse.json(
        { error: 'KOL wallet not found. Please ask the KOL to set up their wallet.' },
        { status: 404 }
      );
    }

    // Create tip record
    const tip = await db.tweetTip.create({
      data: {
        tweetId,
        kolUsername,
        fromUserAddress,
        fromUserName,
        amount,
        cryptocurrency,
        amountUsd,
        message,
        txHash,
        status: txHash ? 'completed' : 'pending',
        completedAt: txHash ? new Date() : null
      }
    });

    // Update KOL wallet total if completed
    if (txHash) {
      await db.kOLWallet.update({
        where: { kolUsername },
        data: {
          totalTipsReceived: {
            increment: amount
          },
          totalTipsReceivedUsd: {
            increment: amountUsd
          }
        }
      });
    }

    return NextResponse.json(tip, { status: 201 });
  } catch (error) {
    console.error('Error creating tip:', error);
    return NextResponse.json(
      { error: 'Failed to create tip' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { tweetId: string } }
) {
  try {
    const { tweetId } = params;

    const tips = await db.tweetTip.findMany({
      where: { tweetId },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const totalTips = tips.reduce((sum: number, tip: any) => sum + tip.amountUsd, 0);
    const tipsCount = tips.length;

    return NextResponse.json({ 
      tips, 
      totalTips,
      tipsCount 
    });
  } catch (error) {
    console.error('Error fetching tips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tips' },
      { status: 500 }
    );
  }
}
