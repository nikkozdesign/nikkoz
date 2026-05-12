import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./styles.module.scss";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function ProjectCarousel({ images = [], rotateAmount = -45 }) {
  const containerRef = useRef(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    const imgs = containerRef.current.querySelectorAll("img");

    imgs.forEach((img) => {
      gsap.fromTo(
        img,
        { rotation: 0 },
        {
          rotation: rotateAmount,
          transformOrigin: "right center",
          ease: "none",
          scrollTrigger: {
            trigger: img,
            start: "top center",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    });
  }, [images, rotateAmount]);

  if (!images.length) return null;

  return (
    <div ref={containerRef} className={styles.carousel}>
      {images.map((src, i) => (
        <div key={i} className={styles.carousel__item}>
          <img src={src} alt="" className={styles.carousel__img} />
        </div>
      ))}
    </div>
  );
}
