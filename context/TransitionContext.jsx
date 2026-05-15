import { createContext, useContext, useMemo, useState, useCallback } from "react";

const TransitionContext = createContext(null);

export function TransitionProvider({ children }) {
  const [transition, setTransition] = useState(null);
  const [phase, setPhaseState] = useState(null);

  const start = useCallback((kind, payload) => {
    setTransition({ kind, payload });
    setPhaseState("expanding");
  }, []);

  const setPhase = useCallback((p) => {
    setPhaseState(p);
  }, []);

  const complete = useCallback(() => {
    setTransition(null);
    setPhaseState(null);
  }, []);

  const value = useMemo(
    () => ({ transition, phase, start, setPhase, complete }),
    [transition, phase, start, setPhase, complete]
  );

  return (
    <TransitionContext.Provider value={value}>
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("useTransition must be inside TransitionProvider");
  return ctx;
}
