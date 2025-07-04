import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const supabase = supabaseAdmin;

export async function POST(req: NextRequest) {
  console.log('[Webhook] Incoming Stripe webhook request');
  const buf = await req.arrayBuffer();
  const rawBody = Buffer.from(buf);
  const sig = req.headers.get('stripe-signature');
  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
    console.log('[Webhook] Event type:', event.type);
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      console.log('[Webhook] Session metadata:', session.metadata);
      const metadata = session.metadata || {};
      const type = metadata.type;

      if (type === 'subscription') {

        console.log('session.subscription:', session.subscription);

        // Defensive logging for missing metadata
        if (!metadata.user_id || !session.subscription || !session.customer) {
          console.error('[Webhook] Missing required subscription metadata:', {
            user_id: metadata.user_id,
            subscription_id: session.subscription,
            customer_id: session.customer,
            metadata,
            session
          });
          return NextResponse.json({ error: 'Missing required subscription metadata' }, { status: 400 });
        }

        // Update user in Supabase (activate subscription)
        const user_id = metadata.user_id;
        const subscription_id = session.subscription;
        const customer_id = session.customer;

        console.log('[Webhook] Subscription fields:', { user_id, subscription_id, customer_id });
        try {
          // Obtener la suscripción real de Stripe para usar current_period_end exacto
          const stripeSubscription = await stripe.subscriptions.retrieve(subscription_id, { expand: ['items'] });
          let periodEnd = (stripeSubscription as any).current_period_end;

          // Fallback: get from first subscription item if not at top level
          if (!periodEnd && stripeSubscription.items && stripeSubscription.items.data && stripeSubscription.items.data.length > 0) {
            periodEnd = stripeSubscription.items.data[0].current_period_end;
          }

          if (!periodEnd) {
            console.error('No current_period_end found in subscription or items:', stripeSubscription);
            return NextResponse.json({ error: 'No valid period end found' }, { status: 500 });
          }

          const { data: updateResult, error: updateError } = await supabase
            .from('subscriptions')
            .upsert({
              user_id,
              stripe_customer_id: customer_id,
              stripe_subscription_id: subscription_id,
              status: 'active',
              current_period_end: new Date(periodEnd * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' })
            .select();

          if (updateError) {
            console.error('[Webhook] Supabase update error:', updateError);
          } else if (!updateResult || updateResult.length === 0) {
            console.warn('[Webhook] No subscription row updated for user:', user_id);
          } else {
            console.log('[Webhook] Subscription updated for user:', user_id, updateResult);
          }
        } catch (err) {
          console.error('[Webhook] Exception during Supabase update:', err);
        }

      } else if (type === 'onetime') {

        const user_id = metadata.user_id;
        const file_uuid = metadata.file_uuid;
        const stripe_payment_id = session.payment_intent || null;

        // Look up midi_file_id from file_uuid
        const { data: midiFile, error: midiFileError } = await supabase
          .from('midi_files')
          .select('id')
          .eq('id', file_uuid)
          .single();

        if (!midiFile || midiFileError) {
          console.error('MIDI file not found for file_uuid:', file_uuid, midiFileError);
          return NextResponse.json({ error: 'MIDI file not found' }, { status: 404 });
        }

        // Insert one-time purchase record
        const { data: purchase, error: purchaseError } = await supabase
          .from('one_time_purchases')
          .upsert({
            user_id: user_id,
            midi_file_id: midiFile.id,
            stripe_payment_id,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (purchaseError) {
          console.error('[Webhook] Failed to insert purchase:', purchaseError);
          return NextResponse.json({ error: 'Failed to insert purchase' }, { status: 500 });
        }
        console.log('[Webhook] One-time purchase recorded:', purchase);

      }
    }

    // Handler for invoice.payment_succeeded
    if (event && event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as any;
      // Solo continuar si hay una suscripción asociada
      if (invoice.subscription) {
        // Obtener la suscripción actualizada desde Stripe
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        // current_period_end está en segundos
        const periodEnd = (subscription as any).current_period_end;
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status === 'active' ? 'active' : 'inactive',
            current_period_end: new Date(periodEnd * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
        console.log('[Webhook] Subscription renewed and updated in Supabase:', subscription.id);
      } else {
        console.log('[Webhook] invoice.payment_succeeded without subscription, ignoring.');
      }
      return NextResponse.json({ received: true });
    } 
    console.log('[Webhook] Processing completed successfully');
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error processing Stripe webhook:', error);
    return NextResponse.json({ error: 'Error processing Stripe webhook', details: (error as any).message }, { status: 500 });
  }
}

