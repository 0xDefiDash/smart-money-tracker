
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = body.event;

    if (!event) {
      return NextResponse.json({ error: 'No event data' }, { status: 400 });
    }

    // Handle different event types
    const { type, data } = event;

    if (type === 'charge:confirmed' || type === 'charge:resolved') {
      // Payment was successful
      const chargeCode = data.code;
      const metadata = data.metadata || {};

      // Find the tip by charge code (stored in txHash)
      const tip = await db.tweetTip.findFirst({
        where: { txHash: chargeCode }
      });

      if (tip) {
        // Update tip status to completed
        await db.tweetTip.update({
          where: { id: tip.id },
          data: {
            status: 'completed',
            completedAt: new Date()
          }
        });

        // Update KOL wallet totals
        await db.kOLWallet.update({
          where: { kolUsername: tip.kolUsername },
          data: {
            totalTipsReceived: {
              increment: tip.amount
            },
            totalTipsReceivedUsd: {
              increment: tip.amountUsd
            }
          }
        });

        console.log(`✅ Tip completed: ${chargeCode} for ${tip.kolUsername}`);
      }
    } else if (type === 'charge:failed') {
      // Payment failed
      const chargeCode = data.code;

      const tip = await db.tweetTip.findFirst({
        where: { txHash: chargeCode }
      });

      if (tip) {
        await db.tweetTip.update({
          where: { id: tip.id },
          data: {
            status: 'failed'
          }
        });

        console.log(`❌ Tip failed: ${chargeCode}`);
      }
    } else if (type === 'charge:pending') {
      // Payment is pending (waiting for confirmations)
      console.log(`⏳ Payment pending: ${data.code}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
