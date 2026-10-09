import { AnalyticsEmptyState } from '../components/analytics/AnalyticsEmptyState'
import { AnalyticsHeader } from '../components/analytics/AnalyticsHeader'
import { AnalyticsTasksErrorState } from '../components/analytics/AnalyticsTasksErrorState'
import { CompletionAnalytics } from '../components/analytics/CompletionAnalytics'
import { ProductivityInsights } from '../components/analytics/ProductivityInsights'
import { ProductivityOverview } from '../components/analytics/ProductivityOverview'
import { TimeAnalyticsSection } from '../components/analytics/TimeAnalyticsSection'
import { useAnalyticsPage } from '../hooks/useAnalyticsPage'

export function Analytics() {
  const {
    filter,
    setRangePreset,
    setCustomDates,
    customRangeInvalid,
    overview,
    completion,
    time,
    insights,
    productivityScore,
    tasksLoading,
    tasksLoadError,
    retryLoadTasks,
    showEmpty,
  } = useAnalyticsPage()

  return (
    <div className="flex w-full min-w-0 flex-col gap-5 pb-4 xl:gap-6">
      <AnalyticsHeader
        filter={filter}
        onPreset={setRangePreset}
        onCustomDates={setCustomDates}
        invalidCustom={customRangeInvalid}
      />

      {tasksLoading ? (
        <p className="py-12 text-center text-sm text-text-muted">Loading analytics…</p>
      ) : tasksLoadError ? (
        <AnalyticsTasksErrorState
          message={tasksLoadError}
          onRetry={retryLoadTasks}
          retrying={tasksLoading}
        />
      ) : showEmpty ? (
        <AnalyticsEmptyState />
      ) : (
        <>
          <ProductivityOverview overview={overview} productivityScore={productivityScore} />
          <CompletionAnalytics completion={completion} />
          <TimeAnalyticsSection time={time} />
          <ProductivityInsights insights={insights} productivityScore={productivityScore} />
        </>
      )}
    </div>
  )
}
