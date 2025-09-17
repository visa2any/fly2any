import { NextRequest, NextResponse } from 'next/server';
import { EmailMarketingDatabase } from '@/lib/email-marketing-database';

// Email Marketing specific unsubscribe endpoint
export async function POST(request: NextRequest) {
  try {
    const { email, contactId, reason, campaignId } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Record unsubscribe event
    if (contactId && campaignId) {
      await EmailMarketingDatabase.recordEmailEvent({
        contact_id: contactId,
        campaign_id: campaignId,
        event_type: 'unsubscribed',
        event_data: {
          reason: reason || 'user_request',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Update contact status to unsubscribed
    const contacts = await EmailMarketingDatabase.getEmailContacts({
      limit: 1,
      offset: 0
    });

    if (contacts.contacts.length === 0) {
      return NextResponse.json(
        { error: 'Email address not found in our system' },
        { status: 404 }
      );
    }

    // Mark as unsubscribed
    // Note: You'll need to add an updateContactStatus method to EmailMarketingDatabase
    // For now, we'll use the existing unsubscribe endpoint
    const unsubscribeResponse = await fetch('/api/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (!unsubscribeResponse.ok) {
      const errorData = await unsubscribeResponse.json();
      return NextResponse.json(errorData, { status: unsubscribeResponse.status });
    }

    const result = await unsubscribeResponse.json();

    console.log(`📧 Email Marketing Unsubscribe: ${email} (Reason: ${reason || 'user_request'})`);

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from email marketing',
      email,
      unsubscribeReason: reason || 'user_request'
    });

  } catch (error) {
    console.error('Email Marketing unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to process unsubscribe request' },
      { status: 500 }
    );
  }
}