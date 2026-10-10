import { useEffect, useState } from 'react'

const QUERY = '(max-width: 1023px)'

/** True when viewport is below Tailwind `lg` (1024px) — mobile/tablet shell. */
export function useMediaMaxLg(): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(QUERY).matches : false,
  )

  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const onChange = () => setMatches(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return matches
}
