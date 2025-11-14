
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Generate a random 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Generate code regardless of authentication
    // This allows users to generate a link before logging in
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    // Bot username
    const botUsername = 'Tracker103_bot';
    
    // Create deep link with code as start parameter
    const deepLink = `https://t.me/${botUsername}?start=${code}`;
    
    // If user is logged in, store the code in database
    if (session?.user?.email) {
      try {
        await prisma.user.update({
          where: { email: session.user.email },
          data: {
            telegramLinkingCode: code,
            telegramLinkingCodeExpiry: expiresAt,
          },
        });
      } catch (dbError) {
        console.error('Error storing code in database:', dbError);
        // Continue anyway - code can still work via bot memory
      }
    }
    
    return NextResponse.json({
      success: true,
      code,
      deepLink,
      expiresAt: expiresAt.toISOString(),
      botUsername,
    });
  } catch (error: any) {
    console.error('Error generating code:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate code' },
      { status: 500 }
    );
  }
}
