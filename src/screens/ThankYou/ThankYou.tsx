import { useFlow } from "../../app/FlowMachine";
import { PARTICIPATION_POINTS } from "../../config/env";
import { BrandFrame } from "../../components/BrandFrame";
import { Button } from "../../components/Button";
import { Footer } from "../../components/Footer";
import { Logo } from "../../components/Logo";
import styles from "./ThankYou.module.css";

/**
 * Mismo contenido que ThankYou.tsx en displays/tablet de la version
 * tablet+pitch (node 224:3181, "04_Agradecimiento") - el puntaje mostrado es
 * PARTICIPATION_POINTS, el mismo fijo que ya se mando en Catalog al tocar
 * "Finalizar".
 */
export function ThankYou() {
  const { navigate, session } = useFlow();

  return (
    <div className={styles.shell}>
      <BrandFrame />
      <div className={styles.logo}>
        <Logo />
      </div>
      <h1 className={styles.title}>{session.name ? `¡Gracias, ${session.name}!` : "¡Gracias por participar!"}</h1>
      <div className={styles.scoreBox}>{PARTICIPATION_POINTS}</div>
      <p className={styles.label}>Acumulaste</p>
      <div className={styles.buttonBox}>
        <Button className={styles.finishButton} onClick={() => navigate("ranking")}>
          Finalizar
        </Button>
      </div>
      <Footer />
    </div>
  );
}
