import { NextRequest, NextResponse } from 'next/server';
import { mobileUploadService } from '@/lib/mobile-upload-service';

export async function POST() {
  const sessionId = mobileUploadService.createSession();
  return NextResponse.json({ sessionId });
}
