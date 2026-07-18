import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { getCategory } from "@/lib/fetchers";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params;
  try {
    const cat = await getCategory(category);
    return { title: cat.name, description: cat.description ?? undefined };
  } catch {
    return { title: "Projects" };
  }
}

export default async function CategoryPage({ params }: Params) {
  const { category } = await params;
  const cat = await getCategory(category).catch(() => notFound());

  const projects = [...(cat.projects ?? [])].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
  );

  return (
    <Container className="py-16 md:py-24">
      <Link
        href="/projects"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← All projects
      </Link>

      <h1 className="mt-6 font-heading text-3xl font-semibold tracking-tight">
        {cat.name}
      </h1>
      {cat.description ? (
        <p className="mt-3 max-w-2xl text-muted-foreground">{cat.description}</p>
      ) : null}

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/projects/${cat.slug}/${p.slug}`}
            className="group rounded-xl border p-6 transition-colors hover:bg-muted/40"
          >
            <h2 className="font-heading font-medium">{p.title}</h2>
            {p.description ? (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {p.description}
              </p>
            ) : null}
            {p.techStack && p.techStack.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {p.techStack.slice(0, 5).map((tech) => (
                  <span
                    key={tech}
                    className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            ) : null}
          </Link>
        ))}
      </div>
    </Container>
  );
}
