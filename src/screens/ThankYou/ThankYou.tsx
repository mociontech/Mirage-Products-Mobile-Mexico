import { useFlow } from "../../app/FlowMachine";
import { BrandFrame } from "../../components/BrandFrame";
import { Button } from "../../components/Button";
import { Footer } from "../../components/Footer";
import { Logo } from "../../components/Logo";
import { products } from "../../content/products";
import styles from "./ThankYou.module.css";

/**
 * Mismo contenido que ThankYou.tsx en displays/tablet de la version
 * tablet+pitch (node 224:3181, "04_Agradecimiento") - el puntaje mostrado es
 * el mismo que ya se mando a Catalog.handleFinish: cuantos productos
 * DISTINTOS exploro (session.viewedProductIds) sobre el total, no un fijo.
 * Se recalcula aca en vez de leerlo de vuelta de session para no tener que
 * guardar el resultado del calculo en otro lado - la formula vive en un
 * solo sitio conceptual (productos vistos / total).
 */
export function ThankYou() {
  const { navigate, session } = useFlow();
  const points = Math.round((session.viewedProductIds.length / products.length) * 100);

  return (
    <div className={styles.shell}>
      <BrandFrame />
      <div className={`${styles.logo} enterFromTop`}>
        <Logo />
      </div>
      <h1 className={`${styles.title} enterFromLeft delay1`}>
        {session.name ? `¡Gracias, ${session.name}!` : "¡Gracias por participar!"}
      </h1>
      <div className={`${styles.scoreBox} enterScale delay2`}>{points}</div>
      <p className={`${styles.label} enterFade delay3`}>Acumulaste</p>
      <div className={`${styles.buttonBox} enterFromBottom delay4`}>
        <Button className={styles.finishButton} onClick={() => navigate("ranking")}>
          Finalizar
        </Button>
      </div>
      <Footer />
    </div>
  );
}
