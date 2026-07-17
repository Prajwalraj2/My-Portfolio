import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { getBlogs } from "@/lib/fetchers";
import type { BlogListItem } from "@/types/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing on web, DevOps, and AI by Prajwal Raj.",
};

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function BlogsPage() {
  let blogs: BlogListItem[] = [];
  let reachable = true;
  try {
    blogs = await getBlogs();
  } catch {
    reachable = false;
  }

  return (
    <Container className="py-16 md:py-24">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Blog</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Notes on what I&apos;m building and learning.
      </p>

      <div className="mt-12 divide-y">
        {!reachable ? (
          <p className="text-muted-foreground">Couldn&apos;t reach the service.</p>
        ) : blogs.length === 0 ? (
          <p className="text-muted-foreground">No posts published yet.</p>
        ) : (
          blogs.map((b) => (
            <Link key={b.id} href={`/blog/${b.slug}`} className="group block py-6">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-heading font-medium group-hover:underline">{b.title}</h2>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDate(b.publishedAt ?? b.createdAt)}
                </span>
              </div>
              {b.excerpt ? (
                <p className="mt-1 text-sm text-muted-foreground">{b.excerpt}</p>
              ) : null}
              {b.tags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {b.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </Link>
          ))
        )}
      </div>
    </Container>
  );
}
