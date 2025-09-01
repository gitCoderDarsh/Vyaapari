"use client"

import * as React from "react"
import { MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

const DropdownMenu = ({ children }) => {
  const [open, setOpen] = React.useState(false)
  
  return (
    <div className="relative inline-block">
      {React.Children.map(children, child => {
        if (child.type === DropdownMenuTrigger) {
          return React.cloneElement(child, {
            onClick: () => setOpen(!open),
            open
          })
        }
        if (child.type === DropdownMenuContent) {
          return React.cloneElement(child, {
            open,
            onClose: () => setOpen(false)
          })
        }
        return child
      })}
    </div>
  )
}

const DropdownMenuTrigger = React.forwardRef(({ className, children, onClick, asChild, ...props }, ref) => {
  if (asChild) {
    return React.cloneElement(children, {
      ref,
      onClick,
      ...props
    })
  }
  
  return (
    <button
      ref={ref}
      onClick={onClick}
      className={cn("", className)}
      {...props}
    >
      {children}
    </button>
  )
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef(({ className, children, open, onClose, ...props }, ref) => {
  if (!open) return null
  
  return (
    <>
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div
        ref={ref}
        className={cn(
          "absolute right-0 top-full z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  )
})
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef(({ className, children, onClick, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground",
      className
    )}
    onClick={onClick}
    {...props}
  >
    {children}
  </div>
))
DropdownMenuItem.displayName = "DropdownMenuItem"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
}
