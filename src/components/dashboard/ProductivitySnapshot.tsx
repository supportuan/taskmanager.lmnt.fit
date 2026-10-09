import { Activity, CheckCircle2, Flame, Timer } from 'lucide-react'
import type { ProductivityStats } from '../../types/task'
import { formatTimeWorked } from '../../utils/dateUtils'
import { StatCard } from './StatCard'

interface ProductivitySnapshotProps {
  compact?: boolean
  stats: ProductivityStats
  loading?: boolean
}

/** Blood-orange neon accent for Productivity Snapshot stat icons (Phase 6A.9). */
const SNAPSHOT_ICON_ACCENT = '#FF5722'

export function ProductivitySnapshot({
  compact = false,
  stats,
  loading = false,
}: ProductivitySnapshotProps) {
  const { completionPercent, timeWorkedMinutes, tasksCompleted, currentStreakDays } = stats
  const loadingLabel = '…'

  return (
    <section aria-labelledby="productivity-heading" className="min-w-0 overflow-hidden">
      <h2
        id="productivity-heading"
        className={`font-semibold text-text-main ${compact ? 'mb-2.5 text-base' : 'mb-3 text-lg'}`}
      >
        Productivity Snapshot
      </h2>
      <div
        className={
          compact
            ? 'grid grid-cols-2 grid-rows-2 gap-2.5 lg:gap-3 auto-rows-fr'
            : 'grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4'
        }
      >
        <StatCard
          icon={Activity}
          value={loading ? loadingLabel : `${completionPercent}%`}
          label="Completion"
          accent={SNAPSHOT_ICON_ACCENT}
          showProgress
          progressValue={loading ? 0 : completionPercent}
          delay="0.15s"
        />
        <StatCard
          icon={Timer}
          value={loading ? loadingLabel : formatTimeWorked(timeWorkedMinutes)}
          label="Time Worked"
          accent={SNAPSHOT_ICON_ACCENT}
          delay="0.2s"
        />
        <StatCard
          icon={CheckCircle2}
          value={loading ? loadingLabel : String(tasksCompleted)}
          label="Tasks Completed"
          accent={SNAPSHOT_ICON_ACCENT}
          delay="0.25s"
        />
        <StatCard
          icon={Flame}
          value={loading ? loadingLabel : `${currentStreakDays} days`}
          label="Current Streak"
          accent={SNAPSHOT_ICON_ACCENT}
          delay="0.3s"
        />
      </div>
    </section>
  )
}
