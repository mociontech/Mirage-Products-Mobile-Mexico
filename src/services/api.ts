import { normalizeEmail } from "./idService";
import { env, RANKING_EXPERIENCE } from "../config/env";
import type { Participation } from "../types/participation";

/**
 * El unico punto de salida que usa el resto de la app - outbox.ts reintenta
 * lo que esto lance, las pantallas nunca llaman fetch directo. Replica el
 * mismo par de destinos que gateway.ts en el sync-server de la version
 * tablet+pitch (Evius + Supabase compartido), pero corriendo directo desde
 * el navegador del visitante en vez de un servidor propio - esta app es
 * estatica (Netlify), no hay backend propio que guarde una service_role key.
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

/** POST /attendees - se omite si no hay email, igual que el patron del sync-server. */
async function submitAttendee(participation: Participation, email: string | null): Promise<void> {
  if (!email) return;
  const res = await postEvius("/attendees", {
    eventId: env.evius.eventId,
    source: env.experienceName,
    sentAt: new Date(participation.ts).toISOString(),
    records: [
      {
        fullName: participation.name ?? email,
        email,
        checkInAt: new Date(participation.ts).toISOString(),
        country: env.country,
      },
    ],
  });
  if (!res.ok) throw new Error(`Evius /attendees failed: ${res.status}`);
}

/** POST /activities - fallback si /experiences no responde, score embebido como JSON (igual que gateway.ts). */
async function submitExperienceAsActivity(participation: Participation, email: string): Promise<void> {
  const res = await postEvius("/activities", {
    eventId: env.evius.eventId,
    source: env.experienceName,
    sentAt: new Date(participation.ts).toISOString(),
    records: [
      {
        name: env.experienceName,
        shortDescription: String(participation.points),
        longDescription: JSON.stringify({
          experiencia: env.experienceName,
          email,
          score: participation.points,
          productId: participation.productId,
          code: participation.code,
          country: env.country,
        }),
      },
    ],
  });
  if (!res.ok) throw new Error(`Evius /activities failed: ${res.status}`);
}

/**
 * POST /experiences - guarda el puntaje. No documentado en el PDF oficial de
 * eviusapi (solo visto en produccion en otras experiencias), pero es el
 * unico endpoint con score/bonusScore nativos. Se manda siempre, con o sin
 * registro (usa un email sintetico si hace falta, igual que gateway.ts). Si
 * falla, cae a /activities antes de propagar el error.
 */
async function submitExperienceResult(participation: Participation): Promise<void> {
  if (!env.evius.experienceId) return;
  const email = normalizeEmail(participation.email ?? "") || `anon-${participation.ts}@local`;

  try {
    const res = await postEvius("/experiences", {
      eventId: env.evius.eventId,
      experienceId: env.evius.experienceId,
      source: env.experienceName,
      sentAt: new Date(participation.ts).toISOString(),
      records: [
        {
          email,
          play_timestamp: new Date(participation.ts).toISOString(),
          score: participation.points,
          bonusScore: 0,
          data: {
            experiencia: env.experienceName,
            productId: participation.productId,
            code: participation.code,
            country: env.country,
          },
        },
      ],
    });
    if (!res.ok) throw new Error(`Evius /experiences failed: ${res.status}`);
  } catch {
    await submitExperienceAsActivity(participation, email);
  }
}

/**
 * Insert (nunca upsert) en la tabla compartida `participations` de Supabase,
 * la misma que usa Memory Match y el sync-server de la version tablet+pitch,
 * con el mismo shape de fila (participant_id/participant_name/country/
 * experience/score/submitted_at) para que el agregador ranking_combined (que
 * vive en Supabase, no aca) las lea igual sin importar de cual experiencia
 * vinieron. A diferencia de gateway.ts (que corre en el sync-server con la
 * service_role key y puede usar `resolution=merge-duplicates` como upsert),
 * esta app usa la Publishable key desde el navegador, que solo tiene permiso
 * de INSERT - un upsert con esa key falla con 42501, asi que esto manda un
 * insert simple.
 *
 * Un 409 aca es el unique constraint (participant_id, country, experience)
 * rechazando un duplicado real - nunca es transitorio, reintentarlo jamas
 * va a funcionar. Antes esto lanzaba igual que cualquier otro fallo, y el
 * outbox lo reintentaba para siempre (persistido en localStorage, revivido
 * en cada carga de pagina) sin que nadie se enterara de por que nunca se
 * iba. Se trata como entrega exitosa: la fila que se queria ya esta ahi.
 */
async function submitRanking(participation: Participation, email: string | null): Promise<void> {
  if (!env.rankingDb.url || !env.rankingDb.apiKey) return;
  if (!email) return;

  const res = await fetch(`${env.rankingDb.url}/rest/v1/${env.rankingDb.table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: env.rankingDb.apiKey,
      Authorization: `Bearer ${env.rankingDb.apiKey}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      participant_id: email,
      participant_name: participation.name?.trim() || null,
      country: env.country,
      experience: RANKING_EXPERIENCE,
      score: participation.points,
      submitted_at: new Date(participation.ts).toISOString(),
    }),
  });
  if (res.status === 409) return;
  if (!res.ok) throw new Error(`Ranking DB submit failed: ${res.status}`);
}

/**
 * Envia una participacion a cada destino que tenga sus propias env vars
 * configuradas - Evius y la ranking DB son despliegues independientes, uno
 * sin configurar (ej. credenciales de Evius no emitidas todavia) no debe
 * bloquear al otro. Lanza si un destino *configurado* falla; outbox.ts
 * decide que hacer con eso (reintentar despues).
 */
export async function submitParticipation(participation: Participation): Promise<void> {
  const email = participation.email ? normalizeEmail(participation.email) : null;
  const tasks: Promise<void>[] = [];

  if (env.evius.url && env.evius.token && env.evius.eventId) {
    tasks.push(submitAttendee(participation, email), submitExperienceResult(participation));
  }
  if (env.rankingDb.url && env.rankingDb.apiKey) {
    tasks.push(submitRanking(participation, email));
  }

  if (tasks.length === 0) {
    throw new Error(
      "submitParticipation: ni Evius (VITE_EVIUS_URL/VITE_EVIUS_TOKEN/VITE_EVIUS_EVENT_ID) ni la ranking DB (VITE_RANKING_DB_URL/VITE_RANKING_DB_API_KEY) estan configurados",
    );
  }
  await Promise.all(tasks);
}
