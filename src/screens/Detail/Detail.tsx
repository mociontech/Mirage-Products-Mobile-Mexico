import { useEffect } from "react";
import { useFlow } from "../../app/FlowMachine";
import { getProductById } from "../../content/products";
import styles from "./Detail.module.css";

/**
 * Banner vertical completo de un producto (logo + foto + copy + features,
 * ya armado por la marca - product.pitchImage), a pantalla completa. Antes
 * este mismo contenido lo mostraba una segunda pantalla (el pitch)
 * sincronizada por WebSocket con la tablet; aqui es una sola pantalla y el
 * "volver" es una flecha explicita en vez de que otro dispositivo cambie de
 * estado - es el pedido puntual del cliente al pasar a experiencia de un
 * solo celular.
 *
 * Cada producto que se abre aca se agrega a session.viewedProductIds (una
 * sola vez por producto, sin importar cuantas veces lo reabra) - es lo que
 * Catalog usa para calcular el puntaje final segun cuanto explorо el
 * catalogo, en vez de un fijo.
 */
export function Detail() {
  const { navigate, session, setSession } = useFlow();
  const product = getProductById(session.selectedProductId ?? "");

  useEffect(() => {
    if (!product) return;
    if (session.viewedProductIds.includes(product.id)) return;
    setSession({ viewedProductIds: [...session.viewedProductIds, product.id] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  if (!product) {
    navigate("catalog");
    return null;
  }

  return (
    <div className={styles.shell}>
      <img src={product.pitchImage} alt={product.name} className={styles.banner} />
      <button
        type="button"
        className={styles.backButton}
        aria-label="Volver al catálogo"
        onClick={() => navigate("catalog")}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M15 5L8 12L15 19"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
