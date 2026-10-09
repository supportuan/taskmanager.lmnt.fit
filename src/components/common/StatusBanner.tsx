interface StatusBannerProps {
  message: string
  tone?: 'success' | 'error'
}

export function StatusBanner({ message, tone = 'success' }: StatusBannerProps) {
  const styles =
    tone === 'error'
      ? 'border-danger/40 bg-danger/10 text-[#ffb8c0]'
      : 'border-[rgba(52,175,255,0.45)] bg-[rgba(32,140,255,0.12)] text-primary-cyan'

  return (
    <div
      role="status"
      className={`glass-panel fixed bottom-6 left-1/2 z-[250] max-w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border px-4 py-3 text-center text-sm font-medium shadow-[0_12px_40px_rgba(0,0,0,0.35)] animate-fade-up ${styles}`}
    >
      {message}
    </div>
  )
}
