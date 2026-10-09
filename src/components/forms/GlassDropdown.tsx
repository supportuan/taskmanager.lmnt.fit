import { ChevronDown } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

export interface GlassDropdownOption {
  value: string
  label: string
}

interface GlassDropdownProps {
  id: string
  value: string
  options: GlassDropdownOption[]
  onChange: (value: string) => void
  className?: string
  'aria-live'?: 'off' | 'polite' | 'assertive'
}

export function GlassDropdown({
  id,
  value,
  options,
  onChange,
  className = '',
  'aria-live': ariaLive,
}: GlassDropdownProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  const selected = options.find((o) => o.value === value) ?? options[0]

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className={`glass-dropdown relative min-w-0 ${className}`}>
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="glass-input-field glass-dropdown-trigger flex h-11 w-full items-center justify-between rounded-xl border px-3.5 text-left text-[13px] text-text-main"
        aria-live={ariaLive}
      >
        <span className="truncate">{selected?.label ?? 'Select'}</span>
        <ChevronDown
          className={[
            'ml-2 h-4 w-4 shrink-0 text-text-muted transition-transform duration-200',
            open ? 'rotate-180' : '',
          ].join(' ')}
          strokeWidth={2}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={id}
          className="glass-dropdown-menu absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-52 overflow-y-auto rounded-xl p-1"
        >
          {options.map((opt) => {
            const active = opt.value === value
            return (
              <li key={opt.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(opt.value)
                    setOpen(false)
                  }}
                  className={[
                    'glass-dropdown-option w-full rounded-lg px-3 py-2 text-left text-[13px] transition-colors duration-150',
                    active
                      ? 'glass-dropdown-option-active text-white'
                      : 'text-text-secondary hover:text-text-main',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
