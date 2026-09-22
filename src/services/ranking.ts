import { env, RANKING_EXPERIENCE } from "../config/env";

export interface RankingEntry {
  participant_name: string | null;
  score: number;
  position: number;
}

/**
 * Top 10 de este pais para la experiencia "catalogo", leido directo de la
 * vista `ranking_by_experience` en Supabase - misma vista que usa Memory
 * Match y el sync-server de la version tablet+pitch (gateway.ts#fetchRanking).
 * Nunca lanza: si no esta configurado o el fetch falla, no hay ranking que
 * mostrar y la pantalla lo trata como lista vacia, no como error.
 */
export async function fetchTopRanking(): Promise<RankingEntry[]> {
  if (!env.rankingDb.url || !env.rankingDb.apiKey) return [];

  try {
    const query = new URLSearchParams({
      country: `eq.${env.country}`,
      experience: `eq.${RANKING_EXPERIENCE}`,
      order: "position.asc",
      limit: "10",
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
