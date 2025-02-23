import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "score-to-midi",
  description: "Convert music scores to MIDI files",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Toaster
          richColors
          position="top-center"
          theme="dark"
          closeButton
        />
        {children}
      </body>
    </html>
  )
}



import './globals.css'



import './globals.css'