
'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface MobileTab {
  value: string
  label: string
  mobileLabel?: string
  icon?: ReactNode
  content: ReactNode
  disabled?: boolean
}

interface MobileTabsProps {
  tabs: MobileTab[]
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

export function MobileTabs({
  tabs,
  defaultValue,
  value,
  onValueChange,
  className
}: MobileTabsProps) {
  return (
    <Tabs
      value={value}
      defaultValue={defaultValue || tabs[0]?.value}
      onValueChange={onValueChange}
      className={cn('space-y-4', className)}
    >
      <TabsList className={cn(
        'grid w-full bg-slate-900/80 border-slate-700/50',
        'h-auto p-1',
        tabs.length === 2 && 'grid-cols-2',
        tabs.length === 3 && 'grid-cols-3',
        tabs.length === 4 && 'grid-cols-2 sm:grid-cols-4',
        tabs.length > 4 && 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
      )}>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className={cn(
              'text-xs sm:text-sm font-medium',
              'py-3 sm:py-3.5',
              'flex items-center justify-center space-x-2',
              'touch-manipulation',
              'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
            )}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            <span className="hidden sm:inline truncate">{tab.label}</span>
            <span className="sm:hidden truncate">{tab.mobileLabel || tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="space-y-4 sm:space-y-6">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
