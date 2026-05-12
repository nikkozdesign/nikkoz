import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SkobkaLeft from "@/components/sections/TypesOfWork/svg/SkobkaLeft";
import SkobkaRight from "@/components/sections/TypesOfWork/svg/SkobkaRight";
import styles from "./styles.module.scss";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const DISCOVERY_ITEMS = [
  "understand the space,",
  "find what's broken,",
  "talk to the right people,",
  "map the territory,",
  "define what success looks like,",
];

const DESIGN_ITEMS = [
  "make it ugly first,",
  "then make it right,",
  "then make it beautiful,",
  "test it on someone who doesn't care about design,",
  "do it again,",
];

const DEV_ITEMS = [
  "write code that reads like design,",
  "animate with intention,",
  "ship something real,",
  "watch people use it,",
  "fix what breaks.",
];

export default function Process() {
  const sectionRef = useRef(null);
  const titleBlockRef = useRef(null);
  const designRef = useRef(null);
  const devRef = useRef(null);
  const [stage, setStage] = useState("discovery");

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 769px)", () => {
      // title scale + borderRadius on exit (bg + content together)
      gsap.fromTo(
        titleBlockRef.current,
        { scale: 1, borderRadius: "0px" },
        {
          scale: 0.9,
          borderRadius: "24px",
          ease: "none",
          immediateRender: false,
          scrollTrigger: {
            trigger: titleBlockRef.current,
            start: "bottom bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );

      // parallax: title moves up faster than scroll (Lenis-like acceleration)
      gsap.to(titleBlockRef.current, {
        yPercent: -30,
        ease: "none",
        scrollTrigger: {
          trigger: titleBlockRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // stage text swap: design
      ScrollTrigger.create({
        trigger: designRef.current,
        start: "top center",
        end: "bottom center",
        onEnter: () => setStage("design"),
        onLeaveBack: () => setStage("discovery"),
      });

      // stage text swap: development
      ScrollTrigger.create({
        trigger: devRef.current,
        start: "top center",
        end: "bottom center",
        onEnter: () => setStage("development"),
        onLeaveBack: () => setStage("design"),
      });
    });
  }, []);

  return (
    <section ref={sectionRef} className={styles.process}>
      <div ref={titleBlockRef} className={styles.process_title}>
        <SkobkaLeft className={styles.process_title__skobka_left} />
        <div className={styles.process_title__heading}>
          <div className={styles.section_name__wraper_process}>
            <div className={styles.section_name_process}>
              <span className="sigurd-36 italic dark">(</span>
              <span className="geist-25 dark uppercase">
                how the magic happens
              </span>
              <span className="sigurd-36 italic dark">)</span>
            </div>
          </div>
          <h2 className={`${styles.process_title__title} sigurd-212 dark center`}>
            It&apos;s all about the process
          </h2>
        </div>
        <SkobkaRight className={styles.process_title__skobka_right} />
      </div>

      <div className={styles.process_content}>
        <div className={`${styles.process_content__wrap} grid-layout`}>
          <div className={styles.process_content__left}>
            <p className={`${styles.process_content__text} light geist-82`}>
              {stage}
            </p>
          </div>

          <div className={styles.process_content__center}>
            <ul
              className={`${styles.process_content__list} ${styles.process_content__list_first}`}
            >
              {DISCOVERY_ITEMS.map((item, i) => (
                <li
                  key={i}
                  className={`${styles.process_content__list_item} light geist-82`}
                >
                  {item}
                </li>
              ))}
            </ul>

            <ul
              ref={designRef}
              className={`${styles.process_content__list} ${styles.process_content__list_second}`}
            >
              {DESIGN_ITEMS.map((item, i) => (
                <li
                  key={i}
                  className={`${styles.process_content__list_item} light sigurd-92`}
                >
                  {item}
                </li>
              ))}
            </ul>

            <ul
              ref={devRef}
              className={`${styles.process_content__list} ${styles.process_content__list_third}`}
            >
              {DEV_ITEMS.map((item, i) => (
                <li
                  key={i}
                  className={`${styles.process_content__list_item} light geist-82`}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.process_content__right}>
            <p
              className={`${styles.process_content__text} light geist-82 right`}
            >
              stage
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
