import {
  Bell,
  Calendar,
  Clock,
  ClipboardList,
  Flag,
  Grid2X2,
  Plus,
  Repeat,
  Sparkles,
  Tag,
  Timer,
  Trash2,
  X,
} from 'lucide-react'
import {
  DURATION_OPTIONS,
  RECURRENCE_OPTIONS,
  REMINDER_OPTIONS,
  TASK_CATEGORIES,
} from '../../data/addTaskOptions'
import type { AddTaskFormErrors, AddTaskFormState } from '../../types/addTaskForm'
import type { TaskPriority } from '../../types/task'
import { Button } from '../common/Button'
import { FormField } from '../forms/FormField'
import { GlassDropdown } from '../forms/GlassDropdown'
import { GlassCard } from '../layout/GlassCard'

interface AddTaskFormCardProps {
  form: AddTaskFormState
  durationSelectValue: number
  errors: AddTaskFormErrors
  tagDraft: string
  createSuccess: boolean
  isSubmitting?: boolean
  onTagDraftChange: (value: string) => void
  onAddTag: (value: string) => void
  onRemoveTag: (tag: string) => void
  onChange: <K extends keyof AddTaskFormState>(key: K, value: AddTaskFormState[K]) => void
  onClear: () => void
  onCreate: () => void | Promise<boolean>
}

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export function AddTaskFormCard({
  form,
  durationSelectValue,
  errors,
  tagDraft,
  createSuccess,
  isSubmitting = false,
  onTagDraftChange,
  onAddTag,
  onRemoveTag,
  onChange,
  onClear,
  onCreate,
}: AddTaskFormCardProps) {
  return (
    <GlassCard
      tier="accent"
      className="add-task-form-card add-task-form-card-sized relative flex max-h-[725px] w-full max-w-[675px] flex-col overflow-hidden"
      glow="blue"
      style={{ animationDelay: '0.08s' }}
    >
      <div
        className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full opacity-20 blur-3xl"
        style={{ background: '#208CFF' }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-12 bottom-0 h-40 w-40 rounded-full opacity-15 blur-3xl"
        style={{ background: '#FF6B6B' }}
        aria-hidden
      />

      <div className="add-task-form-fields relative flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-[26px] pb-[22px] pt-[26px]">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.05] shadow-[0_0_12px_rgba(32,140,255,0.1)]">
            <ClipboardList className="h-4 w-4 text-primary-cyan" strokeWidth={1.75} />
          </div>
          <h2 className="text-[15px] font-semibold tracking-tight text-white">Task Details</h2>
        </div>

        <FormField
          label="Task Title"
          htmlFor="task-title"
          required
          error={errors.title}
          className="add-task-field"
        >
          <div className="relative">
            <input
              id="task-title"
              type="text"
              value={form.title}
              onChange={(e) => onChange('title', e.target.value)}
              placeholder="e.g. Build Login API"
              className="glass-input glass-input-field add-task-control h-11 w-full rounded-xl px-3.5 pr-10 text-[13px]"
              autoComplete="off"
            />
            <Sparkles
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent-purple/80"
              strokeWidth={1.75}
              aria-hidden
            />
          </div>
        </FormField>

        <FormField label="Description" htmlFor="task-description" className="add-task-field">
          <textarea
            id="task-description"
            value={form.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Add a description (optional)..."
            rows={3}
            className="glass-textarea glass-input-field add-task-control min-h-[72px] w-full resize-none rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed"
          />
        </FormField>

        <div className="task-field-grid-3 add-task-form-row">
          <FormField label="Date" htmlFor="task-date" icon={Calendar} required error={errors.date}>
            <input
              id="task-date"
              type="date"
              value={form.date}
              onChange={(e) => onChange('date', e.target.value)}
              className="glass-input glass-input-field add-task-control glass-input-date h-11 w-full rounded-xl px-3 text-[13px]"
            />
          </FormField>

          <FormField
            label="Start Time"
            htmlFor="task-start"
            icon={Clock}
            required
            error={errors.startTime}
          >
            <input
              id="task-start"
              type="time"
              value={form.startTime}
              onChange={(e) => onChange('startTime', e.target.value)}
              className="glass-input glass-input-field add-task-control glass-input-time h-11 w-full rounded-xl px-3 text-[13px]"
            />
          </FormField>

          <FormField
            label="End Time"
            htmlFor="task-end"
            icon={Clock}
            required
            error={errors.endTime}
          >
            <input
              id="task-end"
              type="time"
              value={form.endTime}
              onChange={(e) => onChange('endTime', e.target.value)}
              className="glass-input glass-input-field add-task-control glass-input-time h-11 w-full rounded-xl px-3 text-[13px]"
            />
          </FormField>
        </div>

        <div className="task-field-grid-3 add-task-form-row">
          <FormField label="Duration" htmlFor="task-duration" icon={Timer}>
            <GlassDropdown
              id="task-duration"
              value={String(durationSelectValue)}
              onChange={(v) => onChange('durationMinutes', Number(v))}
              options={DURATION_OPTIONS.map((opt) => ({
                value: String(opt.value),
                label: opt.label,
              }))}
              aria-live="polite"
            />
          </FormField>

          <FormField label="Priority" htmlFor="task-priority" icon={Flag}>
            <GlassDropdown
              id="task-priority"
              value={form.priority}
              onChange={(v) => onChange('priority', v as TaskPriority)}
              options={PRIORITY_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
            />
          </FormField>

          <FormField label="Category" htmlFor="task-category" icon={Grid2X2}>
            <GlassDropdown
              id="task-category"
              value={form.category}
              onChange={(v) => onChange('category', v)}
              options={TASK_CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
            />
          </FormField>
        </div>

        <div className="task-field-grid-3 add-task-form-row">
          <FormField label="Reminder" htmlFor="task-reminder" icon={Bell}>
            <GlassDropdown
              id="task-reminder"
              value={form.reminder}
              onChange={(v) => onChange('reminder', v as AddTaskFormState['reminder'])}
              options={REMINDER_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
            />
          </FormField>

          <FormField label="Recurrence" htmlFor="task-recurrence" icon={Repeat}>
            <GlassDropdown
              id="task-recurrence"
              value={form.recurrence}
              onChange={(v) => onChange('recurrence', v as AddTaskFormState['recurrence'])}
              options={RECURRENCE_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
            />
          </FormField>

          <FormField label="Tags" htmlFor="task-tags" icon={Tag}>
            <input
              id="task-tags"
              type="text"
              value={tagDraft}
              onChange={(e) => onTagDraftChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  onAddTag(tagDraft)
                }
              }}
              onBlur={() => onAddTag(tagDraft)}
              placeholder="Add tags..."
              className="glass-input glass-input-field add-task-control h-11 w-full rounded-xl px-3.5 text-[13px]"
            />
            {form.tags.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-2">
                {form.tags.map((tag) => (
                  <li key={tag}>
                    <span className="tag-pill">
                      {tag}
                      <button
                        type="button"
                        onClick={() => onRemoveTag(tag)}
                        className="tag-pill-remove"
                        aria-label={`Remove tag ${tag}`}
                      >
                        <X className="h-3 w-3" strokeWidth={2.5} />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </FormField>
        </div>

        {errors.form && (
          <p
            className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-medium text-danger"
            role="alert"
          >
            {errors.form}
          </p>
        )}

        {createSuccess && (
          <p className="text-xs font-medium text-success" role="status">
            Task created successfully.
          </p>
        )}

        <div className="add-task-form-footer mt-1 flex items-center justify-between gap-3 pt-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClear}
            className="h-10 px-4 py-2 text-[13px]"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            Clear
          </Button>
          <Button
            type="button"
            onClick={() => void onCreate()}
            disabled={isSubmitting}
            className="add-task-create-btn h-10 px-5 text-[13px]"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            {isSubmitting ? 'Creating…' : 'Create Task'}
          </Button>
        </div>
      </div>
    </GlassCard>
  )
}
