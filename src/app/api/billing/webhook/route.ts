import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Signature missing' }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn('RAZORPAY_WEBHOOK_SECRET is not configured on the server. Webhook verification skipped but logged.');
    } else {
      // Validate signature
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.error('Razorpay Webhook signature verification failed.');
        return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    console.log(`[Razorpay Webhook Event Received]: ${payload.event}`, {
      id: payload.id,
      created_at: payload.created_at,
    });

    // Webhook mutations are deferred for future implementation.
    // We will not modify the database or bypass RLS here.
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Exception in webhook endpoint:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
