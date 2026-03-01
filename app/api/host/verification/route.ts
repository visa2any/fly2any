import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleApiError(req, async () => {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const owner = await prisma.propertyOwner.findUnique({
      where: { userId: session.user.id },
      select: {
        verificationStatus: true,
        trustScore: true,
        verificationMethod: true,
        identityVerified: true,
        emailVerified: true,
      }
    });

    if (!owner) {
      return NextResponse.json({ verificationStatus: 'UNVERIFIED', trustScore: 20, method: null });
    }

    return NextResponse.json(owner);
  }, { category: ErrorCategory.DATABASE, severity: ErrorSeverity.NORMAL });
}

export async function POST(req: NextRequest) {
  return handleApiError(req, async () => {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { method, status, trustScoreIncrease } = await req.json();

    let owner = await prisma.propertyOwner.findUnique({ where: { userId: session.user.id } });
    if (!owner) {
      owner = await prisma.propertyOwner.create({ data: { userId: session.user.id } });
    }

    const updates: any = {};
    if (status) updates.verificationStatus = status;
    if (method) updates.verificationMethod = method;
    if (trustScoreIncrease) updates.trustScore = { increment: trustScoreIncrease };
    if (method === 'GPS' && status === 'VERIFIED') updates.propertyVerified = true;

    const updated = await prisma.propertyOwner.update({ where: { id: owner.id }, data: updates });
    return NextResponse.json(updated);
  }, { category: ErrorCategory.DATABASE, severity: ErrorSeverity.HIGH });
}
