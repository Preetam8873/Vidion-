import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import CurshifyCursor from '@/components/curshify-cursor'
import FluidCursor from '@/components/fluid-cursor'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Spectre Hub",
  description: "A modern video-streaming platform",
  generator: "v0.dev",
  icons: {
    icon: [
      {
        url: "https://i.postimg.cc/gjNkMv4W/256.png",
        sizes: "any",
      },
      {
        url: "https://i.postimg.cc/761Lzv2b/32px.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "https://i.postimg.cc/gjNkMv4W/256.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
    apple: [
      {
        url: "https://i.postimg.cc/pTMTyVyg/15px.png",
        sizes: "180x180",
      },
    ],
  },
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://i.postimg.cc" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={inter.className}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="dark" 
          enableSystem={false} 
          storageKey="theme"
        >
          <div className="animate-reveal min-h-screen">
            {children}
          </div>
          <CurshifyCursor />
          <FluidCursor />
          {/* Old cursor components are commented out */}
          {/* <CustomCursor /> */}
        </ThemeProvider>
      </body>
    </html>
  )
}

import './globals.css'