import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

/** The red pill button reused for every primary action (Iniciar, Comenzar, ...). */
export function Button({ className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={className ? `${styles.button} ${className}` : styles.button}
      {...props}
    />
  );
}
