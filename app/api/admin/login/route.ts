import { NextRequest, NextResponse } from 'next/server'
import { setAdminCookie, hashPasswordWithSalt } from '../../../lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    }

    const envUser = process.env.ADMIN_USERNAME
    const envHash = process.env.ADMIN_PASSWORD_HASH
    const envSalt = process.env.ADMIN_SALT
    const envPlain = process.env.ADMIN_PASSWORD

    if (!envUser || (!envPlain && (!envHash || !envSalt))) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
    }

    if (username !== envUser) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    let ok = false
    if (envHash && envSalt) {
      const computed = hashPasswordWithSalt(password, envSalt)
      ok = computed === envHash
    }
    if (!ok && envPlain) {
      ok = password === envPlain
    }
    if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    setAdminCookie(username)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
