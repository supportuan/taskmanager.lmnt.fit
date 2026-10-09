import { Lightbulb, Sparkles } from 'lucide-react'
import type { ProductivityInsight } from '../../types/analytics'
import { GlassCard } from '../layout/GlassCard'

interface ProductivityInsightsProps {
  insights: ProductivityInsight[]
  productivityScore: number | null
}

function insightAccent(tone: ProductivityInsight['tone']): string {
  if (tone === 'positive') return '#2DD4A3'
  if (tone === 'negative') return '#F5B544'
  return '#25C8FF'
}

export function ProductivityInsights({
  insights,
  productivityScore,
}: ProductivityInsightsProps) {
  const scoreAccent = '#7B4DFF'
  const gridItems = insights.length === 0 && productivityScore == null

  return (
    <section aria-labelledby="productivity-insights-heading" className="min-w-0">
      <div className="mb-3">
        <h2
          id="productivity-insights-heading"
          className="text-lg font-semibold text-text-main"
        >
          Productivity Insights
        </h2>
        <p className="text-xs text-text-muted">Patterns from your recent work.</p>
      </div>

      {gridItems ? (
        <GlassCard tier="secondary" className="p-6 text-sm text-text-muted">
          Complete a few more tasks in this range to unlock tailored insights.
        </GlassCard>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {productivityScore != null ? (
            <GlassCard
              tier="secondary"
              className="flex min-h-[88px] gap-3 p-4"
              style={{ animationDelay: '0.1s' }}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: `${scoreAccent}18`,
                  border: `1px solid ${scoreAccent}35`,
                }}
              >
                <Sparkles className="h-4 w-4 text-[#7B4DFF]" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex flex-1 flex-col justify-center">
                <h3 className="text-sm font-semibold text-text-main">Productivity score</h3>
                <p className="mt-1 text-2xl font-semibold leading-tight tracking-tight text-text-main">
                  {productivityScore}
                  <span className="text-sm font-normal text-text-muted"> / 100</span>
                </p>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                  Completion, efficiency, and consistency in this period.
                </p>
              </div>
            </GlassCard>
          ) : null}
          {insights.map((item, idx) => {
            const accent = insightAccent(item.tone)
            const delayIdx = productivityScore != null ? idx + 1 : idx
            return (
              <GlassCard
                key={item.id}
                tier="secondary"
                className="flex min-h-[88px] gap-3 p-4"
                style={{ animationDelay: `${0.1 + delayIdx * 0.04}s` }}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: `${accent}18`,
                    border: `1px solid ${accent}35`,
                  }}
                >
                  <Lightbulb className="h-4 w-4" style={{ color: accent }} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-text-main">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-text-secondary">{item.body}</p>
                </div>
              </GlassCard>
            )
          })}
        </div>
      )}
    </section>
  )
}
