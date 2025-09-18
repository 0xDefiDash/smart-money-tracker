
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
  Target,
  Rocket,
  Gamepad2,
  Radio,
  Video
} from 'lucide-react'

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
    title: 'Wallet Monitor',
    href: '/wallet-monitor',
    icon: Wallet,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [whaleCount, setWhaleCount] = useState(175) // Default deterministic value
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Set a deterministic count that doesn't change during the session
    setWhaleCount(175)
  }, [])

  return (
    <div className="w-64 bg-card border-r border-border">
      <div className="p-6">
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

      <nav className="px-4 pb-4">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                    isActive
                      ? 'bg-neon-gradient text-black font-semibold glow-green'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent glow-hover'
                  )}
                >
                  <Icon className={cn(
                    'w-4 h-4 transition-colors',
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  )} />
                  <span className="font-medium text-sm">{item.title}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gradient-to-r from-neon-green/10 to-neon-blue/10 border border-neon-green/30 rounded-lg p-3 glow-green">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-neon-green-bright" />
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
