import { useEffect, useState } from "react";
import { useFlow } from "../../app/FlowMachine";
import { BrandFrame } from "../../components/BrandFrame";
import { Button } from "../../components/Button";
import { Footer } from "../../components/Footer";
import { Logo } from "../../components/Logo";
import { NotchedCard } from "../../components/NotchedCard";
import { fetchTopRanking, type RankingEntry } from "../../services/ranking";
import styles from "./Ranking.module.css";

const TOP_N = 5;
/** Max chars shown for a name before truncating with "…" - keeps every row's
 * proportions/spacing intact regardless of how long a name is, instead of
 * relying only on CSS ellipsis (which depends on the rendered pixel width). */
const NAME_MAX_CHARS = 6;

function truncateName(name: string): string {
  return name.length > NAME_MAX_CHARS ? `${name.slice(0, NAME_MAX_CHARS)}…` : name;
}

/**
 * Cada cuanto reintenta mientras la pantalla siga montada. A diferencia de
 * una lista fija de delays (que se quedaba corta en redes moviles reales,
 * mas lentas que las pruebas de escritorio), esto sigue reintentando cada
 * 3s indefinidamente mientras el visitante este parado en esta pantalla -
 * son lecturas baratas, y nunca deja de intentar solo porque paso "algo de
 * tiempo".
 */
const POLL_INTERVAL_MS = 3000;

/**
 * Top 5, mismo template visual que Memory Match (node 423:290, "¡TOP 5!",
 * 1080x1920) - misma fuente (Supabase, experience "catalogo"), leida directo
 * desde el navegador en vez de a traves del sync-server (ver
 * services/ranking.ts). El insert de este mismo participante (disparado al
 * tocar "Finalizar" en Catalog) corre en segundo plano y puede no haber
 * aterrizado todavia cuando esta pantalla monta - un solo fetch inmediato
 * mostraba la lista vieja para siempre. Reintenta cada POLL_INTERVAL_MS
 * mientras el visitante este parado en esta pantalla, hasta que toque
 * "Finalizar" y salga.
 */
export function Ranking() {
  const { reset } = useFlow();
  const [entries, setEntries] = useState<RankingEntry[]>([]);

  useEffect(() => {
    let cancelled = false;

    const poll = () => {
      fetchTopRanking().then((rows) => {
        if (!cancelled) setEntries(rows.slice(0, TOP_N));
      });
    };

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={styles.shell}>
      <BrandFrame />
      <div className={styles.logo}>
        <Logo />
      </div>
      <h1 className={styles.title}>¡Top 5!</h1>
      <NotchedCard className={styles.card}>
        {entries.length === 0 ? (
          <p className={styles.empty}>Aún no hay resultados para mostrar.</p>
        ) : (
          <ol className={styles.list}>
            {entries.map((entry) => (
              <li key={entry.position} className={styles.row}>
                <span className={styles.name}>{truncateName(entry.participant_name ?? "Anónimo")}</span>
                <span className={styles.score}>{Math.round(entry.score)}pt</span>
              </li>
            ))}
          </ol>
        )}
      </NotchedCard>
      <div className={styles.buttonBox}>
        <Button className={styles.finishButton} onClick={reset}>
          Finalizar
        </Button>
      </div>
      <Footer />
    </div>
  );
}
