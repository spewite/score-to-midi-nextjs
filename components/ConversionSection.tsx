'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthFlow } from './AuthFlowContext';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Play, Pause, ArrowRight } from 'lucide-react';
import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';
import { toast } from 'sonner';
import posthog from 'posthog-js';
import WaifuSuggestion from './WaifuSuggestion';
import DownloadModal from './DownloadModal';
import { User } from '../lib/types';
interface ConversionSectionProps {
  file: File,
  setFile: (file: File | null) => void;
  midiUrl: string | null,
  setMidiUrl: (midiUrl: string | null) => void,
  isConverting: boolean,
  setIsConverting: (isConverting: boolean) => void;
  user: User | null;
}

export function ConversionSection({ file, setFile, midiUrl, setMidiUrl, isConverting, setIsConverting , user }: ConversionSectionProps) {
  const {
    setLoginModalOpen,
    subscribeIntent,
    setSubscribeIntent,
  } = useAuthFlow();
 
  // State and refs
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [fileUuid, setFileUuid] = useState<string | null>(null);
  const [oneTimePurchased] = useState(false);
  const synth = useRef<Tone.Sampler | null>(null);
  const midiPlayer = useRef<Tone.Part | null>(null);

  // Download permission state
  const [canDownload, setCanDownload] = useState((!!user && user.subscription?.status === 'active') || oneTimePurchased);

  useEffect(() => {
    // When the uploaded file changes remove the error.
    setError(null);
  }, [file]);

  useEffect(() => {
    synth.current = new Tone.Sampler({
      urls: {
        A0: 'A0.mp3',
        C1: 'C1.mp3',
        'D#1': 'Ds1.mp3',
        'F#1': 'Fs1.mp3',
        A1: 'A1.mp3',
        C2: 'C2.mp3',
        'D#2': 'Ds2.mp3',
        'F#2': 'Fs2.mp3',
        A2: 'A2.mp3',
        C3: 'C3.mp3',
        'D#3': 'Ds3.mp3',
        'F#3': 'Fs3.mp3',
        A3: 'A3.mp3',
        C4: 'C4.mp3',
        'D#4': 'Ds4.mp3',
        'F#4': 'Fs4.mp3',
        A4: 'A4.mp3',
        C5: 'C5.mp3',
        'D#5': 'Ds5.mp3',
        'F#5': 'Fs5.mp3',
        A5: 'A5.mp3',
        C6: 'C6.mp3',
        'D#6': 'Ds6.mp3',
        'F#6': 'Fs6.mp3',
        A6: 'A6.mp3',
        C7: 'C7.mp3',
        'D#7': 'Ds7.mp3',
        'F#7': 'Fs7.mp3',
        A7: 'A7.mp3',
        C8: 'C8.mp3',
      },
      release: 1,
      baseUrl: 'https://tonejs.github.io/audio/salamander/',
    }).toDestination();

    return () => {
      if (synth.current) {
        synth.current.dispose();
      }
      if (midiPlayer.current) {
        midiPlayer.current.dispose();
      }
    };
  }, []);

  // Handles file conversion and sets all required state from backend JSON
  const fileConversion = async () => {
    posthog.capture('convertButtonClicked', { fileName: file.name });
    setIsConverting(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      // Handle error
      if (!response.ok) {
        const responseData = await response.json();
        if (responseData?.error) {
          throw new Error(responseData?.error);
        }
        throw new Error('An error occurred during conversion. Please try again.');
      }
      // Parse JSON response
      const data = await response.json();
      if (!data.midi_url || !data.file_uuid) {
        throw new Error('Invalid response from server. Please try again.');
      }
      setMidiUrl(data.midi_url);
      setFileUuid(data.file_uuid);

      // Insertar registro en Supabase vía Next.js
      try {
        await fetch('/api/midi/insert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.file_uuid,
            score_url: data.score_url,
            midi_url: data.midi_url,
            user_id: user?.id || null,
            filename: file.name,
          }),
        });
      } catch {
        // Si falla el insert, mostrar error pero no bloquear el flujo principal
        setError('Error saving MIDI metadata. The MIDI was generated, but could not be saved.');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'An error occurred during conversion. Please try again.');
      }
      throw err;
    } finally {
      setIsConverting(false);
    }
  };

  const handleConversion = () => {
    toast.promise(fileConversion(), {
      loading: 'The conversion may take up to 2 minute 🙌',
      success: 'The score has been converted successfully! 😎',
      error: 'An error occurred during conversion 😬.'
    });
  };

  const playMidi = async () => {

    posthog.capture('playMidiClicked', { fileName: file.name });

    if (!midiUrl || !synth.current) return;

    // Reset the transport to ensure immediate playback
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    Tone.Transport.cancel();

    const midi = await Midi.fromUrl(midiUrl);
    const offset = 0.5; // schedule events to start 0.5s after transport starts

    const midiEvents = midi.tracks.flatMap((track) =>
      track.notes.map((note) => ({
        time: note.time + offset, // schedule relative to the transport start
        note: note.name,
        duration: note.duration,
        velocity: note.velocity,
      })));

    // Create a new Tone.Part and start it at time 0 of the transport timeline
    midiPlayer.current = new Tone.Part((time, event) => {
      synth.current?.triggerAttackRelease(event.note,
        event.duration,
        time,
        event.velocity);
    }, midiEvents).start(0);

    Tone.Transport.start();
    setIsPlaying(true);
  };

  const stopMidi = () => {

    posthog.capture('stopMidiClicked', { fileName: file.name });

    // Stop the transport and the midi part.
    Tone.Transport.stop();

    if (midiPlayer.current) {
      midiPlayer.current.stop();
      midiPlayer.current.dispose(); // Clean up the Tone.Part instance
      midiPlayer.current = null;
    }

    // Optionally clear all events from the Transport if needed.
    Tone.Transport.cancel();

    synth.current?.releaseAll();
    setIsPlaying(false);
  };

  const handleConvertNext = () => {
    posthog.capture('convertNextClicked', { fileName: file.name });
    setError(null);
    setIsPlaying(false);
    setMidiUrl(null);
    setFile(null);
  };

  // Handler for download button
  const handleDownloadClick = (e: React.MouseEvent) => {
    if (!canDownload) {
      e.preventDefault();
      setShowDownloadModal(true);
    } else {
      posthog.capture('downloadClicked', { fileName: file.name });
    }
  };

  // Handler for subscribe button in modal
  const handleSubscribe = async () => {
    setShowDownloadModal(false);
    if (!user) {
      setSubscribeIntent(true);
      setLoginModalOpen(true);
      return;
    }
    const res = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'subscription', user_id: user.id, file_uuid: fileUuid }),
    });
    const data = await res.json();
    if (data.url) {
      posthog.capture('subscribeClicked', { fileName: file.name });
      window.open(data.url, '_blank', 'noopener,noreferrer'); // Open Stripe in new tab/window
      pollForSubscription();
    }
  };

  // Effect: After login, if subscribeIntent is set, continue subscription flow
  useEffect(() => {
    if (user && subscribeIntent) {
      setSubscribeIntent(false); // clear intent
      handleSubscribe(); // will run with user present
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, subscribeIntent]);

  // Polls the backend for subscription status
  const pollForSubscription = () => {
    const interval = setInterval(async () => {
      const res = await fetch('/api/user');
      const data = await res.json();
      if (data.subscription?.status === 'active') {
        clearInterval(interval);
        toast.success('Subscription successful!');
        setCanDownload(true);
      }
    }, 3000); // Poll every 3 seconds
  };

  // Polls the backend for a one-time purchase
  const pollForOneTimePurchase = () => {
    const interval = setInterval(async () => {
      const res = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_uuid: fileUuid }),
      });
      const data = await res.json();
      if (data.success) {
        clearInterval(interval);
        toast.success('One-time purchase successful!');
        setCanDownload(true);
      }
    }, 3000); // Poll every 3 seconds
  };

  // Handler for one-time purchase button in modal
  const handleOneTime = async () => {
    setShowDownloadModal(false);
    if (!fileUuid) {
      setError('Missing file UUID for payment. Please try converting again.');
      return;
    }
    // Call backend to create Stripe one-time session
    const body: any = { type: 'onetime', file_uuid: fileUuid, user_id: user?.id };
    if (user && user.email) {
      body.email = user.email;
    }
    const res = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.url) {
      window.open(data.url, '_blank', 'noopener,noreferrer');
      posthog.capture('oneTimePurchaseClicked', { fileName: file.name });
      pollForOneTimePurchase();
    }
  };

  return (
    <>
      <div className="w-full mt-8 flex flex-col items-center">
        {!midiUrl && (
          <Button
            onClick={handleConversion}
            disabled={isConverting}>
            {isConverting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              'Convert to MIDI'
            )}
          </Button>
        )}

        {error && <p className="text-red-500 mt-4">{error}</p>}

        {midiUrl && (
          <div
            className="w-full md:w-1/2 mt-8 p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg border border-gray-700 card-background animate-fadeIn"
          >
            <h3 className="text-2xl font-semibold mb-4 text-gray-100 text-center">
              Your MIDI File is Ready!
            </h3>
            <div className="w-full flex flex-col gap-4 justify-center items-center">
              <div className="w-full flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
                <Button
                  asChild
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-900 to-blue-600 hover:from-blue-900 hover:to-blue-700 text-white transition-all ease-in-out duration-200"
                >
                  <a
                    href={canDownload ? midiUrl : '#'}
                    download={file.name.split('.')[0] + '.midi' || 'converted_score.midi'}
                    onClick={handleDownloadClick}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download MIDI
                  </a>
                </Button>
                <Button
                  onClick={isPlaying ? stopMidi : playMidi}
                  className={`w-full sm:w-auto bg-gradient-to-r ${!isPlaying ? 'from-green-600 to-green-900 hover:from-green-700 hover:to-green-800' : 'from-red-700 to-red-900 hover:from-red-800 hover:to-red-900'} text-white transition-all ease-in-out duration-200`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Stop Playback
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Play MIDI
                    </>
                  )}
                </Button>
              </div>
              <div className="w-full flex justify-center">
                <Button
                  className="w-full sm:w-auto bg-gradient-to-r transition ease-in-out duration-200"
                  variant={'outline'}
                  onClick={handleConvertNext}
                >
                  <ArrowRight className="h-4 w-4" />
                  Convert Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Download Modal for payment options */}
      <DownloadModal
        open={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onSubscribe={handleSubscribe}
        onOneTime={handleOneTime}
      />

      {error?.includes('Please, upload the image with higher quality.') && (
        <WaifuSuggestion />
      )}
    </>
  );
}

