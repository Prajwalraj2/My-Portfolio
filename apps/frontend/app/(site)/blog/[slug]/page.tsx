import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { Markdown } from "@/components/markdown";
import { getBlog } from "@/lib/fetchers";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  try {
    const b = await getBlog(slug);
    return { title: b.title, description: b.excerpt ?? undefined };
  } catch {
    return { title: "Post" };
  }
}

export default async function BlogPage({ params }: Params) {
  const { slug } = await params;
  const blog = await getBlog(slug).catch(() => notFound());

  return (
    <Container className="py-16 md:py-24">
      <Link
        href="/blogs"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← All posts
      </Link>

      <article className="mt-6 max-w-3xl">
        <div className="mb-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{formatDate(blog.publishedAt ?? blog.createdAt)}</span>
          <span>·</span>
          <span>{blog.views} views</span>
        </div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          {blog.title}
        </h1>
        {blog.tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-10">
          <Markdown content={blog.contentMd} />
        </div>
      </article>
    </Container>
  );
}
