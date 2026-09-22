/**
 * La experiencia es lineal y cerrada (sin boton atras del navegador, sin URLs
 * manipulables) salvo por "catalog" <-> "detail", que si necesita ida y
 * vuelta libre mientras el visitante explora productos - por eso esos dos
 * viven como screens normales del mismo state machine en vez de rutas
 * separadas. "Advertencia" (ID ya usado) no es un screen aqui por la misma
 * razon que en Memory Match: es un modal sobre RegisterId, no un destino
 * navegable.
 */
export type Screen = "welcome" | "register" | "registerId" | "idGenerated" | "catalog" | "detail";

/**
 * Datos del participante capturados en Register/RegisterId, mas el producto
 * que esta viendo actualmente en Detail (null en catalog). A diferencia de
 * Memory Match no hay score/attempts/matchedProducts - aqui no hay juego,
 * solo exploracion libre del catalogo.
 */
export interface Session {
  id: string;
  name: string;
  email: string;
  /** ISO 8601, fijado cuando se confirma el registro (Register o RegisterId). */
  registeredAt: string;
  /** Producto que se esta viendo en Detail, o null si no hay ninguno seleccionado. */
  selectedProductId: string | null;
}

export const EMPTY_SESSION: Session = {
  id: "",
  name: "",
  email: "",
  registeredAt: "",
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
