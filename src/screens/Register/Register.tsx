import { useState } from "react";
import { useFlow } from "../../app/FlowMachine";
import { EMPTY_SESSION } from "../../app/flow.types";
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

  const canSubmit = name.trim().length > 0 && email.trim().length > 0;

  const buildFields = () => ({
    name: name.trim(),
    email: email.trim(),
    company: company.trim() || null,
    phone: phone.trim() || null,
    area,
  });

  const handleSubmit = () => {
    if (!canSubmit) return;
    const trimmedEmail = email.trim();

    // El dedupe real (email + country + experience) es del lado del servidor;
    // esto solo evita que alguien recorra todo el catalogo antes de ser rechazado.
    if (hasEmailPlayedLocally(trimmedEmail)) {
      setShowAdvertencia(true);
      return;
    }

    setSession({ ...buildFields(), code: generateId() });
    navigate("idGenerated");
  };

  const handleDigitaId = () => {
    // Nombre/correo (si se llenaron) viajan con la sesion; RegisterId solo agrega el codigo.
    if (email.trim() && hasEmailPlayedLocally(email.trim())) {
      setShowAdvertencia(true);
      return;
    }
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
      <div className={styles.logo}>
        <Logo />
      </div>
      <h1 className={styles.title}>REGISTRO</h1>

      <div className={styles.fields}>
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

      <div className={styles.buttonBox}>
        <Button className={styles.ctaButton} onClick={handleSubmit} disabled={!canSubmit}>
          Comenzar
        </Button>
      </div>
      <button className={styles.link} onClick={handleDigitaId} disabled={!canSubmit}>
        ó ingresa tu ID
      </button>
      <button type="button" className={styles.skipLink} onClick={handleSkip}>
        Continúa sin registro
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
