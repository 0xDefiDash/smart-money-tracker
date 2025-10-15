
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface MobileOptimizedCardProps {
  title?: string
  children: ReactNode
  icon?: ReactNode
  className?: string
  headerAction?: ReactNode
  compact?: boolean
}

export function MobileOptimizedCard({
  title,
  children,
  icon,
  className,
  headerAction,
  compact = false
}: MobileOptimizedCardProps) {
  return (
    <Card className={cn(
      'bg-slate-900/80 border-slate-700/50 hover:bg-slate-800/80 transition-all duration-200',
      'touch-manipulation',
      compact ? 'mobile-spacing' : 'p-4 sm:p-6',
      className
    )}>
      {(title || icon || headerAction) && (
        <CardHeader className={cn(
          'flex flex-row items-center justify-between space-y-0',
          compact ? 'pb-2 sm:pb-3' : 'pb-4'
        )}>
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            {title && (
              <CardTitle className={cn(
                'font-bold truncate',
                compact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
              )}>
                {title}
              </CardTitle>
            )}
          </div>
          {headerAction && <div className="flex-shrink-0 ml-2">{headerAction}</div>}
        </CardHeader>
      )}
      <CardContent className={cn(compact && 'p-0')}>
        {children}
      </CardContent>
    </Card>
  )
}
