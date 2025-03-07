"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Download, Play, Pause, ArrowRight } from "lucide-react"
import { Midi } from "@tonejs/midi"
import * as Tone from "tone"
import { toast } from "sonner"
import posthog from "posthog-js"

interface ConversionSectionProps { 
  file: File,
  setFile: (file: File | null) => void;
  midiUrl: string | null,
  setMidiUrl: (midiUrl: string | null) => void,
  isConverting: boolean,
  setIsConverting: (isConverting: boolean) => void;
}

export function ConversionSection({ file, setFile, midiUrl, setMidiUrl, isConverting, setIsConverting }: ConversionSectionProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const synth = useRef<Tone.Sampler | null>(null)
  const midiPlayer = useRef<Tone.Part | null>(null)

  useEffect(() => {
    // When the uploaded file changes remove the error.
    setError(null);
  }, [file]);

  useEffect(() => {
    synth.current = new Tone.Sampler({
      urls: {
        A0: "A0.mp3",
        C1: "C1.mp3",
        "D#1": "Ds1.mp3",
        "F#1": "Fs1.mp3",
        A1: "A1.mp3",
        C2: "C2.mp3",
        "D#2": "Ds2.mp3",
        "F#2": "Fs2.mp3",
        A2: "A2.mp3",
        C3: "C3.mp3",
        "D#3": "Ds3.mp3",
        "F#3": "Fs3.mp3",
        A3: "A3.mp3",
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
        C5: "C5.mp3",
        "D#5": "Ds5.mp3",
        "F#5": "Fs5.mp3",
        A5: "A5.mp3",
        C6: "C6.mp3",
        "D#6": "Ds6.mp3",
        "F#6": "Fs6.mp3",
        A6: "A6.mp3",
        C7: "C7.mp3",
        "D#7": "Ds7.mp3",
        "F#7": "Fs7.mp3",
        A7: "A7.mp3",
        C8: "C8.mp3",
      },
      release: 1,
      baseUrl: "https://tonejs.github.io/audio/salamander/",
    }).toDestination()

    return () => {
      if (synth.current) {
        synth.current.dispose()
      }
      if (midiPlayer.current) {
        midiPlayer.current.dispose()
      }
    }
  }, [])

  const fileConversion = async () => {

    posthog.capture('convertButtonClicked', { fileName: file.name });

    setIsConverting(true)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`, {
        method: "POST",
        body: formData,
      })

      // Handle error
      if (!response.ok) {

        const reponseData = await response.json();
        if (reponseData?.error) {
          throw new Error(reponseData?.error);
        }

        throw new Error("An error occurred during conversion. Please try again.")
      }

      // Handle success
      const midiBlob = await response.blob()
      const midiUrl = URL.createObjectURL(midiBlob)
      setMidiUrl(midiUrl)

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "An error occurred during conversion. Please try again.")
      }
      throw err;
    } finally {
      setIsConverting(false)
    }
  }

  const handleConversion = () => {
    toast.promise(fileConversion(), {
      loading: "The conversion may take up to 2 minute 🙌",
      success: "The score has been converted successfully! 😎",
      error: "An error occurred during conversion 😬."
    })
  }

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
      }))
    );
  
    // Create a new Tone.Part and start it at time 0 of the transport timeline
    midiPlayer.current = new Tone.Part((time, event) => {
      synth.current?.triggerAttackRelease(
        event.note,
        event.duration,
        time,
        event.velocity
      );
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
  }

  const handleConvertNext = () => {
    posthog.capture('convertNextClicked', { fileName: file.name });
    setError(null);
    setIsPlaying(false);
    setMidiUrl(null);
    setFile(null);
    setMidiUrl(null);
  }

  return (
    <div className="mt-8 flex flex-col items-center">
      {!midiUrl && (
        <Button onClick={handleConversion} disabled={isConverting}>
          {isConverting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Converting...
            </>
          ) : (
            "Convert to MIDI"
          )}
        </Button>
      )}
      
      {error && <p className="text-red-500 mt-4">{error}</p>}

      {midiUrl && (
        <div 
          className="w-1/2 mt-8 p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg border border-gray-700 card-background animate-fadeIn"
        >
          <h3 className="text-2xl font-semibold mb-4 text-gray-100 text-center">
            Your MIDI File is Ready!
          </h3>
          <div className="flex flex-col gap-4 justify-center items-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
              <Button 
                asChild 
                className="w-full sm:w-auto bg-gradient-to-r from-blue-900 to-blue-600 hover:from-blue-900 hover:to-blue-700 text-white transition-all ease-in-out duration-200"
              >
                <a 
                  href={midiUrl} 
                  download={file.name.split('.')[0] + ".midi" || "converted_score.midi"}
                  onClick={() => {
                    posthog.capture('downloadClicked', { fileName: file.name });
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download MIDI
                </a>
              </Button>
              <Button
                onClick={isPlaying ? stopMidi : playMidi}
                className={`w-full sm:w-auto bg-gradient-to-r ${!isPlaying ? "from-green-600 to-green-900 hover:from-green-700 hover:to-green-800" : "from-red-700 to-red-900 hover:from-red-800 hover:to-red-900"} text-white transition-all ease-in-out duration-200`}
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
                variant={"outline"}
                onClick={handleConvertNext}
              >
                <ArrowRight className="h-4 w-4"/>
                Convert Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

