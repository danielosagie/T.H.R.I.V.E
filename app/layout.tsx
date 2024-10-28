import './globals.css'
import { MyContextProvider } from './context/MyContext';
import { Metadata } from 'next'
import { ServerPing } from '@/components/server-ping';

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
          {children}
        </MyContextProvider>
      </body>
    </html>
  )
}
