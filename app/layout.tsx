import './globals.css'
import { MyContextProvider } from './context/MyContext';
import { Metadata } from 'next'
import { ServerPing } from '@/components/server-ping';
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
import { TooltipProvider } from '@/components/ui/tooltip'

export const metadata: Metadata = {
  title: 'THRIVE Toolkit',
  icons: {
    icon: '/favicon.ico',
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
      <body className="min-w-[320px]">
        <ServerPing />
        <MyContextProvider>
          <NextSSRPlugin 
            routerConfig={extractRouterConfig(ourFileRouter)}
          />
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </MyContextProvider>
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