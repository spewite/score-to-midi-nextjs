"use client"

import { FileUpload } from "@/components/FileUpload"
import { Button } from "@/components/ui/button"
import { Music } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import Link from "next/link"
import { useState } from "react"
import { ConversionSection } from "@/components/ConversionSection"
import { toast } from 'sonner';

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [midiUrl, setMidiUrl] = useState<string | null>(null)
  const [isConverting, setIsConverting] = useState(false)

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
      <main className="flex-grow bg-[#131313]">
        <section className="container mx-auto px-4 py-8 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight sm:text-5xl text-center mb-8">
            Convert Music Scores to MIDI
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-prose mx-auto text-center mb-12">
            Transform your sheet music into playable MIDI files with ease. Just upload your score and let us do the
            rest.
          </p>
          {!midiUrl && <FileUpload onFileUpload={setUploadedFile} isConverting={isConverting} /> }
          {uploadedFile &&  (
            <ConversionSection 
              midiUrl={midiUrl}
              setMidiUrl={setMidiUrl}
              file={uploadedFile}
              isConverting={isConverting}
              setIsConverting={setIsConverting}
          />)}
        </section>
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © 2025 score-to-midi. All rights reserved.
      </footer>
    </div>
  )
}

