import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLightSection } from "@/hooks/useLightSection";
import ProjectCard from "./ProjectCard";
import styles from "./styles.module.scss";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const PROJECTS = [
  {
    name1: "Zara",
    name2: "Home",
    modifier: "zara",
    services: "research / design / art direction / motion",
    role: "lead designer",
    year: "2022",
    cover: "/zara-cover.png",
  },
  {
    name1: "Xerox",
    name2: "PARC",
    modifier: "xerox",
    services: "research / design / art direction / motion",
    role: "lead designer",
    year: "2022",
    cover: "/zara-cover.png",
  },
  {
    name1: "Volvo",
    name2: "S90",
    modifier: "volvo",
    services: "research / design / art direction / motion / 3d",
    role: "lead designer",
    year: "2023",
    cover: "/zara-cover.png",
  },
  {
    name2: "Sephora",
    modifier: "sephora",
    services: "research / design / art direction / motion",
    role: "lead designer",
    year: "2024",
    cover: "/zara-cover.png",
  },
];

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
    <section ref={sectionRef} className={styles.projects}>
      <div className={styles.projects__camera}>
        <div ref={containerRef} className={styles.projects__container}>
          <div className={styles.projects__item} />
          {PROJECTS.map((p) => (
            <div key={p.modifier} className={styles.projects__item}>
              <ProjectCard {...p} containerAnimation={mainTimeline} />
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
