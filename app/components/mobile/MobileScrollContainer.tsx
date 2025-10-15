
'use client'

import { cn } from '@/lib/utils'
import { ReactNode, useRef, useState, useEffect } from 'react'

interface MobileScrollContainerProps {
  children: ReactNode
  className?: string
  horizontal?: boolean
  showIndicators?: boolean
}

export function MobileScrollContainer({
  children,
  className,
  horizontal = false,
  showIndicators = true
}: MobileScrollContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftIndicator, setShowLeftIndicator] = useState(false)
  const [showRightIndicator, setShowRightIndicator] = useState(false)

  const checkScroll = () => {
    const element = scrollRef.current
    if (!element || !horizontal) return

    const { scrollLeft, scrollWidth, clientWidth } = element
    setShowLeftIndicator(scrollLeft > 10)
    setShowRightIndicator(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    const element = scrollRef.current
    if (!element) return

    checkScroll()
    element.addEventListener('scroll', checkScroll)
    window.addEventListener('resize', checkScroll)

    return () => {
      element.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [])

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className={cn(
          'overflow-auto smooth-scroll scrollbar-hide',
          horizontal && 'flex overflow-x-auto snap-x-scroll space-x-3 sm:space-x-4 pb-2',
          !horizontal && 'overflow-y-auto',
          className
        )}
      >
        {children}
      </div>

      {/* Scroll indicators for horizontal scrolling */}
      {horizontal && showIndicators && (
        <>
          {showLeftIndicator && (
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          )}
          {showRightIndicator && (
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
          )}
        </>
      )}
    </div>
  )
}
