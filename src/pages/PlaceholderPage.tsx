import { Sparkles } from 'lucide-react'
import { GlassCard } from '../components/layout/GlassCard'

interface PlaceholderPageProps {
  title: string
  description?: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="animate-fade-up opacity-0">
      <GlassCard className="mx-auto max-w-lg p-10 text-center" animate={false}>
        <Sparkles className="mx-auto mb-4 h-8 w-8 text-primary-cyan" strokeWidth={1.5} />
        <h1 className="text-2xl font-semibold text-text-main">{title}</h1>
        <p className="mt-2 text-text-secondary">
          {description ?? 'This section is coming soon. Stay tuned.'}
        </p>
      </GlassCard>
    </div>
  )
}
