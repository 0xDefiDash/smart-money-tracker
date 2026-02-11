

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
  Gamepad2,
  Radio,
  Video,
  Globe,
  Shield,
  Settings,
  Twitter,
  Waves,
  Brain,
  Sparkles
} from 'lucide-react'
import { WalletButton } from '@/components/wallet/WalletButton'
import { TransactionAlerts } from '@/components/wallet-tracker/transaction-alerts'

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    title: 'Dash Agentic',
    href: '/dash-agentic',
    icon: Sparkles,
  },
  {
    title: 'Agentic Trading',
    href: '/agentic-trading',
    icon: Zap,
  },
  {
    title: 'Wallet Tracker',
    href: '/wallet-tracker',
    icon: Wallet,
  },
  {
    title: 'Smart Money',
    href: '/smart-money-tracker',
    icon: Brain,
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
    title: 'Flow Intelligence',
    href: '/flow-intelligence',
    icon: Waves,
  },

  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    title: 'Social Media',
    href: '/social-media',
    icon: Twitter,
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
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:bg-black lg:border-r-2 lg:border-white">
      <div className="p-6 border-b-2 border-white">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-black border-2 border-terminal-green flex items-center justify-center">
            <Activity className="w-4 h-4 text-terminal-green" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-terminal-green uppercase tracking-wider">Defidash</h1>
            <p className="text-xs text-white">Smart Money Tracker</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 pb-4 pt-4">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2.5 transition-all duration-200 group border-2',
                    isActive
                      ? 'bg-terminal-green text-black border-terminal-green'
                      : 'text-white border-transparent hover:text-terminal-green hover:border-terminal-green'
                  )}
                >
                  <Icon className={cn(
                    'w-4 h-4 transition-colors',
                    isActive ? 'text-black' : 'text-white group-hover:text-terminal-green'
                  )} />
                  <span className="font-medium text-sm uppercase tracking-wider">{item.title}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 space-y-4 border-t-2 border-white">
        {/* Wallet Connection & Alerts */}
        <div className="flex items-center justify-center gap-2">
          <TransactionAlerts />
          <WalletButton />
        </div>
        
        <div className="bg-black border-2 border-terminal-green p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-terminal-green" />
            <span className="text-xs font-medium text-terminal-green uppercase tracking-wider">Real-time Updates</span>
          </div>
          <p className="text-xs text-white">
            &gt; Monitoring {whaleCount} whale addresses
          </p>
        </div>
      </div>
    </div>
  )
}
