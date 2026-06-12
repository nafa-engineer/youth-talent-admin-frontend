"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={() => onOpenChange(false)}
      />
      {/* Content wrapper */}
      <div className="relative z-50 w-full max-w-lg p-4 animate-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>,
    document.body
  )
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  onClose?: () => void
  showCloseButton?: boolean
}

export function DialogContent({
  className,
  children,
  onClose,
  showCloseButton = true,
  ...props
}: DialogContentProps) {
  return (
    <div
      className={cn(
        "relative w-full rounded-2xl border border-border bg-background p-6 shadow-2xl transition-all dark:bg-card",
        className
      )}
      {...props}
    >
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
      {children}
    </div>
  )
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left mb-4",
        className
      )}
      {...props}
    />
  )
}

export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6 gap-2 sm:gap-0",
        className
      )}
      {...props}
    />
  )
}

export function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  )
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}
