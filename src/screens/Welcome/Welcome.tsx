import { useFlow } from "../../app/FlowMachine";
import { Button } from "../../components/Button";
import { BrandFrame } from "../../components/BrandFrame";
import { Footer } from "../../components/Footer";
import logoMark from "../../assets/images/logo-mirage.svg";
import styles from "./Welcome.module.css";

/**
 * Landing screen: brand splash + CTA into Register. Positioned to match the
 * Figma frame (1080x1920) pixel-for-pixel — every left/top/width/height/
 * font-size below is `(figma_px / 1920) * 100`cqh, which is exact because the
 * app shell is aspect-ratio-locked to 1080x1920 (see App.module.css), so 1cqh
 * here always means the same fraction of the frame on every screen size.
 * Unlike the other screens, this one skips ScreenShell's flex layout on
 * purpose — Figma places these elements at absolute coordinates that don't
 * reduce to a simple centered flex column.
 */
export function Welcome() {
  const { navigate } = useFlow();
  return (
    <div className={styles.shell}>
      <BrandFrame />
      <img className={`${styles.mark} enterFromTop`} src={logoMark} alt="Mirage" />
      <h1 className={`${styles.title} enterFromLeft delay1`}>
        <span className={styles.titleTop}>NUESTROS</span>
        <span className={styles.titleBottom}>PRODUCTOS</span>
      </h1>
      <div className={`${styles.buttonBox} enterFromBottom delay2`}>
        <Button className={styles.ctaButton} onClick={() => navigate("register")}>
          Iniciar
        </Button>
      </div>
      <p className={`${styles.tagline} enterFade delay3`}>
        Acondicionamos tu vida<sup>®</sup>
      </p>
      <Footer />
    </div>
  );
}
