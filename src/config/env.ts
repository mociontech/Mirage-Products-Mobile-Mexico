/**
 * Configuracion por pais/despliegue. Todo viene de variables de entorno de
 * Vite (`.env.local` o la configuracion de Netlify) - nunca hardcodeado,
 * nunca compartido entre los despliegues de Colombia/Mexico.
 */
function readOptional(key: string): string | undefined {
  const value = import.meta.env[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function readRequired(key: string): string {
  const value = readOptional(key);
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

export const env = {
  country: readRequired("VITE_COUNTRY"),
  kioskId: readOptional("VITE_KIOSK_ID") ?? "unknown",
  experienceName: readOptional("VITE_EXPERIENCE_NAME") ?? "Mirage - Catalogo de Productos",

  evius: {
    url: readOptional("VITE_EVIUS_URL"),
    token: readOptional("VITE_EVIUS_TOKEN"),
    eventId: readOptional("VITE_EVIUS_EVENT_ID"),
    experienceId: readOptional("VITE_EVIUS_EXPERIENCE_ID"),
  },

  /**
   * Mismo proyecto Supabase compartido con Memory Match ("Mirage Colombia" -
   * el nombre es solo una etiqueta, ahi escriben ambos paises y ambas
   * experiencias). RANKING_DB_API_KEY tiene que ser la Publishable key
   * (sb_publishable_...), NUNCA la Secret key - a diferencia del sync-server
   * de la version tablet+pitch (que corre en un servidor propio y usa la
   * service_role key), esta app es estatica y corre en el navegador del
   * visitante, asi que cualquier key que se le entregue queda expuesta en el
   * bundle.
   */
  rankingDb: {
    url: readOptional("VITE_RANKING_DB_URL"),
    apiKey: readOptional("VITE_RANKING_DB_API_KEY"),
    table: readOptional("VITE_RANKING_DB_TABLE") ?? "participations",
  },
};

/** Mismo nombre de experiencia usado por el sync-server de la version tablet+pitch en la tabla compartida de ranking. */
export const RANKING_EXPERIENCE = "catalogo";

/**
 * Puntos por participacion completa (registro + Finalizar en el catalogo).
 * Fijo en 100, igual que PARTICIPATION_POINTS en session.ts de la version
 * tablet+pitch: el catalogo siempre otorga el maximo, el memory match aporta
 * 0-100 segun desempeno, y el ranking combinado promedia ambas experiencias.
 */
export const PARTICIPATION_POINTS = 100;
