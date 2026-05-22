import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';

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

    // 2. Parse and validate requested plan
    const { planName } = await req.json();
    if (!planName || (planName !== 'Pro' && planName !== 'Business')) {
      return NextResponse.json({ error: 'Invalid plan selection' }, { status: 400 });
    }

    // Compute plan amount in paise (Pro: ₹999 -> 99900 paise, Business: ₹2999 -> 299900 paise)
    const amount = planName === 'Pro' ? 999 * 100 : 2999 * 100;

    // 3. Initialize Razorpay and create order
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Server configuration error: Razorpay keys missing' }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}_${user.id.substring(0, 8)}`,
    });

    // 4. Save order record in payment_orders table (respecting RLS)
    const { error: dbError } = await supabase
      .from('payment_orders')
      .insert({
        user_id: user.id,
        razorpay_order_id: order.id,
        amount: amount / 100,
        currency: 'INR',
        status: 'created',
        plan_name: planName,
      });

    if (dbError) {
      console.error('Error logging payment order to database:', dbError);
      return NextResponse.json({ error: 'Failed to record payment order' }, { status: 500 });
    }

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Exception in create-order endpoint:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
