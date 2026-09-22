const USED_IDS_CACHE_KEY = "kam:usedIds";
const USED_EMAILS_CACHE_KEY = "kam:usedEmails";
const VALIDATION_TIMEOUT_MS = 2500;
const BLOCK_LENGTH = 3;

export type IdStatus = "available" | "used";

/**
 * Trim + lowercase, matching how the catalog experience normalizes email
 * before using it as the shared dedupe key (Evius /attendees + Supabase).
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function readUsedEmailsCache(): string[] {
  try {
    const raw = localStorage.getItem(USED_EMAILS_CACHE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/**
 * Remembers an email as having played, locally, for this deployment/country.
 * The real dedupe constraint lives server-side (email + country + experience
 * in Supabase, email + eventId in Evius) — this only lets the kiosk reject a
 * repeat attempt immediately, without waiting to sync.
 */
export function rememberUsedEmail(email: string): void {
  const normalized = normalizeEmail(email);
  const emails = readUsedEmailsCache();
  if (!emails.includes(normalized)) {
    localStorage.setItem(USED_EMAILS_CACHE_KEY, JSON.stringify([...emails, normalized]));
  }
}

/** Checks the local cache only — see `rememberUsedEmail` for why this isn't authoritative. */
export function hasEmailPlayedLocally(email: string): boolean {
  return readUsedEmailsCache().includes(normalizeEmail(email));
}

/** Generates a fresh "123-456"-style participation ID. */
export function generateId(): string {
  const block = () => String(Math.floor(Math.random() * 10 ** BLOCK_LENGTH)).padStart(BLOCK_LENGTH, "0");
  return `${block()}-${block()}`;
}

function readUsedIdsCache(): string[] {
  try {
    const raw = localStorage.getItem(USED_IDS_CACHE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** Remembers an ID locally so a repeat visit is caught even if the backend can't be reached. */
export function rememberUsedId(id: string): void {
  const ids = readUsedIdsCache();
  if (!ids.includes(id)) {
    localStorage.setItem(USED_IDS_CACHE_KEY, JSON.stringify([...ids, id]));
  }
}

/**
 * Checks whether an ID has already participated.
 *
 * TODO(Fase 5): there is no backend yet (see services/api.ts) — this only
 * checks the local kioskId cache and resolves immediately. Once a real
 * endpoint exists, wrap it with the same `Promise.race` timeout pattern
 * shown here (2.5s) so a slow/offline network still falls back to the
 * local cache instead of blocking the participant.
 */
export async function checkIdStatus(id: string): Promise<IdStatus> {
  const localCheck = new Promise<IdStatus>((resolve) => {
    resolve(readUsedIdsCache().includes(id) ? "used" : "available");
  });

  const timeout = new Promise<IdStatus>((resolve) => {
    setTimeout(() => resolve("available"), VALIDATION_TIMEOUT_MS);
  });

  return Promise.race([localCheck, timeout]);
}

/**
 * crypto.randomUUID solo existe en "secure context" (HTTPS o localhost) - en
 * pruebas por IP LAN sobre http (no localhost) Safari no lo expone y rompe
 * el flujo en silencio (mismo problema documentado en session.ts de la
 * version tablet+pitch). Con crypto disponible se usa esa; si no, cae a un
 * UUID v4 armado a mano con Math.random (suficiente para una llave de
 * idempotencia, no para seguridad).
 */
export function generateIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}
