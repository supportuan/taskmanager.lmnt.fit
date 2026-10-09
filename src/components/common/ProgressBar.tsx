interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  barClassName?: string
}

export function ProgressBar({
  value,
  max = 100,
  className = '',
  barClassName = '',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div
      className={`h-1.5 overflow-hidden rounded-full bg-white/[0.08] shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className={`h-full rounded-full bg-gradient-to-r from-primary-cyan via-primary-blue to-accent-purple shadow-[0_0_10px_rgba(37,200,255,0.35)] transition-all duration-700 ease-out ${barClassName}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
