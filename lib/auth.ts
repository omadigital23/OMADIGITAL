import crypto from 'crypto'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'admin_session'
const COOKIE_MAX_AGE = 60 * 60 * 8 // 8 hours

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return secret
}

export function hashPasswordWithSalt(password: string, saltHex: string) {
  const salt = Buffer.from(saltHex, 'hex')
  const key = crypto.scryptSync(password, salt, 64)
  return key.toString('hex')
}

function base64url(input: Buffer) {
  return input.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

export function signSession(payload: Record<string, any>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = Buffer.from(JSON.stringify(payload))
  const data = `${base64url(header)}.${base64url(body)}`
  const sig = crypto
    .createHmac('sha256', getJwtSecret())
    .update(data)
    .digest()
  return `${data}.${base64url(sig)}`
}

export function verifySession(token: string | undefined | null) {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [h, b, s] = parts
  const data = `${h}.${b}`
  const expected = base64url(
    crypto
      .createHmac('sha256', getJwtSecret())
      .update(data)
      .digest()
  )
  if (expected !== s) return null
  try {
    const payload = JSON.parse(Buffer.from(b, 'base64').toString('utf8'))
    if (payload.exp && Date.now() / 1000 > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

export function setAdminCookie(username: string) {
  const exp = Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE
  const token = signSession({ sub: username, role: 'admin', exp })
  cookies().set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  })
}

export function clearAdminCookie() {
  cookies().set({ name: COOKIE_NAME, value: '', maxAge: 0, path: '/' })
}

export function getAdminSession() {
  const token = cookies().get(COOKIE_NAME)?.value
  return verifySession(token)
}
