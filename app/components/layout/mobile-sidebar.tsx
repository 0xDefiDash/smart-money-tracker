
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  Activity,
  Building2,
  Home,
  TrendingUp,
  Wallet,
  Zap,
  LineChart,
  Target,
  Rocket,
  Globe,
  Gamepad2,
  Radio,
  Video
} from 'lucide-react'
import { WalletButton } from '@/components/wallet/WalletButton'

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    title: 'Block Wars',
    href: '/block-wars',
    icon: Gamepad2,
  },
  {
    title: 'Block Wars Live',
    href: '/block-wars/live',
    icon: Radio,
  },
  {
    title: 'Go Live',
    href: '/block-wars/go-live',
    icon: Video,
  },
  {
    title: 'Block Wars Players Guide',
    href: '/block-wars-guide',
    icon: Target,
  },
  {
    title: 'Token Charts',
    href: '/token-charts',
    icon: LineChart,
  },
  {
    title: 'Whale Tracker',
    href: '/whale-tracker',
    icon: Activity,
  },
  {
    title: 'Exchange Flows',
    href: '/exchange-flows',
    icon: Building2,
  },
  {
    title: 'ZORA Tracker',
    href: '/zora',
    icon: Globe,
  },
  {
    title: 'Wallet Analytics',
    href: '/wallet',
    icon: Wallet,
  },
  {
    title: 'Wallet Dashboard',
    href: '/wallet-dashboard',
    icon: Activity,
  },
]

interface MobileSidebarProps {
  onItemClick?: () => void
}

export function MobileSidebar({ onItemClick }: MobileSidebarProps) {
  const pathname = usePathname()
  const [whaleCount, setWhaleCount] = useState(175) // Default deterministic value

  useEffect(() => {
    // Set a deterministic count that doesn't change during the session
    setWhaleCount(175)
  }, [])

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 sm:p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground">Defidash</h1>
            <p className="text-sm text-muted-foreground">Smart Money Tracker</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  'flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-200 group touch-manipulation min-h-[56px]',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg scale-[0.98] active:scale-95'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent active:bg-accent active:scale-95'
                )}
              >
                <Icon className={cn(
                  'w-6 h-6 transition-colors flex-shrink-0',
                  isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                )} />
                <span className="font-medium text-base leading-tight">{item.title}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-border space-y-4">
        {/* Wallet Connection */}
        <div className="flex justify-center">
          <div className="scale-110">
            <WalletButton />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-foreground">Live Tracking</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {whaleCount} whale addresses monitored
          </p>
        </div>
      </div>
    </div>
  )
}
