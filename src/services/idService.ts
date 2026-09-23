import { env, RANKING_EXPERIENCE } from "../config/env";

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
 * Chequeo real contra Supabase de si este correo ya participo en esta
 * experiencia+pais - hasEmailPlayedLocally solo detecta un repetido en el
 * MISMO navegador; alguien que repite desde otro celular (o borro su cache)
 * pasaba sin aviso, aunque el insert final igual fuera rechazado en
 * silencio por el unique constraint de Supabase (participant_id, country,
 * experience). Este chequeo cierra esa brecha de UX -no de datos, esos ya
 * estaban protegidos- mostrando la advertencia tambien en ese caso.
 *
 * Lee la vista ranking_by_experience (SECURITY DEFINER, la unica que la
 * Publishable key puede leer) en vez de la tabla base. Nunca bloquea el
 * flujo: sin red o mas lento que VALIDATION_TIMEOUT_MS, se asume
 * "disponible" y el intento sigue - igual que checkIdStatus - porque un
 * evento con mal internet no debe impedir participar, la proteccion real
 * sigue siendo el constraint de la base de datos.
 */
export async function checkEmailUsedRemotely(email: string): Promise<boolean> {
  if (!env.rankingDb.url || !env.rankingDb.apiKey) return false;

  const normalized = normalizeEmail(email);
  const query = new URLSearchParams({
    participant_id: `eq.${normalized}`,
    country: `eq.${env.country}`,
    experience: `eq.${RANKING_EXPERIENCE}`,
    select: "participant_id",
    limit: "1",
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), VALIDATION_TIMEOUT_MS);
  try {
    const response = await fetch(`${env.rankingDb.url}/rest/v1/ranking_by_experience?${query.toString()}`, {
      headers: { apikey: env.rankingDb.apiKey, Authorization: `Bearer ${env.rankingDb.apiKey}` },
      signal: controller.signal,
    });
    if (!response.ok) return false;
    const rows = (await response.json()) as unknown[];
    return Array.isArray(rows) && rows.length > 0;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
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
