import { useEffect, useState } from "react";
import { useFlow } from "../../app/FlowMachine";
import { BrandFrame } from "../../components/BrandFrame";
import { Button } from "../../components/Button";
import { Footer } from "../../components/Footer";
import { Logo } from "../../components/Logo";
import { products } from "../../content/products";
import { fetchMyCombinedPosition } from "../../services/ranking";
import styles from "./ThankYou.module.css";

/**
 * Solo nombre + primer apellido en el saludo, sin importar cuantas palabras
 * haya escrito la persona - un nombre con dos nombres y dos apellidos hacia
 * que el titulo ocupara 3 lineas y se solapara con el puntaje de abajo (el
 * layout esta pensado, a la Figma, para 1 nombre + 1 apellido). El nombre
 * COMPLETO sigue yendo intacto a Evius/Supabase - esto es solo cosmetico,
 * no toca session.name.
 */
function shortGreetingName(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).join(" ");
}

/**
 * El envio de ESTA participacion (enqueueParticipation, disparado en
 * Catalog.handleFinish justo antes de navegar aca) viaja a Supabase via el
 * outbox de forma asincrona - un solo fetch al montar casi siempre corre
 * antes de que el insert exista, y la persona nunca veria si quedo en el
 * ranking general. Se reintenta mientras la pantalla siga montada, mismo
 * patron que el poll del Top 5 en Ranking.tsx.
 */
const POSITION_POLL_INTERVAL_MS = 1500;

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
  const [combinedPosition, setCombinedPosition] = useState<number | null>(null);

  // El puntaje de arriba es SOLO de esta experiencia - se aclara para no
  // repetir el malentendido de Mexico, donde un puntaje alto aca se confundio
  // con haber ganado el premio (lo decide el ranking general, ver
  // ranking_combined en docs/supabase-schema.sql).
  useEffect(() => {
    if (!session.email) return;
    let cancelled = false;

    const poll = () => {
      fetchMyCombinedPosition(session.email!).then((record) => {
        if (!cancelled && record) setCombinedPosition(record.position);
      });
    };

    poll();
    const interval = setInterval(poll, POSITION_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [session.email]);

  return (
    <div className={styles.shell}>
      <BrandFrame />
      <div className={`${styles.logo} enterFromTop`}>
        <Logo />
      </div>
      <h1 className={`${styles.title} enterFromLeft delay1`}>
        {session.name ? `¡Gracias, ${shortGreetingName(session.name)}!` : "¡Gracias por participar!"}
      </h1>
      <div className={`${styles.scoreBox} enterScale delay2`}>
        <span className={styles.scoreValue}>{points}</span>
      </div>
      <p className={`${styles.label} enterFade delay3`}>Acumulaste en esta experiencia</p>
      {combinedPosition !== null && (
        <p className={`${styles.label} enterFade delay3`}>Vas en el puesto #{combinedPosition} del ranking general</p>
      )}
      <div className={`${styles.buttonBox} enterFromBottom delay4`}>
        <Button className={styles.finishButton} onClick={() => navigate("ranking")}>
          Finalizar
        </Button>
      </div>
      <Footer />
    </div>
  );
}
