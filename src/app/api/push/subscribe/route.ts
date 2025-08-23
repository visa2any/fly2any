/**
 * Push Notification Subscription API
 * Handles VAPID subscriptions for booking updates and travel notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// Extended PushSubscription interface for proper typing
interface ExtendedPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Browser PushSubscription to web-push compatible conversion
function convertPushSubscription(subscription: any): ExtendedPushSubscription {
  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys?.p256dh || '',
      auth: subscription.keys?.auth || ''
    }
  };
}

// Configure VAPID details
const vapidConfig = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
  subject: process.env.VAPID_SUBJECT || 'mailto:info@fly2any.com'
};

if (vapidConfig.publicKey && vapidConfig.privateKey) {
  webpush.setVapidDetails(
    vapidConfig.subject,
    vapidConfig.publicKey,
    vapidConfig.privateKey
  );
}

interface PushSubscriptionData {
  subscription: any; // Browser PushSubscription
  userAgent?: string;
  timestamp?: string;
  userId?: string;
  preferences?: {
    bookingUpdates: boolean;
    priceAlerts: boolean;
    travelTips: boolean;
    promotions: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: PushSubscriptionData = await request.json();
    
    if (!body.subscription) {
      return NextResponse.json(
        { error: 'Subscription data is required' },
        { status: 400 }
      );
    }

    // Validate VAPID configuration
    if (!vapidConfig.publicKey || !vapidConfig.privateKey) {
      console.error('VAPID keys not configured');
      return NextResponse.json(
        { error: 'Push notifications not configured' },
        { status: 500 }
      );
    }

    // Convert to web-push compatible format
    const webPushSubscription = convertPushSubscription(body.subscription);
    
    // Store subscription in database (implement based on your DB)
    const subscriptionData = {
      id: generateSubscriptionId(body.subscription),
      endpoint: webPushSubscription.endpoint,
      keys: webPushSubscription.keys,
      userAgent: body.userAgent || '',
      createdAt: new Date().toISOString(),
      isActive: true,
      preferences: body.preferences || {
        bookingUpdates: true,
        priceAlerts: true,
        travelTips: false,
        promotions: false
      }
    };

    // Save to your database (replace with your actual DB logic)
    await saveSubscriptionToDatabase(subscriptionData);

    // Send welcome notification
    try {
      await sendWelcomeNotification(body.subscription);
    } catch (error) {
      console.error('Failed to send welcome notification:', error);
      // Don't fail the subscription if welcome notification fails
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Successfully subscribed to push notifications',
        subscriptionId: subscriptionData.id
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Push subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required for unsubscribe' },
        { status: 400 }
      );
    }

    // Remove subscription from database
    await removeSubscriptionFromDatabase(endpoint);

    return NextResponse.json(
      { success: true, message: 'Successfully unsubscribed' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      );
    }

    // Check subscription status in database
    const subscription = await getSubscriptionFromDatabase(endpoint);
    
    return NextResponse.json({
      exists: !!subscription,
      active: subscription?.isActive || false,
      preferences: subscription?.preferences || {}
    });

  } catch (error) {
    console.error('Push subscription check error:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription' },
      { status: 500 }
    );
  }
}

/**
 * Send welcome notification to new subscriber
 */
async function sendWelcomeNotification(subscription: any): Promise<void> {
  const payload = JSON.stringify({
    title: '✈️ Welcome to Fly2Any!',
    body: 'You\'ll now receive updates about your bookings and exclusive Brazil travel deals.',
    icon: '/apple-touch-icon.png',
    badge: '/favicon-32x32.png',
    tag: 'welcome',
    requireInteraction: false,
    data: {
      type: 'welcome',
      url: '/',
      timestamp: new Date().toISOString()
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore Deals',
        icon: '/favicon-32x32.png'
      }
    ]
  });

  const webPushSubscription = convertPushSubscription(subscription);
  await webpush.sendNotification(webPushSubscription, payload);
}

/**
 * Generate unique subscription ID
 */
function generateSubscriptionId(subscription: any): string {
  // Create hash based on endpoint and keys
  const data = `${subscription.endpoint}${JSON.stringify(subscription.keys || {})}`;
  
  // Simple hash function (in production, use a proper crypto hash)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `sub_${Math.abs(hash)}_${Date.now()}`;
}

/**
 * Database operations (implement based on your database)
 * These are placeholder functions - replace with your actual database logic
 */

async function saveSubscriptionToDatabase(subscriptionData: any): Promise<void> {
  // Example using localStorage (for demo - use proper DB in production)
  if (typeof localStorage !== 'undefined') {
    const existingSubscriptions = JSON.parse(
      localStorage.getItem('push_subscriptions') || '[]'
    );
    
    // Check if subscription already exists
    const existingIndex = existingSubscriptions.findIndex(
      (sub: any) => sub.endpoint === subscriptionData.endpoint
    );
    
    if (existingIndex >= 0) {
      existingSubscriptions[existingIndex] = subscriptionData;
    } else {
      existingSubscriptions.push(subscriptionData);
    }
    
    localStorage.setItem('push_subscriptions', JSON.stringify(existingSubscriptions));
  }
  
  // In production, save to your database:
  /*
  await prisma.pushSubscription.upsert({
    where: { endpoint: subscriptionData.endpoint },
    update: subscriptionData,
    create: subscriptionData
  });
  */
  
  console.log('Subscription saved:', subscriptionData.id);
}

async function removeSubscriptionFromDatabase(endpoint: string): Promise<void> {
  // Example using localStorage (for demo - use proper DB in production)
  if (typeof localStorage !== 'undefined') {
    const existingSubscriptions = JSON.parse(
      localStorage.getItem('push_subscriptions') || '[]'
    );
    
    const filteredSubscriptions = existingSubscriptions.filter(
      (sub: any) => sub.endpoint !== endpoint
    );
    
    localStorage.setItem('push_subscriptions', JSON.stringify(filteredSubscriptions));
  }
  
  // In production, remove from your database:
  /*
  await prisma.pushSubscription.delete({
    where: { endpoint }
  });
  */
  
  console.log('Subscription removed:', endpoint);
}

async function getSubscriptionFromDatabase(endpoint: string): Promise<any> {
  // Example using localStorage (for demo - use proper DB in production)
  if (typeof localStorage !== 'undefined') {
    const existingSubscriptions = JSON.parse(
      localStorage.getItem('push_subscriptions') || '[]'
    );
    
    return existingSubscriptions.find((sub: any) => sub.endpoint === endpoint);
  }
  
  // In production, query your database:
  /*
  return await prisma.pushSubscription.findUnique({
    where: { endpoint }
  });
  */
  
  return null;
}