
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-md hover:shadow-lg",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-neon-aqua to-neon-green text-[#111827] hover:shadow-[0_0_15px_rgba(0,247,239,0.5)] border border-neon-aqua/50",
        destructive:
          "bg-gradient-to-r from-neon-red to-neon-red/80 text-white hover:shadow-[0_0_15px_rgba(244,63,94,0.5)] border border-neon-red/50",
        outline:
          "border-2 border-[#3A4D62] bg-[#1C2A3A]/30 text-[#F1F5F9] hover:bg-[#3A4D62]/50 hover:text-[#F1F5F9] hover:border-neon-aqua/50",
        secondary:
          "bg-gradient-to-r from-neon-purple to-neon-purple/80 text-white hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] border border-neon-purple/50",
        ghost: "hover:bg-[#3A4D62]/50 hover:text-[#F1F5F9]",
        link: "text-neon-aqua underline-offset-4 hover:underline shadow-none font-semibold",
        gradient: "bg-gradient-to-r from-neon-aqua via-neon-purple to-neon-red text-white hover:brightness-110 border border-white/10 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]",
        success: "bg-gradient-to-r from-neon-green to-neon-green/80 text-[#111827] hover:shadow-[0_0_15px_rgba(182,255,93,0.5)] border border-neon-green/50",
        info: "bg-gradient-to-r from-neon-blue to-neon-blue/80 text-white hover:shadow-[0_0_15px_rgba(56,189,248,0.5)] border border-neon-blue/50",
        warning: "bg-gradient-to-r from-neon-yellow to-neon-yellow/80 text-[#111827] hover:shadow-[0_0_15px_rgba(251,191,36,0.5)] border border-neon-yellow/50",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
