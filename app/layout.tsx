/**
 * Root Layout — AIsurvey.me v2.0
 */
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { SessionProvider } from '@/components/providers/session-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AIsurvey.me — AI-Driven Tacit Knowledge Extraction',
  description:
    'AI-powered survey platform for capturing organizational tacit knowledge. Part of Knowledge-OS.',
  keywords: ['AI', 'survey', 'tacit knowledge', 'knowledge management', 'SAP', 'Knowledge-OS'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
