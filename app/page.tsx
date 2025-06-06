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

