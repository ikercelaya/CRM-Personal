import { SignJWT, jwtVerify } from "jose";

// Nombre de la cookie de sesión.
export const SESSION_COOKIE = "crm_session";

// Duración de la sesión (7 días).
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getSecretKey(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET ||
    "dev-secret-cambia-esto-en-produccion-por-favor-1234567890";
  return new TextEncoder().encode(secret);
}

/** Comprueba usuario/contraseña contra las variables de entorno. */
export function credencialesValidas(user: string, password: string): boolean {
  const validUser = process.env.CRM_USER || "iker";
  const validPass = process.env.CRM_PASSWORD || "iker2026";
  return user === validUser && password === validPass;
}

/** Genera un token de sesión firmado (JWT) para el usuario. */
export async function crearToken(user: string): Promise<string> {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

/** Verifica un token de sesión. Devuelve el usuario o null si no es válido. */
export async function verificarToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return (payload.user as string) || null;
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE = MAX_AGE_SECONDS;
