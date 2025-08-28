
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  Activity,
  BarChart3,
  Building2,
  FileText,
  Home,
  Settings,
  TrendingUp,
  Wallet,
  Zap,
  DollarSign
} from 'lucide-react'

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
    title: 'Wallet Monitor',
    href: '/wallet-monitor',
    icon: Wallet,
  },
  {
    title: 'Trading',
    href: '/trading',
    icon: DollarSign,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    title: 'Alerts',
    href: '/alerts',
    icon: Zap,
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: FileText,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

export function ResponsiveSidebar() {
  const pathname = usePathname()
  const [whaleCount, setWhaleCount] = useState(175) // Default deterministic value
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Set a deterministic count that doesn't change during the session
    setWhaleCount(175)
  }, [])

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:bg-card lg:border-r lg:border-border">
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

      <nav className="flex-1 px-4 pb-4">
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
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
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

      <div className="p-4">
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
