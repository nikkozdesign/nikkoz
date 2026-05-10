import { useEffect, useState } from "react";
import styles from "./styles.module.scss";

export default function DesignGrid() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("designGrid") === "true";
    if (stored) setVisible(true);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "g" && e.key !== "G") return;
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.target?.isContentEditable) return;
      setVisible((v) => {
        const next = !v;
        localStorage.setItem("designGrid", String(next));
        return next;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.grid} aria-hidden="true">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className={styles.col} />
      ))}
    </div>
  );
}
