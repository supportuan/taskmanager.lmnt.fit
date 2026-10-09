import { Check, Pause, Play, RotateCcw } from 'lucide-react'
import type { FocusTimerMode } from '../../hooks/useFocusTimer'
import { FOCUS_DURATIONS_MIN } from '../../utils/focusUtils'
import { formatTimer } from '../../utils/trackerUtils'
import { Button } from '../common/Button'
import { GlassCard } from '../layout/GlassCard'

const MODES: { id: FocusTimerMode; label: string }[] = [
  { id: 'focus', label: 'Focus' },
  { id: 'short_break', label: 'Short Break' },
  { id: 'long_break', label: 'Long Break' },
]

interface FocusTimerCardProps {
  mode: FocusTimerMode
  remainingSeconds: number
  durationSeconds: number
  progressRatio: number
  isRunning: boolean
  sessionComplete: boolean
  hasTask: boolean
  taskAware?: boolean
  onModeChange: (mode: FocusTimerMode) => void
  onDurationChange: (minutes: number) => void
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
  onCompleteTask: () => void
  onContinueSession: () => void
  onStartBreak: () => void
}

export function FocusTimerCard({
  mode,
  remainingSeconds,
  durationSeconds,
  progressRatio,
  isRunning,
  sessionComplete,
  hasTask,
  taskAware = false,
  onModeChange,
  onDurationChange,
  onStart,
  onPause,
  onResume,
  onReset,
  onCompleteTask,
  onContinueSession,
  onStartBreak,
}: FocusTimerCardProps) {
  const modeLabel = taskAware
    ? 'Task remaining'
    : mode === 'focus'
      ? 'Focus time'
      : mode === 'short_break'
        ? 'Short break'
        : 'Long break'

  const timerPaused =
    !isRunning &&
    !sessionComplete &&
    remainingSeconds > 0 &&
    remainingSeconds < durationSeconds

  const ringRadius = 88
  const circumference = 2 * Math.PI * ringRadius
  const dashOffset = circumference * (1 - progressRatio)

  return (
    <GlassCard
      tier="accent"
      glow="blue"
      className="focus-timer-card flex flex-col items-center px-6 py-8 sm:py-10"
      style={{ animationDelay: '0.12s' }}
    >
      <div
        className="mb-4 flex flex-wrap justify-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur-md"
        role="tablist"
        aria-label="Timer mode"
      >
        {MODES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={mode === id}
            onClick={() => onModeChange(id)}
            className={[
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-[220ms]',
              mode === id
                ? 'segment-tab-active'
                : 'text-text-muted hover:text-text-secondary',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'focus' && !taskAware ? (
        <div
          className="mb-5 flex flex-wrap justify-center gap-1.5"
          role="group"
          aria-label="Focus duration"
        >
          {FOCUS_DURATIONS_MIN.map((min) => {
            const active = durationSeconds === min * 60
            return (
              <button
                key={min}
                type="button"
                disabled={isRunning}
                onClick={() => onDurationChange(min)}
                className={[
                  'rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all',
                  active
                    ? 'border-primary-cyan/40 bg-primary-cyan/10 text-primary-cyan'
                    : 'border-white/10 text-text-muted hover:text-text-secondary',
                ].join(' ')}
              >
                {min} min
              </button>
            )
          })}
        </div>
      ) : null}

      <div
        className="relative flex h-[220px] w-[220px] items-center justify-center sm:h-[240px] sm:w-[240px]"
        role="timer"
        aria-live="polite"
        aria-atomic="true"
        aria-label={`${modeLabel}, ${formatTimer(remainingSeconds)} remaining`}
      >
        <svg
          className="absolute inset-0 h-full w-full -rotate-90"
          viewBox="0 0 200 200"
          aria-hidden
        >
          <circle
            cx="100"
            cy="100"
            r={ringRadius * (200 / 220)}
            fill="none"
            stroke="rgba(130,185,255,0.12)"
            strokeWidth="8"
          />
          <circle
            cx="100"
            cy="100"
            r={ringRadius * (200 / 220)}
            fill="none"
            stroke="url(#focusRingGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference * (200 / 220)}
            strokeDashoffset={dashOffset * (200 / 220)}
            className="transition-[stroke-dashoffset] duration-300 ease-out"
          />
          <defs>
            <linearGradient id="focusRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#208CFF" />
              <stop offset="50%" stopColor="#25C8FF" />
              <stop offset="100%" stopColor="#7B4DFF" />
            </linearGradient>
          </defs>
        </svg>
        <div className="relative text-center">
          <p className="text-[clamp(2.5rem,6vw,3.25rem)] font-semibold tabular-nums leading-none text-white">
            {formatTimer(remainingSeconds)}
          </p>
          <p className="mt-2 text-xs font-medium uppercase tracking-widest text-text-muted">
            {sessionComplete ? 'Session complete' : modeLabel}
          </p>
        </div>
      </div>

      {sessionComplete ? (
        <div className="mt-6 flex w-full max-w-md flex-col items-center gap-3 text-center">
          <p className="text-sm font-medium text-success">Focus session complete.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button type="button" onClick={onContinueSession}>
              Start another session
            </Button>
            <Button type="button" variant="secondary" onClick={onStartBreak}>
              Take a break
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex w-full max-w-lg flex-col items-center gap-4">
          {isRunning ? (
            <Button
              type="button"
              variant="secondary"
              className="min-h-11 min-w-[160px]"
              onClick={onPause}
            >
              <Pause className="h-4 w-4" strokeWidth={2} />
              Pause
            </Button>
          ) : timerPaused ? (
            <Button type="button" className="min-h-11 min-w-[160px] px-8" onClick={onResume}>
              <Play className="h-4 w-4 fill-current" strokeWidth={0} />
              Resume
            </Button>
          ) : (
            <Button type="button" className="min-h-11 min-w-[160px] px-8" onClick={onStart}>
              <Play className="h-4 w-4 fill-current" strokeWidth={0} />
              {mode === 'focus' ? 'Start focus' : 'Start break'}
            </Button>
          )}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {!taskAware ? (
              <Button type="button" variant="secondary" onClick={onReset}>
                <RotateCcw className="h-4 w-4" strokeWidth={2} />
                Reset
              </Button>
            ) : null}
            {hasTask && mode === 'focus' && !taskAware ? (
              <Button type="button" onClick={onCompleteTask}>
                <Check className="h-4 w-4" strokeWidth={2.5} />
                Complete task
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </GlassCard>
  )
}
