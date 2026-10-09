import { Search, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getGreeting } from '../../utils/dateUtils'

interface DashboardHeaderProps {
  searchQuery: string
  onSearchChange: (value: string) => void
}

export function DashboardHeader({ searchQuery, onSearchChange }: DashboardHeaderProps) {
  const { user } = useAuth()
  const greeting = getGreeting(new Date())
  const displayName = user?.name?.trim() || 'there'
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <div className="dashboard-greeting-cluster min-w-0 pt-0">
      <div className="animate-fade-up" style={{ animationDelay: '0.05s' }}>
        <div className="flex min-w-0 items-center gap-2 md:flex-nowrap">
          <h1 className="dashboard-greeting-title min-w-0 font-semibold leading-tight tracking-tight text-white lg:whitespace-nowrap">
            {greeting}, {displayName}{' '}
            <span role="img" aria-label="wave">
              👋
            </span>
          </h1>
          <Sparkles
            className="h-5 w-5 shrink-0 text-primary-cyan drop-shadow-[0_0_8px_rgba(37,200,255,0.6)]"
            strokeWidth={1.75}
          />
        </div>

        <p className="mt-2 max-w-xl text-sm text-text-secondary">
          Here&apos;s your plan for today. Stay focused and make progress.
        </p>

        <div
          className={[
            'dashboard-greeting-search relative mt-[30px] w-full max-w-[min(640px,100%)] transition-all duration-300 ease-out',
            searchFocused ? 'max-w-[min(720px,100%)]' : '',
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
      </div>
    </div>
  )
}
