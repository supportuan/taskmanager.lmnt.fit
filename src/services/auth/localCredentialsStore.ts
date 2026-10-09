import type { AuthUser, RegisterCredentials } from '../../types/auth'
import { AuthError } from './authErrors'
import { hashPassword, verifyPassword } from './passwordHash'

const STORE_KEY = 'taskflow-auth-users-v1'

interface StoredUserRecord {
  id: string
  email: string
  name: string
  salt: string
  hash: string
  createdAt: string
}

type UserStore = Record<string, StoredUserRecord>

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function readStore(): UserStore {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as UserStore
  } catch {
    return {}
  }
}

function writeStore(store: UserStore): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(store))
}

export async function localRegister(credentials: RegisterCredentials): Promise<AuthUser> {
  const email = normalizeEmail(credentials.email)
  const store = readStore()
  if (store[email]) {
    throw new AuthError('An account with this email already exists.')
  }
  const { salt, hash } = await hashPassword(credentials.password)
  const user: StoredUserRecord = {
    id: crypto.randomUUID(),
    email,
    name: credentials.name.trim(),
    salt,
    hash,
    createdAt: new Date().toISOString(),
  }
  store[email] = user
  writeStore(store)
  return { id: user.id, email: user.email, name: user.name }
}

export async function localLogin(emailInput: string, password: string): Promise<AuthUser> {
  const email = normalizeEmail(emailInput)
  const record = readStore()[email]
  if (!record) {
    throw new AuthError('Invalid email or password.')
  }
  const valid = await verifyPassword(password, record.salt, record.hash)
  if (!valid) {
    throw new AuthError('Invalid email or password.')
  }
  return { id: record.id, email: record.email, name: record.name }
}
