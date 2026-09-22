import { useState } from "react";
import { useFlow } from "../../app/FlowMachine";
import { generateId, hasEmailPlayedLocally } from "../../services/idService";
import { BrandFrame } from "../../components/BrandFrame";
import { Button } from "../../components/Button";
import { Footer } from "../../components/Footer";
import { Logo } from "../../components/Logo";
import { TextField } from "../../components/TextField";
import { Modal } from "../../components/Modal";
import modalStyles from "../../components/Modal/Modal.module.css";
import iconPerson from "../../assets/images/icon-person.svg";
import iconEnvelope from "../../assets/images/icon-envelope.svg";
import iconWarning from "../../assets/images/icon-warning.svg";
import styles from "./Register.module.css";

/**
 * Name + email capture, or a link into RegisterId to resume with an existing
 * ID. Positioned to match Figma (node 209:235, 1080x1920) exactly — every
 * left/top/width/height/font-size is `(figma_px / 1920) * 100`cqh, same
 * conversion as Welcome (see the comment there for why it's exact on this
 * aspect-locked shell). Bypasses ScreenShell's flex layout for the same
 * reason Welcome does: Figma's coordinates don't reduce to a centered column.
 */
export function Register() {
  const { navigate, setSession } = useFlow();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showAdvertencia, setShowAdvertencia] = useState(false);

  const canSubmit = name.trim().length > 0 && email.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const trimmedEmail = email.trim();

    // Server-side dedupe (email + country + experience) is authoritative; this only
    // saves a participant from playing through the whole board before being rejected.
    if (hasEmailPlayedLocally(trimmedEmail)) {
      setShowAdvertencia(true);
      return;
    }

    setSession({ name: name.trim(), email: trimmedEmail, id: generateId() });
    navigate("idGenerated");
  };

  const handleDigitaId = () => {
    if (!canSubmit) return;
    const trimmedEmail = email.trim();

    if (hasEmailPlayedLocally(trimmedEmail)) {
      setShowAdvertencia(true);
      return;
    }

    // RegisterId only collects the ID itself — name/email must already be in the
    // session before navigating there, or the final submit goes out with no email.
    setSession({ name: name.trim(), email: trimmedEmail });
    navigate("registerId");
  };

  return (
    <div className={styles.shell}>
      <BrandFrame />
      <div className={styles.logo}>
        <Logo />
      </div>
      <h1 className={styles.title}>REGISTRO</h1>

      <div className={`${styles.fieldBox} ${styles.nameField}`}>
        <TextField
          icon={<img src={iconPerson} alt="" />}
          iconClassName={styles.nameIcon}
          placeholder="Nombre"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className={`${styles.fieldBox} ${styles.emailField}`}>
        <TextField
          icon={<img src={iconEnvelope} alt="" />}
          iconClassName={styles.emailIcon}
          placeholder="Correo"
          type="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className={styles.buttonBox}>
        <Button className={styles.ctaButton} onClick={handleSubmit} disabled={!canSubmit}>
          Comenzar
        </Button>
      </div>
      <button className={styles.link} onClick={handleDigitaId} disabled={!canSubmit}>
        ó Digita ID
      </button>

      <Modal open={showAdvertencia} onClose={() => setShowAdvertencia(false)}>
        <img className={styles.warningIcon} src={iconWarning} alt="" aria-hidden="true" />
        <p className={modalStyles.text}>
          Parece que ya participaste en esta experiencia. ¡Gracias!
        </p>
      </Modal>

      <Footer />
    </div>
  );
}
