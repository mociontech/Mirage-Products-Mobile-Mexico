import type { ReactNode } from "react";
import styles from "./Modal.module.css";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Full-screen dim overlay + centered red content box. Base for Advertencia
 * and ProductPopup — the spec calls for dismissing ProductPopup with a
 * single tap anywhere, so the whole overlay (backdrop and content) closes it.
 */
export function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className={`${styles.overlay} enterFade`} onClick={onClose}>
      <div className={`${styles.content} enterScale delay1`}>{children}</div>
    </div>
  );
}
