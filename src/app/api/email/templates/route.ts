import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email/email-service';

const availableTemplates = [
  {
    id: 'welcome-lead',
    name: 'Welcome Email for New Leads',
    description: 'Professional welcome email optimized for Mailgun deliverability',
    category: 'welcome_series',
    variables: [
      'firstName', 'email', 'source', 'preferredDestination', 'interests'
    ],
    preview: {
      subject: 'Hi {{firstName}}! Your exclusive flight deals await ✈️',
      previewText: 'Welcome to Fly2Any! Get exclusive flight deals and travel insights.'
    }
  },
  {
    id: 'flight-deal-promo',
    name: 'Flight Deal Promotional Email',
    description: 'Engaging promotional email for flight deals optimized for Mailgun',
    category: 'promotional',
    variables: [
      'firstName', 'email', 'dealTitle', 'deals', 'expiryDate', 'promoCode'
    ],
    preview: {
      subject: '🚨 Price Drop Alert! {{dealTitle}} - Save up to $500!',
      previewText: 'Amazing flight deals you don\'t want to miss!'
    }
  },
  {
    id: 'booking-follow-up',
    name: 'Booking Follow-up Email',
    description: 'Post-booking follow-up with travel tips and upsells',
    category: 'booking_follow_up',
    variables: [
      'firstName', 'bookingReference', 'destination', 'departureDate', 'daysUntilTravel'
    ],
    preview: {
      subject: '✈️ Your {{destination}} trip is coming up! Here\'s what you need to know',
      previewText: 'Get ready for your amazing trip with our travel preparation guide.'
    }
  },
  {
    id: 'newsletter',
    name: 'Newsletter Template',
    description: 'Weekly/monthly newsletter with travel news, deals, and tips',
    category: 'newsletter',
    variables: [
      'firstName', 'newsletterTitle', 'edition', 'featuredDestination', 'topDeals'
    ],
    preview: {
      subject: '{{newsletterTitle}} - {{edition}} | {{featuredDestination}} spotlight 🌟',
      previewText: 'This week\'s travel inspiration, deals, and tips from around the world!'
    }
  },
  {
    id: 'price-drop-alert',
    name: 'Price Drop Alert',
    description: 'Alert email when flight prices drop for saved routes',
    category: 'price_alert',
    variables: [
      'firstName', 'route', 'priceInfo', 'flightDetails', 'urgencyLevel'
    ],
    preview: {
      subject: '📉 Price Drop Alert! {{origin}}→{{destination}} now ${{currentPrice}} ({{percentageOff}}% off!)',
      previewText: 'The flight you\'ve been tracking just dropped in price!'
    }
  },
  {
    id: 'booking-confirmation',
    name: 'Booking Confirmation',
    description: 'Professional booking confirmation with all flight details',
    category: 'transactional',
    variables: [
      'bookingReference', 'passengerName', 'flightDetails', 'totalPrice'
    ],
    preview: {
      subject: '✅ Flight Confirmed - {{bookingReference}} | {{origin}} → {{destination}}',
      previewText: 'Your flight booking is confirmed! Here are your travel details.'
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const templateId = searchParams.get('id');

    if (templateId) {
      // Return specific template
      const template = availableTemplates.find(t => t.id === templateId);
      if (!template) {
        return NextResponse.json(
          { success: false, error: 'Template not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: template
      });
    }

    // Filter templates by category if specified
    let templates = availableTemplates;
    if (category) {
      templates = availableTemplates.filter(t => t.category === category);
    }

    return NextResponse.json({
      success: true,
      data: templates,
      count: templates.length,
      categories: [...new Set(availableTemplates.map(t => t.category))]
    });
  } catch (error) {
    console.error('❌ Failed to fetch templates:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch templates',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, templateId, testEmail, templateData } = body;

    if (action === 'test') {
      if (!templateId || !testEmail) {
        return NextResponse.json(
          { success: false, error: 'Template ID and test email are required' },
          { status: 400 }
        );
      }

      // Send test email
      console.log(`📧 Sending test email for template: ${templateId} to: ${testEmail}`);

      const result = await emailService.sendTemplatedEmail(
        templateId,
        testEmail,
        templateData || { firstName: 'Test User', email: testEmail },
        'test-email'
      );

      return NextResponse.json({
        success: result.success,
        message: result.success 
          ? `Test email sent successfully to ${testEmail}` 
          : `Failed to send test email: ${result.error}`,
        data: {
          messageId: result.messageId,
          provider: result.provider
        }
      });
    }

    if (action === 'preview') {
      const template = availableTemplates.find(t => t.id === templateId);
      if (!template) {
        return NextResponse.json(
          { success: false, error: 'Template not found' },
          { status: 404 }
        );
      }

      // Generate preview with sample data
      const sampleData = generateSampleData(templateId);
      
      // In a real implementation, you'd render the template with sample data
      // For now, return the template info with sample data
      return NextResponse.json({
        success: true,
        data: {
          template,
          sampleData,
          renderedSubject: replaceVariables(template.preview.subject, sampleData),
          renderedPreviewText: replaceVariables(template.preview.previewText, sampleData)
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('❌ Template action failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Template action failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateSampleData(templateId: string): Record<string, any> {
  const sampleDataMap: Record<string, any> = {
    'welcome-lead': {
      firstName: 'Sarah',
      email: 'sarah@example.com',
      source: 'website signup',
      preferredDestination: 'Paris',
      interests: ['Europe', 'Cultural Tours']
    },
    'flight-deal-promo': {
      firstName: 'John',
      email: 'john@example.com',
      dealTitle: 'Flash Sale: Europe Flights',
      deals: [
        {
          origin: 'NYC',
          destination: 'LON',
          price: 299,
          currency: '$',
          originalPrice: 599,
          savings: 300,
          departureDate: '2024-06-15',
          airline: 'British Airways',
          dealUrl: 'https://fly2any.com/deal/123'
        }
      ],
      expiryDate: '2024-06-01',
      promoCode: 'FLASH50'
    },
    'booking-follow-up': {
      firstName: 'Maria',
      bookingReference: 'FLY2024001',
      destination: 'Tokyo',
      departureDate: '2024-07-20',
      daysUntilTravel: 14,
      flightDetails: {
        origin: 'LAX',
        destination: 'NRT',
        airline: 'Japan Airlines'
      }
    },
    'newsletter': {
      firstName: 'David',
      newsletterTitle: 'Fly2Any Travel Weekly',
      edition: 'June 2024',
      featuredDestination: {
        name: 'Iceland',
        description: 'Discover the land of fire and ice',
        avgPrice: 450,
        currency: '$'
      },
      topDeals: []
    },
    'price-drop-alert': {
      firstName: 'Lisa',
      route: {
        origin: 'SFO',
        destination: 'CDG',
        originCity: 'San Francisco',
        destinationCity: 'Paris'
      },
      priceInfo: {
        currentPrice: 425,
        previousPrice: 650,
        currency: '$',
        savings: 225,
        percentageOff: 35
      },
      urgencyLevel: 'high'
    },
    'booking-confirmation': {
      bookingReference: 'FLY2024002',
      passengerName: 'Robert Johnson',
      flightDetails: {
        outbound: {
          departure: { iataCode: 'LAX', city: 'Los Angeles' },
          arrival: { iataCode: 'JFK', city: 'New York' },
          airline: { name: 'American Airlines' },
          flightNumber: 'AA123'
        }
      },
      totalPrice: 350
    }
  };

  return sampleDataMap[templateId] || {};
}

function replaceVariables(text: string, data: Record<string, any>): string {
  return text.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
    const value = getNestedValue(data, path);
    return value !== undefined ? String(value) : match;
  });
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}