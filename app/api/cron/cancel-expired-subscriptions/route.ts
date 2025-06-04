import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Only allow requests with this secret header
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: NextRequest) {
  // Allow secret via header or query param
  const authHeader = req.headers.get('x-cron-secret');
  const { searchParams } = new URL(req.url);
  const secretParam = searchParams.get('secret');

  if (!CRON_SECRET || (authHeader !== CRON_SECRET && secretParam !== CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Mark expired subscriptions as inactive
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'inactive' })
    .lt('current_period_end', new Date().toISOString())
    .eq('status', 'active');

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
