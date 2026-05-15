import "@/styles/globals.scss";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import ShaderBackground from "@/components/ShaderBackground";
import GridLight from "@/components/GridLight";
import GridDark from "@/components/GridDark";
import Header from "@/components/Header";
import TransitionOverlay from "@/components/TransitionOverlay";
import DesignGrid from "@/components/DesignGrid";
import { ShaderPaletteProvider } from "@/context/ShaderPaletteContext";
import { LenisProvider } from "@/context/LenisContext";
import { ScrollProvider } from "@/context/ScrollContext";
import {
  TransitionProvider,
  useTransition,
} from "@/context/TransitionContext";
import { ProjectCoversProvider } from "@/context/ProjectCoversContext";

const ProjectCoversCanvas = dynamic(
  () => import("@/components/ProjectCoversCanvas"),
  { ssr: false }
);

function AnimatedRoutes({ Component, pageProps }) {
  const router = useRouter();
  const { transition } = useTransition();
  const customActive = transition !== null;

  // During custom transitions skip mode="wait" — instant exit + simultaneous
  // mount so the new page can render and run its own enter animation.
  return (
    <AnimatePresence mode={customActive ? "popLayout" : "wait"}>
      <motion.div
        key={router.asPath}
        initial={customActive ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={customActive ? { opacity: 1, transition: { duration: 0 } } : { opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Component {...pageProps} />
      </motion.div>
    </AnimatePresence>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <LenisProvider>
      <TransitionProvider>
        <ScrollProvider>
          <ShaderPaletteProvider>
            <ProjectCoversProvider>
              <ShaderBackground />
              <GridLight />
              <GridDark />
              <Header />
              <AnimatedRoutes Component={Component} pageProps={pageProps} />
              <ProjectCoversCanvas />
              <TransitionOverlay />
              <DesignGrid />
            </ProjectCoversProvider>
          </ShaderPaletteProvider>
        </ScrollProvider>
      </TransitionProvider>
    </LenisProvider>
  );
}
