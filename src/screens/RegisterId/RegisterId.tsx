import { useState } from "react";
import { useFlow } from "../../app/FlowMachine";
import { checkIdStatus } from "../../services/idService";
import { Button } from "../../components/Button";
import { IdInput, type IdInputValue } from "../../components/IdInput";
import { Modal } from "../../components/Modal";
import modalStyles from "../../components/Modal/Modal.module.css";
import iconWarning from "../../assets/images/icon-warning.svg";
import { ScreenShell } from "../ScreenShell";
import styles from "./RegisterId.module.css";

const EMPTY_ID: IdInputValue = ["", ""];

/**
 * ID entry screen. "Advertencia" (ID already used) is a local modal, not a
 * flow screen: the design shows it as an overlay with no path into the game.
 */
export function RegisterId() {
  const { navigate, setSession } = useFlow();
  const [blocks, setBlocks] = useState<IdInputValue>(EMPTY_ID);
  const [checking, setChecking] = useState(false);
  const [showAdvertencia, setShowAdvertencia] = useState(false);

  const code = `${blocks[0]}-${blocks[1]}`;
  const canSubmit = blocks[0].length === 3 && blocks[1].length === 3 && !checking;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setChecking(true);
    const status = await checkIdStatus(code);
    setChecking(false);
    if (status === "used") {
      setShowAdvertencia(true);
      return;
    }
    setSession({ code });
    navigate("idGenerated");
  };

  return (
    <ScreenShell
      actions={
        <Button onClick={handleSubmit} disabled={!canSubmit}>
          {checking ? "Verificando..." : "Comenzar"}
        </Button>
      }
    >
      <h1 className={styles.title}>Agrega ID</h1>
      <IdInput value={blocks} onChange={setBlocks} />

      <Modal open={showAdvertencia} onClose={() => setShowAdvertencia(false)}>
        <img className={styles.warningIcon} src={iconWarning} alt="" aria-hidden="true" />
        <p className={modalStyles.text}>
          Parece que ya participaste en esta experiencia. ¡Gracias!
        </p>
      </Modal>
    </ScreenShell>
  );
}
