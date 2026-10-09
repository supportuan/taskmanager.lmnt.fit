import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DURATION_OPTIONS } from '../data/addTaskOptions'
import { ApiError } from '../services/api'
import { createTask } from '../services/taskService'
import type { AddTaskFormErrors, AddTaskFormState } from '../types/addTaskForm'
import { mapAddTaskFormToCreatePayload } from '../utils/addTaskApiMapper'
import { formatISODate, isValidISODateString } from '../utils/dateUtils'
import { notifyTasksChanged } from '../utils/taskEvents'
import {
  durationMinutesFromRange,
  endTimeFromDuration,
} from '../utils/timeFormUtils'

const DEFAULT_DURATION = 60

const INITIAL: AddTaskFormState = {
  title: '',
  description: '',
  date: formatISODate(new Date()),
  startTime: '10:30',
  endTime: endTimeFromDuration('10:30', DEFAULT_DURATION),
  durationMinutes: DEFAULT_DURATION,
  priority: 'medium',
  category: 'Development',
  tags: [],
  reminder: 'none',
  recurrence: 'none',
}

function closestDurationPreset(minutes: number): number {
  const presets = DURATION_OPTIONS.map((o) => o.value)
  return presets.reduce((best, value) =>
    Math.abs(value - minutes) < Math.abs(best - minutes) ? value : best,
  )
}

function validate(state: AddTaskFormState): AddTaskFormErrors {
  const errors: AddTaskFormErrors = {}
  if (!state.title.trim()) {
    errors.title = 'Task title is required.'
  }
  if (!state.date) {
    errors.date = 'Date is required.'
  }
  if (!state.startTime) {
    errors.startTime = 'Start time is required.'
  }
  if (!state.endTime) {
    errors.endTime = 'End time is required.'
  }
  if (
    state.date &&
    state.startTime &&
    state.endTime &&
    durationMinutesFromRange(state.date, state.startTime, state.endTime) === null
  ) {
    errors.endTime = 'End time must be after start time.'
  }
  return errors
}

function mapBackendValidationErrors(errors: Record<string, string>): AddTaskFormErrors {
  const mapped: AddTaskFormErrors = {}
  if (errors.title) mapped.title = errors.title
  if (errors.taskDate) mapped.date = errors.taskDate
  if (errors.startTime) mapped.startTime = errors.startTime
  if (errors.endTime) mapped.endTime = errors.endTime
  if (errors.plannedDuration) mapped.form = errors.plannedDuration
  if (errors.description) mapped.form = errors.description
  if (errors.priority) mapped.form = errors.priority
  if (errors.category) mapped.form = errors.category
  return mapped
}

function initialFormState(dateFromQuery: string | null): AddTaskFormState {
  if (dateFromQuery && isValidISODateString(dateFromQuery)) {
    return { ...INITIAL, date: dateFromQuery }
  }
  return { ...INITIAL }
}

export function useAddTaskForm() {
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState<AddTaskFormState>(() =>
    initialFormState(searchParams.get('date')),
  )
  const [tagDraft, setTagDraft] = useState('')
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverErrors, setServerErrors] = useState<AddTaskFormErrors>({})

  useEffect(() => {
    const dateParam = searchParams.get('date')
    const nextDate =
      dateParam && isValidISODateString(dateParam)
        ? dateParam
        : formatISODate(new Date())
    setForm((prev) => (prev.date === nextDate ? prev : { ...prev, date: nextDate }))
  }, [searchParams])

  const clientErrors = useMemo(() => validate(form), [form])

  const updateField = useCallback(
    <K extends keyof AddTaskFormState>(key: K, value: AddTaskFormState[K]) => {
      setCreateSuccess(false)
      setServerErrors({})
      setForm((prev) => {
        if (key === 'durationMinutes') {
          const minutes = value as number
          return {
            ...prev,
            durationMinutes: minutes,
            endTime: endTimeFromDuration(prev.startTime, minutes),
          }
        }
        if (key === 'startTime') {
          const startTime = value as string
          return {
            ...prev,
            startTime,
            endTime: endTimeFromDuration(startTime, prev.durationMinutes),
          }
        }
        if (key === 'endTime') {
          const endTime = value as string
          const computed = durationMinutesFromRange(prev.date, prev.startTime, endTime)
          if (computed === null) {
            return { ...prev, endTime }
          }
          const preset = closestDurationPreset(computed)
          const matchedPreset = DURATION_OPTIONS.some((o) => o.value === computed)
          return {
            ...prev,
            endTime,
            durationMinutes: matchedPreset ? computed : preset,
          }
        }
        return { ...prev, [key]: value }
      })
    },
    [],
  )

  const durationSelectValue = useMemo(() => {
    const exact = DURATION_OPTIONS.find((o) => o.value === form.durationMinutes)
    if (exact) return exact.value
    return closestDurationPreset(form.durationMinutes)
  }, [form.durationMinutes])

  const addTag = useCallback((raw: string) => {
    const tag = raw.trim()
    if (!tag) return
    setForm((prev) => {
      if (prev.tags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
        return prev
      }
      return { ...prev, tags: [...prev.tags, tag] }
    })
    setTagDraft('')
  }, [])

  const removeTag = useCallback((tag: string) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))
  }, [])

  const clearForm = useCallback(() => {
    setForm(INITIAL)
    setTagDraft('')
    setSubmitAttempted(false)
    setCreateSuccess(false)
    setServerErrors({})
    setIsSubmitting(false)
  }, [])

  const submit = useCallback(async () => {
    setSubmitAttempted(true)
    setCreateSuccess(false)
    setServerErrors({})

    const nextErrors = validate(form)
    if (Object.keys(nextErrors).length > 0) {
      return false
    }

    setIsSubmitting(true)
    try {
      await createTask(mapAddTaskFormToCreatePayload(form))
      setCreateSuccess(true)
      notifyTasksChanged()
      return true
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldMapped = error.fieldErrors
          ? mapBackendValidationErrors(error.fieldErrors)
          : {}
        const formMessage =
          error.status === 401
            ? 'Your session expired. Please sign in again.'
            : error.status === 0
              ? error.message
              : (fieldMapped.form ?? error.message)
        setServerErrors({
          ...fieldMapped,
          form: formMessage,
        })
      } else if (error instanceof Error) {
        setServerErrors({
          form: error.message || 'Could not create task. Please try again.',
        })
      } else {
        setServerErrors({ form: 'Could not create task. Please try again.' })
      }
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [form])

  const visibleErrors = submitAttempted ? { ...clientErrors, ...serverErrors } : {}

  return {
    form,
    tagDraft,
    setTagDraft,
    durationSelectValue,
    errors: visibleErrors,
    updateField,
    addTag,
    removeTag,
    clearForm,
    submit,
    createSuccess,
    isSubmitting,
  }
}
