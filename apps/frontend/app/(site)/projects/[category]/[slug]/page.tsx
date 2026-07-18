import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Container } from "@/components/layout/container";
import { GithubIcon } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getProject } from "@/lib/fetchers";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ category: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  try {
    const p = await getProject(slug);
    return { title: p.title, description: p.description ?? undefined };
  } catch {
    return { title: "Project" };
  }
}

export default async function ProjectPage({ params }: Params) {
  const { category, slug } = await params;
  const project = await getProject(slug).catch(() => notFound());

  const categorySlug = project.category?.slug ?? category;

  return (
    <Container className="py-16 md:py-24">
      <Link
        href={`/projects/${categorySlug}`}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← {project.category?.name ?? "Back to projects"}
      </Link>

      <article className="mt-6 max-w-3xl">
        <h1 className="font-heading text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
          {project.title}
        </h1>

        {project.description ? (
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {project.description}
          </p>
        ) : null}

        {/* Links */}
        {project.githubUrl || project.liveUrl ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {project.githubUrl ? (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                <GithubIcon /> GitHub
              </a>
            ) : null}
            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants())}
              >
                <ExternalLink /> Live
              </a>
            ) : null}
          </div>
        ) : null}

        {/* Tech stack */}
        {project.techStack && project.techStack.length > 0 ? (
          <div className="mt-8">
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Tech stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-md bg-muted px-2.5 py-1 text-sm text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {/* Long description */}
        {project.longDescription ? (
          <div className="mt-10">
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              About
            </h2>
            <p className="leading-relaxed whitespace-pre-line text-foreground/90">
              {project.longDescription}
            </p>
          </div>
        ) : null}
      </article>
    </Container>
  );
}
