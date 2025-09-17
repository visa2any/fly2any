import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Simple image upload system for email templates
// For production, consider using Cloudinary or AWS S3
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 2MB' }, { status: 400 });
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: 'Only JPEG, PNG, GIF, and WebP images are allowed'
      }, { status: 400 });
    }

    // Convert to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Create images table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS email_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        filename VARCHAR(255) NOT NULL,
        mimetype VARCHAR(100) NOT NULL,
        size INTEGER NOT NULL,
        data_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(100)
      )
    `;

    // Store in database
    const result = await sql`
      INSERT INTO email_images (filename, mimetype, size, data_url, created_by)
      VALUES (${file.name}, ${file.type}, ${file.size}, ${dataUrl}, 'admin')
      RETURNING id, filename, mimetype, size, created_at
    `;

    const imageRecord = result.rows[0];

    return NextResponse.json({
      success: true,
      image: {
        id: imageRecord.id,
        filename: imageRecord.filename,
        mimetype: imageRecord.mimetype,
        size: imageRecord.size,
        url: `/api/email-marketing/images/${imageRecord.id}`,
        uploadedAt: imageRecord.created_at
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({
      error: 'Failed to upload image'
    }, { status: 500 });
  }
}

// Get all images
export async function GET() {
  try {
    const result = await sql`
      SELECT id, filename, mimetype, size, created_at, created_by
      FROM email_images
      ORDER BY created_at DESC
    `;

    const images = result.rows.map(row => ({
      id: row.id,
      filename: row.filename,
      mimetype: row.mimetype,
      size: row.size,
      url: `/api/email-marketing/images/${row.id}`,
      uploadedAt: row.created_at,
      uploadedBy: row.created_by
    }));

    return NextResponse.json({
      success: true,
      images
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json({
      error: 'Failed to fetch images'
    }, { status: 500 });
  }
}