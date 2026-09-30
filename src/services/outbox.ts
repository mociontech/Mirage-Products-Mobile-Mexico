import { submitParticipation } from "./api";
import type { Participation } from "../types/participation";

const OUTBOX_KEY = "mpm:outbox";
const RETRY_DELAYS_MS = [1000, 2000, 4000, 8000] as const; // 4 delays -> 5 total attempts
/**
 * Reintento periodico, independiente del evento `online` del navegador - ese
 * evento no es confiable en un kiosko (el wifi del venue puede reportarse
 * "conectado" sin internet real, o sin ruta a Supabase, y el navegador nunca
 * dispara `online` en ese caso porque nunca vio un `offline` real primero).
 * Bug real detectado en vivo en Mexico: participaciones se quedaron sin
 * subir porque nunca llego el evento `online` para disparar el reintento.
 */
const POLL_INTERVAL_MS = 20_000;

function readOutbox(): Participation[] {
  try {
    const raw = localStorage.getItem(OUTBOX_KEY);
    return raw ? (JSON.parse(raw) as Participation[]) : [];
  } catch {
    return [];
  }
}

function writeOutbox(entries: Participation[]): void {
  localStorage.setItem(OUTBOX_KEY, JSON.stringify(entries));
}

function removeFromOutbox(idempotencyKey: string): void {
  writeOutbox(readOutbox().filter((entry) => entry.idempotencyKey !== idempotencyKey));
}

/**
 * Persiste un registro localmente para que la UI pueda seguir de inmediato
 * al catalogo, y dispara un flush en segundo plano. Nunca esperado por quien
 * llama.
 */
export function enqueueParticipation(participation: Participation): void {
  const outbox = readOutbox();
  if (!outbox.some((entry) => entry.idempotencyKey === participation.idempotencyKey)) {
    writeOutbox([...outbox, participation]);
  }
  void flushOutbox();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendWithRetries(participation: Participation): Promise<boolean> {
  for (let attempt = 0; ; attempt++) {
    try {
      await submitParticipation(participation);
      return true;
    } catch {
      const delay = RETRY_DELAYS_MS[attempt];
      if (delay === undefined) return false; // agoto los 5 intentos
      await sleep(delay);
    }
  }
}

let isFlushing = false;

/**
 * Reintenta cada registro pendiente del outbox (backoff 1s/2s/4s/8s, 5
 * intentos cada uno). Uno que sigue fallando se queda en el outbox y se
 * reintenta en el siguiente flush - disparado de nuevo en `online`, o en el
 * siguiente enqueue.
 */
export async function flushOutbox(): Promise<void> {
  if (isFlushing) return;
  isFlushing = true;
  try {
    for (const participation of readOutbox()) {
      const sent = await sendWithRetries(participation);
      if (sent) removeFromOutbox(participation.idempotencyKey);
    }
  } finally {
    isFlushing = false;
  }
}

/**
 * Conecta el outbox para reintentar al recuperar conectividad. Llamar una
 * vez al arrancar.
 *
 * Dos disparadores, no uno solo: el evento `online` (rapido cuando si
 * dispara) MAS un poll cada POLL_INTERVAL_MS mientras queden entradas
 * pendientes - el poll es la red de seguridad real, porque `online` puede
 * simplemente no disparar en el wifi del venue (ver el comentario en
 * POLL_INTERVAL_MS). El poll no hace nada si el outbox esta vacio.
 */
export function initOutboxFlush(): () => void {
  const handleOnline = () => void flushOutbox();
  window.addEventListener("online", handleOnline);
  void flushOutbox();

  const interval = setInterval(() => {
    if (readOutbox().length > 0) void flushOutbox();
  }, POLL_INTERVAL_MS);

  return () => {
    window.removeEventListener("online", handleOnline);
    clearInterval(interval);
  };
}
