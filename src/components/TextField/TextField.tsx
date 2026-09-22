import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./TextField.module.css";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: ReactNode;
  /** Overrides the icon wrapper's size — Figma sizes the Nombre/Correo icons differently (the person icon is notably narrower than the envelope). */
  iconClassName?: string;
}

/** Bordered pill input with a leading icon, used for Nombre/Correo in Register. */
export function TextField({ icon, iconClassName, autoComplete = "off", ...props }: TextFieldProps) {
  return (
    <label className={styles.field}>
      <span className={iconClassName ? `${styles.icon} ${iconClassName}` : styles.icon} aria-hidden="true">
        {icon}
      </span>
      <input className={styles.input} autoComplete={autoComplete} {...props} />
    </label>
  );
}
