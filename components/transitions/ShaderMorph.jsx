import { motion } from "framer-motion";

export default function ShaderMorph({ payload, onDone }) {
  const { src, rect } = payload;

  return (
    <motion.div
      initial={{
        top: rect.y,
        left: rect.x,
        width: rect.width,
        height: rect.height,
      }}
      animate={{
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={onDone}
      style={{
        position: "fixed",
        zIndex: 9000,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <img
        src={src}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </motion.div>
  );
}
