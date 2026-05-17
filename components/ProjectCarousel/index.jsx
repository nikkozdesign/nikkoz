import { useEffect, useMemo, useRef } from "react";
import styles from "./styles.module.scss";

// Infinite vertical carousel — middle item scales up.
// Driven by its own wheel/touch handler (page itself does not scroll).
export default function ProjectCarousel({ images = [] }) {
  const containerRef = useRef(null);
  const itemsRef = useRef([]);
  const imgsRef = useRef([]);

  // Repeat list so wrapping stays smooth even with few originals.
  const list = useMemo(() => {
    if (!images.length) return [];
    const min = 8;
    let arr = [...images];
    while (arr.length < min) arr = [...arr, ...images];
    return arr;
  }, [images]);

  const targetRef = useRef(0);
  const currentRef = useRef(0);

  useEffect(() => {
    if (!containerRef.current || !list.length) return;
    if (typeof window === "undefined") return;

    let rafId = null;
    let metrics = compute();

    function compute() {
      const viewportH = window.innerHeight;
      const viewportW = window.innerWidth;
      const itemHeight = (690 / 1920) * viewportW;
      const itemWidth = (920 / 1920) * viewportW;
      const spacing = itemHeight;
      return {
        viewportH,
        itemHeight,
        itemWidth,
        spacing,
        cycle: list.length * spacing,
        fall: viewportH * 0.45,
        minScale: 0.85,
      };
    }

    const update = () => {
      const m = metrics;
      const offset = currentRef.current;
      for (let i = 0; i < itemsRef.current.length; i++) {
        const slot = itemsRef.current[i];
        if (!slot) continue;
        let y = (i * m.spacing - offset) % m.cycle;
        if (y < -m.cycle / 2) y += m.cycle;
        else if (y > m.cycle / 2) y -= m.cycle;

        const dist = Math.abs(y);
        const t = Math.min(dist / m.fall, 1);
        const scale = 1 - t * (1 - m.minScale);

        const screenY = m.viewportH / 2 + y - m.itemHeight / 2;
        slot.style.transform = `translate3d(0, ${screenY}px, 0) scale(${scale})`;
      }
    };

    const tick = () => {
      const delta = targetRef.current - currentRef.current;
      if (Math.abs(delta) > 0.05) {
        currentRef.current += delta * 0.1;
        update();
      }
      rafId = requestAnimationFrame(tick);
    };

    const WHEEL_SPEED = 0.5;
    const TOUCH_SPEED = 1.0;

    const onWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      targetRef.current += e.deltaY * WHEEL_SPEED;
    };

    let touchY = 0;
    const onTouchStart = (e) => {
      touchY = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const dy = touchY - e.touches[0].clientY;
      targetRef.current += dy * TOUCH_SPEED;
      touchY = e.touches[0].clientY;
    };

    const onResize = () => {
      metrics = compute();
      update();
    };

    const el = containerRef.current;
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("resize", onResize);
    rafId = requestAnimationFrame(tick);
    update();

    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", onResize);
    };
  }, [list]);

  if (!list.length) return null;

  return (
    <div ref={containerRef} className={styles.carousel}>
      <div className={styles.carousel__track}>
        {list.map((src, i) => (
          <div
            ref={(el) => (itemsRef.current[i] = el)}
            key={`${src}-${i}`}
            className={styles.carousel__item}
          >
            <img
              ref={(el) => (imgsRef.current[i] = el)}
              src={src}
              alt=""
              className={styles.carousel__img}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
