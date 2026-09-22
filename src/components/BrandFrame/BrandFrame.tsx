import styles from "./BrandFrame.module.css";

/**
 * The two red accent bars recurring at the top/bottom edge of every screen.
 * Must be rendered inside a `position: relative` ancestor (the app shell).
 */
export function BrandFrame() {
  return (
    <>
      <div className={`${styles.bar} ${styles.top}`} aria-hidden="true" />
      <div className={`${styles.bar} ${styles.bottom}`} aria-hidden="true" />
    </>
  );
}
