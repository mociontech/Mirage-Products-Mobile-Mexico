import { useEffect, useRef } from "react";
import { useFlow } from "../../app/FlowMachine";
import { BrandFrame } from "../../components/BrandFrame";
import { Button } from "../../components/Button";
import { Footer } from "../../components/Footer";
import { IdInput, type IdInputValue } from "../../components/IdInput";
import { Logo } from "../../components/Logo";
import { env } from "../../config/env";
import { rememberUsedEmail, rememberUsedId } from "../../services/idService";
import { enqueueParticipation } from "../../services/outbox";
import type { Participation } from "../../types/participation";
import styles from "./IdGenerated.module.css";

/**
 * Muestra el ID recien generado (o confirmado, si vino de RegisterId) antes
 * de entrar al catalogo. Este es el punto donde id+nombre+correo ya estan
 * completos sin importar por cual de los dos caminos (Register directo, o
 * Register -> "Digita ID" -> RegisterId) se haya llegado, asi que es aqui
 * donde se dispara el registro hacia el backend, una sola vez. Posicionado
 * para calzar con Figma (node 209:298, 1080x1920) exacto — cada
 * left/top/width/height/font-size es `(figma_px / 1920) * 100`cqh, misma
 * conversion que Welcome/Register (ver el comentario en Welcome.tsx).
 */
export function IdGenerated() {
  const { navigate, session } = useFlow();
  const [first = "", second = ""] = session.id.split("-");
  const blocks: IdInputValue = [first, second];
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current) return;
    submitted.current = true;

    rememberUsedId(session.id);
    if (session.email) rememberUsedEmail(session.email);

    const participation: Participation = {
      id: session.id,
      name: session.name,
      email: session.email,
      registeredAt: new Date().toISOString(),
      kioskId: env.kioskId,
    };
    enqueueParticipation(participation);
  }, [session.id, session.name, session.email]);

  return (
    <div className={styles.shell}>
      <BrandFrame />
      <div className={styles.logo}>
        <Logo />
      </div>
      <h1 className={styles.title}>Tu ID único</h1>
      <p className={styles.description}>
        <span className={styles.descriptionBold}>Este es tu código personal.</span>
        <span>Guárdalo, lo necesitarás para iniciar.</span>
      </p>
      <div className={styles.idInputBox}>
        <IdInput value={blocks} onChange={() => {}} readOnly />
      </div>
      <div className={styles.buttonBox}>
        <Button className={styles.ctaButton} onClick={() => navigate("catalog")}>
          Comenzar
        </Button>
      </div>
      <Footer />
    </div>
  );
}
