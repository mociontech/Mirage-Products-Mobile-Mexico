import { useFlow } from "../../app/FlowMachine";
import { BrandFrame } from "../../components/BrandFrame";
import { Button } from "../../components/Button";
import { Footer } from "../../components/Footer";
import { Logo } from "../../components/Logo";
import { getProductById, products } from "../../content/products";
import { generateIdempotencyKey, rememberUsedEmail } from "../../services/idService";
import { enqueueParticipation } from "../../services/outbox";
import { prefetchTopRanking } from "../../services/ranking";
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
interface ImageCrop {
  left: string;
  top: string;
  width: string;
  height: string;
}

interface TileLayout {
  /** Proporcion comun de la fila en el muro original. */
  cardAspect: string;
  logo: { left: string; top: string; width: string };
  photo: {
    left: string;
    top: string;
    width: string;
    aspect: string;
    crop?: ImageCrop;
  };
  capacity?: { left: string; top: string };
}

/**
 * Composicion completa portada desde ProductSelect/tiles.ts de Products MX.
 * No basta con copiar el ancho visible: las fotos fuente traen aire alrededor
 * del equipo y Figma las amplia/recorta de forma distinta para cada modelo.
 * Los porcentajes de logo y marco se normalizan contra la tarjeta original;
 * `crop` conserva exactamente la transformacion interna de Figma.
 */
const TILE_LAYOUTS: Record<string, TileLayout> = {
  "life-12-plus": {
    cardAspect: "370 / 288",
    logo: { left: "20.82%", top: "9.38%", width: "63.50%" },
    photo: { left: "4.88%", top: "48.26%", width: "89.20%", aspect: "347 / 122" },
  },
  "x-life": {
    cardAspect: "370 / 288",
    logo: { left: "24.02%", top: "6.25%", width: "53.52%" },
    photo: {
      left: "1.57%",
      top: "44.79%",
      width: "95.30%",
      aspect: "365 / 143",
      crop: { left: "-6.68%", top: "-6.48%", width: "114.2%", height: "106.56%" },
    },
  },
  "aire-ventana-1-ton": {
    cardAspect: "370 / 288",
    logo: { left: "25.95%", top: "9.03%", width: "47.57%" },
    capacity: { left: "49.73%", top: "28.47%" },
    photo: {
      left: "17.03%",
      top: "35.07%",
      width: "63.24%",
      aspect: "234 / 161",
      crop: { left: "0%", top: "-21.7%", width: "100%", height: "145.13%" },
    },
  },
  "aire-ventana-2-ton": {
    cardAspect: "370 / 288",
    logo: { left: "26.22%", top: "9.03%", width: "47.30%" },
    capacity: { left: "50%", top: "28.47%" },
    photo: {
      left: "22.43%",
      top: "35.07%",
      width: "55.68%",
      aspect: "206 / 174",
      crop: { left: "-1.54%", top: "-13.14%", width: "103.09%", height: "121.9%" },
    },
  },
  "xs-inverter": {
    cardAspect: "393 / 241",
    logo: { left: "34.86%", top: "4.15%", width: "29.52%" },
    photo: {
      left: "4.07%",
      top: "29.88%",
      width: "91.86%",
      aspect: "361 / 162",
      crop: { left: "-8.61%", top: "-28.57%", width: "113.52%", height: "142.42%" },
    },
  },
  "neo-inverter": {
    cardAspect: "393 / 241",
    logo: { left: "31.68%", top: "10.79%", width: "35.40%" },
    photo: {
      left: "5.20%",
      top: "31.54%",
      width: "91.09%",
      aspect: "368 / 148",
      crop: { left: "-7.02%", top: "-1.69%", width: "111.11%", height: "112.07%" },
    },
  },
  "inverter-x": {
    cardAspect: "393 / 241",
    logo: { left: "28.11%", top: "8.71%", width: "46.52%" },
    photo: {
      left: "5.22%",
      top: "35.27%",
      width: "91.79%",
      aspect: "369 / 128",
      crop: { left: "-6.8%", top: "-104.6%", width: "113.6%", height: "326.44%" },
    },
  },
  "x5-convencional": {
    cardAspect: "393 / 241",
    logo: { left: "34.45%", top: "4.98%", width: "29.82%" },
    photo: {
      left: "3.34%",
      top: "29.88%",
      width: "92.03%",
      aspect: "358 / 162",
      crop: { left: "-5.94%", top: "-28.03%", width: "112.07%", height: "142.01%" },
    },
  },
  "flex-inverter": {
    cardAspect: "380 / 278",
    logo: { left: "30.85%", top: "3.60%", width: "38.56%" },
    photo: {
      left: "-1.33%",
      top: "25.90%",
      width: "99.20%",
      aspect: "373 / 159",
      crop: { left: "-12.62%", top: "-50.84%", width: "128.53%", height: "201.53%" },
    },
  },
  "inverter-x32": {
    cardAspect: "380 / 278",
    logo: { left: "32.20%", top: "4.32%", width: "35.34%" },
    photo: {
      left: "1.83%",
      top: "25.90%",
      width: "95.55%",
      aspect: "365 / 169",
      crop: { left: "-28.19%", top: "-54.45%", width: "152.32%", height: "219.01%" },
    },
  },
  "magnum-22": {
    cardAspect: "380 / 278",
    logo: { left: "13.68%", top: "5.04%", width: "73.42%" },
    photo: {
      left: "3.42%",
      top: "29.14%",
      width: "93.68%",
      aspect: "356 / 140",
      crop: { left: "-9.19%", top: "-58.58%", width: "117.97%", height: "208.55%" },
    },
  },
  "magnum-18": {
    cardAspect: "380 / 278",
    logo: { left: "13.68%", top: "5.04%", width: "73.42%" },
    photo: { left: "3.07%", top: "33.45%", width: "93.86%", aspect: "550 / 158" },
  },
};

