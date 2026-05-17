import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useLightSection } from "@/hooks/useLightSection";
import { useLenis } from "@/context/LenisContext";
import { useTransition } from "@/context/TransitionContext";
import { projectMorph } from "@/lib/transitionConfig";
import FlipLink from "@/components/FlipLink";
import ProjectCarousel from "@/components/ProjectCarousel";
import styles from "./styles.module.scss";

gsap.registerPlugin(useGSAP);

export default function ProjectDetail({ project }) {
  const ref = useRef(null);
  useLightSection(ref);

  const { transition, complete } = useTransition();
  const lenis = useLenis();

  // Scroll to top on mount — Next router scroll restoration + Lenis state can
  // otherwise leave the new page at the previous page's scroll position.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [lenis]);

  useGSAP(
    () => {
      if (!ref.current) return;
      const isMorph =
        transition !== null && transition.kind === "projectMorph";
      if (!isMorph) return;

      // Lift article above shader (z 60) only during slide-up
      ref.current.style.zIndex = "70";

      gsap.fromTo(
        ref.current,
        { y: "100vh" },
        {
          y: 0,
          duration: projectMorph.pageDuration,
          ease: projectMorph.pageEase,
          onComplete: () => {
            // Hide frozen shader mesh + clear canvas tint BEFORE dropping
            // z-index so neither bleeds through during the React commit gap.
            window.dispatchEvent(new CustomEvent("projectMorph:hideMesh"));
            window.dispatchEvent(new CustomEvent("projectMorph:resetCanvas"));
            if (ref.current) ref.current.style.zIndex = "";
            complete();
          },
        }
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    { dependencies: [], scope: ref }
  );

  if (!project) return null;
  const { detail } = project;

  return (
    <article ref={ref} className={styles.project_detail}>
      <div className={styles.project_detail__inner}>
        <div className={styles.project_detail__left}>
          <h1 className={`${styles.project_detail__title} sigurd-54 italic dark`}>
            {detail.title}
          </h1>

          <div className={styles.project_detail__texts}>
            {detail.text1 && (
              <p className={`${styles.project_detail__text1} sigurd-54 dark`}>
                {detail.text1}
              </p>
            )}

            {detail.text2 && (
              <p className={`${styles.project_detail__text2} geist-22 dark`}>
                {detail.text2}
              </p>
            )}
          </div>

          {detail.email && (
            <div className={styles.project_detail__email_row}>
              <span className={`sigurd-32 italic dark`}>☞</span>
              <span className={styles.project_detail__email}>
                <FlipLink
                  href={`mailto:${detail.email}`}
                  className="sigurd-32 italic dark"
                >
                  {detail.email}
                </FlipLink>
              </span>
              {detail.caseStudyUrl && (
                <span className={styles.project_detail__case_study}>
                  <FlipLink
                    href={detail.caseStudyUrl}
                    target="_blank"
                    className="sigurd-32 italic dark"
                  >
                    view full case study
                  </FlipLink>
                </span>
              )}
            </div>
          )}
        </div>

        <div className={styles.project_detail__right}>
          <div className={styles.project_detail__carousel}>
            <ProjectCarousel images={detail.images} />
          </div>
          <div className={styles.project_detail__images_mobile}>
            {(detail.images || []).map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className={styles.project_detail__mobile_img}
              />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
