import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLightSection } from "@/hooks/useLightSection";
import Parallax from "@/components/Parallax";
import PerLine from "@/components/PerLine";
import Ampersand from "./svg/Ampersand";
import styles from "./styles.module.scss";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const TEXT_BIG_DESKTOP =
  "I'm Nikita — a designer and \ndeveloper based in Kyiv. I think about design \nthe way Bauhaus taught us — form follows \nfunction, nothing is decorative without a \nreal reason.";

const TEXT_BIG_MOBILE =
  "I'm Nikita — \na designer and developer \nbased in Kyiv. I think \nabout design the way \nBauhaus taught us — \nform follows function, \nnothing is decorative \nwithout a real reason.";

const TEXT_SMALL_DESKTOP =
  "Then I look at the Dadaists and \nthink: rules are made to be broken with intention. \nThen I walk into a home decor store and just want \neverything to shimmer. I try to fit all three into the \nweb — the last place anyone expects it.";

const TEXT_SMALL_MOBILE =
  "Then I look at the \nDadaists and think: rules are made to \nbe broken with intention. Then I \nwalk into a home decor store and \njust want everything to shimmer. \nI try to fit all three into the web — \nthe last place anyone expects it.";

const TEXT_EXTRASMALL =
  "Currently designing and building \neditorial websites for brands that take \nvisual quality seriously.";

export default function About() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const imgContainer = useRef(null);
  const imgSecond = useRef(null);
  const imgThird = useRef(null);
  const imgFourth = useRef(null);
  const imgFifth = useRef(null);

  useLightSection(sectionRef);

  useGSAP(() => {
    // image stack: each subsequent image scales smaller
    const imgTl = gsap.timeline({
      scrollTrigger: {
        trigger: imgContainer.current,
        start: "top 80%",
        end: "bottom 20%",
        scrub: true,
      },
    });
    imgTl
      .to(imgSecond.current, { scale: 0.8 }, 0)
      .to(imgThird.current, { scale: 0.65 }, 0)
      .to(imgFourth.current, { scale: 0.5 }, 0)
      .to(imgFifth.current, { scale: 0.35 }, 0);

    // section title fade
    gsap.fromTo(
      titleRef.current,
      { opacity: 0 },
      {
        opacity: 1,
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 90%",
          end: "top 25%",
          scrub: true,
        },
      }
    );

    // section scale-in on entry
    gsap.fromTo(
      sectionRef.current,
      { scale: 0.8 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "top 60%",
          scrub: true,
        },
      }
    );

    // section scale-out on exit
    gsap.fromTo(
      sectionRef.current,
      { scale: 1 },
      {
        scale: 0.8,
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "bottom 60%",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  }, []);

  return (
    <section ref={sectionRef} className={styles.about} data-color="var(--light-color)">
      <div className="space-25" />

      <Parallax speed={-0.5}>
        <div className="grid-layout grid-layout_2-row">
          <div className={styles.section_name__wraper} ref={titleRef}>
            <div className={styles.section_name_about}>
              <span className="sigurd-22 italic dark">(</span>
              <span className="geist-16 dark uppercase">about</span>
              <span className="sigurd-22 italic dark">)</span>
            </div>
          </div>

          <div className="desktop-only">
            <PerLine
              value={TEXT_BIG_DESKTOP}
              className={`${styles.about__text_big} ${styles.about__text_big_second} sigurd-142 dark`}
            />
          </div>
          <div className="mobile-only">
            <PerLine
              value={TEXT_BIG_MOBILE}
              className={`${styles.about__text_big} ${styles.about__text_big_second} sigurd-142 dark`}
            />
          </div>
        </div>
      </Parallax>

      <Parallax speed={-1.5}>
        <div className="grid-layout">
          <div ref={imgContainer} className={styles.about_img}>
            <img
              src="/photo.webp"
              alt="nikkoz photo"
              className={`${styles.about_img__item} ${styles.about_img__item_1}`}
            />
            <img
              ref={imgSecond}
              src="/photo.webp"
              alt="nikkoz photo"
              className={`${styles.about_img__item} ${styles.about_img__item_2}`}
            />
            <img
              ref={imgThird}
              src="/photo.webp"
              alt="nikkoz photo"
              className={`${styles.about_img__item} ${styles.about_img__item_3}`}
            />
            <img
              ref={imgFourth}
              src="/photo.webp"
              alt="nikkoz photo"
              className={`${styles.about_img__item} ${styles.about_img__item_4}`}
            />
            <img
              ref={imgFifth}
              src="/photo.webp"
              alt="nikkoz photo"
              className={`${styles.about_img__item} ${styles.about_img__item_5}`}
            />
          </div>
        </div>
      </Parallax>

      <Parallax className="grid-layout" speed={-2}>
        <div className="desktop-only">
          <PerLine
            value={TEXT_SMALL_DESKTOP}
            className={`${styles.about__text_small} sigurd-102 dark`}
          />
        </div>
        <div className="mobile-only">
          <PerLine
            value={TEXT_SMALL_MOBILE}
            className={`${styles.about__text_small} sigurd-102 dark`}
          />
        </div>
      </Parallax>

      <div className={`grid-layout ${styles.about__description}`}>
        <Parallax className={styles.about__ampersand} speed={-4}>
          <Ampersand />
        </Parallax>
        <Parallax className={styles.about__text_extrasmall} speed={-2.5}>
          <PerLine
            value={TEXT_EXTRASMALL}
            className="geist-32 dark"
            offset={["start 1.5", "start 0.6"]}
          />
        </Parallax>
      </div>
    </section>
  );
}
