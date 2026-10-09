import { MOUNTAIN_BACKGROUND_URL } from '../../config/background'

const MOUNTAIN_BG = MOUNTAIN_BACKGROUND_URL

export function AtmosphericBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* Layer 0 — base */}
      <div className="absolute inset-0 bg-[#030817]" />

      {/* Layer 1–5 — photographic mountain landscape (environment only) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${MOUNTAIN_BG})`,
          backgroundPosition: '48% 38%',
        }}
      />

      {/* Sky grade — keeps upper area dark, lets peaks read through content zone */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg,
              rgba(3, 8, 23, 0.55) 0%,
              rgba(3, 8, 23, 0.12) 28%,
              rgba(3, 8, 23, 0.05) 48%,
              rgba(3, 8, 23, 0.15) 72%,
              rgba(3, 8, 23, 0.35) 100%
            )
          `,
        }}
      />

      {/* Layer 2 — blue atmosphere (left / center, subtle) */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 55% 45% at 18% 72%, rgba(27, 111, 255, 0.22) 0%, transparent 58%),
            radial-gradient(ellipse 50% 40% at 48% 58%, rgba(22, 136, 255, 0.12) 0%, transparent 55%)
          `,
        }}
      />

      {/* Layer 3 — purple upper-right atmosphere */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 65% 55% at 82% 12%, rgba(124, 77, 255, 0.2) 0%, transparent 62%),
            radial-gradient(ellipse 45% 40% at 92% 22%, rgba(185, 85, 255, 0.1) 0%, transparent 55%)
          `,
        }}
      />

      {/* Layer 6 — stars */}
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 12% 14%, rgba(255,255,255,0.28) 0%, transparent 100%),
            radial-gradient(1px 1px at 24% 9%, rgba(200,220,255,0.22) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 36% 16%, rgba(255,255,255,0.25) 0%, transparent 100%),
            radial-gradient(1px 1px at 51% 11%, rgba(255,255,255,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 68% 8%, rgba(180,210,255,0.24) 0%, transparent 100%),
            radial-gradient(1px 1px at 79% 15%, rgba(255,255,255,0.18) 0%, transparent 100%),
            radial-gradient(1px 1px at 88% 10%, rgba(255,255,255,0.22) 0%, transparent 100%)
          `,
        }}
      />

      {/* Layer 7 — vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 95% 88% at 50% 45%, transparent 0%, rgba(3, 8, 23, 0.15) 68%, rgba(3, 8, 23, 0.5) 100%)
          `,
        }}
      />
    </div>
  )
}
