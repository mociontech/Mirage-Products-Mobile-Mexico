/**
 * La experiencia es lineal y cerrada (sin boton atras del navegador, sin URLs
 * manipulables) salvo por "catalog" <-> "detail", que si necesita ida y
 * vuelta libre mientras el visitante explora productos - por eso esos dos
 * viven como screens normales del mismo state machine en vez de rutas
 * separadas. "Advertencia" (ID ya usado) no es un screen aqui por la misma
 * razon que en Memory Match: es un modal sobre RegisterId, no un destino
 * navegable. thankYou/ranking replican el cierre de la version tablet+pitch
 * (Register -> ... -> ThankYou -> Ranking -> Finalizar), disparado por el
 * boton "Finalizar" en Catalog en vez de por completar un juego.
 */
export type Screen =
  | "welcome"
  | "register"
  | "registerId"
  | "idGenerated"
  | "catalog"
  | "detail"
  | "thankYou"
  | "ranking";

/**
 * Datos del participante. name/email/company/phone/area quedan null si
 * entro por "Continua sin registro" (igual que EMPTY_SESSION en la version
 * tablet) o por "ingresa tu ID" (solo llena code). selectedProductId es el
 * ultimo producto que vio en Detail - va en el payload de PARTICIPATION_RESULT
 * como el "producto de interes" de la sesion, igual que productId en
 * session.ts de la version tablet.
 */
export interface Session {
  code: string | null;
  name: string | null;
  email: string | null;
  company: string | null;
  phone: string | null;
  area: string | null;
  selectedProductId: string | null;
}

export const EMPTY_SESSION: Session = {
  code: null,
  name: null,
  email: null,
  company: null,
  phone: null,
  area: null,
  selectedProductId: null,
};

export interface FlowState {
  screen: Screen;
  session: Session;
}

export type FlowAction =
  | { type: "NAVIGATE"; screen: Screen }
  | { type: "SET_SESSION"; session: Partial<Session> }
  | { type: "RESET" };

export const INITIAL_FLOW_STATE: FlowState = {
  screen: "welcome",
  session: EMPTY_SESSION,
};
