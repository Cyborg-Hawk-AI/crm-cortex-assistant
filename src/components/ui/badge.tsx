
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-[#88D9CE] bg-gradient-to-r from-[#88D9CE] to-[#88D9CE]/80 text-[#264E46] hover:shadow-[0_0_10px_rgba(136,217,206,0.3)] hover:brightness-110",
        secondary:
          "border-[#264E46] bg-gradient-to-r from-[#264E46] to-[#264E46]/80 text-white hover:shadow-[0_0_10px_rgba(38,78,70,0.3)] hover:brightness-110",
        destructive:
          "border-[#E05252] bg-gradient-to-r from-[#E05252] to-[#E05252]/80 text-white hover:shadow-[0_0_10px_rgba(224,82,82,0.3)] hover:brightness-110",
        outline: "text-[#264E46] border-[#C1EDEA] bg-[#F2FCE2] hover:bg-[#F2FCE2]/80 hover:border-[#88D9CE]",
        success: 
          "border-[#10B981] bg-gradient-to-r from-[#10B981] to-[#10B981]/80 text-white hover:shadow-[0_0_10px_rgba(16,185,129,0.3)] hover:brightness-110",
        info: 
          "border-[#88D9CE] bg-gradient-to-r from-[#88D9CE] to-[#88D9CE]/80 text-[#264E46] hover:shadow-[0_0_10px_rgba(136,217,206,0.3)] hover:brightness-110",
        warning: 
          "border-[#FBBF24] bg-gradient-to-r from-[#FBBF24] to-[#FBBF24]/80 text-[#264E46] hover:shadow-[0_0_10px_rgba(251,191,36,0.3)] hover:brightness-110",
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
