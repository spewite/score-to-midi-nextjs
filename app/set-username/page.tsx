'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SetUsername() {
  const [username, setUsername] = useState('');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUserAndProfile = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', data.user.id)
          .single();
        setProfile(profileData);
      }
      setLoading(false);
    };
    getUserAndProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username) {
      setError('Username required');
      return;
    }
    const { error } = await supabase
      .from('profiles')
      .update({ username })
      .eq('id', user.id);
    if (error) {
      setError('Could not save username.');
    } else {
      // Notifica a otras pestañas que el username ha sido creado
      if (typeof window !== 'undefined') {
        localStorage.setItem('username_set', Date.now().toString());
      }
      window.close(); // Cierra la pestaña
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#18181b] text-white">Loading...</div>;
  if (!user) return <div className="flex h-screen items-center justify-center bg-[#18181b] text-white">Not authenticated</div>;

  // If profile exists and username is set, show welcome message and close button
  if (profile && profile.username) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#18181b]">
        <div className="bg-[#131315] border border-zinc-800 rounded-lg p-8 w-full max-w-md text-white flex flex-col items-center gap-6">
          <div className="text-2xl font-bold">Welcome back!</div>
          <div className="text-zinc-400 text-center">You are already registered as <span className="font-semibold text-white">{profile.username}</span>.</div>
          <button
            className="bg-blue-600 text-white py-2 px-8 rounded hover:bg-blue-700 transition font-semibold mt-4"
            onClick={() => window.close()}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Otherwise, show the username form
  return (
    <div className="flex h-screen items-center justify-center bg-[#18181b]">
      <div className="bg-[#131315] border border-zinc-800 rounded-lg p-8 w-full max-w-md text-white">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Choose your username</h1>
          <p className="text-zinc-400">Set a username to complete your registration.</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4">
          <input
            className="p-3 rounded bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold"
          >
            Save & Close
          </button>
          {error && (
            <div className="bg-red-900 text-red-300 rounded p-2 text-center text-sm border border-red-700">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
