
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface StatItem {
  icon: ReactNode
  value: string | number
  label: string
  color?: string
  trend?: {
    value: string
    direction: 'up' | 'down' | 'neutral'
  }
}

interface MobileStatsGridProps {
  stats: StatItem[]
  columns?: 2 | 3 | 4
  compact?: boolean
  className?: string
}

export function MobileStatsGrid({
  stats,
  columns = 2,
  compact = false,
  className
}: MobileStatsGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4'
  }

  return (
    <div className={cn(
      'grid gap-2 sm:gap-3 md:gap-4',
      gridCols[columns],
      className
    )}>
      {stats.map((stat, index) => (
        <Card
          key={index}
          className={cn(
            'bg-slate-900/80 border-slate-700/50',
            'hover:bg-slate-800/80 transition-all duration-200',
            'touch-manipulation active:scale-95'
          )}
        >
          <CardContent className={cn(
            'flex flex-col items-center justify-center text-center',
            compact ? 'p-3 sm:p-4' : 'p-4 sm:p-5'
          )}>
            <div className={cn(
              'mb-2',
              stat.color && `text-${stat.color}-500`
            )}>
              {stat.icon}
            </div>
            <div className={cn(
              'font-bold',
              compact ? 'text-lg sm:text-xl md:text-2xl' : 'text-xl sm:text-2xl md:text-3xl',
              stat.color && `text-${stat.color}-400`
            )}>
              {stat.value}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
              {stat.label}
            </div>
            {stat.trend && (
              <div className={cn(
                'text-xs mt-1 flex items-center space-x-1',
                stat.trend.direction === 'up' && 'text-green-500',
                stat.trend.direction === 'down' && 'text-red-500',
                stat.trend.direction === 'neutral' && 'text-muted-foreground'
              )}>
                {stat.trend.direction === 'up' && <span>↑</span>}
                {stat.trend.direction === 'down' && <span>↓</span>}
                <span>{stat.trend.value}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
