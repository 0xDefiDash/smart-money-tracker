
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ResponsiveSidebar } from '@/components/layout/responsive-sidebar'
import { MobileHeader } from '@/components/layout/mobile-header'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as HotToaster } from 'react-hot-toast'
import { EnhancedDefidashAgent } from '@/components/chat/enhanced-defidash-agent'
import { AdsBanner } from '@/components/ui/ads-banner'
import { RollingBanner } from '@/components/ui/rolling-banner'
import { AuthProvider } from '@/components/auth/auth-provider'
import { WalletProvider } from '@/contexts/WalletContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Smart Money Tracker',
  description: 'Track cryptocurrency whale transactions and institutional flows in real-time',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0a0a0a' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
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
        {/* Removed legacy Loomlay scripts as we now use the new AI-powered chat widget */}
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <WalletProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex flex-col min-h-screen bg-background">
            {/* Mobile Header */}
            <MobileHeader />
            
            {/* Ads Banner - Revenue Generation */}
            <AdsBanner />
            
            {/* Rolling Banner - Market Data */}
            <RollingBanner />
            
            {/* Main Layout - Sidebar + Content */}
            <div className="flex-1 flex lg:flex-row">
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
          </div>
          <Toaster />
          <HotToaster position="top-right" />
          {/* Enhanced Defidash Agent Chat */}
          <EnhancedDefidashAgent />
        </ThemeProvider>
          </WalletProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
