// app/page.tsx
"use client"

import { FileUpload } from "@/components/FileUpload"
import { Music } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { ConversionSection } from "@/components/ConversionSection"
import KofiButtonWidget from "@/components/KofiButtonWidget" // Import the Ko-fi button

export default function Home() {
  const [midiUrl, setMidiUrl] = useState<string | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  // State to control Ko-fi button visibility
  const [showKofiButton, setShowKofiButton] = useState(true);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <Link href="/" className="flex items-center space-x-2">
          <Music className="w-6 h-6" />
          <span className="text-xl font-bold">score-to-midi</span>
        </Link>
        {/* <nav className="flex items-center space-x-4">
          <ThemeToggle />
          <Button variant="ghost">Sign In</Button>
          <Button>Create Account</Button>
        </nav> */}
      </header>
      <main className="flex justify-center items-center flex-grow site-background relative">
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
              setShowKofiButton={setShowKofiButton}
            />)}

        </section>
        
        {showKofiButton && (
          <div className="absolute top-5 z-40 animate-fadeIn"> 
            <KofiButtonWidget />
          </div>
        )}
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © 2025 score-to-midi. All rights reserved.
      </footer>
    </div>
  )
}