/**
 * CSV Email List Upload API
 *
 * Uploads a CSV file containing email addresses for campaign targeting
 * - Validates email format
 * - Deduplicates entries
 * - Returns parsed email list for campaign use
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';

export const runtime = 'nodejs';

// Simple email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST - Upload and parse CSV file with emails
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const campaignId = formData.get('campaignId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Read file content
    const text = await file.text();
    const lines = text.split(/[\r\n]+/).filter(line => line.trim());

    // Parse emails (handle CSV with headers and various formats)
    const emails: string[] = [];
    const invalid: string[] = [];
    const duplicates: string[] = [];
    const seen = new Set<string>();

    for (const line of lines) {
      // Skip common header rows
      const lowerLine = line.toLowerCase();
      if (
        lowerLine.includes('email') &&
        (lowerLine.includes('name') || lowerLine.includes('first') || lines.indexOf(line) === 0)
      ) {
        continue;
      }

      // Split by comma, semicolon, or tab
      const parts = line.split(/[,;\t]/);

      for (const part of parts) {
        const cleaned = part.trim().toLowerCase().replace(/^["']|["']$/g, '');

        if (!cleaned) continue;

        // Check if it looks like an email
        if (EMAIL_REGEX.test(cleaned)) {
          if (seen.has(cleaned)) {
            duplicates.push(cleaned);
          } else {
            seen.add(cleaned);
            emails.push(cleaned);
          }
        } else if (cleaned.includes('@')) {
          // Might be an email but invalid format
          invalid.push(cleaned);
        }
      }
    }

    // Check against suppression list
    const prisma = getPrismaClient();
    const suppressedEmails = await prisma.$queryRaw<{ email: string }[]>`
      SELECT "email" FROM "email_suppressions"
    `;
    const suppressedSet = new Set(suppressedEmails.map(s => s.email.toLowerCase()));

    const suppressed: string[] = [];
    const validEmails = emails.filter(email => {
      if (suppressedSet.has(email)) {
        suppressed.push(email);
        return false;
      }
      return true;
    });

    // If campaignId provided, update campaign with custom email list
    if (campaignId && validEmails.length > 0) {
      await prisma.$executeRaw`
        UPDATE "email_campaigns"
        SET
          "targetAudience" = 'custom',
          "totalRecipients" = ${validEmails.length},
          "updatedAt" = NOW()
        WHERE "id" = ${campaignId}
      `;
    }

    console.log(`📤 [UPLOAD] Processed CSV: ${validEmails.length} valid, ${invalid.length} invalid, ${duplicates.length} duplicates, ${suppressed.length} suppressed`);

    return NextResponse.json({
      success: true,
      stats: {
        total: lines.length,
        valid: validEmails.length,
        invalid: invalid.length,
        duplicates: duplicates.length,
        suppressed: suppressed.length,
      },
      emails: validEmails,
      invalid: invalid.slice(0, 10), // Only first 10 invalid
      suppressed: suppressed.slice(0, 10), // Only first 10 suppressed
    });
  } catch (error) {
    console.error('[CSV_UPLOAD] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process CSV file', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST - Parse email list from text input (alternative to file upload)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { emailText, campaignId } = body;

    if (!emailText) {
      return NextResponse.json({ error: 'No email text provided' }, { status: 400 });
    }

    // Split by common delimiters
    const lines = emailText.split(/[\r\n,;\t]+/).filter((line: string) => line.trim());

    // Parse and validate emails
    const emails: string[] = [];
    const invalid: string[] = [];
    const seen = new Set<string>();

    for (const line of lines) {
      const cleaned = line.trim().toLowerCase().replace(/^["']|["']$/g, '');

      if (!cleaned) continue;

      if (EMAIL_REGEX.test(cleaned)) {
        if (!seen.has(cleaned)) {
          seen.add(cleaned);
          emails.push(cleaned);
        }
      } else if (cleaned.includes('@')) {
        invalid.push(cleaned);
      }
    }

    // Check against suppression list
    const prisma = getPrismaClient();
    const suppressedEmails = await prisma.$queryRaw<{ email: string }[]>`
      SELECT "email" FROM "email_suppressions"
    `;
    const suppressedSet = new Set(suppressedEmails.map(s => s.email.toLowerCase()));

    const suppressed: string[] = [];
    const validEmails = emails.filter(email => {
      if (suppressedSet.has(email)) {
        suppressed.push(email);
        return false;
      }
      return true;
    });

    // If campaignId provided, update campaign
    if (campaignId && validEmails.length > 0) {
      await prisma.$executeRaw`
        UPDATE "email_campaigns"
        SET
          "targetAudience" = 'custom',
          "totalRecipients" = ${validEmails.length},
          "updatedAt" = NOW()
        WHERE "id" = ${campaignId}
      `;
    }

    return NextResponse.json({
      success: true,
      stats: {
        total: lines.length,
        valid: validEmails.length,
        invalid: invalid.length,
        suppressed: suppressed.length,
      },
      emails: validEmails,
      invalid: invalid.slice(0, 10),
      suppressed: suppressed.slice(0, 10),
    });
  } catch (error) {
    console.error('[EMAIL_PARSE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to parse email list', details: String(error) },
      { status: 500 }
    );
  }
}
