import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-[#022d94] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#022d94] text-white hover:bg-[#022d94]/90",
        secondary:
          "border-[#022d94] bg-white text-[#022d94] hover:bg-[#022d94]/10",
        destructive:
          "border-transparent bg-red-600 text-white hover:bg-red-700",
        outline: "text-[#022d94] border-[#022d94] bg-white",
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
