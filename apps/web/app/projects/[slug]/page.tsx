import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Github, Calendar } from "lucide-react";
import { getProject } from "@/lib/fetchers";
import type { Metadata } from "next";

// Force dynamic rendering - skip static generation at build time
export const dynamic = "force-dynamic";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    return { title: "Project Not Found" };
  }

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: project.thumbnailUrl ? [project.thumbnailUrl] : [],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-4xl items-center px-4 sm:px-6 lg:px-8">
          <Link
            href="/#works"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Works
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Category Badge */}
        {project.category && (
          <div className="mb-6">
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor: project.category.color
                  ? `${project.category.color}15`
                  : "var(--muted)",
                color: project.category.color || "var(--muted-foreground)",
              }}
            >
              {project.category.name}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          {project.title}
        </h1>

        {/* Description */}
        <p className="mb-8 text-lg text-muted-foreground">
          {project.description}
        </p>

        {/* Action Buttons */}
        <div className="mb-12 flex flex-wrap gap-4">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
            >
              <ExternalLink className="h-4 w-4" />
              View Live
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-5 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Github className="h-4 w-4" />
              View Source
            </a>
          )}
        </div>

        {/* Thumbnail */}
        {project.thumbnailUrl && (
          <div className="mb-12 overflow-hidden rounded-2xl border border-border">
            <img
              src={project.thumbnailUrl}
              alt={project.title}
              className="w-full"
            />
          </div>
        )}

        {/* Long Description */}
        {project.longDescription && (
          <div className="mb-12">
            <h2 className="mb-4 text-xl font-semibold">About this project</h2>
            <div className="prose prose-zinc max-w-none dark:prose-invert">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {project.longDescription}
              </p>
            </div>
          </div>
        )}

        {/* Tech Stack */}
        {project.techStack.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-4 text-xl font-semibold">Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-border bg-muted px-3 py-1.5 text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Project Images */}
        {project.images && project.images.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-4 text-xl font-semibold">Screenshots</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {project.images.map((image, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border border-border"
                >
                  <img
                    src={image}
                    alt={`${project.title} screenshot ${index + 1}`}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Added {new Date(project.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
