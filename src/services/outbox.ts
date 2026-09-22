import { submitParticipation } from "./api";
import type { Participation } from "../types/participation";

const OUTBOX_KEY = "mpm:outbox";
const RETRY_DELAYS_MS = [1000, 2000, 4000, 8000] as const; // 4 delays -> 5 total attempts

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

function removeFromOutbox(id: string): void {
  writeOutbox(readOutbox().filter((entry) => entry.id !== id));
}

/**
 * Persiste un registro localmente para que la UI pueda seguir de inmediato
 * al catalogo, y dispara un flush en segundo plano. Nunca esperado por quien
 * llama.
 */
export function enqueueParticipation(participation: Participation): void {
  const outbox = readOutbox();
  if (!outbox.some((entry) => entry.id === participation.id)) {
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
      if (sent) removeFromOutbox(participation.id);
    }
  } finally {
    isFlushing = false;
  }
}

/** Conecta el outbox para reintentar solo al recuperar conectividad. Llamar una vez al arrancar. */
export function initOutboxFlush(): () => void {
  const handleOnline = () => void flushOutbox();
  window.addEventListener("online", handleOnline);
  void flushOutbox();
  return () => window.removeEventListener("online", handleOnline);
}
