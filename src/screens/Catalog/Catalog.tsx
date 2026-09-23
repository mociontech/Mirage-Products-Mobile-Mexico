import { useFlow } from "../../app/FlowMachine";
import { BrandFrame } from "../../components/BrandFrame";
import { Button } from "../../components/Button";
import { Footer } from "../../components/Footer";
import { Logo } from "../../components/Logo";
import { getProductById, products } from "../../content/products";
import { generateIdempotencyKey, rememberUsedEmail } from "../../services/idService";
import { enqueueParticipation } from "../../services/outbox";
import type { Participation } from "../../types/participation";
import styles from "./Catalog.module.css";

/**
 * Tres secciones tematicas en vez de un grid parejo de 12 (referencia
 * visual del cliente) - la del medio (Alto rendimiento) va en rojo, sus 4
 * logos (Inverter X, Neo Inverter, X5, X5 Inverter) ya estan pensados para
 * fondo rojo: en el desktop de la tablet esos 4 son justo los que caen
 * sobre la franja roja horizontal (ver tiles.ts, y>=889px), asi que se
 * reusan tal cual, sin ningun filtro de color. Agrupacion confirmada con el
 * cliente contra el catalogo real de Mexico.
 */
const SECTIONS: Array<{ title: string; variant: "light" | "dark"; ids: string[] }> = [
  {
    title: "Soluciones para tu espacio",
    variant: "light",
    ids: ["life-12-plus", "x-life", "aire-ventana-1-ton", "aire-ventana-2-ton"],
  },
  {
    title: "Alto rendimiento",
    variant: "dark",
    ids: ["inverter-x", "neo-inverter", "x5-convencional", "xs-inverter"],
  },
  {
    title: "Confort para cada proyecto",
    variant: "light",
    ids: ["flex-inverter", "inverter-x32", "magnum-22", "magnum-18"],
  },
];

export function Catalog() {
  const { navigate, session, setSession } = useFlow();

  const openProduct = (productId: string) => {
    setSession({ selectedProductId: productId });
    navigate("detail");
  };

  const handleFinish = () => {
    const points = Math.round((session.viewedProductIds.length / products.length) * 100);
    const participation: Participation = {
      code: session.code,
      name: session.name,
      email: session.email,
      company: session.company,
      phone: session.phone,
      area: session.area,
      productId: session.selectedProductId,
      points,
      idempotencyKey: generateIdempotencyKey(),
      ts: Date.now(),
    };
    enqueueParticipation(participation);
    // Recien aca (no antes de intentarlo) se marca localmente como
    // participado - asi un segundo intento en este mismo celular con el
    // mismo correo lo atrapa hasEmailPlayedLocally al instante, en vez de
    // depender solo del chequeo remoto o de que Supabase rechace el insert
    // con un 409 silencioso.
    if (session.email) rememberUsedEmail(session.email);
    navigate("thankYou");
  };

  return (
    <div className={styles.shell}>
      <BrandFrame />
      <div className={styles.header}>
        <div className={styles.logoWrap}>
          <Logo />
        </div>
        {session.name && <p className={styles.greeting}>Hola, {session.name.split(" ")[0]}</p>}
      </div>

      <div className={styles.scrollArea}>
        {SECTIONS.map((section) => (
          <section
            key={section.title}
            className={`${styles.section} ${section.variant === "dark" ? styles.sectionDark : ""}`}
          >
            <h2 className={`${styles.sectionTitle} ${section.variant === "dark" ? styles.sectionTitleDark : ""}`}>
              {section.title}
            </h2>
            <div className={`${styles.sectionDivider} ${section.variant === "dark" ? styles.sectionDividerDark : ""}`} />

            <div className={styles.grid}>
              {section.ids.map((id) => {
                const product = getProductById(id);
                if (!product) return null;
                return (
                  <button
                    key={product.id}
                    type="button"
                    className={`${styles.card} ${section.variant === "dark" ? styles.cardOnDark : ""}`}
                    onClick={() => openProduct(product.id)}
                  >
                    <img src={product.logoImage} alt={product.name} className={styles.cardLogo} />
                    <img src={product.photoImage} alt="" className={styles.cardPhoto} />
                  </button>
                );
              })}
            </div>
          </section>
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
