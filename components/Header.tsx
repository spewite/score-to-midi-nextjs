'use client';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabaseClient';
import React from 'react';

import { Button } from '@/components/ui/button';
import LoginModal from './LoginModal';
import { useEffect } from 'react';

// Listen for username creation in other tabs and reload user state
function useUsernameSync() {
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'username_set') {
        // Reload user state or page
        // window.location.reload();
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);
}

import { useAuthFlow } from './AuthFlowContext';

export const Header: React.FC = () => {
  useUsernameSync();
  const { user, loading, error } = useUser();
  const {
    loginModalOpen,
    setLoginModalOpen,
    loginError,
    setLoginError,
    setUsernameModalOpen,
  } = useAuthFlow();

  // Detect login error from URL

  useEffect(() => {

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (
        params.get('error') === 'server_error' &&
        params.get('error_description')?.includes('Database error saving new user')
      ) {
        setLoginError('Error al iniciar sesión. Intenta de nuevo.');
        setLoginModalOpen(true);
      }
    }
  }, [setLoginError, setLoginModalOpen]);

  // Show username modal if user is signed up but has no username
  useEffect(() => {
    if (user && !user.username) {
      setUsernameModalOpen(true);
    } else {
      setUsernameModalOpen(false);
    }
  }, [setUsernameModalOpen, user]);

  // Show error if user is not registered (profile missing)
  useEffect(() => {
    if (error === 'Account not registered. Please create one.') {
      setLoginError(error);
      setLoginModalOpen(true);
    }
  }, [error, setLoginError, setLoginModalOpen]);



  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <header className="w-full flex items-center justify-between p-4 border-b border-zinc-800">
      <a
        href="/"
        className="flex items-center gap-2 group"
        aria-label="Go to homepage">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-music w-6 h-6 text-white group-hover:text-blue-400 transition-colors">
          <path d="M9 18V5l12-2v13"></path>
          <circle
            cx="6"
            cy="18"
            r="3"></circle>
          <circle
            cx="18"
            cy="16"
            r="3"></circle>
        </svg>
        <span className="text-xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">score-to-midi</span>
      </a>
      <div>
        {loading ? (
          <div className="flex items-center gap-2 text-zinc-400">
            <svg
              className="animate-spin h-5 w-5 mr-2 text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            Loading user...
          </div>
        ) : user ? (
          // Only allow access to the app if the user has a profile (username)
          user.username ? (
            <>
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="flex items-center gap-2 cursor-pointer select-none">
                    <span className="hidden sm:inline text-white font-medium">{user.username || user.email}</span>
                    <svg
                      className="w-4 h-4 text-zinc-400 group-hover:text-blue-400 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"><path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-2 w-44 bg-zinc-900 border border-zinc-700 rounded shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity z-20">
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-zinc-800 text-white"
                      onClick={() => window.location.href = '/my-scores'}
                    >
                      My Scores
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-zinc-800 text-red-300"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <></>
          )
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={() => setLoginModalOpen(true)}
              className="px-5 py-2 bg-zinc-900 border border-zinc-700 text-white font-semibold rounded-md shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
            >
              Access
            </Button>
            <LoginModal
              open={loginModalOpen}
              onOpenChange={setLoginModalOpen}
              error={loginError}
              onGoogle={() => {
                window.open('/auth-redirect', '_blank', 'noopener,noreferrer');
              }}
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
