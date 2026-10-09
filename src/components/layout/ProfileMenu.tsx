import { Camera, ChevronDown, LogOut } from 'lucide-react'
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useProfileAvatar } from '../../hooks/useProfileAvatar'

const MENU_WIDTH = 280
const MENU_GAP = 10

export function ProfileMenu() {
  const { user, logout } = useAuth()
  const { avatarUrl, changeAvatarFromFile, avatarError } = useProfileAvatar()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const menuId = useId()

  const updateMenuPosition = () => {
    const trigger = triggerRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    const width = Math.min(MENU_WIDTH, window.innerWidth - 16)
    const left = Math.min(
      Math.max(8, rect.right - width),
      window.innerWidth - width - 8,
    )
    setMenuPos({
      top: rect.bottom + MENU_GAP,
      left,
    })
  }

  useLayoutEffect(() => {
    if (!open) {
      setMenuPos(null)
      return
    }
    updateMenuPosition()
    window.addEventListener('resize', updateMenuPosition)
    window.addEventListener('scroll', updateMenuPosition, true)
    return () => {
      window.removeEventListener('resize', updateMenuPosition)
      window.removeEventListener('scroll', updateMenuPosition, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return
      }
      setOpen(false)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const onPickPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    void changeAvatarFromFile(file)
    event.target.value = ''
  }

  const menuPanel =
    open && menuPos
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="dialog"
            aria-label="Profile menu"
            className="glass-panel fixed z-[200] w-[min(280px,calc(100vw-2rem))] rounded-2xl p-4 shadow-[0_16px_48px_rgba(0,0,0,0.45)] animate-fade-up"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <span className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/15">
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-main">
                  {user?.name ?? 'TaskFlow user'}
                </p>
                <p className="truncate text-xs text-text-muted">{user?.email ?? ''}</p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={onPickPhoto}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.05] px-3 py-2.5 text-sm font-medium text-text-main transition hover:border-[rgba(110,180,255,0.35)] hover:bg-white/[0.08]"
            >
              <Camera className="h-4 w-4 text-primary-cyan" strokeWidth={1.75} />
              Change profile picture
            </button>
            {avatarError ? (
              <p className="mt-2 text-center text-xs text-danger">{avatarError}</p>
            ) : null}
            <button
              type="button"
              onClick={async () => {
                setOpen(false)
                await logout()
                navigate('/login', { replace: true })
              }}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2.5 text-sm font-medium text-text-secondary transition hover:border-[rgba(110,180,255,0.35)] hover:bg-white/[0.06] hover:text-text-main"
            >
              <LogOut className="h-4 w-4 text-primary-cyan" strokeWidth={1.75} />
              Sign out
            </button>
          </div>,
          document.body,
        )
      : null

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        className="group relative z-[100] flex items-center gap-1 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue"
      >
        <span className="h-11 w-11 overflow-hidden rounded-full border-2 border-[rgba(65,180,255,0.5)] shadow-glowBlue transition group-hover:border-[rgba(65,180,255,0.75)]">
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        </span>
        <ChevronDown
          className={[
            'hidden h-4 w-4 text-text-muted transition-transform sm:block',
            open ? 'rotate-180' : '',
          ].join(' ')}
          strokeWidth={2}
        />
      </button>
      {menuPanel}
    </>
  )
}
