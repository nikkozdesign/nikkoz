import Head from "next/head";
import { PROJECTS, getProjectBySlug } from "@/lib/projects";
import ProjectDetail from "@/components/sections/ProjectDetail";

export async function getStaticPaths() {
  return {
    paths: PROJECTS.map((p) => ({ params: { slug: p.slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const project = getProjectBySlug(params.slug);
  if (!project) return { notFound: true };
  return { props: { project } };
}

export default function ProjectPage({ project }) {
  return (
    <>
      <Head>
        <title>{project.detail.title} — nikkoz</title>
        <meta name="description" content={project.detail.text1 || ""} />
      </Head>
      <ProjectDetail project={project} />
    </>
  );
}
