import { env, RANKING_EXPERIENCE } from "../config/env";

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

export async function fetchTopRanking(): Promise<RankingEntry[]> {
  if (!env.rankingDb.url || !env.rankingDb.apiKey) return [];

  try {
    const query = new URLSearchParams({
      country: `eq.${env.country}`,
      experience: `eq.${RANKING_EXPERIENCE}`,
      order: "position.asc",
      limit: "5",
    });
    const res = await fetch(`${env.rankingDb.url}/rest/v1/ranking_by_experience?${query.toString()}`, {
      headers: {
        apikey: env.rankingDb.apiKey,
        Authorization: `Bearer ${env.rankingDb.apiKey}`,
      },
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as RankingEntry[];
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}
