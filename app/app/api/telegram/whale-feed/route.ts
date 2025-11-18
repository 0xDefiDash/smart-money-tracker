
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const transactions = await prisma.whaleTransaction.findMany({
      take: 20,
      orderBy: { timestamp: 'desc' },
      include: {
        cryptocurrency: {
          select: {
            symbol: true,
            name: true,
          },
        },
      },
    });

    const formattedTransactions = transactions.map((tx: any) => ({
      id: tx.id,
      blockchain: tx.blockchain,
      value: tx.value,
      valueUsd: tx.valueUsd,
      symbol: tx.cryptocurrency.symbol,
      timestamp: tx.timestamp,
    }));

    return NextResponse.json({
      success: true,
      transactions: formattedTransactions,
    });
  } catch (error: any) {
    console.error('Error fetching whale transactions:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        transactions: [],
      },
      { status: 500 }
    );
  }
}
