import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AtmosphericBackground } from './AtmosphericBackground'
import { DashboardHeader } from '../dashboard/DashboardHeader'
import { MotivationCard } from '../dashboard/MotivationCard'
import { Header } from './Header'
import { HeaderToolbar } from './HeaderToolbar'
import { MobileNavDrawer } from './MobileNavDrawer'
import { MobileShellBar } from './MobileShellBar'
import { Sidebar } from './Sidebar'

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const isDashboard = useLocation().pathname === '/dashboard'

  const contentOffsetClass = sidebarCollapsed
    ? 'lg:left-[calc(88px+1rem)]'
    : 'lg:left-[calc(268px+1rem)]'
  const contentMarginClass = sidebarCollapsed
    ? 'lg:ml-[calc(88px+1rem)]'
    : 'lg:ml-[calc(268px+1rem)]'

  return (
    <div className="relative min-h-screen">
      <AtmosphericBackground />

      <div className="relative z-10 min-h-screen">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        />

        <MobileShellBar onOpenMenu={() => setMobileNavOpen(true)} />
        <MobileNavDrawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

        <div
          className={[
            'pointer-events-none fixed left-0 top-[calc(1rem+3px)] z-[150] flex justify-end px-4 transition-[left] duration-[220ms] ease-out sm:px-6 lg:top-4 lg:px-8',
            contentOffsetClass,
            'right-0',
          ].join(' ')}
          aria-label="Account and notifications"
        >
          <div className="pointer-events-auto">
            <HeaderToolbar layout={isDashboard ? 'dashboard' : 'inline'} />
          </div>
        </div>

        <div
          className={[
            'flex min-h-screen min-w-0 flex-col overflow-x-hidden overflow-y-auto bg-transparent px-4 pb-4 pt-14 transition-[margin] duration-[220ms] ease-out sm:px-6 sm:pt-[3.75rem] lg:px-8',
            contentMarginClass,
          ].join(' ')}
        >
          {isDashboard ? (
            <div className="dashboard-shell-header app-header-toolbar-row mb-1 shrink-0 sm:mb-2">
              <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,340px)] lg:items-start lg:gap-x-6">
                <DashboardHeader
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
                <div className="dashboard-header-meta flex min-w-0 flex-col items-stretch self-start max-lg:w-full lg:items-end">
                  <div className="dashboard-header-quote flex max-lg:justify-stretch lg:justify-end">
                    <MotivationCard />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          <main
            className={
              isDashboard ? 'flex-1 pb-6 max-lg:mt-0 lg:-mt-[36px]' : 'flex-1 pb-8'
            }
          >
            <Outlet context={{ searchQuery, setSearchQuery }} />
          </main>
        </div>
      </div>
    </div>
  )
}
