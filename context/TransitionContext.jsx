import { createContext, useContext, useState, useCallback } from "react";

const TransitionContext = createContext(null);

export function TransitionProvider({ children }) {
  const [transition, setTransition] = useState(null);

  const start = useCallback((kind, payload) => {
    setTransition({ kind, payload });
  }, []);

  const complete = useCallback(() => {
    setTransition(null);
  }, []);

  return (
    <TransitionContext.Provider value={{ transition, start, complete }}>
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("useTransition must be inside TransitionProvider");
  return ctx;
}
