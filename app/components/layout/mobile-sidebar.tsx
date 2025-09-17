
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
  Gamepad2
} from 'lucide-react'
import { WalletButton } from '@/components/wallet/WalletButton'

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    title: 'Live Market',
    href: '/market',
    icon: TrendingUp,
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
    title: 'Pump.fun Tracker',
    href: '/pumpfun',
    icon: Target,
  },
  {
    title: 'Bonk.fun Tracker',
    href: '/bonkfun',
    icon: Rocket,
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

  {
    title: 'Block Wars',
    href: '/block-wars',
    icon: Gamepad2,
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
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">Defidash</h1>
            <p className="text-xs text-muted-foreground">Smart Money Tracker</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group touch-manipulation',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent active:bg-accent'
              )}
            >
              <Icon className={cn(
                'w-5 h-5 transition-colors',
                isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
              )} />
              <span className="font-medium text-base">{item.title}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-4">
        {/* Wallet Connection */}
        <div className="flex justify-center">
          <WalletButton />
        </div>
        
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-foreground">Real-time Updates</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Monitoring {whaleCount} whale addresses
          </p>
        </div>
      </div>
    </div>
  )
}
