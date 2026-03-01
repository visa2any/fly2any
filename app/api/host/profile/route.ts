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

    let owner = await prisma.propertyOwner.findUnique({
      where: { userId: session.user.id }
    });

    if (!owner) {
      owner = await prisma.propertyOwner.create({
        data: { userId: session.user.id }
      });
    }

    return NextResponse.json(owner);
  }, { category: ErrorCategory.DATABASE, severity: ErrorSeverity.NORMAL });
}

export async function PUT(req: NextRequest) {
  return handleApiError(req, async () => {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    const owner = await prisma.propertyOwner.findUnique({ where: { userId: session.user.id } });
    if (!owner) return NextResponse.json({ error: 'Host profile not found' }, { status: 404 });

    const updated = await prisma.propertyOwner.update({
      where: { id: owner.id },
      data: {
        bio: data.bio,
        businessName: data.businessName,
        businessType: data.businessType,
        phone: data.phone,
        whatsapp: data.whatsapp,
        website: data.website,
        payoutMethod: data.payoutMethod,
        taxId: data.taxId,
        currency: data.currency,
        languagesSpoken: data.languagesSpoken,
        profileImageUrl: data.profileImageUrl,
      }
    });

    return NextResponse.json(updated);
  }, { category: ErrorCategory.DATABASE, severity: ErrorSeverity.NORMAL });
}
