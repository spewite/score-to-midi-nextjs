import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabaseClient';

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const buf = await req.arrayBuffer();
  const rawBody = Buffer.from(buf);
  const sig = req.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig!, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Procesar solo eventos relevantes
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const metadata = session.metadata || {};
    const type = metadata.type;

    if (type === 'subscription') {
      // Actualizar usuario en Supabase (activar suscripción)
      const user_id = metadata.user_id;
      const subscription_id = session.subscription;
      const customer_id = session.customer;
      await supabase.from('users').update({
        subscription_status: 'active',
        subscription_id,
        stripe_customer_id: customer_id,
        updated_at: new Date().toISOString(),
      }).eq('id', user_id);
      // (Opcional) puedes crear un registro en purchases si quieres trazabilidad
    } else if (type === 'onetime') {
      // Registrar compra one-time en purchases
      const file_uuid = metadata.file_uuid;
      const session_id = session.id;
      const amount = session.amount_total ? session.amount_total / 100 : null;
      const currency = session.currency;
      // Buscar midi_id por file_uuid
      const { data: midi, error: midiError } = await supabase
        .from('midi_files')
        .select('id')
        .eq('file_uuid', file_uuid)
        .single();
      if (!midi || midiError) {
        console.error('MIDI file not found for file_uuid:', file_uuid);
        return NextResponse.json({ error: 'MIDI not found' }, { status: 404 });
      }
      await supabase.from('purchases').insert({
        user_id: null, // anónimo
        midi_id: midi.id,
        stripe_session_id: session_id,
        type: 'onetime',
        created_at: new Date().toISOString(),
        amount,
        currency,
      });
    }
  }

  // Stripe exige 200 OK rápido
  return NextResponse.json({ received: true });
}
