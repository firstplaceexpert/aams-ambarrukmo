'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DEMO_USERS } from '@/lib/demo/mock-data'

const COOKIE_NAME = 'aams_demo_session'

export async function loginDemo(email: string, redirectTo = '/dashboard') {
  const user = DEMO_USERS[email] || DEMO_USERS['admin@ambarrukmo.co.id']
  const cookieStore = await cookies()

  // Save demo user info in session cookie
  cookieStore.set(COOKIE_NAME, JSON.stringify({
    email: user.email,
    id: user.id,
  }), {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
  })

  return { success: true, redirectTo }
}

export async function logoutDemo() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  return { success: true }
}

export async function getDemoSession() {
  const cookieStore = await cookies()
  const raw = cookieStore.get(COOKIE_NAME)?.value
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    return DEMO_USERS[parsed.email] || DEMO_USERS['admin@ambarrukmo.co.id']
  } catch {
    return null
  }
}
