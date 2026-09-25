import type { ReactNode } from "react";
import styles from "./NotchedCard.module.css";

interface NotchedCardProps {
  children?: ReactNode;
  className?: string;
}

/**
 * The white panel used on the Top 5 ranking: rounded on two corners, squared
 * off with a small red tab on the other two - Figma's "ticket stub" card.
 * The tabs are plain CSS rectangles, not the original vector asset (Figma
 * doesn't expose it as a separate node to export). Ported from Memory Match
 * for visual parity between the two apps' Top 5 screens.
 */
export function NotchedCard({ children, className }: NotchedCardProps) {
  return (
    <div className={className ? `${styles.card} ${className}` : styles.card}>
      <span className={`${styles.tab} ${styles.tabTop}`} aria-hidden="true" />
      <span className={`${styles.tab} ${styles.tabBottom}`} aria-hidden="true" />
      {children}
    </div>
  );
}
