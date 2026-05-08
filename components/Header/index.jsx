import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSpring, useMotionValueEvent } from "framer-motion";
import { useLenis } from "@/context/LenisContext";
import styles from "./styles.module.scss";

export default function Header() {
  const router = useRouter();
  const lenis = useLenis();
  const isHome = router.pathname === "/";

  const [target, setTarget] = useState(isHome ? 0 : 1);

  useEffect(() => {
    if (!isHome) {
      setTarget(1);
      return;
    }
    if (!lenis) return;

    const onScroll = ({ scroll }) => {
      const p = Math.min(scroll / window.innerHeight, 1);
      setTarget(p);
    };
    lenis.on("scroll", onScroll);
    onScroll({ scroll: lenis.scroll });
    return () => lenis.off("scroll", onScroll);
  }, [lenis, isHome]);

  const progress = useSpring(target, {
    stiffness: 120,
    damping: 22,
    mass: 0.6,
  });

  useEffect(() => {
    progress.set(target);
  }, [target, progress]);

  useMotionValueEvent(progress, "change", (v) => {
    document.documentElement.style.setProperty("--header-progress", v);
  });

  return (
    <header className={styles.header}>
      <div className={styles.logo}>NIKKOZ</div>
    </header>
  );
}
