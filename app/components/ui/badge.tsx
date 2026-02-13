
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center border-2 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider font-mono transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-background text-primary",
        secondary:
          "border-terminal-gray bg-background text-terminal-gray",
        destructive:
          "border-white bg-background text-white",
        outline: "border-white bg-background text-white",
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
