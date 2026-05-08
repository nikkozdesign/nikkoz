import { AnimatePresence } from "framer-motion";
import { useTransition } from "@/context/TransitionContext";
import ShaderMorph from "./transitions/ShaderMorph";

const REGISTRY = {
  shaderMorph: ShaderMorph,
};

export default function TransitionOverlay() {
  const { transition, complete } = useTransition();
  const Effect = transition ? REGISTRY[transition.kind] : null;

  return (
    <AnimatePresence>
      {Effect && (
        <Effect
          key={transition.kind}
          payload={transition.payload}
          onDone={complete}
        />
      )}
    </AnimatePresence>
  );
}
