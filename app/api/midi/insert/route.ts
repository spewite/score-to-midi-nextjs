import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  const { id, midi_url, user_id, filename } = await req.json();
  const { error } = await supabaseAdmin
    .from('midi_files')
    .insert({
      id,
      user_id: user_id || null,
      midi_url,
      file_name: filename,
      created_at: new Date().toISOString(),
    });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
