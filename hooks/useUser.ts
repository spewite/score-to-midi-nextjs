import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '../lib/types';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchUser() {
      setLoading(true);
      setError(null);
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      // If there is no authenticated user, do not make further requests
      if (!authUser) {
        if (mounted) {
          setUser(null);
          setLoading(false);
          setError(null); // No error, user is simply not logged in
        }
        return;
      }

      // If there is a session error, you can show an error if you want, but it is not necessary after logout
      if (authError && authError.message?.toLowerCase().includes('session')) {
        if (mounted) {
          setUser(null);
          setLoading(false);
          setError(null); // Detect login error from URL logout
        }
        return;
      }
      
      // 1. Read user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, username, created_at')
        .eq('id', authUser.id)
        .single();

      // 2. Read active subscription (if exists)
      let subscription = null;
      if (profile) {
        const { data: sub, error: subError } = await supabase
          .from('subscriptions')
          .select('id, user_id, stripe_customer_id, stripe_subscription_id, status, current_period_end, updated_at')
          .eq('user_id', authUser.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (sub) {
          subscription = {
            id: sub.id,
            user_id: sub.user_id,
            stripe_customer_id: sub.stripe_customer_id,
            stripe_subscription_id: sub.stripe_subscription_id,
            status: sub.status,
            current_period_end: sub.current_period_end,
            updated_at: sub.updated_at,
          };
        }
      }

      if (mounted) {
        if (profile) {
          setUser({
            id: profile.id,
            username: profile.username, // do not default to ''
            email: profile.email,
            created_at: profile.created_at,
            subscription: subscription,
          });
        } else {
          setUser(null);
          setError('Account not registered. Please sign up.');
        }
        setLoading(false);
      }
    }

    fetchUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, _session) => {
      fetchUser();
    });
    
    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
    
  }, []);

  return { user, loading, error };
}

