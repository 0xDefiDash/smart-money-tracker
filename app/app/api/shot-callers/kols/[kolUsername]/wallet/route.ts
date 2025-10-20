
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { kolUsername: string } }
) {
  try {
    const { kolUsername } = params;

    const wallet = await db.kOLWallet.findUnique({
      where: { kolUsername },
      include: {
        tips: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    });

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(wallet);
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { kolUsername: string } }
) {
  try {
    const { kolUsername } = params;
    const body = await request.json();

    const wallet = await db.kOLWallet.upsert({
      where: { kolUsername },
      update: {
        ...body,
        updatedAt: new Date()
      },
      create: {
        kolUsername,
        ...body
      }
    });

    return NextResponse.json(wallet);
  } catch (error) {
    console.error('Error updating wallet:', error);
    return NextResponse.json(
      { error: 'Failed to update wallet' },
      { status: 500 }
    );
  }
}
