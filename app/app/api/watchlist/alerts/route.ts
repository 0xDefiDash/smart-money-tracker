
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
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

    const alerts = await prisma.transactionAlert.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const unreadCount = await prisma.transactionAlert.count({
      where: {
        userId: user.id,
        isRead: false
      }
    });

    return NextResponse.json({ alerts, unreadCount });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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

    const { alertIds } = await request.json();

    if (!alertIds || !Array.isArray(alertIds)) {
      return NextResponse.json(
        { error: 'alertIds array required' },
        { status: 400 }
      );
    }

    await prisma.transactionAlert.updateMany({
      where: {
        id: { in: alertIds },
        userId: user.id
      },
      data: {
        isRead: true
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update alerts' },
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

    // Delete all read alerts for the user
    await prisma.transactionAlert.deleteMany({
      where: {
        userId: user.id,
        isRead: true
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to clear alerts' },
      { status: 500 }
    );
  }
}
