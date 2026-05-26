import { NextResponse } from 'next/server'
import { clearAdminAuthCookie } from '@/lib/api-auth'

export async function POST() {
  const response = NextResponse.json({ success: true })
  clearAdminAuthCookie(response)
  return response
}
