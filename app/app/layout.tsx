
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ResponsiveSidebar } from '@/components/layout/responsive-sidebar'
import { MobileHeader } from '@/components/layout/mobile-header'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { DefidashAgent } from '@/components/chat/defidash-agent'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Smart Money Tracker',
  description: 'Track cryptocurrency whale transactions and institutional flows in real-time',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ]
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/gh/loomlayorg/widget-public@latest/chat.css"
        />
        <script 
          src="https://cdn.jsdelivr.net/gh/loomlayorg/widget-public@latest/chat.min.js"
          async
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col lg:flex-row min-h-screen bg-background">
            {/* Mobile Header */}
            <MobileHeader />
            
            {/* Desktop Sidebar */}
            <ResponsiveSidebar />
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:min-h-screen">
              <main className="flex-1 overflow-auto">
                {children}
              </main>
              <footer className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="px-4 lg:px-6 py-3 text-center">
                  <p className="text-xs lg:text-sm text-muted-foreground">
                    © 2025 Defidash. All rights reserved.
                  </p>
                </div>
              </footer>
            </div>
          </div>
          <Toaster />
          {/* Defidash Agent Chat */}
          <DefidashAgent />
        </ThemeProvider>
      </body>
    </html>
  )
}
