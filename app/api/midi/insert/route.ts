import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  console.log("Request received at /api/midi/insert");
  const { id, midi_url, user_id } = await req.json();
  console.log("id: ", id);
  console.log("midi_url: ", midi_url);
  console.log("user_id: ", user_id);
  const { error } = await supabaseAdmin
    .from('midi_files')
    .insert({
      id,
      midi_url,
      created_at: new Date().toISOString(),
      user_id: user_id || null,
    });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
