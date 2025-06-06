'use client';

import { FileUpload } from '@/components/FileUpload';
import { useEffect, useState } from 'react';
import { ConversionSection } from '@/components/ConversionSection';
import { useUser } from '@/hooks/useUser';

export default function Home() {
  const [midiUrl, setMidiUrl] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { user, loading } = useUser();

  useEffect(() => {
    // Log all public env variables
    console.log('NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
    console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    console.log('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

    // Log secrets (not recommended for production, but OK for staging as you said)
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY);
    console.log('STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET);
    console.log('STRIPE_SUBSCRIPTION_PRICE_ID:', process.env.STRIPE_SUBSCRIPTION_PRICE_ID);
    console.log('STRIPE_ONETIME_MIDI_PRICE_ID:', process.env.STRIPE_ONETIME_MIDI_PRICE_ID);
    console.log('CRON_SECRET:', process.env.CRON_SECRET);
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('User:', user, 'Loading:', loading);
    }
  }, [loading, user]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      
      <main className="flex justify-center items-center flex-grow site-background">
        <section className="container animate-fadeIn py-16 flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight sm:text-5xl text-center mb-8">
            Convert Music Scores to MIDI
          </h1>
          <h2 className="text-lg md:text-xl text-muted-foreground max-w-prose mx-auto text-center mb-12">
            Transform your sheet music into playable MIDI files with ease. Just upload your score and let us do the
            rest.
          </h2>
          {!midiUrl && (
            <FileUpload
              isConverting={isConverting}
              file={file}
              setFile={setFile}
            />)
          }
          {file && (
            <ConversionSection
              midiUrl={midiUrl}
              setMidiUrl={setMidiUrl}
              file={file}
              setFile={setFile}
              isConverting={isConverting}
              setIsConverting={setIsConverting}
              user={user}
            />)}

        </section>
      </main>
    </div>
  );
}

