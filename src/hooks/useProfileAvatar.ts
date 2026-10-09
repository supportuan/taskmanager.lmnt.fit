import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  defaultAvatarUrl,
  getStoredProfileAvatar,
  readImageFileAsDataUrl,
  setStoredProfileAvatar,
} from '../utils/profileAvatarStorage'

export function useProfileAvatar() {
  const { user } = useAuth()
  const userId = user?.id != null ? String(user.id) : null
  const seed = user?.email ?? user?.name ?? userId ?? 'taskflow-user'

  const [avatarUrl, setAvatarUrl] = useState(() =>
    userId ? getStoredProfileAvatar(userId) ?? defaultAvatarUrl(seed) : defaultAvatarUrl(seed),
  )
  const [avatarError, setAvatarError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setAvatarUrl(defaultAvatarUrl(seed))
      setAvatarError(null)
      return
    }
    const stored = getStoredProfileAvatar(userId)
    setAvatarUrl(stored ?? defaultAvatarUrl(seed))
    setAvatarError(null)
  }, [userId, seed])

  const changeAvatarFromFile = useCallback(
    async (file: File) => {
      if (!userId) return
      setAvatarError(null)
      try {
        const dataUrl = await readImageFileAsDataUrl(file)
        const saved = setStoredProfileAvatar(userId, dataUrl)
        if (!saved) {
          setAvatarError('Image is too large. Try a smaller file (under 2 MB).')
          return
        }
        setAvatarUrl(dataUrl)
      } catch {
        setAvatarError('Could not load that image. Please try another file.')
      }
    },
    [userId],
  )

  return { avatarUrl, changeAvatarFromFile, avatarError }
}
