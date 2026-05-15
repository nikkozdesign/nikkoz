import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useLightSection } from "@/hooks/useLightSection";
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
            // Hide frozen shader mesh BEFORE dropping z-index so it can't flash
            // through during the gap between z change and async dispose.
            window.dispatchEvent(new CustomEvent("projectMorph:hideMesh"));
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

          {detail.email && (
            <div className={styles.project_detail__email}>
              <FlipLink
                href={`mailto:${detail.email}`}
                className="sigurd-46 italic dark"
              >
                {detail.email}
              </FlipLink>
            </div>
          )}
        </div>

        <div className={styles.project_detail__right}>
          <ProjectCarousel images={detail.images} />
        </div>
      </div>
    </article>
  );
}
