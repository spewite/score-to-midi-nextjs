import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error or no user:', authError);
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { type, file_uuid } = body; // user_id from body is not used for security, we use the session user

    if (!type || (type === 'onetime' && !file_uuid)) {
      return NextResponse.json({ error: 'Missing type or file_uuid for onetime payment' }, { status: 400 });
    }

    // Fetch user's profile and existing Stripe customer ID from your database
    // This assumes you have a 'subscriptions' table that might store stripe_customer_id
    // or a 'profiles' table.
    let stripeCustomerId: string | undefined;

    // Attempt to get stripe_customer_id from the 'subscriptions' table first
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subscriptionError && subscriptionError.code !== 'PGRST116') { // PGRST116: 'single' row not found
        console.error('Error fetching subscription data:', subscriptionError);
        // Potentially handle this error, but for now, we can proceed and Stripe will create a customer
    }
    
    if (subscriptionData?.stripe_customer_id) {
        stripeCustomerId = subscriptionData.stripe_customer_id;
    }

    // If not found in subscriptions, you might check a 'profiles' table or let Stripe create one
    // For simplicity, if not found, Stripe will create a new customer using the email.

    let stripeSession;
    const successUrl = `${siteUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${siteUrl}/payment-cancelled`;

    if (type === 'subscription') {
      const subscriptionPriceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;
      if (!subscriptionPriceId) {
        console.error('STRIPE_SUBSCRIPTION_PRICE_ID is not set.');
        return NextResponse.json({ error: 'Server configuration error for subscriptions.' }, { status: 500 });
      }

      const checkoutSessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: subscriptionPriceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: user.id, // Your internal user ID
      };

      if (stripeCustomerId) {
        checkoutSessionParams.customer = stripeCustomerId;
      } else {
        checkoutSessionParams.customer_email = user.email;
        // Optionally, you can create the customer in Stripe first and then pass the ID
        // Or pass customer_creation: 'always_prompt' if you want Stripe to handle it explicitly
      }
      
      stripeSession = await stripe.checkout.sessions.create(checkoutSessionParams);

    } else if (type === 'onetime') {
      const oneTimePriceId = process.env.STRIPE_ONETIME_PRICE_ID;
      if (!oneTimePriceId) {
        console.error('STRIPE_ONETIME_PRICE_ID is not set.');
        return NextResponse.json({ error: 'Server configuration error for one-time payments.' }, { status: 500 });
      }

      stripeSession = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price: oneTimePriceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: user.id,
        metadata: {
          user_id: user.id,
          file_uuid: file_uuid,
        },
        // For one-time payments, Stripe usually creates a guest customer unless customer ID or email is provided
        customer_email: stripeCustomerId ? undefined : user.email, // Use existing customer if available, else new one with email
        customer: stripeCustomerId ? stripeCustomerId : undefined,
      });
    } else {
      return NextResponse.json({ error: 'Invalid payment type' }, { status: 400 });
    }

    if (stripeSession.url) {
      return NextResponse.json({ url: stripeSession.url });
    } else {
      console.error('Stripe session URL not found:', stripeSession);
      return NextResponse.json({ error: 'Could not create Stripe session' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error in /api/stripe/create-checkout-session:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
