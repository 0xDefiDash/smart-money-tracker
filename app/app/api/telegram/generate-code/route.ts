
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/db';

// Generate a random 6-character alphanumeric code
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar looking characters
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Generate unique code (retry if duplicate)
    let code = generateCode();
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const existing = await prisma.user.findFirst({
        where: {
          telegramLinkingCode: code,
          telegramLinkingCodeExpiry: {
            gte: new Date(), // Only check non-expired codes
          },
        },
      });

      if (!existing) break;
      code = generateCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'Failed to generate unique code. Please try again.' },
        { status: 500 }
      );
    }

    // Set expiry to 5 minutes from now
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 5);

    // Update user with linking code
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        telegramLinkingCode: code,
        telegramLinkingCodeExpiry: expiry,
      },
    });

    // Generate deep link
    const botUsername = 'Tracker103_bot';
    const deepLink = `https://t.me/${botUsername}?start=${code}`;

    return NextResponse.json({
      success: true,
      code,
      deepLink,
      expiresAt: expiry.toISOString(),
    });
  } catch (error) {
    console.error('Error generating Telegram linking code:', error);
    return NextResponse.json(
      { error: 'Failed to generate linking code' },
      { status: 500 }
    );
  }
}
