import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FlipLink from "@/components/FlipLink";
import styles from "./styles.module.scss";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const IMG_CONFIGS = [
  { xMove: 0, yMove: 0, rotation: 9 },
  { xMove: 1.927, yMove: -1.406, rotation: 12 },
  { xMove: 3.854, yMove: -2.812, rotation: 15 },
  { xMove: 5.781, yMove: -4.218, rotation: 18 },
  { xMove: 7.708, yMove: -5.624, rotation: 21 },
  { xMove: 9.635, yMove: -7.03, rotation: 24 },
];

export default function Footer() {
  const footerRef = useRef(null);
  const imgsContainerRef = useRef(null);
  const imgsRef = useRef([]);

  const year = new Date().getFullYear();

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: footerRef.current,
        start: "top center",
        end: "bottom 50%",
        scrub: true,
      },
    });

    IMG_CONFIGS.forEach((cfg, i) => {
      const el = imgsRef.current[i];
      if (!el) return;
      tl.fromTo(
        el,
        { x: 0, y: 0, rotate: 0 },
        {
          x: `${cfg.xMove}vw`,
          y: `${cfg.yMove}vw`,
          rotate: `${cfg.rotation}deg`,
        },
        0
      );
    });

    tl.fromTo(imgsContainerRef.current, { y: "40%" }, { y: "-10%" }, 0);
  }, []);

  return (
    <footer ref={footerRef} className={styles.footer}>
      <div className={styles.footer__wrap}>
        <div className={styles.footer__top}>
          <div className={`${styles.footer__title} light uppercase geist-32`}>
            Let&rsquo;s create something cool
          </div>
          <div
            className={`${styles.footer_mail} ${styles.footer_mail_footer}`}
          >
            <div className={styles.footer_mail__inner}>
              <FlipLink href="mailto:nikkoz.hello@gmail.com" className="sigurd-220 light italic">
                nikkoz.hello@gmail.com
              </FlipLink>
              <div className={styles.footer_mail__line}></div>
            </div>
          </div>
          <div className={styles.footer__description}>
            <p className="geist-25 light uppercase">Open for collaboration</p>
            <p className="geist-25 light uppercase">Available worldwide</p>
          </div>
        </div>

        <div className={styles.footer__bottom}>
          <div className={styles.footer_social}>
            <FlipLink
              target="_blank"
              href="https://www.instagram.com/nikkoz.design/"
              className={`${styles.footer_social__link} sigurd-46 italic light`}
            >
              Instagram,
            </FlipLink>
            <FlipLink
              target="_blank"
              href="https://dribbble.com/nikkozdesign"
              className={`${styles.footer_social__link} sigurd-46 italic light`}
            >
              Dribbble,
            </FlipLink>
            <FlipLink
              target="_blank"
              href="https://www.behance.net/nikkoz"
              className={`${styles.footer_social__link} sigurd-46 italic light`}
            >
              Behance,
            </FlipLink>
            <FlipLink
              target="_blank"
              href="https://www.linkedin.com/in/nikkoz/"
              className={`${styles.footer_social__link} sigurd-46 italic light`}
            >
              LinkedIn
            </FlipLink>
          </div>

          <div className={styles.footer_copyright}>
            <div
              id="copyright"
              className={`${styles.footer_copyright__text} geist-16 light uppercase`}
            >
              © {year} all rights reserved
            </div>
            <FlipLink
              href="#"
              className={`${styles.footer_copyright__link} geist-16 light uppercase`}
            >
              privacy policy
            </FlipLink>
            <div
              className={`${styles.footer_copyright__text} geist-16 light uppercase`}
            >
              design & development by nikkoz
            </div>
          </div>
        </div>

        <div ref={imgsContainerRef} className={styles.footer_imgs}>
          {IMG_CONFIGS.map((_, i) => (
            <img
              key={i}
              ref={(el) => (imgsRef.current[i] = el)}
              src="/footer-img.webp"
              alt="nikkoz-photo"
              className={`${styles.footer_imgs__item} ${
                styles[`footer_imgs__item_${i + 1}`]
              }`}
            />
          ))}
        </div>
      </div>
    </footer>
  );
}
