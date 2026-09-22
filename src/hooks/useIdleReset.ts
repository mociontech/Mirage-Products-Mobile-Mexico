import { useEffect, useRef } from "react";

const DEFAULT_IDLE_TIMEOUT_MS = 60_000;
const ACTIVITY_EVENTS = ["pointerdown", "pointermove", "keydown"] as const;

/**
 * Calls `onIdle` after `timeoutMs` of no touch/pointer/keyboard activity.
 * Used to force the kiosk back to Welcome and clear session state when a
 * participant walks away mid-flow.
 */
export function useIdleReset(
  onIdle: () => void,
  timeoutMs: number = DEFAULT_IDLE_TIMEOUT_MS,
): void {
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => onIdleRef.current(), timeoutMs);
    };

    resetTimer();
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, resetTimer);
    }

    return () => {
      clearTimeout(timer);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, resetTimer);
      }
    };
  }, [timeoutMs]);
}
