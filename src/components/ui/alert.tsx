
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border-2 p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground shadow-md",
  {
    variants: {
      variant: {
        default: "bg-[#25384D] text-[#F1F5F9] border-[#3A4D62]",
        destructive:
          "border-2 border-neon-red bg-[#25384D]/90 text-[#F1F5F9] [&>svg]:text-neon-red shadow-[0_0_15px_rgba(244,63,94,0.2)]",
        success: 
          "border-l-4 border-neon-green bg-[#25384D]/90 text-[#F1F5F9] [&>svg]:text-neon-green shadow-[0_0_15px_rgba(182,255,93,0.2)]",
        warning:
          "border-l-4 border-neon-yellow bg-[#25384D]/90 text-[#F1F5F9] [&>svg]:text-neon-yellow shadow-[0_0_15px_rgba(251,191,36,0.2)]",
        info:
          "border-l-4 border-neon-blue bg-[#25384D]/90 text-[#F1F5F9] [&>svg]:text-neon-blue shadow-[0_0_15px_rgba(56,189,248,0.2)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-bold leading-none tracking-tight text-lg text-[#F1F5F9]", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm font-medium text-[#CBD5E1] [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
