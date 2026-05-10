import { useEffect } from "react";

let activeCount = 0;

export function useLightSection(ref, { threshold = 0.01 } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isActive = false;
    const setActive = (active) => {
      if (active === isActive) return;
      isActive = active;
      activeCount += active ? 1 : -1;
      document.documentElement.dataset.section =
        activeCount > 0 ? "light" : "";
    };

    const obs = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold }
    );
    obs.observe(el);

    return () => {
      obs.disconnect();
      setActive(false);
    };
  }, [ref, threshold]);
}
