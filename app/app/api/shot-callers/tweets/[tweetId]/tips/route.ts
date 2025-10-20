
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { createCoinbaseCharge } from '@/lib/coinbase-commerce';

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
      message
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

    // Create Coinbase Commerce charge
    const charge = await createCoinbaseCharge({
      name: `Tip for ${kolUsername}`,
      description: message || `Tip for ${kolUsername}'s content on Smart Money Tracker`,
      pricing_type: 'fixed_price',
      local_price: {
        amount: amount.toString(),
        currency: 'USD'
      },
      metadata: {
        tweetId,
        kolUsername,
        fromUserAddress,
        fromUserName,
        cryptocurrency,
        message: message || ''
      },
      redirect_url: `${process.env.NEXTAUTH_URL}/shot-callers?tip_success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/shot-callers?tip_cancelled=true`
    });

    // Create tip record with pending status
    const tip = await db.tweetTip.create({
      data: {
        tweetId,
        kolUsername,
        fromUserAddress,
        fromUserName,
        amount: parseFloat(amount),
        cryptocurrency,
        amountUsd: parseFloat(amount),
        message,
        txHash: charge.data.code, // Store Coinbase charge code as reference
        status: 'pending',
        completedAt: null
      }
    });

    return NextResponse.json({ 
      tip,
      checkoutUrl: charge.data.hosted_url,
      chargeId: charge.data.id,
      chargeCode: charge.data.code
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating tip:', error);
    return NextResponse.json(
      { error: 'Failed to create tip. Please try again.' },
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
    const tipsCount = tips.filter((tip: any) => tip.status === 'completed').length;

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
