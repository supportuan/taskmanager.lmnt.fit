import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AtmosphericBackground } from './AtmosphericBackground'
import { DashboardHeader } from '../dashboard/DashboardHeader'
import { MotivationCard } from '../dashboard/MotivationCard'
import { Header } from './Header'
import { HeaderToolbar } from './HeaderToolbar'
import { Sidebar } from './Sidebar'

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const isDashboard = useLocation().pathname === '/dashboard'

  const contentOffsetClass = sidebarCollapsed
    ? 'left-[calc(88px+1rem)]'
    : 'left-[calc(268px+1rem)]'

  return (
    <div className="relative min-h-screen">
      <AtmosphericBackground />

      <div className="relative z-10 min-h-screen">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        />

        <div
          className={[
            'fixed top-4 z-[150] flex justify-end px-4 transition-[left] duration-[220ms] ease-out sm:px-6 lg:px-8',
            contentOffsetClass,
            'right-0',
          ].join(' ')}
          aria-label="Account and notifications"
        >
          <HeaderToolbar layout={isDashboard ? 'dashboard' : 'inline'} />
        </div>

        <div
          className={[
            'flex min-h-screen min-w-0 flex-col overflow-y-auto bg-transparent px-4 pb-4 pt-14 transition-[margin] duration-[220ms] ease-out sm:px-6 sm:pt-[3.75rem] lg:px-8',
            sidebarCollapsed ? 'ml-[calc(88px+1rem)]' : 'ml-[calc(268px+1rem)]',
          ].join(' ')}
        >
          {isDashboard ? (
            <div className="dashboard-shell-header app-header-toolbar-row mb-1 shrink-0 sm:mb-2">
              <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,340px)] lg:items-start lg:gap-x-6">
                <DashboardHeader
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
                <div className="dashboard-header-meta flex min-w-0 flex-col items-end self-start">
                  <div className="dashboard-header-quote flex justify-end">
                    <MotivationCard />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          <main className={isDashboard ? '-mt-[36px] flex-1 pb-6' : 'flex-1 pb-8'}>
            <Outlet context={{ searchQuery, setSearchQuery }} />
          </main>
        </div>
      </div>
    </div>
  )
}
