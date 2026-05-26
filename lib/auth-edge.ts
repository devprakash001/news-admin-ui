import { jwtVerify } from 'jose'

/** Edge-compatible JWT verify for middleware (jsonwebtoken does not run on Edge) */
export async function verifyAdminTokenEdge(token: string): Promise<{ sub: string } | null> {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET_ADMIN || process.env.JWT_SECRET || 'admin-dev-secret-change-me'
    )
    const { payload } = await jwtVerify(token, secret)
    if (payload.aud && payload.aud !== 'admin') return null
    const sub = typeof payload.sub === 'string' ? payload.sub : null
    if (!sub) return null
    return { sub }
  } catch {
    return null
  }
}
