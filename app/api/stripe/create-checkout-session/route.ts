import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SUBSCRIPTION_PRICE_ID = process.env.STRIPE_SUBSCRIPTION_PRICE_ID!;
const ONETIME_MIDI_PRICE_ID = process.env.STRIPE_ONETIME_MIDI_PRICE_ID!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function POST(req: NextRequest) {
  try {
    const { type, file_uuid, user_id } = await req.json();
    let session;

    // Fetch user profile from 'profiles' table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('id', user_id)
      .single();

    if (type === 'subscription') {
      if (!user_id) {
        return NextResponse.json({ error: 'user_id required for subscription' }, { status: 400 });
      }
      
      if (profileError || !profile) {
        console.log(profileError);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      // Fetch latest subscription for Stripe customer ID
      const { data: subscription } = await supabaseAdmin
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      const stripeCustomerId = subscription?.stripe_customer_id || undefined;
      session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer: stripeCustomerId,
        customer_email: profile.email,
        line_items: [
          {
            price: SUBSCRIPTION_PRICE_ID,
            quantity: 1,
          },
        ],
        success_url: `${APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${APP_URL}/payment/cancel`,
        metadata: {
          user_id: profile.id,
          type: 'subscription',
        },
      });
    } else if (type === 'onetime') {
      if (!file_uuid) {
        return NextResponse.json({ error: 'file_uuid required for one-time purchase' }, { status: 400 });
      }
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price: ONETIME_MIDI_PRICE_ID,
            quantity: 1,
          },
        ],
        success_url: `${APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${APP_URL}/payment/cancel`,
        metadata: {
          file_uuid,
          user_id: profile?.id,
          type: 'onetime',
        },
      });
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe Checkout error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
