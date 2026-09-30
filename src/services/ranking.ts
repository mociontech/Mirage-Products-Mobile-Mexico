import { env } from "../config/env";

/**
 * Fecha local (YYYY-MM-DD) de "ahora" en la zona horaria del pais de este
 * despliegue - tiene que dar el mismo valor que el event_day calculado en
 * ranking_by_experience/ranking_combined (ver docs/supabase-schema.sql del
 * proyecto Catalogo). El ranking (y el premio) se maneja por dia: cada dia
 * del evento de una semana arranca en position 1 de nuevo.
 */
function getEventDay(): string {
  const timeZone = env.country === "CO" ? "America/Bogota" : "America/Mexico_City";
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export interface RankingEntry {
  participant_name: string | null;
  score: number;
  position: number;
}

/**
 * Top 5 de este pais para la experiencia "catalogo", leido directo de la
 * vista `ranking_by_experience` en Supabase - misma vista que usa Memory
 * Match y el sync-server de la version tablet+pitch (gateway.ts#fetchRanking).
 * Nunca lanza: si no esta configurado o el fetch falla, no hay ranking que
 * mostrar y la pantalla lo trata como lista vacia, no como error.
 */
/**
 * Cache en memoria del ultimo Top 5 pedido - permite que Ranking.tsx pinte
 * la lista de inmediato al montar (sin esperar el round-trip) si alguien ya
 * disparo prefetchTopRanking() antes, en vez de arrancar siempre en []
 * mientras carga. Ranking.tsx sigue con su propio poll cada 3s como antes -
 * esto solo evita el parpadeo inicial, no lo reemplaza.
 */
let cachedTopRanking: RankingEntry[] | null = null;

/** Lee el cache sin disparar ningun fetch - null si nunca se prefeteo. */
export function getCachedTopRanking(): RankingEntry[] | null {
  return cachedTopRanking;
}

/**
 * Dispara el fetch del ranking por adelantado (apenas se conoce el puntaje
 * final, antes de llegar a la pantalla Ranking) para que el round-trip a
 * Supabase ya este en curso o resuelto cuando el visitante llegue ahi.
 */
export function prefetchTopRanking(): void {
  fetchTopRanking().then((rows) => {
    cachedTopRanking = rows;
  });
}

/**
 * Lee `ranking_combined` (promedio catalogo+memory_match por persona, ver
 * docs/supabase-schema.sql) en vez de `ranking_by_experience` filtrado por
 * esta experiencia - es el ranking que en verdad decide el premio. Antes
 * mostraba el top de esta experiencia sola, lo que causo que el dia del
 * evento un puntaje alto aca se confundiera con haber ganado. La vista
 * combinada expone `final_score` en vez de `score`, se remapea aca para no
 * tocar el resto de la pantalla.
 */
export async function fetchTopRanking(): Promise<RankingEntry[]> {
  if (!env.rankingDb.url || !env.rankingDb.apiKey) return [];

  try {
    const query = new URLSearchParams({
      country: `eq.${env.country}`,
      event_day: `eq.${getEventDay()}`,
      order: "position.asc",
      limit: "5",
    });
    const res = await fetch(`${env.rankingDb.url}/rest/v1/ranking_combined?${query.toString()}`, {
      headers: {
        apikey: env.rankingDb.apiKey,
        Authorization: `Bearer ${env.rankingDb.apiKey}`,
      },
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as Array<{ participant_name: string | null; final_score: number; position: number }>;
    if (!Array.isArray(rows)) return [];
    return rows.map((row) => ({ participant_name: row.participant_name, score: row.final_score, position: row.position }));
  } catch {
    return [];
  }
}

/**
 * Puesto de una persona puntual en el ranking general (combinado) - usado en
 * la pantalla de score para mostrar, por separado del puntaje de esta
 * experiencia, en que puesto va esa persona en el ranking que decide el
 * premio.
 */
export interface CombinedPositionEntry {
  position: number;
  finalScore: number;
}

export async function fetchMyCombinedPosition(email: string): Promise<CombinedPositionEntry | null> {
  if (!env.rankingDb.url || !env.rankingDb.apiKey || !email) return null;

  try {
    const query = new URLSearchParams({
      participant_id: `eq.${email.trim().toLowerCase()}`,
      country: `eq.${env.country}`,
      event_day: `eq.${getEventDay()}`,
      select: "position,final_score",
      limit: "1",
    });
    const res = await fetch(`${env.rankingDb.url}/rest/v1/ranking_combined?${query.toString()}`, {
      headers: {
        apikey: env.rankingDb.apiKey,
        Authorization: `Bearer ${env.rankingDb.apiKey}`,
      },
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as Array<{ position: number; final_score: number }>;
    const row = rows[0];
    return row ? { position: row.position, finalScore: row.final_score } : null;
  } catch {
    return null;
  }
}
