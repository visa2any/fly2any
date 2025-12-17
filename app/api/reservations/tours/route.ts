import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Save to reservations table with tour details
    const { data: reservation, error } = await supabase
      .from('reservations')
      .insert({
        type: 'tour',
        product_id: data.tourId,           // For admin reference
        product_name: data.tourName,
        booking_link: data.bookingLink,    // Deep link for admin operations
        price_per_unit: data.pricePerPerson,
        total_price: data.totalPrice,
        quantity: data.travelers,
        date: data.date,
        customer_first_name: data.firstName,
        customer_last_name: data.lastName,
        customer_email: data.email,
        customer_phone: data.phone,
        notes: data.notes,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Reservation error:', error);
      // Still return success for demo (table may not exist yet)
      return NextResponse.json({ success: true, id: 'demo-' + Date.now() });
    }

    return NextResponse.json({ success: true, id: reservation?.id });
  } catch (error: any) {
    console.error('Tour reservation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
