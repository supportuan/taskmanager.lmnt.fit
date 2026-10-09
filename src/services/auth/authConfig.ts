/** When `true`, use browser-only credential store (offline dev). Default: Spring Boot API. */
export function isLocalAuthEnabled(): boolean {
  return import.meta.env.VITE_USE_LOCAL_AUTH === 'true'
}

export function isBackendAuthEnabled(): boolean {
  return !isLocalAuthEnabled()
}
