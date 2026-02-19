import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

// Optional: Supabase for cloud storage
let supabaseClient: any = null;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function getSupabase() {
  if (supabaseClient) return supabaseClient;
  if (!supabaseUrl || !supabaseKey) return null;
  try {
    const { createClient } = await import('@supabase/supabase-js');
    supabaseClient = createClient(supabaseUrl, supabaseKey);
    return supabaseClient;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Allowed: JPG, PNG, WEBP, GIF' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File too large. Max 10MB' },
        { status: 400 }
      );
    }

    // Derive extension from MIME type (don't trust filename)
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg', 'image/png': 'png',
      'image/webp': 'webp', 'image/gif': 'gif',
    };
    const fileExt = mimeToExt[file.type] || 'jpg';
    const fileName = `${randomUUID()}.${fileExt}`;

    // Strategy 1: Try Supabase cloud storage  
    const supabase = await getSupabase();
    if (supabase) {
      const filePath = `${session.user.id}/${fileName}`;
      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (!error) {
        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);

        return NextResponse.json({ 
          success: true,
          url: publicUrl,
        });
      }
      console.warn('Supabase upload failed, falling back to local storage:', error.message);
    }

    // Strategy 2: Local disk storage fallback
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'properties');
    await mkdir(uploadsDir, { recursive: true });

    const filepath = path.join(uploadsDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    const url = `/uploads/properties/${fileName}`;

    return NextResponse.json({ 
      success: true,
      url,
    });

  } catch (error: any) {
    console.error('Upload handler failed:', error);
    return NextResponse.json({ success: false, error: error.message || 'Upload failed' }, { status: 500 });
  }
}
