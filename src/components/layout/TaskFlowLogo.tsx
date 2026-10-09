export function TaskFlowLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-center ${compact ? 'justify-center' : 'gap-3'}`}>
      <div
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{
          background:
            'linear-gradient(135deg, rgba(37,200,255,0.25) 0%, rgba(123,77,255,0.2) 100%)',
          boxShadow: '0 0 20px rgba(32,140,255,0.25)',
          border: '1px solid rgba(65,180,255,0.4)',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden>
          <path d="M16 4L6 18h7l-3 10 14-16h-7l3-8z" fill="url(#logoGrad)" />
          <defs>
            <linearGradient id="logoGrad" x1="6" y1="28" x2="26" y2="4">
              <stop stopColor="#25C8FF" />
              <stop offset="1" stopColor="#7B4DFF" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {!compact && (
        <span className="whitespace-nowrap text-base font-bold leading-tight tracking-wide text-text-main sm:text-lg">
          Task Manager
        </span>
      )}
    </div>
  )
}
