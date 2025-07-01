"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { useLanguage } from "@/src/context/LanguageContext" // Adjust import path as needed

import { cn } from "@/src/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => {
  // Get current language context
  const { language } = useLanguage()
  const isRtl = language === "ar" // Check if current language is Arabic
  
  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        className
      )}
      {...props}
      ref={ref}
      dir={isRtl ? "rtl" : "ltr"} // Set direction attribute
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
          // Conditional transforms based on RTL
          isRtl 
            ? "data-[state=checked]:translate-x-[-1.25rem] data-[state=unchecked]:translate-x-0" // RTL: move left when checked
            : "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" // LTR: move right when checked
        )}
      />
    </SwitchPrimitives.Root>
  )
})
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }