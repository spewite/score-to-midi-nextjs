import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from 'sonner';
import { PostHogProvider } from "./providers";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Score to MIDI - Convert Music Scores to MIDI Files Fast",
  description: "Easily convert your PDF or image-based music scores into high-quality MIDI files. Try our fast, free conversion tool today!",
  keywords: "music score conversion, PDF to MIDI, image to MIDI, MIDI converter, score-to-midi",
  // Additional SEO metadata
  openGraph: {
    title: "Score to MIDI",
    description: "Convert your music scores to MIDI files with our fast and accurate tool.",
    url: "https://score-to-midi.com/",
    type: "website",
    images: [
      {
        url: "https://score-to-midi.com/open_graph.png",
        width: 1200,
        height: 630,
        alt: "Score to MIDI Preview",
      },
    ],
  },
  // twitter: {
  //   card: "summary_large_image",
  //   site: "@yourTwitterHandle",
  // },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark"> 
      <head>
        <Script id="structured-data" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Score to MIDI",
            "url": "https://score-to-midi.com/",
          })}
        </Script>
      </head>
      <body className={inter.className}>
        <Toaster
          richColors
          position="top-center"
          theme="dark"
          closeButton
        />
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}