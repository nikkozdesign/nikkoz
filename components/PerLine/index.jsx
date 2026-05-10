import { useRef } from "react";
import { useScroll, motion, useTransform } from "framer-motion";

export default function PerLine({ value, className }) {
  const element = useRef(null);
  const { scrollYProgress } = useScroll({
    target: element,
    offset: ["start 0.9", "start 0.25"],
  });

  const lines = value.split("\n");

  return (
    <motion.div
      className={className}
      ref={element}
      style={{ opacity: scrollYProgress }}
    >
      {lines.map((line, i) => {
        const start = i / lines.length;
        const end = start + 1 / lines.length;

        return (
          <Line key={i} range={[start, end]} progress={scrollYProgress}>
            {line}
          </Line>
        );
      })}
    </motion.div>
  );
}

function Line({ children, range, progress }) {
  const opacity = useTransform(progress, range, [0, 1]);
  const y = useTransform(progress, range, [20, 0]);

  return (
    <motion.div
      className="line"
      style={{
        display: "inline-block",
        opacity,
        y,
      }}
    >
      {children}
    </motion.div>
  );
}
