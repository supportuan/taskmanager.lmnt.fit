const STORAGE_PREFIX = 'taskflow-profile-avatar-v1:'

const MAX_BYTES = 2 * 1024 * 1024

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`
}

export function getStoredProfileAvatar(userId: string): string | null {
  try {
    const value = localStorage.getItem(storageKey(userId))
    if (!value || !value.startsWith('data:image/')) return null
    return value
  } catch {
    return null
  }
}

export function setStoredProfileAvatar(userId: string, dataUrl: string): boolean {
  try {
    const approxBytes = Math.ceil((dataUrl.length * 3) / 4)
    if (approxBytes > MAX_BYTES) return false
    localStorage.setItem(storageKey(userId), dataUrl)
    return true
  } catch {
    return false
  }
}

export function clearStoredProfileAvatar(userId: string): void {
  try {
    localStorage.removeItem(storageKey(userId))
  } catch {
    /* ignore */
  }
}

export function defaultAvatarUrl(seed: string): string {
  const safeSeed = encodeURIComponent(seed.trim() || 'taskflow-user')
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${safeSeed}&backgroundColor=050b1c`
}

export function readImageFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Unable to read image.'))
    }
    reader.onerror = () => reject(new Error('Unable to read image.'))
    reader.readAsDataURL(file)
  })
}
