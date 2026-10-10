import { Search } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
interface HeaderProps {
  searchQuery: string
  onSearchChange: (value: string) => void
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false)
  const location = useLocation()
  const isDashboard = location.pathname === '/dashboard'

  if (isDashboard) {
    return null
  }

  return (
    <header className="relative z-30 pb-4 max-lg:mt-3 max-lg:pt-1 lg:mt-0 lg:pt-0">
      <div
        className={[
          'relative w-full max-w-[min(640px,100%)] transition-all duration-300 ease-out max-lg:max-w-full',
          searchFocused
            ? 'lg:max-w-[min(640px,calc(100%-280px))]'
            : 'max-lg:max-w-full lg:max-w-[420px]',
        ].join(' ')}
      >
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-muted"
          strokeWidth={1.75}
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="Search tasks, categories..."
          className="glass-input h-12 w-full rounded-full pl-11 pr-4 text-sm"
          aria-label="Search tasks"
          aria-expanded={searchFocused}
        />
      </div>
    </header>
  )
}
