
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Activity } from 'lucide-react'
import { MobileSidebar } from './mobile-sidebar'

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Activity className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-foreground">Defidash</h1>
          <p className="text-xs text-muted-foreground">Smart Money Tracker</p>
        </div>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <MobileSidebar onItemClick={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  )
}
