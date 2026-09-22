import { useEffect, useState } from "react";
import { useFlow } from "../../app/FlowMachine";
import { BrandFrame } from "../../components/BrandFrame";
import { Button } from "../../components/Button";
import { Footer } from "../../components/Footer";
import { Logo } from "../../components/Logo";
import { fetchTopRanking, type RankingEntry } from "../../services/ranking";
import styles from "./Ranking.module.css";

/**
 * Mismo Top 10 que Ranking.tsx en displays/tablet de la version tablet+pitch
 * (node 423:178, "¡TOP 5!") - misma fuente (Supabase, experience "catalogo"),
 * leida directo desde el navegador en vez de a traves del sync-server (ver
 * services/ranking.ts). "Finalizar" resetea la sesion entera, igual que
 * onFinish -> SESSION_END + goHome en TabletApp.tsx.
 */
export function Ranking() {
  const { reset } = useFlow();
  const [entries, setEntries] = useState<RankingEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchTopRanking().then((rows) => {
      if (!cancelled) setEntries(rows);
    });
    return () => {
      cancelled = true;
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
