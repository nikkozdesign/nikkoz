import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SkobkaLeft from "./svg/SkobkaLeft";
import SkobkaRight from "./svg/SkobkaRight";
import styles from "./styles.module.scss";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function TypesOfWork() {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const contentRef = useRef(null);
  const eyeRef = useRef(null);
  const skobkaLeftRef = useRef(null);
  const skobkaRightRef = useRef(null);
  const elipseRef = useRef(null);
  const sectionNameRef = useRef(null);
  const descriptionRef = useRef(null);
  const projectSectionNameRef = useRef(null);

  useGSAP(() => {
    const buildTimeline = ({ skobkaX, elipseStart, elipseEnd, clipDuration = 1, clipPosition = "<15%" }) => {
      gsap.set(stickyRef.current, {
        backgroundColor: "rgba(245,245,245,0)",
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      tl.to(skobkaLeftRef.current, { x: skobkaX })
        .to(skobkaRightRef.current, { x: `-${skobkaX}` }, 0)
        .to(contentRef.current, { clipPath: "inset(0% 100%)", duration: clipDuration }, clipPosition)
        .fromTo(
          elipseRef.current,
          { scale: 0 },
          { scale: elipseStart },
          "<25%"
        )
        .to(eyeRef.current, { rotateZ: 90 }, "<25%")
        .to(sectionNameRef.current, { opacity: 0 }, "<15%")
        .to(descriptionRef.current, { opacity: 0 }, "<15%")
        .to(elipseRef.current, { scale: elipseEnd })
        .to(projectSectionNameRef.current, { opacity: 1 }, "<-5%")
        .to(stickyRef.current, { backgroundColor: "rgba(245,245,245,1)" });
    };

    const mm = gsap.matchMedia();

    mm.add("(min-width: 769px)", () => {
      buildTimeline({ skobkaX: "37vw", elipseStart: 0.97, elipseEnd: 10 });
    });

    mm.add("(max-width: 768px)", () => {
      buildTimeline({
        skobkaX: "30vw",
        elipseStart: 0.377,
        elipseEnd: 15,
        clipDuration: 1,
        clipPosition: 0,
      });
    });
  }, []);

  return (
    <section
      ref={containerRef}
      className={styles.types_of_work}
      data-color="var(--dark-color)"
    >
      <div ref={stickyRef} className={styles.types_of_work__container}>
        <div
          ref={sectionNameRef}
          className={styles.section_name__wraper_types}
        >
          <div className={styles.section_name_types}>
            <span className="sigurd-36 italic light">(</span>
            <span className="geist-25 light uppercase">Previously</span>
            <span className="sigurd-36 italic light">)</span>
          </div>
        </div>

        <div ref={eyeRef} className={styles.types_of_work__content}>
          <div className={styles.types_of_work__elips_container}>
            <svg
              ref={elipseRef}
              className={styles.types_of_work__elips}
              width="350"
              height="350"
              viewBox="0 0 350 350"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="175" cy="175" r="175" fill="white" />
            </svg>
          </div>
          <SkobkaLeft
            ref={skobkaLeftRef}
            className={styles.types_of_work__skobka_left}
          />
          <div ref={contentRef} className={styles.types_of_work__text}>
            <p className={`sigurd-102 light center ${styles.text_desktop}`}>
              7+ years across AI, Web3, and SaaS <br /> products. Adobe Creative Residency grant recipient. Blue Ribbon on Behance. Film photographer with 1,000,000+ views.
            </p>
            <p className={`sigurd-102 light center ${styles.text_mobile}`}>
              7+ years across AI, Web3, and SaaS products. Adobe Creative Residency grant recipient. Blue Ribbon on Behance. Film photographer with 1,000,000+ views.
            </p>
          </div>
          <SkobkaRight
            ref={skobkaRightRef}
            className={styles.types_of_work__skobka_right}
          />
        </div>

        <div
          ref={descriptionRef}
          className={styles.types_of_work__description}
        >
          <p className="geist-22 light center">
            Here's what that looks like in practice
          </p>
        </div>

        <div
          ref={projectSectionNameRef}
          className={styles.section_name__wraper_projects}
        >
          <div className={styles.section_name_projects}>
            <span className="sigurd-36 italic dark">(</span>
            <span className="geist-25 dark uppercase">selected works</span>
            <span className="sigurd-36 italic dark">)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
