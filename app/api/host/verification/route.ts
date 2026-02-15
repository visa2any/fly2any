import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Adjust path if needed, usually in app/api/auth/[...nextauth]/route.ts or lib/auth
import { prisma } from '@/lib/prisma'; // Adjust if needed

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const owner = await prisma.propertyOwner.findFirst({
        where: { user: { email: session.user.email } },
        select: {
            verificationStatus: true,
            trustScore: true,
            verificationMethod: true,
            identityVerified: true,
            emailVerified: true
        }
    });

    if (!owner) {
        // user might not be an owner yet, return default/empty
         return NextResponse.json({ 
            verificationStatus: 'UNVERIFIED',
            trustScore: 20, // base score
            method: null
         });
    }

    return NextResponse.json(owner);
  } catch (error) {
    console.error('Values verification fetch error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await req.json();
  const { method, status, trustScoreIncrease, proof } = data;

  try {
    // 1. Find or Create Owner Record
    // (In a real app, PropertyOwner is created during onboarding, but we ensure it exists)
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Upsert equivalent logic
    let owner = await prisma.propertyOwner.findUnique({ where: { userId: user.id } });

    if (!owner) {
        owner = await prisma.propertyOwner.create({
            data: {
                userId: user.id,
                // defaults
            }
        });
    }

    // 2. Update Verification Status
    const updates: any = {};
    if (status) updates.verificationStatus = status;
    if (method) updates.verificationMethod = method;
    
    // Increment trust score logic
    if (trustScoreIncrease) {
        updates.trustScore = { increment: trustScoreIncrease };
    }
    
    // Handle specific proofs (GPS, Video)
    if (method === 'GPS' && status === 'VERIFIED') {
        updates.propertyVerified = true;
    }

    const updatedOwner = await prisma.propertyOwner.update({
        where: { id: owner.id },
        data: updates
    });

    return NextResponse.json(updatedOwner);

  } catch (error) {
      console.error('Verification update error', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
