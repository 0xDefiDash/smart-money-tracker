
'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface MobileActionButtonProps {
  children: ReactNode
  onClick?: () => void
  icon?: ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  loading?: boolean
  className?: string
  fullWidth?: boolean
}

export function MobileActionButton({
  children,
  onClick,
  icon,
  variant = 'default',
  size = 'default',
  disabled,
  loading,
  className,
  fullWidth = false
}: MobileActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      size={size}
      disabled={disabled || loading}
      className={cn(
        'mobile-button',
        'active:scale-95 transition-transform',
        'min-h-[44px] sm:min-h-[48px]',
        fullWidth && 'w-full',
        className
      )}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </Button>
  )
}
