import { useFlow } from "../../app/FlowMachine";
import { PARTICIPATION_POINTS } from "../../config/env";
import { BrandFrame } from "../../components/BrandFrame";
import { Button } from "../../components/Button";
import { Footer } from "../../components/Footer";
import { products } from "../../content/products";
import { generateIdempotencyKey } from "../../services/idService";
import { enqueueParticipation } from "../../services/outbox";
import type { Participation } from "../../types/participation";
import styles from "./Catalog.module.css";

/**
 * Grid de los 12 productos - toque en cualquiera abre Detail con su banner
 * completo. "Finalizar" dispara PARTICIPATION_RESULT hacia Evius/Supabase
 * (ver services/api.ts), igual que el boton "Continuar" -> ThankYou de
 * ProductSelect en la version tablet+pitch: se manda el ultimo producto que
 * el visitante abrio (o null si solo miro el grid) y el puntaje fijo
 * PARTICIPATION_POINTS.
 */
export function Catalog() {
  const { navigate, session, setSession } = useFlow();

  const openProduct = (productId: string) => {
    setSession({ selectedProductId: productId });
    navigate("detail");
  };

  const handleFinish = () => {
    const participation: Participation = {
      code: session.code,
      name: session.name,
      email: session.email,
      company: session.company,
      phone: session.phone,
      area: session.area,
      productId: session.selectedProductId,
      points: PARTICIPATION_POINTS,
      idempotencyKey: generateIdempotencyKey(),
      ts: Date.now(),
    };
    enqueueParticipation(participation);
    navigate("thankYou");
  };

  return (
    <div className={styles.shell}>
      <BrandFrame />
      <div className={styles.header}>
        <h1 className={styles.title}>Nuestros Productos</h1>
        {session.name && <p className={styles.greeting}>Hola, {session.name.split(" ")[0]}</p>}
      </div>

      <div className={styles.grid}>
        {products.map((product) => (
          <button
            key={product.id}
            type="button"
            className={styles.card}
            onClick={() => openProduct(product.id)}
          >
            <img src={product.photoImage} alt="" className={styles.cardPhoto} />
            <img src={product.logoImage} alt={product.name} className={styles.cardLogo} />
          </button>
        ))}
      </div>

      <div className={styles.finishRow}>
        <Button className={styles.finishButton} onClick={handleFinish}>
          Finalizar
        </Button>
      </div>

      <Footer />
    </div>
  );
}
