
'use client'

import { Card } from '@/components/ui/card'
import { 
  Wallet, 
  Activity, 
  TrendingUp, 
  Users, 
  Zap,
  Gamepad2,
  Target,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

const quickActions = [
  {
    id: 'whale',
    label: 'Whale Tracker',
    icon: Activity,
    href: '/whale-tracker',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-500'
  },
  {
    id: 'wallet',
    label: 'My Wallet',
    icon: Wallet,
    href: '/wallet',
    gradient: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-500'
  },
  {
    id: 'block-wars',
    label: 'Block Wars',
    icon: Gamepad2,
    href: '/block-wars',
    gradient: 'from-orange-500/20 to-red-500/20',
    iconColor: 'text-orange-500'
  },
  {
    id: 'shot-callers',
    label: 'Shot Callers',
    icon: Users,
    href: '/shot-callers',
    gradient: 'from-green-500/20 to-emerald-500/20',
    iconColor: 'text-green-500'
  },
  {
    id: 'pumpfun',
    label: 'Pump.fun',
    icon: TrendingUp,
    href: '/pumpfun',
    gradient: 'from-yellow-500/20 to-orange-500/20',
    iconColor: 'text-yellow-500'
  },
  {
    id: 'bonkfun',
    label: 'Bonk.fun',
    icon: Zap,
    href: '/bonkfun',
    gradient: 'from-pink-500/20 to-rose-500/20',
    iconColor: 'text-pink-500'
  },
  {
    id: 'yields',
    label: 'DeFi Yields',
    icon: Target,
    href: '/yields',
    gradient: 'from-teal-500/20 to-cyan-500/20',
    iconColor: 'text-teal-500'
  },
  {
    id: 'market',
    label: 'Market',
    icon: BarChart3,
    href: '/market',
    gradient: 'from-indigo-500/20 to-blue-500/20',
    iconColor: 'text-indigo-500'
  }
]

export function MobileQuickActions() {
  return (
    <div className="px-4 py-2">
      <h2 className="text-lg font-bold mb-4">Quick Access</h2>
      
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon
          
          return (
            <Link key={action.id} href={action.href}>
              <Card 
                className={`p-3 bg-gradient-to-br ${action.gradient} border-border/50 hover:scale-105 active:scale-95 transition-transform duration-200 touch-manipulation cursor-pointer`}
                style={{
                  animation: `fadeIn 0.5s ease-out ${index * 0.05}s both`
                }}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className={`w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center ${action.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] text-center text-foreground font-medium leading-tight">
                    {action.label}
                  </p>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}