/** Aires de ventana: la unica pareja con etiqueta de capacidad visible en el
 * desarrollo original tablet+pitch (ProductSelect.tsx / tiles.ts,
 * "capacityLabel") - se habia perdido en el puerto a mobile. */
const CAPACITY_LABEL_BY_ID: Record<string, string> = {
  "aire-ventana-1-ton": "1 tonelada",
  "aire-ventana-2-ton": "2 toneladas",
};

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
    // Adelanta el fetch del Top 5 apenas se conoce el puntaje final (antes
    // de ThankYou) para que Ranking ya lo tenga listo al llegar ahi.
    prefetchTopRanking();
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
      <div className={`${styles.header} enterFromTop`}>
        <div className={styles.logoWrap}>
          <Logo />
        </div>
        {session.name && <p className={styles.greeting}>Hola, {session.name.split(" ")[0]}</p>}
      </div>

      <div className={styles.scrollArea}>
        {SECTIONS.map((section, sectionIndex) => (
          <section
            key={section.title}
            className={`${styles.section} ${section.variant === "dark" ? styles.sectionDark : ""} enterFromLeft`}
            style={{ animationDelay: `${sectionIndex * 120}ms` }}
          >
            <h2 className={`${styles.sectionTitle} ${section.variant === "dark" ? styles.sectionTitleDark : ""}`}>
              {section.title}
            </h2>
            <div className={`${styles.sectionDivider} ${section.variant === "dark" ? styles.sectionDividerDark : ""}`} />

            <div className={styles.grid}>
              {section.ids.map((id, cardIndex) => {
                const product = getProductById(id);
                if (!product) return null;
                const layout = TILE_LAYOUTS[product.id];
                if (!layout) return null;
                const capacityLabel = CAPACITY_LABEL_BY_ID[product.id];
                return (
                  <button
                    key={product.id}
                    type="button"
                    className={`${styles.card} ${section.variant === "dark" ? styles.cardOnDark : ""} enterScale`}
                    style={{
                      animationDelay: `${sectionIndex * 120 + cardIndex * 40}ms`,
                      aspectRatio: layout.cardAspect,
                    }}
                    onClick={() => openProduct(product.id)}
                  >
                    <img
                      src={product.logoImage}
                      alt={product.name}
                      className={styles.cardLogo}
                      style={{ left: layout.logo.left, top: layout.logo.top, width: layout.logo.width }}
                    />
                    {capacityLabel && (
                      <span
                        className={styles.capacityLabel}
                        style={{
                          left: layout.capacity?.left,
                          top: layout.capacity?.top,
                          ...(section.variant === "dark" ? { color: "#fff" } : {}),
                        }}
                      >
                        {capacityLabel}
                      </span>
                    )}
                    <span
                      className={styles.cardPhotoFrame}
                      style={{
                        left: layout.photo.left,
                        top: layout.photo.top,
                        width: layout.photo.width,
                        aspectRatio: layout.photo.aspect,
                      }}
                    >
                      <img
                        src={product.photoImage}
                        alt=""
                        className={`${styles.cardPhoto} ${layout.photo.crop ? "" : styles.cardPhotoCover}`}
                        style={layout.photo.crop}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className={`${styles.finishRow} enterFromBottom`}>
        <Button className={styles.finishButton} onClick={handleFinish}>
          Finalizar
        </Button>
      </div>

      <Footer />
    </div>
  );
}
