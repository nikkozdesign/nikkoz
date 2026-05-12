import { useRef } from "react";
import { useLightSection } from "@/hooks/useLightSection";
import FlipLink from "@/components/FlipLink";
import ProjectCarousel from "@/components/ProjectCarousel";
import styles from "./styles.module.scss";

export default function ProjectDetail({ project }) {
  const ref = useRef(null);
  useLightSection(ref);

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
