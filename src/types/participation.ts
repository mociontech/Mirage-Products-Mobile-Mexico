/**
 * Un registro (lead) de esta experiencia, enviado al backend justo despues
 * de confirmarse el registro (Register o RegisterId) - no hay "fin de
 * juego" aqui, el registro en si es el evento a registrar en Evius.
 */
export interface Participation {
  /** Formato "123-456" - ver idService para generacion/validacion. */
  id: string;
  name: string;
  email: string;
  /** ISO 8601 */
  registeredAt: string;
  /** De VITE_KIOSK_ID (ver .env). */
  kioskId: string;
}
