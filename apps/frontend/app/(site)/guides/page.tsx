import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { getGuides } from "@/lib/fetchers";
import type { Guide } from "@/types/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Guides",
  description: "How-to guides — including using Prajwal's Remote MCP server.",
};

export default async function GuidesPage() {
  let guides: Guide[] = [];
  let reachable = true;
  try {
    guides = await getGuides();
  } catch {
    reachable = false;
  }

  return (
    <Container className="py-16 md:py-24">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Guides</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Practical walkthroughs and how-tos.
      </p>

      <div className="mt-12 divide-y">
        {!reachable ? (
          <p className="text-muted-foreground">Couldn&apos;t reach the service.</p>
        ) : guides.length === 0 ? (
          <p className="text-muted-foreground">No guides published yet.</p>
        ) : (
          guides.map((g) => (
            <Link
              key={g.id}
              href={`/guides/${g.slug}`}
              className="group block py-5 transition-colors"
            >
              <h2 className="font-heading font-medium group-hover:underline">{g.title}</h2>
              {g.summary ? (
                <p className="mt-1 text-sm text-muted-foreground">{g.summary}</p>
              ) : null}
            </Link>
          ))
        )}
      </div>
    </Container>
  );
}
