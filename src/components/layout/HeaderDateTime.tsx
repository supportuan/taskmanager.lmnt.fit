import { useEffect, useState } from 'react'
import { formatHeaderDate, formatTime } from '../../utils/dateUtils'

interface HeaderDateTimeProps {
  className?: string
}

export function HeaderDateTime({ className = '' }: HeaderDateTimeProps) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const tick = () => setNow(new Date())
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className={['text-right', className].filter(Boolean).join(' ')}>
      <p className="whitespace-nowrap text-sm font-medium text-text-main">
        {formatHeaderDate(now)}
      </p>
      <p className="whitespace-nowrap text-xs tabular-nums text-text-muted">{formatTime(now)}</p>
    </div>
  )
}
