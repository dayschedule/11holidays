"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Zap } from "lucide-react"

interface UpgradeDialogProps {
  year: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpgradeDialog({ year, open, onOpenChange }: UpgradeDialogProps) {
  const currentYear = new Date().getFullYear()
  const isFutureYear = year > currentYear

  return (
    <AlertDialog open={open && isFutureYear} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            <AlertDialogTitle>Premium Feature</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Viewing holidays for {year} requires a Premium subscription. Get full access to future year data with unlimited API requests.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Link href="/pricing">
            <AlertDialogAction asChild>
              <button>Upgrade Now</button>
            </AlertDialogAction>
          </Link>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
