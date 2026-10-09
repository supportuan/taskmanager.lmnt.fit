const PBKDF2_ITERATIONS = 120_000

function toBase64(bytes: ArrayBuffer): string {
  const bin = String.fromCharCode(...new Uint8Array(bytes))
  return btoa(bin)
}

function fromBase64(value: string): Uint8Array {
  const bin = atob(value)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i += 1) {
    bytes[i] = bin.charCodeAt(i)
  }
  return bytes
}

async function deriveKey(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  return crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  )
}

export async function hashPassword(password: string): Promise<{ salt: string; hash: string }> {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16))
  const derived = await deriveKey(password, saltBytes)
  return {
    salt: toBase64(saltBytes.buffer),
    hash: toBase64(derived),
  }
}

export async function verifyPassword(
  password: string,
  saltBase64: string,
  hashBase64: string,
): Promise<boolean> {
  const salt = fromBase64(saltBase64)
  const derived = await deriveKey(password, salt)
  const expected = fromBase64(hashBase64)
  const actual = new Uint8Array(derived)
  if (expected.length !== actual.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i += 1) {
    diff |= expected[i]! ^ actual[i]!
  }
  return diff === 0
}
