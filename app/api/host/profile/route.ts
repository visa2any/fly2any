import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    let owner = await prisma.propertyOwner.findUnique({
      where: { userId: user.id }
    });

    if (!owner) {
      // Create empty profile if it doesn't exist yet
      owner = await prisma.propertyOwner.create({
        data: {
          userId: user.id,
        }
      });
    }

    return NextResponse.json(owner);
  } catch (error) {
    console.error('Host profile fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const owner = await prisma.propertyOwner.findUnique({ where: { userId: user.id } });
    if (!owner) return NextResponse.json({ error: "Host profile not found" }, { status: 404 });

    const updatedOwner = await prisma.propertyOwner.update({
      where: { id: owner.id },
      data: {
        bio: data.bio !== undefined ? data.bio : undefined,
        businessName: data.businessName !== undefined ? data.businessName : undefined,
        businessType: data.businessType !== undefined ? data.businessType : undefined,
        phone: data.phone !== undefined ? data.phone : undefined,
        whatsapp: data.whatsapp !== undefined ? data.whatsapp : undefined,
        website: data.website !== undefined ? data.website : undefined,
        payoutMethod: data.payoutMethod !== undefined ? data.payoutMethod : undefined,
        taxId: data.taxId !== undefined ? data.taxId : undefined,
        currency: data.currency !== undefined ? data.currency : undefined,
        languagesSpoken: data.languagesSpoken !== undefined ? data.languagesSpoken : undefined,
        profileImageUrl: data.profileImageUrl !== undefined ? data.profileImageUrl : undefined,
      }
    });

    return NextResponse.json(updatedOwner);
  } catch (error) {
    console.error('Host profile update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
