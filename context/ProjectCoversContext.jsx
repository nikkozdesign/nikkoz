import { createContext, useContext, useMemo, useState, useCallback } from "react";

const ProjectCoversContext = createContext(null);

export function useProjectCovers() {
  return useContext(ProjectCoversContext);
}

export function ProjectCoversProvider({ children }) {
  const [covers, setCovers] = useState([]);

  const registerCover = useCallback((cover) => {
    setCovers((prev) => {
      // dedupe by id
      const next = prev.filter((c) => c.id !== cover.id);
      next.push(cover);
      return next;
    });
    return () => {
      setCovers((prev) => prev.filter((c) => c.id !== cover.id));
    };
  }, []);

  const value = useMemo(
    () => ({ covers, registerCover }),
    [covers, registerCover]
  );

  return (
    <ProjectCoversContext.Provider value={value}>
      {children}
    </ProjectCoversContext.Provider>
  );
}
