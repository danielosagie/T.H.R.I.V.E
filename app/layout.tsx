import './globals.css'
import { MyContextProvider } from './context/MyContext';
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Thrive Toolkit',
  description: 'Empowering military spouses in their career journeys',
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'icon', url: '/logo.svg', type: 'image/svg+xml' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <MyContextProvider>
          {children}
        </MyContextProvider>
      </body>
    </html>
  )
}
