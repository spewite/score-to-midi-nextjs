"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Download, Play, Pause, ArrowRight } from "lucide-react"
import { Midi } from "@tonejs/midi"
import * as Tone from "tone"
import { toast } from "sonner"
import posthog from "posthog-js"
import WaifuSuggestion from "./WaifuSuggestion"
import KofiFloatingWidget from "./KofiFloatingWidget" // Asegúrate que la ruta es correcta

interface ConversionSectionProps {
  file: File,
  setFile: (file: File | null) => void;
  midiUrl: string | null,
  setMidiUrl: (midiUrl: string | null) => void,
  isConverting: boolean,
  setIsConverting: (isConverting: boolean) => void;
  setShowKofiButton: (show: boolean) => void;
}

export function ConversionSection({
  file,
  setFile,
  midiUrl,
  setMidiUrl,
  isConverting,
  setIsConverting,
  setShowKofiButton,
}: ConversionSectionProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const synth = useRef<Tone.Sampler | null>(null)
  const midiPlayer = useRef<Tone.Part | null>(null)

  useEffect(() => {
    setError(null);
  }, [file]);

  useEffect(() => {
    synth.current = new Tone.Sampler({
      urls: {
        A0: "A0.mp3", C1: "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3", A1: "A1.mp3",
        C2: "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3", A2: "A2.mp3", C3: "C3.mp3",
        "D#3": "Ds3.mp3", "F#3": "Fs3.mp3", A3: "A3.mp3", C4: "C4.mp3", "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3", A4: "A4.mp3", C5: "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
        A5: "A5.mp3", C6: "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3", A6: "A6.mp3",
        C7: "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3", A7: "A7.mp3", C8: "C8.mp3",
      },
      release: 1,
      baseUrl: "https://tonejs.github.io/audio/salamander/",
    }).toDestination()

    return () => {
      if (synth.current) synth.current.dispose();
      if (midiPlayer.current) midiPlayer.current.dispose();
      Tone.Transport.stop();
      Tone.Transport.cancel();
    }
  }, [])

  useEffect(() => {
    if (midiUrl) {
      setShowKofiButton(false);
    } else {
      setShowKofiButton(true);
    }
  }, [midiUrl, setShowKofiButton]);

  const fileConversion = async () => {
    if (!file) {
        setError("No file selected for conversion.");
        setIsConverting(false); // Asegurarse de que no quede en estado de conversión
        throw new Error("No file selected for conversion."); // Lanzar error para toast.promise
    }
    posthog.capture('convertButtonClicked', { fileName: file.name });
    setIsConverting(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData?.error || "Conversion API error.");
      }
      const midiBlob = await response.blob();
      const newMidiUrl = URL.createObjectURL(midiBlob);
      setMidiUrl(newMidiUrl);
      //setIsConverting(false); // Se maneja en el 'finally' o en el success de toast.promise
    } catch (err: any) {
      setError(err.message || "An error occurred during conversion. Please try again.");
      setIsConverting(false); // Importante resetear aquí también
      throw err; // Re-throw para que toast.promise lo maneje
    }
    // El 'finally' aquí podría ser redundante si toast.promise siempre se ejecuta
    // setIsConverting(false); // Se maneja en success/error de toast.promise
  };

  const handleConversion = () => {
    if (!file) {
        toast.error("Please upload a file first!");
        return;
    }
    toast.promise(fileConversion(), {
      loading: "The conversion may take up to 2 minutes 🙌",
      success: () => {
        setIsConverting(false);
        return "The score has been converted successfully! 😎";
      },
      error: (err: any) => {
        setIsConverting(false);
        return err.message || "An error occurred during conversion 😬.";
      }
    });
  };

  const playMidi = async () => {
    if (!midiUrl || !synth.current) return;
    posthog.capture('playMidiClicked', { fileName: file?.name });
    await Tone.start();
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    Tone.Transport.cancel();
    try {
      const midi = await Midi.fromUrl(midiUrl);
      const offset = 0.5;
      const midiEvents = midi.tracks.flatMap((track) =>
        track.notes.map((note) => ({
          time: note.time + offset,
          note: note.name,
          duration: note.duration,
          velocity: note.velocity,
        }))
      );
      midiPlayer.current = new Tone.Part((time, event) => {
        synth.current?.triggerAttackRelease(event.note, event.duration, time, event.velocity);
      }, midiEvents).start(0);
      Tone.Transport.start();
      setIsPlaying(true);
    } catch (e) {
      console.error("Error playing MIDI:", e);
      toast.error("Could not play MIDI file.");
    }
  };

  const stopMidi = () => {
    posthog.capture('stopMidiClicked', { fileName: file?.name });
    Tone.Transport.stop();
    if (midiPlayer.current) {
      midiPlayer.current.stop();
      midiPlayer.current.dispose();
      midiPlayer.current = null;
    }
    Tone.Transport.cancel();
    synth.current?.releaseAll();
    setIsPlaying(false);
  };

  const handleConvertNext = () => {
    posthog.capture('convertNextClicked', { fileName: file?.name });
    stopMidi();
    setError(null);
    setIsPlaying(false);
    setMidiUrl(null);
    setFile(null);
    setShowKofiButton(true);
  };

  return (
    <>
      <div className="w-full mt-8 flex flex-col items-center px-2 sm:px-4">

        {!midiUrl && file && (
          <Button onClick={handleConversion} disabled={isConverting || !file} className="mb-4">
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

        {error && !midiUrl && (
          <p className="text-red-500 mt-2 mb-4 text-center">{error}</p>
        )}

        {midiUrl && (
          <>
            <div className="conversion-section-container w-full flex flex-col md:flex-row items-center md:items-start justify-center mt-8 md:space-x-8">
              <div
                className="w-full max-w-md lg:max-w-lg p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg border border-gray-700 card-background animate-fadeIn flex flex-col items-center mb-6 md:mb-0 flex-shrink-0"
              >
                <h3 className="text-2xl font-semibold mb-6 text-gray-100 text-center">
                  Your MIDI File is Ready!
                </h3>
                <div className="w-full flex flex-col gap-4 justify-center items-center">
                  <div className="w-full flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
                    <Button
                      asChild
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-900 to-blue-600 hover:from-blue-900 hover:to-blue-700 text-white transition-all ease-in-out duration-200"
                    >
                      <a
                        href={midiUrl}
                        download={file?.name.split('.')[0] + ".midi" || "converted_score.midi"}
                        onClick={() => {
                          posthog.capture('downloadClicked', { fileName: file?.name });
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
                  <div className="w-full flex justify-center mt-2">
                    <Button
                      className="w-full sm:w-auto bg-gradient-to-r transition ease-in-out duration-200"
                      variant={"outline"}
                      onClick={handleConvertNext}
                    >
                      <ArrowRight className="h-4 w-4" />
                      Convert Next
                    </Button>
                  </div>
                </div>
              </div>

              

            </div>
            <KofiFloatingWidget isVisible={!!midiUrl} />
          </>
        )}

        {error?.includes("Please, upload the image with higher quality.") && !midiUrl && (
          <div className="mt-5 w-full md:w-3/4 mx-auto">
            <WaifuSuggestion />
          </div>
        )}
      </div>
    </>
  );
}