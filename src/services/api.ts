import { normalizeEmail } from "./idService";
import { env } from "../config/env";
import type { Participation } from "../types/participation";

/**
 * El unico punto de salida que usa el resto de la app - outbox.ts reintenta
 * lo que esto lance, las pantallas nunca llaman fetch directo. Solo manda a
 * Evius (registro del asistente) - a diferencia de Memory Match no hay
 * score/ranking que reportar, esto es un catalogo de exploracion libre.
 */
async function postEvius(path: string, body: unknown): Promise<Response> {
  const base = (env.evius.url ?? "").replace(/\/+$/, "");
  return fetch(`${base}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.evius.token}`,
    },
    body: JSON.stringify(body),
  });
}

/** POST /attendees - solo si hay email, deduplicado por email + eventId. */
async function submitAttendee(participation: Participation): Promise<void> {
  if (!participation.email) return;
  const res = await postEvius("/attendees", {
    eventId: env.evius.eventId,
    source: env.experienceName,
    records: [
      {
        fullName: participation.name,
        email: normalizeEmail(participation.email),
        checkInAt: participation.registeredAt,
        country: env.country,
      },
    ],
  });
  if (!res.ok) throw new Error(`Evius /attendees failed: ${res.status}`);
}

/**
 * Envia un registro a Evius si esta configurado. Lanza si la peticion falla;
 * outbox.ts decide que hacer con eso (reintentar despues), esta funcion
 * nunca traga un fallo real.
 */
export async function submitParticipation(participation: Participation): Promise<void> {
  if (!env.evius.url || !env.evius.token) {
    throw new Error("submitParticipation: Evius no esta configurado (VITE_EVIUS_URL/VITE_EVIUS_TOKEN)");
  }
  await submitAttendee(participation);
}
