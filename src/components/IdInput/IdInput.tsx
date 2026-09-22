import { useRef, type ChangeEvent } from "react";
import styles from "./IdInput.module.css";

export type IdInputValue = readonly [string, string];

interface IdInputProps {
  value: IdInputValue;
  onChange: (value: IdInputValue) => void;
  /** Renders the two blocks as read-only, e.g. to display an already-generated ID. */
  readOnly?: boolean;
}

const BLOCK_LENGTH = 3;

function sanitize(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, BLOCK_LENGTH);
}

/**
 * Two 3-digit blocks ("321 - 321") for entering/displaying a participation ID.
 * Auto-advances focus to the second block once the first is complete.
 */
export function IdInput({ value, onChange, readOnly = false }: IdInputProps) {
  const secondRef = useRef<HTMLInputElement>(null);

  const handleFirstChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = sanitize(event.target.value);
    onChange([next, value[1]]);
    if (next.length === BLOCK_LENGTH) {
      secondRef.current?.focus();
    }
  };

  const handleSecondChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange([value[0], sanitize(event.target.value)]);
  };

  return (
    <div className={styles.wrapper}>
      <input
        className={styles.box}
        value={value[0]}
        onChange={handleFirstChange}
        inputMode="numeric"
        autoComplete="off"
        maxLength={BLOCK_LENGTH}
        aria-label="ID, primer bloque"
        readOnly={readOnly}
      />
      <span className={styles.dash} aria-hidden="true" />
      <input
        ref={secondRef}
        className={styles.box}
        value={value[1]}
        onChange={handleSecondChange}
        inputMode="numeric"
        autoComplete="off"
        maxLength={BLOCK_LENGTH}
        aria-label="ID, segundo bloque"
        readOnly={readOnly}
      />
    </div>
  );
}
