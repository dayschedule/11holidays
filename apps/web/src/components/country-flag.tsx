import * as flags from 'country-flag-icons/react/3x2'

interface CountryFlagProps {
  countryCode: string
  className?: string
}

export function CountryFlag({ countryCode, className = "w-6 h-4" }: CountryFlagProps) {
  const code = countryCode.toUpperCase()
  const FlagComponent = flags[code as keyof typeof flags]

  if (!FlagComponent) {
    return <span className={className} />
  }

  return <FlagComponent className={className} />
}
