export class AuthError extends Error {
  status?: number
  fieldErrors?: Record<string, string>

  constructor(message: string, options?: { status?: number; fieldErrors?: Record<string, string> }) {
    super(message)
    this.name = 'AuthError'
    this.status = options?.status
    this.fieldErrors = options?.fieldErrors
  }
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError
}
