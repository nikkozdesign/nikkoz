import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLightSection } from "@/hooks/useLightSection";
import { PROJECTS } from "@/lib/projects";
import ProjectCard from "./ProjectCard";
import styles from "./styles.module.scss";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Projects() {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const [mainTimeline, setMainTimeline] = useState(null);

  useLightSection(sectionRef);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 769px)", () => {
      const containerWidth = containerRef.current.scrollWidth;
      const scrollAmount = -(containerWidth - window.innerWidth);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${Math.abs(scrollAmount)}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      tl.to(containerRef.current, {
        x: scrollAmount,
        ease: "none",
      });

      setMainTimeline(tl);

      return () => {
        setMainTimeline(null);
      };
    });

 

    mm.add("(max-width: 768px)", () => {
      setMainTimeline(null);
    });
  }, []);



  return (
    <section id="projects" ref={sectionRef} className={styles.projects}>
      <div className={styles.projects__camera}>
        <div ref={containerRef} className={styles.projects__container}>
          <div className={styles.projects__item} />
          {PROJECTS.map((p) => (
            <div key={p.slug} className={styles.projects__item}>
              <ProjectCard
                {...p}
                modifier={p.slug}
                containerAnimation={mainTimeline}
              />
            </div>
          ))}
          <div
            className={`${styles.projects__item} ${styles.projects__item_last}`}
          />
        </div>
      </div>
    </section>
  );
}
