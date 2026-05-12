import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLightSection } from "@/hooks/useLightSection";
import SkobkaLeft from "@/components/sections/TypesOfWork/svg/SkobkaLeft";
import SkobkaRight from "@/components/sections/TypesOfWork/svg/SkobkaRight";
import Parallax from "@/components/Parallax";
import styles from "./styles.module.scss";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Playground() {
  const sectionRef = useRef(null);
  const wrapRef = useRef(null);
  const titleRef = useRef(null);
  const imgsContainerRef = useRef(null);

  useLightSection(sectionRef);

  useGSAP(() => {
    // entry: scale 0.9 → 1 (like About)
    gsap.fromTo(
      wrapRef.current,
      { scale: 0.9 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top bottom",
          end: "top top",
          scrub: true,
        },
      }
    );

    // exit: scale 1 → 0.8 (last section before footer)
    gsap.fromTo(
      wrapRef.current,
      { scale: 1 },
      {
        scale: 0.8,
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "bottom 60%",
          end: "bottom top",
          scrub: true,
        },
      }
    );

    const mm = gsap.matchMedia();

    mm.add("(min-width: 769px)", () => {
      // title scale-down
      gsap.to(titleRef.current, {
        scale: 0.5,
        ease: "none",
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // per-image scale reveal
      const images = imgsContainerRef.current.querySelectorAll("img");
      images.forEach((img) => {
        gsap.fromTo(
          img,
          { scale: 0 },
          {
            scale: 1,
            scrollTrigger: {
              trigger: img,
              start: "top bottom",
              end: "top 80%",
              scrub: true,
              fastScrollEnd: true,
              toggleActions: "play reverse play reverse",
            },
          }
        );
      });
    });

    mm.add("(max-width: 768px)", () => {
      gsap.to(titleRef.current, {
        scale: 0.7,
        ease: "none",
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    });
  }, []);

  return (
    <section ref={sectionRef} className={styles.playground}>
      <div ref={wrapRef} className={styles.playground__wrap}>
        <div ref={titleRef} className={styles.playground_title}>
          <SkobkaLeft className={styles.playground_title__skobka_left} />
          <div className={styles.playground_title__heading}>
            <div className={styles.section_name__wraper_process}>
              <div className={styles.section_name_process}>
                <span className="sigurd-36 italic light">(</span>
                <span className="geist-25 light uppercase">
                  some of my other works
                </span>
                <span className="sigurd-36 italic light">)</span>
              </div>
            </div>
            <h2 className={`${styles.playground_title__title} sigurd-410 light`}>
              Playground
            </h2>
            <p className={`${styles.playground_decription} geist-22 light`}>
              A curated collection of my other design projects where creativity
              knows no bounds, where I let my imagination run free and explore
              new ideas
            </p>
          </div>
          <SkobkaRight className={styles.playground_title__skobka_right} />
        </div>

        <div ref={imgsContainerRef} className={styles.playground__imgs}>
          <img
            src="/playground/playground-01.webp"
            alt=""
            className={`${styles.playground__img} ${styles.playground__img_1}`}
          />
          <Parallax speed={1}>
            <img
              src="/playground/playground-02.webp"
              alt=""
              className={`${styles.playground__img} ${styles.playground__img_2}`}
            />
          </Parallax>
          <img
            src="/playground/playground-03.webp"
            alt=""
            className={`${styles.playground__img} ${styles.playground__img_3}`}
          />
          <img
            src="/playground/playground-04.webp"
            alt=""
            className={`${styles.playground__img} ${styles.playground__img_4}`}
          />
          <Parallax speed={-1}>
            <img
              src="/playground/playground-05.webp"
              alt=""
              className={`${styles.playground__img} ${styles.playground__img_5}`}
            />
          </Parallax>
          <img
            src="/playground/playground-06.webp"
            alt=""
            className={`${styles.playground__img} ${styles.playground__img_6}`}
          />
          <Parallax speed={-2}>
            <img
              src="/playground/playground-07.webp"
              alt=""
              className={`${styles.playground__img} ${styles.playground__img_7}`}
            />
          </Parallax>
          <img
            src="/playground/playground-08.webp"
            alt=""
            className={`${styles.playground__img} ${styles.playground__img_8}`}
          />
          <img
            src="/playground/playground-09.webp"
            alt=""
            className={`${styles.playground__img} ${styles.playground__img_9}`}
          />
          <Parallax speed={-1}>
            <img
              src="/playground/playground-10.webp"
              alt=""
              className={`${styles.playground__img} ${styles.playground__img_10}`}
            />
          </Parallax>
          <img
            src="/playground/playground-11.webp"
            alt=""
            className={`${styles.playground__img} ${styles.playground__img_11}`}
          />
          <img
            src="/playground/playground-12.webp"
            alt=""
            className={`${styles.playground__img} ${styles.playground__img_12}`}
          />
          <Parallax speed={-1}>
            <img
              src="/playground/playground-13.webp"
              alt=""
              className={`${styles.playground__img} ${styles.playground__img_13}`}
            />
          </Parallax>
          <img
            src="/playground/playground-14.webp"
            alt=""
            className={`${styles.playground__img} ${styles.playground__img_14}`}
          />
          <img
            src="/playground/playground-15.webp"
            alt=""
            className={`${styles.playground__img} ${styles.playground__img_15}`}
          />
          <Parallax speed={-1}>
            <img
              src="/playground/playground-16.webp"
              alt=""
              className={`${styles.playground__img} ${styles.playground__img_16}`}
            />
          </Parallax>
          <img
            src="/playground/playground-17.webp"
            alt=""
            className={`${styles.playground__img} ${styles.playground__img_17}`}
          />
        </div>
      </div>
    </section>
  );
}
