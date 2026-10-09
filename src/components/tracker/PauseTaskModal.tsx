import { Pause, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { TrackerTask } from '../../types/tracker'
import {
  defaultResumeDateIso,
  scheduledResumeAtFromLocal,
} from '../../utils/tracker/scheduledResumeUtils'
import { Button } from '../common/Button'
import { IconButton } from '../common/IconButton'
import { FormField } from '../forms/FormField'

export interface PauseTaskFormValues {
  pauseReason: string
  resumeDateIso: string
  resumeTime24: string
}

interface PauseTaskModalProps {
  task: TrackerTask
  open: boolean
  busy?: boolean
  onClose: () => void
  onConfirm: (values: PauseTaskFormValues) => void
}

export function PauseTaskModal({
  task,
  open,
  busy = false,
  onClose,
  onConfirm,
}: PauseTaskModalProps) {
  const reasonId = useId()
  const dateId = useId()
  const timeId = useId()
  const reasonRef = useRef<HTMLTextAreaElement>(null)
  const [reason, setReason] = useState('')
  const [resumeDate, setResumeDate] = useState(defaultResumeDateIso)
  const [resumeTime, setResumeTime] = useState('10:30')
  const [errors, setErrors] = useState<{ reason?: string; date?: string; time?: string }>({})

  useEffect(() => {
    if (!open) return
    setReason('')
    setResumeDate(defaultResumeDateIso())
    setResumeTime('10:30')
    setErrors({})
    const t = window.setTimeout(() => reasonRef.current?.focus(), 50)
    return () => window.clearTimeout(t)
  }, [open, task.id])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, busy])

  if (!open) return null

  const validate = (): boolean => {
    const next: typeof errors = {}
    if (!reason.trim()) next.reason = 'Please enter a reason for pausing.'
    if (!resumeDate) next.date = 'Resume date is required.'
    if (!resumeTime.trim()) next.time = 'Resume time is required.'
    else if (!scheduledResumeAtFromLocal(resumeDate, resumeTime)) {
      next.time = 'Enter a valid resume time.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleConfirm = () => {
    if (!validate()) return
    onConfirm({
      pauseReason: reason.trim(),
      resumeDateIso: resumeDate,
      resumeTime24: resumeTime,
    })
  }

  return createPortal(
    <div
      className="completion-modal-root fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(4,10,28,0.62)] backdrop-blur-md"
        aria-label="Close pause dialog"
        onClick={() => {
          if (!busy) onClose()
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pause-modal-title"
        className="completion-modal-panel relative z-10 w-full max-w-lg animate-fade-up rounded-glass border border-[rgba(145,200,255,0.22)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45),0_0_40px_rgba(32,140,255,0.12)] sm:p-7"
        style={{
          background: 'rgba(8, 18, 42, 0.72)',
          backdropFilter: 'blur(28px) saturate(1.35)',
        }}
      >
        <div className="absolute right-4 top-4">
          <IconButton label="Close" onClick={onClose} disabled={busy}>
            <X className="h-4 w-4" strokeWidth={2} />
          </IconButton>
        </div>

        <div className="mb-5 flex items-start gap-3 pr-8">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: 'rgba(245, 181, 68, 0.14)',
              boxShadow: '0 0 20px rgba(245, 181, 68, 0.2)',
            }}
          >
            <Pause className="h-5 w-5 text-warning" strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-warning">Pause task</p>
            <h2 id="pause-modal-title" className="mt-1 text-xl font-semibold text-white">
              {task.title}
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Why are you pausing this task? When do you plan to resume?
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <FormField label="Why are you pausing this task?" htmlFor={reasonId} required>
            <textarea
              ref={reasonRef}
              id={reasonId}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Brief reason for pausing..."
              rows={3}
              className="glass-textarea glass-input-field w-full resize-none rounded-xl px-3.5 py-2.5 text-sm leading-relaxed"
              aria-invalid={Boolean(errors.reason)}
            />
            {errors.reason ? (
              <p className="mt-1 text-xs text-danger" role="alert">
                {errors.reason}
              </p>
            ) : null}
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="When will you resume? — Date" htmlFor={dateId} required>
              <input
                id={dateId}
                type="date"
                value={resumeDate}
                onChange={(e) => setResumeDate(e.target.value)}
                className="glass-input glass-input-field h-11 w-full rounded-xl px-3 text-sm"
                aria-invalid={Boolean(errors.date)}
              />
              {errors.date ? (
                <p className="mt-1 text-xs text-danger" role="alert">
                  {errors.date}
                </p>
              ) : null}
            </FormField>

            <FormField label="Time" htmlFor={timeId} required>
              <input
                id={timeId}
                type="time"
                value={resumeTime}
                onChange={(e) => setResumeTime(e.target.value)}
                className="glass-input glass-input-field h-11 w-full rounded-xl px-3 text-sm"
                aria-invalid={Boolean(errors.time)}
              />
              {errors.time ? (
                <p className="mt-1 text-xs text-danger" role="alert">
                  {errors.time}
                </p>
              ) : null}
            </FormField>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={busy}>
            {busy ? 'Pausing…' : 'Pause Task'}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
