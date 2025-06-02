import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);

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
      const { data: purchase, error } = await supabase
        .from('one_time_purchases')
        .select('*')
        .eq('stripe_payment_id', payment_intent)
        .single();
      if (error) {
        console.error('[Session API] Error fetching purchase:', error);
      }
      if (!purchase) {
        console.warn('[Session API] No purchase found for payment_intent:', payment_intent);
      } else {
        console.log('[Session API] Purchase found:', purchase);
      }
      return NextResponse.json({
        type: 'onetime',
        purchaseConfirmed: !!purchase && !error,
        purchase,
        payment_intent,
        purchaseError: error,
      });
    } else if (type === 'subscription') {
      // Puedes añadir lógica para verificar la suscripción si quieres
      return NextResponse.json({
        type: 'subscription',
        subscriptionConfirmed: true,
        session,
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
