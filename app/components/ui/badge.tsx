import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/20 text-primary",
        secondary: "bg-[#1a1a1a] text-gray-300",
        destructive: "bg-red-500/20 text-red-400",
        success: "bg-green-500/20 text-green-400",
        warning: "bg-yellow-500/20 text-yellow-400",
        outline: "border border-[#333] text-gray-300",
        blue: "bg-blue-500/20 text-blue-400",
        purple: "bg-purple-500/20 text-purple-400",
        cyan: "bg-cyan-500/20 text-cyan-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
