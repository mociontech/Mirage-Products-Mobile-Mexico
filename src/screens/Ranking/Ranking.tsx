import { useEffect, useState } from "react";
import { useFlow } from "../../app/FlowMachine";
import { BrandFrame } from "../../components/BrandFrame";
import { Button } from "../../components/Button";
import { Footer } from "../../components/Footer";
import { Logo } from "../../components/Logo";
import { fetchTopRanking, type RankingEntry } from "../../services/ranking";
import styles from "./Ranking.module.css";

/** Igual que POSITION_POLL_DELAYS_MS en Result.tsx de Memory Match: reintentos espaciados para darle tiempo al outbox de aterrizar la fila antes de asumir que no llego. */
const REFRESH_DELAYS_MS = [0, 1500, 3500, 6000];

/**
 * Mismo Top 10 que Ranking.tsx en displays/tablet de la version tablet+pitch
 * (node 423:178, "¡TOP 5!") - misma fuente (Supabase, experience "catalogo"),
 * leida directo desde el navegador en vez de a traves del sync-server (ver
 * services/ranking.ts). El insert de este mismo participante (disparado al
 * tocar "Finalizar" en Catalog) corre en segundo plano y puede no haber
 * aterrizado todavia cuando esta pantalla monta - un solo fetch inmediato
 * mostraba la lista vieja para siempre. Reintenta unas cuantas veces con
 * backoff, no solo una vez, hasta que el usuario toque "Finalizar" y salga.
 * "Finalizar" resetea la sesion entera, igual que onFinish -> SESSION_END +
 * goHome en TabletApp.tsx.
 */
export function Ranking() {
  const { reset } = useFlow();
  const [entries, setEntries] = useState<RankingEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    const timers = REFRESH_DELAYS_MS.map((delay) =>
      setTimeout(() => {
        fetchTopRanking().then((rows) => {
          if (!cancelled) setEntries(rows);
        });
      }, delay),
    );
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className={styles.shell}>
      <BrandFrame />
      <div className={styles.logo}>
        <Logo />
      </div>
      <h1 className={styles.title}>¡Top 10!</h1>

      <div className={styles.card}>
        {entries.length === 0 ? (
          <p className={styles.empty}>Aún no hay resultados</p>
        ) : (
          <ol className={styles.list}>
            {entries.map((entry) => (
              <li key={entry.position} className={styles.row}>
                <span>{entry.participant_name ?? "Anónimo"}</span>
                <span className={styles.score}>{Math.round(entry.score)}pt</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className={styles.buttonBox}>
        <Button className={styles.finishButton} onClick={reset}>
          Finalizar
        </Button>
      </div>
      <Footer />
    </div>
  );
}
