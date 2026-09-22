import { useEffect } from "react";
import { FlowProvider, useFlow } from "./FlowMachine";
import { useIdleReset } from "../hooks/useIdleReset";
import { initOutboxFlush } from "../services/outbox";
import { Welcome } from "../screens/Welcome";
import { Register } from "../screens/Register";
import { RegisterId } from "../screens/RegisterId";
import { IdGenerated } from "../screens/IdGenerated";
import { Catalog } from "../screens/Catalog";
import { Detail } from "../screens/Detail";
import styles from "./App.module.css";

/**
 * Bloquea los dos gestos que el CSS solo no puede detener en un dispositivo
 * publico: el menu contextual (click derecho/long-press) y el pinch-to-zoom
 * (gesturestart no estandar de Safari, mas un pinch sintetico via multi-touch).
 */
function useKioskGestureLock(): void {
  useEffect(() => {
    const blockContextMenu = (event: Event) => event.preventDefault();
    const blockGesture = (event: Event) => event.preventDefault();
    const blockPinch = (event: TouchEvent) => {
      if (event.touches.length > 1) event.preventDefault();
    };

    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("gesturestart", blockGesture);
    document.addEventListener("touchmove", blockPinch, { passive: false });

    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("gesturestart", blockGesture);
      document.removeEventListener("touchmove", blockPinch);
    };
  }, []);
}

function CurrentScreen() {
  const { screen } = useFlow();
  switch (screen) {
    case "welcome":
      return <Welcome />;
    case "register":
      return <Register />;
    case "registerId":
      return <RegisterId />;
    case "idGenerated":
      return <IdGenerated />;
    case "catalog":
      return <Catalog />;
    case "detail":
      return <Detail />;
  }
}

function AppShell() {
  const { reset } = useFlow();
  useIdleReset(reset);
  useKioskGestureLock();
  useEffect(() => initOutboxFlush(), []);

  return (
    <div className={styles.shell}>
      <CurrentScreen />
    </div>
  );
}

/** Raiz de la app: conecta el state machine de flujo. */
export function App() {
  return (
    <FlowProvider>
      <AppShell />
    </FlowProvider>
  );
}
