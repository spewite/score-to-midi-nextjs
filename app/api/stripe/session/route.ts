import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const session_id = searchParams.get('session_id');

  if (!session_id) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    // console.log('[Session API] Full Stripe session:', JSON.stringify(session, null, 2));
    const type = session.metadata?.type;
    if (type === 'onetime') {
      const payment_intent = session.payment_intent;
      console.log('[Session API] Looking up one_time_purchases for payment_intent:', payment_intent);
      const { data: purchase, error } = await supabaseAdmin
        .from('one_time_purchases')
        .select('*')
        .eq('stripe_payment_id', payment_intent)
        .single();
      if (error) {
        console.error('[Session API] Error fetching purchase:', error);
      }
      if (!purchase) {
        console.warn('[Session API] No purchase found for payment_intent:', payment_intent);
      }
      return NextResponse.json({
        type: 'onetime',
        purchaseConfirmed: !!purchase && !error,
        purchase,
        payment_intent,
        purchaseError: error,
      });
    } else if (type === 'subscription') {

      // Get the Stripe subscription ID from the session object
      const stripe_subscription_id = session.subscription;

      // Query Supabase for the subscription record
      const { data: subscription, error } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('stripe_subscription_id', stripe_subscription_id)
        .single();

      if (error) {
        console.error('[Session API] Error fetching subscription:', error);
      }
      if (!subscription) {
        console.warn('[Session API] No subscription found for stripe_subscription_id:', stripe_subscription_id);
      }

      return NextResponse.json({
        type: 'subscription',
        subscriptionConfirmed: !!subscription && !error,
        subscription,
        stripe_subscription_id,
        subscriptionError: error,
      });

    } else {
      return NextResponse.json({
        type: 'unknown',
        error: 'Unknown payment type.',
      }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
