import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { session_id } = await req.json();
    if (!session_id) {
      return NextResponse.json({ success: false, error: 'Missing session_id' }, { status: 400 });
    }

    // Fetch session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription', 'customer'],
    });

    const stripeCustomerId = session.customer as string;
    const stripeSubscriptionId = (session.subscription as Stripe.Subscription)?.id;
    const status = (session.subscription as Stripe.Subscription)?.status;
    const userId = session.metadata?.user_id;

    // DEBUG: Log the user_id from metadata
    console.log('[DEBUG] userId from Stripe session metadata:', userId);

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID not found in Stripe metadata' }, { status: 400 });
    }

    // Confirm the user exists in profiles
    const { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // 1. Check for any existing active subscription for this user (regardless of stripe_subscription_id)
    const { data: activeSub, error: activeSubError } = await supabaseAdmin
      .from('subscriptions')
      .select('id, status, stripe_subscription_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (activeSubError) {
      return NextResponse.json({ success: false, error: activeSubError.message }, { status: 500 });
    }

    // 2. If an active subscription exists for this user with a different Stripe subscription, prevent duplicate
    if (activeSub && activeSub.stripe_subscription_id !== stripeSubscriptionId) {
      return NextResponse.json({ success: false, error: 'You already have an active subscription.' }, { status: 400 });
    }

    // 3. Upsert subscription (insert or update if user_id+stripe_subscription_id already exists)
    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        status: status === 'active' ? 'active' : 'inactive',
        current_period_end: (session.subscription as any)?.current_period_end
          ? new Date((session.subscription as any).current_period_end * 1000).toISOString()
          : null,
        created_at: new Date().toISOString(),
      }, { onConflict: 'user_id,stripe_subscription_id' });

    if (subError) {
      return NextResponse.json({ success: false, error: subError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
