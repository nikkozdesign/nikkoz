import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProjectCovers } from "@/context/ProjectCoversContext";
import styles from "./styles.module.scss";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function MetaItem({ label, value }) {
  return (
    <div className={styles.project_card_meta__item}>
      <div className={styles.project_card_meta__title}>
        <span className="sigurd-22 italic dark">(</span>
        <span className="geist-16 dark uppercase">{label}</span>
        <span className="sigurd-22 italic dark">)</span>
      </div>
      <p className={`${styles.project_card_meta__text} geist-16 uppercase dark`}>
        {value}
      </p>
    </div>
  );
}

export default function ProjectCard({
  name1,
  name2,
  modifier,
  services,
  role,
  year,
  cover,
  containerAnimation,
}) {
  const cardRef = useRef(null);
  const coverRef = useRef(null);

  const projectCovers = useProjectCovers();

  useEffect(() => {
    if (!projectCovers || !coverRef.current) return;
    const unregister = projectCovers.registerCover({
      id: modifier,
      src: cover,
      element: coverRef.current,
    });
    return unregister;
  }, [projectCovers, modifier, cover]);

  useGSAP(
    () => {
      if (!coverRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 769px)", () => {
        if (!containerAnimation) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            containerAnimation,
            trigger: cardRef.current,
            start: "left right",
            end: "right left-=135%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        tl.set(coverRef.current, { y: "200vh", x: "125%", rotate: -40 }).to(
          coverRef.current,
          { rotate: 40, x: "125%", y: "-200vh" }
        );
      });

      mm.add("(max-width: 768px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 80%",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        tl.set(coverRef.current, { x: "100vw", y: "-25%", rotate: -40 }).to(
          coverRef.current,
          { rotate: 40, y: "-15%", x: "-100vw" }
        );
      });
    },
    { dependencies: [containerAnimation] }
  );

  const topLineClass = `${styles.project_card__top_line} ${
    styles[`project_card__top_line_${modifier}`] || ""
  }`;
  const bottomLineClass = `${styles.project_card__bottom_line} ${
    styles[`project_card__bottom_line_${modifier}`] || ""
  }`;

  return (
    <div ref={cardRef} className={styles.project_card}>
      {name1 && (
        <div className={topLineClass}>
          <h2 className={`${styles.project_card__name} sigurd-388 dark`}>
            {name1}
          </h2>
        </div>
      )}
      <div className={bottomLineClass}>
        <div className={styles.project_card_meta}>
          <MetaItem label="services" value={services} />
          <MetaItem label="role" value={role} />
          <MetaItem label="year" value={year} />
        </div>
        {name2 && (
          <h2 className={`${styles.project_card__name} sigurd-388 dark`}>
            {name2}
          </h2>
        )}
      </div>
      <div ref={coverRef} className={styles.project_card__cover}>
        <img
          className={styles.project_card__video}
          src={cover}
          alt={`${name1 || ""} ${name2 || ""}`.trim()}
        />
      </div>
    </div>
  );
}
