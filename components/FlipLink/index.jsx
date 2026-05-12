import { forwardRef, useEffect, useRef, useState } from "react";
import { motion, cubicBezier } from "framer-motion";
import styles from "./styles.module.scss";

const DURATION = 0.45;
const STAGGER = 0.025;
const EASING = cubicBezier(0.76, 0, 0.024, 1);

const FlipLink = forwardRef(function FlipLink(
  { children, href, className, target },
  ref
) {
  const topRef = useRef(null);
  const [, setLinkWidth] = useState(0);

  useEffect(() => {
    if (topRef.current) {
      setLinkWidth(topRef.current.offsetWidth * 1.5);
    }
  }, [children]);

  const chars = String(children).split("");

  return (
    <motion.a
      ref={ref}
      href={href}
      target={target}
      className={`${styles.flip_link} ${className || ""}`}
      initial="initial"
      whileHover="hovered"
    >
      <div className={styles.flip_link__top} ref={topRef}>
        {chars.map((l, i) => (
          <motion.span
            key={i}
            variants={{
              initial: { y: 0 },
              hovered: { y: "-101%" },
            }}
            transition={{
              duration: DURATION,
              ease: EASING,
              delay: STAGGER * i,
            }}
            className={styles.flip_link__char}
          >
            {l === " " ? " " : l}
          </motion.span>
        ))}
      </div>
      <div className={styles.flip_link__bottom}>
        {chars.map((l, i) => (
          <motion.span
            key={i}
            variants={{
              initial: { y: "101%" },
              hovered: { y: 0 },
            }}
            transition={{
              duration: DURATION,
              ease: EASING,
              delay: STAGGER * i,
            }}
            className={styles.flip_link__char}
          >
            {l === " " ? " " : l}
          </motion.span>
        ))}
      </div>
    </motion.a>
  );
});

export default FlipLink;
