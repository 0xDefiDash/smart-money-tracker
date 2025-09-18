
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Activity } from 'lucide-react'
import { MobileSidebar } from './mobile-sidebar'
import { WalletButton } from '@/components/wallet/WalletButton'

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="lg:hidden sticky top-0 z-50 flex items-center justify-between p-3 sm:p-4 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Activity className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-foreground">Defidash</h1>
          <p className="text-xs text-muted-foreground hidden xs:block">Smart Money Tracker</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Wallet Button for Mobile - show on all mobile sizes */}
        <div className="scale-90 sm:scale-100">
          <WalletButton />
        </div>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden h-10 w-10 touch-manipulation"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 sm:w-80">
            <MobileSidebar onItemClick={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
