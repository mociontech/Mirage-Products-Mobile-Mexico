import { useFlow } from "../../app/FlowMachine";
import { BrandFrame } from "../../components/BrandFrame";
import { Footer } from "../../components/Footer";
import { products } from "../../content/products";
import styles from "./Catalog.module.css";

/**
 * Grid de los 12 productos - toque en cualquiera abre Detail con su banner
 * completo. No hay frame de Figma para esto (pantalla nueva, no existia en
 * Memory Match ni en la version tablet+pitch), asi que el grid es diseno
 * propio: 2 columnas, con scroll vertical dentro del area de contenido (a
 * diferencia del resto de pantallas, que nunca scrollean - 12 productos
 * legibles no caben enteros en un frame de celular sin scroll).
 */
export function Catalog() {
  const { navigate, session, setSession } = useFlow();

  const openProduct = (productId: string) => {
    setSession({ selectedProductId: productId });
    navigate("detail");
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

      <Footer />
    </div>
  );
}
