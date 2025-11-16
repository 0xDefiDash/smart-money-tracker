
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  // If no session, return empty watchlist (site is now public)
  if (!session?.user?.email) {
    return NextResponse.json({ watchlist: [] });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ watchlist: [] });
    }

    const watchlist = await prisma.watchlistItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ watchlist });
  } catch (error: any) {
    return NextResponse.json({ watchlist: [] });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  // If no session, inform user that they need to sign in for this feature
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Please sign in to add items to your watchlist' },
      { status: 401 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { address, chain, label, tokenAddress, tokenSymbol } = await request.json();

    if (!address || !chain) {
      return NextResponse.json(
        { error: 'Address and chain are required' },
        { status: 400 }
      );
    }

    // Normalize address based on chain
    const normalizedAddress = chain === 'solana'
      ? address
      : address.toLowerCase();

    // Check for existing watchlist item
    const existing = await prisma.watchlistItem.findFirst({
      where: {
        userId: user.id,
        address: normalizedAddress,
        chain,
        tokenAddress: tokenAddress || null
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Wallet already in watchlist' },
        { status: 409 }
      );
    }

    // Create watchlist item
    const item = await prisma.watchlistItem.create({
      data: {
        userId: user.id,
        address: normalizedAddress,
        chain,
        label,
        tokenAddress,
        tokenSymbol
      }
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to add to watchlist' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await prisma.watchlistItem.delete({
      where: {
        id,
        userId: user.id // Ensure user owns this item
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to remove from watchlist' },
      { status: 500 }
    );
  }
}
