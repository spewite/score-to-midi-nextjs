import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { file_uuid } = await req.json();

    if (!file_uuid) {
      return NextResponse.json({ success: false, error: 'Missing file UUID' }, { status: 400 });
    }

    // Confirm the purchase exists in profiles
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from('one_time_purchases')
      .select('id')
      .eq('midi_file_id', file_uuid)
      .single();

    if (purchaseError || !purchase) {
      return NextResponse.json({ success: false, error: 'Purchase not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
