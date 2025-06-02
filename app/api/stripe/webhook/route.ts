import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const supabase = supabaseAdmin;

export async function POST(req: NextRequest) {
  console.log('[Webhook] Incoming Stripe webhook request');
  const buf = await req.arrayBuffer();
  const rawBody = Buffer.from(buf);
  const sig = req.headers.get('stripe-signature');
  console.log('[Webhook] Stripe signature:', sig);
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
        // Update user in Supabase (activate subscription)
        const user_id = metadata.user_id;
        const subscription_id = session.subscription;
        const customer_id = session.customer;
        await supabase
          .from('users')
          .update({
            subscription_status: 'active',
            subscription_id,
            stripe_customer_id: customer_id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user_id);
        console.log('[Webhook] Subscription updated for user:', user_id);
      } else if (type === 'onetime') {
        console.log("metadata")
        console.log(metadata)
        const user_id = metadata.user_id;
        const file_uuid = metadata.file_uuid;
        const session_id = session.id;
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
          .insert({
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
    console.log('[Webhook] Processing completed successfully');
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error processing Stripe webhook:', error);
    return NextResponse.json({ error: 'Error processing Stripe webhook', details: (error as any).message }, { status: 500 });
  }
}
