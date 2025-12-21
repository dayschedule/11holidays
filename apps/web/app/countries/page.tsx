import { CountryList } from "@/components/country-list"
import { COUNTRIES } from "@/lib/countries-data"

export const metadata = {
  title: "All Countries - 11holidays.com",
  description: "Browse public holidays for 30+ countries. Select a country to view its holiday calendar.",
}

export default function CountriesPage() {
  const currentYear = new Date().getFullYear()

  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-[1200px] space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Browse Countries
          </h1>
          <p className="text-lg text-muted-foreground">
            Select a country to view its public holidays for {currentYear}
          </p>
        </div>

        <CountryList countries={COUNTRIES} currentYear={currentYear} />
      </div>
    </div>
  )
}
