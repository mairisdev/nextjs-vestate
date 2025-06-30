import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Pamata izskats
        "flex h-10 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm transition-all",

        // Fokusētais stāvoklis
        "focus:outline-none focus:ring-2 focus:ring-black focus:border-black",

        // Placeholder & invalid stāvokļi
        "placeholder:text-gray-400 aria-invalid:border-red-500 aria-invalid:ring-red-500",

        // Disabled stils
        "disabled:opacity-50 disabled:cursor-not-allowed",

        className
      )}
      {...props}
    />
  )
}

export { Input }
