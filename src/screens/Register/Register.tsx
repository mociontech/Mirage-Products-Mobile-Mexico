import { useState } from "react";
import { useFlow } from "../../app/FlowMachine";
import { EMPTY_SESSION } from "../../app/flow.types";
import { checkEmailUsedRemotely, generateId, hasEmailPlayedLocally, rememberUsedEmail } from "../../services/idService";
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
 * Mismos campos que Register.tsx en displays/tablet de la version
 * tablet+pitch (nombre, correo, empresa, celular, area) mas "Continua sin
 * registro" y "ingresa tu ID" - a diferencia de esa version este layout no
 * viene de un frame de Figma especifico (esos campos ahi son parte de un
 * frame mas grande con teclado en pantalla que no aplica en un celular real),
 * asi que es flex en vez de posicionado absoluto pixel a pixel.
 */
const AREAS = ["Ventas", "Mercadotecnia", "Adquisiciones", "Operaciones", "Finanzas"];

export function Register() {
  const { navigate, setSession } = useFlow();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState(AREAS[0]);
  const [showAdvertencia, setShowAdvertencia] = useState(false);
  const [checking, setChecking] = useState(false);

  const canSubmit = name.trim().length > 0 && email.trim().length > 0 && !checking;

  const buildFields = () => ({
    name: name.trim(),
    email: email.trim(),
    company: company.trim() || null,
    phone: phone.trim() || null,
    area,
  });

  /**
   * hasEmailPlayedLocally solo atrapa un repetido en el MISMO celular;
   * checkEmailUsedRemotely cierra la brecha de alguien que repite desde
   * otro dispositivo con el mismo correo - antes eso pasaba de largo hasta
   * Catalog, donde el envio final se rechazaba en silencio (el unique
   * constraint de Supabase ya protegia los datos, pero el visitante nunca
   * se enteraba de que no conto).
   */
  const isEmailAlreadyUsed = async (trimmedEmail: string): Promise<boolean> => {
    if (hasEmailPlayedLocally(trimmedEmail)) return true;
    setChecking(true);
    const usedRemotely = await checkEmailUsedRemotely(trimmedEmail);
    setChecking(false);
    if (usedRemotely) rememberUsedEmail(trimmedEmail);
    return usedRemotely;
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const trimmedEmail = email.trim();

    if (await isEmailAlreadyUsed(trimmedEmail)) {
      setShowAdvertencia(true);
      return;
    }

    setSession({ ...buildFields(), code: generateId() });
    navigate("idGenerated");
  };

  const handleDigitaId = async () => {
    if (!canSubmit) return;
    const trimmedEmail = email.trim();

    if (trimmedEmail && (await isEmailAlreadyUsed(trimmedEmail))) {
      setShowAdvertencia(true);
      return;
    }
    // RegisterId only collects the ID itself — name/email must already be in the
    // session before navigating there, or the final submit goes out with no email.
    setSession(buildFields());
    navigate("registerId");
  };

  const handleSkip = () => {
    // Igual que el boton "Continua sin registro" de la version tablet: sesion vacia,
    // directo al catalogo sin generar codigo ni pasar por IdGenerated.
    setSession(EMPTY_SESSION);
    navigate("catalog");
  };

  return (
    <div className={styles.shell}>
      <BrandFrame />
      <div className={`${styles.logo} enterFromTop`}>
        <Logo />
      </div>
      <h1 className={`${styles.title} enterFromLeft delay1`}>REGISTRO</h1>

      <div className={`${styles.fields} enterFade delay2`}>
        <div className={styles.fieldBox}>
          <TextField
            icon={<img src={iconPerson} alt="" />}
            iconClassName={styles.nameIcon}
            placeholder="Nombre"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className={styles.fieldBox}>
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
        <div className={styles.fieldBox}>
          <input
            className={styles.plainInput}
            placeholder="Empresa"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
          />
        </div>
        <div className={styles.fieldBox}>
          <input
            className={styles.plainInput}
            placeholder="Celular"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </div>
        <div className={styles.fieldBox}>
          <select className={styles.select} value={area} onChange={(event) => setArea(event.target.value)}>
            {AREAS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={`${styles.buttonBox} enterFromBottom delay3`}>
        <Button className={styles.ctaButton} onClick={handleSubmit} disabled={!canSubmit}>
          {checking ? "Verificando..." : "Comenzar"}
        </Button>
      </div>
      <button
        className={`${styles.link} enterFade delay4`}
        onClick={handleDigitaId}
        disabled={!canSubmit}
      >
        ó ingresa tu ID
      </button>
      <button type="button" className={`${styles.skipLink} enterFade delay5`} onClick={handleSkip}>
        Continúa sin registro
      </button>

      <Modal open={showAdvertencia} onClose={() => setShowAdvertencia(false)}>
        <img className={styles.warningIcon} src={iconWarning} alt="" aria-hidden="true" />
        <p className={modalStyles.text}>
          Parece que ya participaste en esta experiencia. ¡Gracias!
        </p>
      </Modal>

      <div className={styles.footerWrap}>
        <Footer />
      </div>
    </div>
  );
}
