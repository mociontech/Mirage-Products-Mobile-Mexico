import { createContext, useContext, useReducer, type ReactNode } from "react";
import {
  INITIAL_FLOW_STATE,
  type FlowAction,
  type FlowState,
  type Screen,
  type Session,
} from "./flow.types";

function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case "NAVIGATE":
      return { ...state, screen: action.screen };
    case "SET_SESSION":
      return { ...state, session: { ...state.session, ...action.session } };
    case "RESET":
      return INITIAL_FLOW_STATE;
  }
}

interface FlowContextValue {
  screen: Screen;
  session: Session;
  /** Move to a new screen. */
  navigate: (screen: Screen) => void;
  /** Merge partial participant/selection data into the current session. */
  setSession: (session: Partial<Session>) => void;
  /** Return to Welcome and clear all session/flow state (idle timeout). */
  reset: () => void;
}

const FlowContext = createContext<FlowContextValue | null>(null);

/** Provides the screen-navigation state machine to the whole app. */
export function FlowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(flowReducer, INITIAL_FLOW_STATE);

  const value: FlowContextValue = {
    screen: state.screen,
    session: state.session,
    navigate: (screen) => dispatch({ type: "NAVIGATE", screen }),
    setSession: (session) => dispatch({ type: "SET_SESSION", session }),
    reset: () => dispatch({ type: "RESET" }),
  };

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

/** Reads and controls the current screen and session. Must be used under FlowProvider. */
export function useFlow(): FlowContextValue {
  const ctx = useContext(FlowContext);
  if (!ctx) {
    throw new Error("useFlow must be used within a FlowProvider");
  }
  return ctx;
}
