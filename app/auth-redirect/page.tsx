'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AuthRedirect() {
  useEffect(() => {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: (process.env.NEXT_PUBLIC_APP_URL || 'https://score-to-midi.com/') + '/set-username',
      },
    });
  }, []);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <span>Redirecting to Google sign-in...</span>
    </div>
  );
}
