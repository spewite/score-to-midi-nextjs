import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import type { Subscription, User } from '../../../lib/types';

export async function GET(req: NextRequest) {
  // Crea el cliente Supabase para server components usando cookies
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log('userError:', userError);
      console.log('user:', user);

      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Consulta la suscripción en tu base de datos
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (subError && subError.code !== 'PGRST116') { // PGRST116: No rows found
      return NextResponse.json({ error: 'Failed to fetch subscription', details: subError.message }, { status: 500 });
    }

    // Puedes agregar más campos si tu User los tiene (ej: username, created_at)
    const userResponse: User = {
      id: user.id,
      username: user.user_metadata?.username || '',
      email: user.email || '',
      created_at: user.created_at,
      subscription: subscription || null,
    };

    return NextResponse.json(userResponse);
  } catch (err: any) {
    return NextResponse.json({ error: 'Unexpected server error', details: err?.message }, { status: 500 });
  }
}