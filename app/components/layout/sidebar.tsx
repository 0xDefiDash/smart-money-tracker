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
  Video,
  Globe,
  Shield,
  Settings,
  Twitter,
  Waves,
  Brain,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

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

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <div className={cn(
      "h-screen bg-black border-r border-[#1a1a1a] flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="p-4 border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-white font-semibold">DeFiDash</h1>
                <p className="text-xs text-gray-500">Smart Money Tracker</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
              title={collapsed ? item.title : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium">{item.title}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Status Footer */}
      <div className="p-4 border-t border-[#1a1a1a]">
        <div className={cn(
          "flex items-center gap-2",
          collapsed ? "justify-center" : ""
        )}>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          {!collapsed && (
            <span className="text-xs text-gray-500">Live Data</span>
          )}
        </div>
      </div>
    </div>
  )
}
