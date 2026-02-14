import { NextRequest, NextResponse } from 'next/server';
import { mobileUploadService } from '@/lib/mobile-upload-service';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const photos = mobileUploadService.getSession(params.sessionId);
  if (!photos) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  return NextResponse.json({ photos });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Save to public/uploads/temp
  const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'temp');
  const filepath = path.join(uploadDir, filename);
  
  try {
      await writeFile(filepath, buffer);
      
      const url = `/uploads/temp/${filename}`;
      const photoData = {
          url,
          caption: '',
          category: 'general',
          isPrimary: false
      };
      
      mobileUploadService.addPhoto(params.sessionId, photoData);
      
      return NextResponse.json({ success: true, Photo: photoData });
  } catch (e) {
      console.error('Upload failed', e);
      return NextResponse.json({ error: 'Write failed' }, { status: 500 });
  }
}
