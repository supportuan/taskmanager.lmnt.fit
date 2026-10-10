import { Bell } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNotifications } from '../../context/NotificationContext'
import { IconButton } from '../common/IconButton'
import { HeaderDateTime } from './HeaderDateTime'
import { NotificationPanel } from './NotificationPanel'
import { ProfileMenu } from './ProfileMenu'

interface HeaderToolbarProps {
  /** Dashboard: date/time inline beside bell and profile. */
  layout?: 'inline' | 'dashboard'
  /** @deprecated Use layout="dashboard" — kept for call-site compatibility. */
  showDateTimeOnMobile?: boolean
}

export function HeaderToolbar({
  layout = 'inline',
  showDateTimeOnMobile = false,
}: HeaderToolbarProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const bellRef = useRef<HTMLButtonElement>(null)
  const { hasUnread } = useNotifications()

  const showInlineDateTime =
    layout === 'dashboard' ||
    (layout === 'inline' && !showDateTimeOnMobile) ||
    (layout === 'inline' && showDateTimeOnMobile)

  const dateTimeClassName =
    layout === 'dashboard'
      ? 'hidden shrink-0 min-[445px]:block'
      : showDateTimeOnMobile
        ? 'shrink-0'
        : 'hidden shrink-0 sm:block'

  const controls = (
    <>
      {showInlineDateTime ? <HeaderDateTime className={dateTimeClassName} /> : null}

      <div className="relative">
        <IconButton
          ref={bellRef}
          label="Notifications"
          aria-expanded={notificationsOpen}
          onClick={() => setNotificationsOpen((open) => !open)}
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </IconButton>
        {hasUnread ? (
          <span
            className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger ring-2 ring-navy"
            aria-hidden
          />
        ) : null}
        <NotificationPanel
          open={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          anchorRef={bellRef}
        />
      </div>

      <ProfileMenu />
    </>
  )

  return (
    <div
      className="app-header-toolbar flex shrink-0 items-center gap-3 sm:gap-4"
      aria-label="Account and notifications"
    >
      {controls}
    </div>
  )
}
