import logoMirage from "../../assets/images/logo-mirage.svg";
import styles from "./Logo.module.css";

/** Mirage wordmark. Sized by its wrapping container (width: 100%). */
export function Logo() {
  return <img className={styles.logo} src={logoMirage} alt="Mirage" />;
}
