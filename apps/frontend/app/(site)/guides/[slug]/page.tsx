import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { Markdown } from "@/components/markdown";
import { getGuide } from "@/lib/fetchers";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  try {
    const g = await getGuide(slug);
    return { title: g.title, description: g.summary ?? undefined };
  } catch {
    return { title: "Guide" };
  }
}

export default async function GuidePage({ params }: Params) {
  const { slug } = await params;
  const guide = await getGuide(slug).catch(() => notFound());

  return (
    <Container className="py-16 md:py-24">
      <Link
        href="/guides"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← All guides
      </Link>

      <article className="mt-6 max-w-3xl">
        <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          {guide.title}
        </h1>
        {guide.summary ? (
          <p className="mt-3 text-lg text-muted-foreground">{guide.summary}</p>
        ) : null}

        <div className="mt-10">
          <Markdown content={guide.bodyMd} />
        </div>
      </article>
    </Container>
  );
}
