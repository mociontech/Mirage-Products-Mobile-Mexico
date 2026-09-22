/**
 * Un registro (lead) de esta experiencia, enviado al backend cuando el
 * visitante toca "Finalizar" en el catalogo - equivalente a PARTICIPATION_RESULT
 * en session.ts/TabletApp.tsx de la version tablet+pitch. code/name/email
 * quedan null si entro por "Continua sin registro".
 */
export interface Participation {
  code: string | null;
  name: string | null;
  email: string | null;
  company: string | null;
  phone: string | null;
  area: string | null;
  /** Ultimo producto que vio en Detail, o null si nunca abrio ninguno. */
  productId: string | null;
  /** Fijo en PARTICIPATION_POINTS (ver config/env.ts). */
  points: number;
  /** Unica por sesion terminada, para que un reintento del outbox nunca duplique el registro. */
  idempotencyKey: string;
  /** epoch ms */
  ts: number;
}
