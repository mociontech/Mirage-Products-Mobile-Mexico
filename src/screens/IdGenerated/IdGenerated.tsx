import { useEffect, useRef } from "react";
import { useFlow } from "../../app/FlowMachine";
import { BrandFrame } from "../../components/BrandFrame";
import { Button } from "../../components/Button";
import { Footer } from "../../components/Footer";
import { IdInput, type IdInputValue } from "../../components/IdInput";
import { Logo } from "../../components/Logo";
import { rememberUsedEmail, rememberUsedId } from "../../services/idService";
import styles from "./IdGenerated.module.css";

/**
 * Muestra el codigo (recien generado, o confirmado si vino de RegisterId)
 * antes de entrar al catalogo. El envio del registro hacia Evius/Supabase NO
 * pasa aqui - pasa cuando el visitante toca "Finalizar" en Catalog, igual
 * que en la version tablet+pitch (el registro solo reserva el codigo/dedupe
 * local; PARTICIPATION_RESULT se manda al terminar de explorar, con el
 * producto que estaba viendo). Posicionado para calzar con Figma (node
 * 209:298, 1080x1920) exacto — ver el comentario en Welcome.tsx.
 */
export function IdGenerated() {
  const { navigate, session } = useFlow();
  const [first = "", second = ""] = (session.code ?? "").split("-");
  const blocks: IdInputValue = [first, second];
  const remembered = useRef(false);

  useEffect(() => {
    if (remembered.current) return;
    remembered.current = true;
    if (session.code) rememberUsedId(session.code);
    if (session.email) rememberUsedEmail(session.email);
  }, [session.code, session.email]);

  return (
    <div className={styles.shell}>
      <BrandFrame />
      <div className={`${styles.logo} enterFromTop`}>
        <Logo />
      </div>
      <h1 className={`${styles.title} enterFromLeft delay1`}>Tu ID único</h1>
      <p className={`${styles.description} enterFade delay2`}>
        <span className={styles.descriptionBold}>Este es tu código personal.</span>
        <span>Guárdalo, lo necesitarás para iniciar.</span>
      </p>
      <div className={`${styles.idInputBox} enterScale delay3`}>
        <IdInput value={blocks} onChange={() => {}} readOnly />
      </div>
      <div className={`${styles.buttonBox} enterFromBottom delay4`}>
        <Button className={styles.ctaButton} onClick={() => navigate("catalog")}>
          Comenzar
        </Button>
      </div>
      <Footer />
    </div>
  );
}
