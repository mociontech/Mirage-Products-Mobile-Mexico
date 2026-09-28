import type { ReactNode } from "react";
import { BrandFrame } from "../components/BrandFrame";
import { Footer } from "../components/Footer";
import { Logo } from "../components/Logo";
import styles from "./ScreenShell.module.css";

interface ScreenShellProps {
  /** Centered title/body content — grows to fill available space. */
  children: ReactNode;
  /** Buttons/links pinned near the bottom, in Figma's usual button position. */
  actions?: ReactNode;
  /** The Instructions/Advertencia screens omit the logo in favor of other art. */
  showLogo?: boolean;
  /** Fires on a tap anywhere on the shell — used by dead-end screens (e.g. Ranking) to advance early. */
  onClick?: () => void;
  /** Flecha sutil arriba a la izquierda (ej. RegisterId -> volver a Register por si alguien se equivoco de camino). Omitida si no se pasa. */
  onBack?: () => void;
}

/** The BrandFrame + Logo + gradient background shared by every kiosk screen. */
export function ScreenShell({ children, actions, showLogo = true, onClick, onBack }: ScreenShellProps) {
  return (
    <div className={styles.shell} onClick={onClick}>
      <BrandFrame />
      {onBack && (
        <button
          type="button"
          className={`${styles.backButton} enterFade`}
          onClick={(event) => {
            event.stopPropagation();
            onBack();
          }}
          aria-label="Volver"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      {showLogo && (
        <div className={`${styles.logo} enterFromTop`}>
          <Logo />
        </div>
      )}
      <div className={`${styles.content} enterFromLeft delay1`}>{children}</div>
      {actions && <div className={`${styles.actions} enterFromBottom delay2`}>{actions}</div>}
      <Footer />
    </div>
  );
}
