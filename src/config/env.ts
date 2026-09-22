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
  experienceName: readOptional("VITE_EXPERIENCE_NAME") ?? "Mirage - Productos",

  evius: {
    url: readOptional("VITE_EVIUS_URL"),
    token: readOptional("VITE_EVIUS_TOKEN"),
    eventId: readOptional("VITE_EVIUS_EVENT_ID"),
  },
};
