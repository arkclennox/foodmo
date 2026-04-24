import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE_NAME = 'direktori_admin_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET (or ADMIN_SESSION_SECRET) must be set in the environment');
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  sub: string;
  email: string;
  role: string;
};

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.sub === 'string' &&
      typeof payload.email === 'string' &&
      typeof payload.role === 'string'
    ) {
      return {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    }
    return null;
  } catch {
    return null;
  }
}
