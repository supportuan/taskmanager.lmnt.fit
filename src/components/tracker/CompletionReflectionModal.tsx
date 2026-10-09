import { CheckCircle2, Sparkles, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { TrackerTask } from '../../types/tracker'
import { Button } from '../common/Button'
import { IconButton } from '../common/IconButton'
import { FormField } from '../forms/FormField'

interface CompletionReflectionModalProps {
  task: TrackerTask
  open: boolean
  onClose: () => void
  onSave: (payload: {
    completionSummary?: string
    achievement?: string
    reflectionNote?: string
    skipReflection?: boolean
  }) => void
}

export function CompletionReflectionModal({
  task,
  open,
  onClose,
  onSave,
}: CompletionReflectionModalProps) {
  const summaryId = useId()
  const achievementId = useId()
  const noteId = useId()
  const summaryRef = useRef<HTMLTextAreaElement>(null)
  const [summary, setSummary] = useState('')
  const [achievement, setAchievement] = useState('')
  const [note, setNote] = useState('')
  const [successPulse, setSuccessPulse] = useState(false)

  useEffect(() => {
    if (!open) return
    setSummary('')
    setAchievement('')
    setNote('')
    setSuccessPulse(false)
    const t = window.setTimeout(() => summaryRef.current?.focus(), 50)
    return () => window.clearTimeout(t)
  }, [open, task.id])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const submit = (skipReflection: boolean) => {
    setSuccessPulse(true)
    window.setTimeout(() => {
      onSave({
        completionSummary: summary,
        achievement,
        reflectionNote: note,
        skipReflection,
      })
    }, 650)
  }

  return createPortal(
    <div
      className="completion-modal-root fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(4,10,28,0.62)] backdrop-blur-md"
        aria-label="Close completion dialog"
        onClick={() => {
          if (!successPulse) onClose()
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="completion-modal-title"
        className={[
          'completion-modal-panel relative z-10 w-full max-w-lg animate-fade-up rounded-glass border border-[rgba(145,200,255,0.22)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45),0_0_40px_rgba(32,140,255,0.12)] sm:p-7',
          successPulse ? 'completion-modal-success' : '',
        ].join(' ')}
        style={{
          background: 'rgba(8, 18, 42, 0.72)',
          backdropFilter: 'blur(28px) saturate(1.35)',
        }}
      >
        <div className="absolute right-4 top-4">
          <IconButton label="Close" onClick={onClose}>
            <X className="h-4 w-4" strokeWidth={2} />
          </IconButton>
        </div>

        <div className="mb-5 flex items-start gap-3 pr-8">
          <div
            className={[
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300',
              successPulse ? 'scale-110' : '',
            ].join(' ')}
            style={{
              background: 'rgba(45, 212, 163, 0.14)',
              boxShadow: '0 0 20px rgba(45, 212, 163, 0.25)',
            }}
          >
            {successPulse ? (
              <CheckCircle2 className="h-6 w-6 text-success" strokeWidth={2} />
            ) : (
              <Sparkles className="h-5 w-5 text-primary-cyan" strokeWidth={1.75} />
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-success">
              Task completed
            </p>
            <h2 id="completion-modal-title" className="mt-1 text-xl font-semibold text-white">
              {task.title}
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Nice work. Take a moment to capture what you accomplished.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <FormField label="What did you accomplish?" htmlFor={summaryId} required>
            <textarea
              ref={summaryRef}
              id={summaryId}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Write a short summary of what you completed..."
              rows={3}
              className="glass-textarea glass-input-field w-full resize-none rounded-xl px-3.5 py-2.5 text-sm leading-relaxed"
            />
          </FormField>

          <FormField label="What achievement are you proud of?" htmlFor={achievementId}>
            <textarea
              id={achievementId}
              value={achievement}
              onChange={(e) => setAchievement(e.target.value)}
              placeholder="Did you finish early, solve a difficult problem, learn something new, or reach a milestone?"
              rows={2}
              className="glass-textarea glass-input-field w-full resize-none rounded-xl px-3.5 py-2.5 text-sm leading-relaxed"
            />
          </FormField>

          <FormField label="Notes for next time (optional)" htmlFor={noteId}>
            <textarea
              id={noteId}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What would you improve or remember next time?"
              rows={2}
              className="glass-textarea glass-input-field w-full resize-none rounded-xl px-3.5 py-2.5 text-sm leading-relaxed"
            />
          </FormField>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => submit(true)} disabled={successPulse}>
            Skip
          </Button>
          <Button type="button" onClick={() => submit(false)} disabled={successPulse}>
            Save &amp; Complete
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
