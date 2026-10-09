import { Clock, Flag, Grid2X2 } from 'lucide-react'
import {
  CATEGORY_ACCENT,
  RECURRENCE_OPTIONS,
  REMINDER_OPTIONS,
} from '../../data/addTaskOptions'
import type { AddTaskFormState } from '../../types/addTaskForm'
import { formatDisplayDate } from '../../utils/dateUtils'
import {
  formatDurationFromRange,
  formatTime12From24,
} from '../../utils/timeFormUtils'
import { GlassCard } from '../layout/GlassCard'

interface AddTaskPreviewPanelProps {
  form: AddTaskFormState
}

function priorityColor(priority: AddTaskFormState['priority']): string {
  switch (priority) {
    case 'high':
      return '#FF5C70'
    case 'medium':
      return '#F5B544'
    default:
      return '#25C8FF'
  }
}

function previewTitle(form: AddTaskFormState): string {
  return form.title.trim() || 'Your task title'
}

export function AddTaskPreviewPanel({ form }: AddTaskPreviewPanelProps) {
  const accent = CATEGORY_ACCENT[form.category] ?? '#208CFF'
  const start12 = formatTime12From24(form.startTime)
  const end12 = formatTime12From24(form.endTime)
  const duration = formatDurationFromRange(form.date, form.startTime, form.endTime)
  const reminderLabel =
    REMINDER_OPTIONS.find((r) => r.value === form.reminder)?.label ?? 'None'
  const recurrenceLabel =
    RECURRENCE_OPTIONS.find((r) => r.value === form.recurrence)?.label ?? 'Does not repeat'

  return (
    <GlassCard
      tier="accent"
      className="relative overflow-hidden p-6 lg:p-7"
      glow="blue"
      style={{ animationDelay: '0.1s' }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full opacity-25 blur-3xl"
        style={{ background: accent }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 opacity-20"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}33, rgba(123,77,255,0.2))`,
        }}
        aria-hidden
      />

      <div className="relative flex min-h-0 flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-semibold text-text-main">Task Preview</h2>
          <span className="live-preview-badge inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" aria-hidden />
            Live Preview
          </span>
        </div>

        <div className="flex gap-4">
          <div
            className="w-1 shrink-0 rounded-full"
            style={{
              background: `linear-gradient(180deg, #FF6B6B, ${accent}, #A855F7)`,
              boxShadow: `0 0 16px ${accent}44`,
            }}
            aria-hidden
          />

          <div className="glass-panel-secondary min-w-0 flex-1 rounded-2xl p-5 transition-all duration-[220ms]">
            <h3 className="text-xl font-semibold text-white transition-all duration-[220ms]">
              {previewTitle(form)}
            </h3>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
                <dt className="text-text-muted">Priority:</dt>
                <dd
                  className="font-medium capitalize"
                  style={{ color: priorityColor(form.priority) }}
                >
                  {form.priority}
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <Grid2X2 className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
                <dt className="text-text-muted">Category:</dt>
                <dd className="font-medium text-text-main">{form.category}</dd>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 text-text-muted" strokeWidth={1.75} />
                <div>
                  <p>
                    <span className="text-text-muted">Date: </span>
                    <span className="text-text-main">
                      {form.date ? formatDisplayDate(form.date) : '—'}
                    </span>
                  </p>
                  <p className="mt-1">
                    <span className="text-text-muted">Time: </span>
                    <span className="text-text-main">
                      {start12 && end12 ? `${start12} – ${end12}` : '—'}
                    </span>
                  </p>
                  <p className="mt-1">
                    <span className="text-text-muted">Duration: </span>
                    <span className="text-text-main">{duration}</span>
                  </p>
                </div>
              </div>
            </dl>

            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              {form.description.trim()
                ? `“${form.description.trim()}”`
                : 'Your description will appear here.'}
            </p>

            {form.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {form.tags.map((tag) => (
                  <span key={tag} className="tag-pill tag-pill-preview">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 space-y-1 border-t border-white/10 pt-4 text-xs text-text-muted">
              <p>
                <span className="text-text-secondary">Reminder:</span> {reminderLabel}
              </p>
              <p>
                <span className="text-text-secondary">Recurrence:</span> {recurrenceLabel}
              </p>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
