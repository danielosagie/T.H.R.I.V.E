import './globals.css'
import { MyContextProvider } from './context/MyContext';

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
