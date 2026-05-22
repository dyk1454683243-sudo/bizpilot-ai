import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    // 1. Authenticate user using Authorization header token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Create a request-specific client with the user's token so RLS is active
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Verify token validity by fetching user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token session' }, { status: 401 });
    }

    // 2. Parse and validate verify request payload
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planName } = await req.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planName) {
      return NextResponse.json({ error: 'Missing payment details for verification' }, { status: 400 });
    }

    // 3. Verify Razorpay Payment Signature
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Server configuration error: Razorpay secret missing' }, { status: 500 });
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.warn(`Payment signature mismatch. Expected: ${generatedSignature}, Received: ${razorpay_signature}`);
      return NextResponse.json({ error: 'Payment signature verification failed' }, { status: 400 });
    }

    // 4. Update the order status in payment_orders (respecting RLS)
    const { error: orderError } = await supabase
      .from('payment_orders')
      .update({ status: 'paid' })
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('user_id', user.id);

    if (orderError) {
      console.error('Error updating order status in DB:', orderError);
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
    }

    // Calculate billing period boundaries (+30 days)
    const periodStart = new Date().toISOString();
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30);

    // 5. Upsert subscription record (respecting RLS)
    const { error: subError } = await supabase
      .from('subscriptions')
      .upsert(
        {
          user_id: user.id,
          plan_name: planName,
          status: 'active',
          current_period_start: periodStart,
          current_period_end: periodEnd.toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (subError) {
      console.error('Error upserting subscription record in DB:', subError);
      return NextResponse.json({ error: 'Failed to update user subscription' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Exception in verify endpoint:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
