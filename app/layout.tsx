import './globals.css'
import { MyContextProvider } from './context/MyContext';
import { Metadata } from 'next'
import { ServerPing } from '@/components/server-ping';
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
import { TooltipProvider } from '@/components/ui/tooltip'
import StyledComponentsRegistry from '@/lib/registry'

export const metadata: Metadata = {
  title: 'T.H.R.I.V.E Toolkit — Your Living Employment Training Platform',
  description: 'THRIVE Toolkit is a comprehensive platform designed to empower individuals in their career development journey. Our tools help users create personalized experience cards, track their progress, and make informed decisions about their professional growth.',
  metadataBase: new URL('https://tcard.vercel.app'), // Replace with your actual domain
  openGraph: {
    type: 'website',
    title: 'T.H.R.I.V.E Toolkit — Your Living Employment Training Platform',
    description: 'THRIVE Toolkit is a comprehensive platform designed to empower individuals in their career development journey. Our tools help users create personalized experience cards, track their progress, and make informed decisions about their professional growth.',
    url: 'https://tcard.vercel.app', // Replace with your actual domain
    siteName: 'T.H.R.I.V.E Toolkit',
    images: [
      {
        url: 'https://utfs.io/f/azdjmzDIYeboFIBF8JjnpiRV3etQA2DrCXGkUnaTSIWPvu5K', // Replace with your UploadThing image URL
        width: 1200,
        height: 630,
        alt: 'T.H.R.I.V.E Toolkit Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'T.H.R.I.V.E Toolkit — Your Living Employment Training Platform',
    description: 'THRIVE Toolkit is a comprehensive platform designed to empower individuals in their career development journey. Our tools help users create personalized experience cards, track their progress, and make informed decisions about their professional growth.',
    images: ['https://utfs.io/f/azdjmzDIYeboFIBF8JjnpiRV3etQA2DrCXGkUnaTSIWPvu5K'], // Replace with your UploadThing image URL
    creator: '@yourtwitterhandle', // Optional: Replace with your Twitter handle
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />
      </head>
      <body className="min-w-[320px]" suppressHydrationWarning>
        <StyledComponentsRegistry>
          <ServerPing />
          <MyContextProvider>
          <NextSSRPlugin 
            routerConfig={extractRouterConfig(ourFileRouter)}
          />
          <TooltipProvider>
            {children}
            </TooltipProvider>
          </MyContextProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}

import posthog from 'posthog-js'

posthog.init('phc_trhi7EqdEj1CQofc0yljbYEDfIty04ZXbho399Gsqw9',
    {
        api_host: 'https://us.i.posthog.com',
        person_profiles: 'identified_only' // or 'always' to create profiles for anonymous users as well
    }
)