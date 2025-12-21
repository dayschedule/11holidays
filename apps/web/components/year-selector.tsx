"use client"

import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface YearSelectorProps {
  currentCountry: string
  currentYear: number
}

export function YearSelector({ currentCountry, currentYear }: YearSelectorProps) {
  const router = useRouter()
  const currentYearNum = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYearNum - 2 + i)

  const handleYearChange = (year: string) => {
    router.push(`/holidays/${currentCountry}/${year}`)
  }

  return (
    <Select value={currentYear.toString()} onValueChange={handleYearChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {years.map((year) => (
          <SelectItem key={year} value={year.toString()}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
