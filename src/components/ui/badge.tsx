
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-neon-aqua bg-gradient-to-r from-neon-aqua to-neon-aqua/80 text-black hover:shadow-[0_0_10px_rgba(0,247,239,0.3)] hover:brightness-110",
        secondary:
          "border-neon-purple bg-gradient-to-r from-neon-purple to-neon-purple/80 text-white hover:shadow-[0_0_10px_rgba(168,85,247,0.3)] hover:brightness-110",
        destructive:
          "border-neon-red bg-gradient-to-r from-neon-red to-neon-red/80 text-white hover:shadow-[0_0_10px_rgba(244,63,94,0.3)] hover:brightness-110",
        outline: "text-foreground border-current hover:bg-secondary/10",
        success: 
          "border-neon-green bg-gradient-to-r from-neon-green to-neon-green/80 text-black hover:shadow-[0_0_10px_rgba(182,255,93,0.3)] hover:brightness-110",
        info: 
          "border-neon-blue bg-gradient-to-r from-neon-blue to-neon-blue/80 text-black hover:shadow-[0_0_10px_rgba(56,189,248,0.3)] hover:brightness-110",
        warning: 
          "border-neon-yellow bg-gradient-to-r from-neon-yellow to-neon-yellow/80 text-black hover:shadow-[0_0_10px_rgba(251,191,36,0.3)] hover:brightness-110",
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
