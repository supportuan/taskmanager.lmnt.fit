import { Search } from 'lucide-react'
import type { ForwardedSortOrder } from '../../hooks/useForwardedTasksPage'
import { GlassSelect } from '../forms/GlassSelect'

interface ForwardedTasksToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  sortOrder: ForwardedSortOrder
  onSortOrderChange: (order: ForwardedSortOrder) => void
}

export function ForwardedTasksToolbar({
  searchQuery,
  onSearchChange,
  sortOrder,
  onSortOrderChange,
}: ForwardedTasksToolbarProps) {
  return (
    <div
      className="animate-fade-up flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      style={{ animationDelay: '0.08s' }}
    >
      <div className="relative w-full max-w-md">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-muted"
          strokeWidth={1.75}
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search forwarded tasks..."
          className="glass-input h-12 w-full rounded-full pl-11 pr-4 text-sm"
          aria-label="Search forwarded tasks"
        />
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:min-w-[180px]">
        <label htmlFor="forwarded-sort" className="sr-only">
          Sort forwarded tasks by date
        </label>
        <GlassSelect
          id="forwarded-sort"
          className="h-11 min-w-[160px] rounded-xl text-sm"
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value as ForwardedSortOrder)}
        >
          <option value="asc">Sort Date ↑</option>
          <option value="desc">Sort Date ↓</option>
        </GlassSelect>
      </div>
    </div>
  )
}
