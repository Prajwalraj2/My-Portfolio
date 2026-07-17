import Link from "next/link";
import { Container } from "@/components/layout/container";
import { CategoryColumns } from "@/components/projects/category-columns";
import { TalkToLisaButton } from "@/components/chat/talk-to-lisa-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCategoriesWithProjects, getPortfolio } from "@/lib/fetchers";
import type { CategoryWithProjects, Profile } from "@/types/api";

// Request-time render for now (gateway may be updating). ISR/caching tuned later.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  let profile: Profile | null = null;
  let groups: CategoryWithProjects[] = [];
  let reachable = true;

  try {
    const [portfolio, cats] = await Promise.all([
      getPortfolio(),
      getCategoriesWithProjects(),
    ]);
    profile = portfolio.profile;
    groups = cats;
  } catch {
    reachable = false;
  }

  return (
    <Container className="py-20 md:py-28">
      {/* Intro */}
      <section className="max-w-2xl space-y-4">
        <p className="text-muted-foreground">Well, well, well…</p>
        <h1 className="font-heading text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
          {profile?.headline ?? "Since you're already here, let me unfold myself."}
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          {profile?.bio ??
            "I'm Raj — a developer by profession who does a lot of crazy stuff too. Full-stack, cloud/DevOps, and AI. This whole site is the proof."}
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/connect" className={cn(buttonVariants({ size: "lg" }))}>
            Book a call
          </Link>
          <TalkToLisaButton />
        </div>
      </section>

      {/* Work — categories as columns, projects listed under each */}
      <section className="mt-24">
        <h2 className="mb-8 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Work
        </h2>
        {reachable ? (
          <CategoryColumns groups={groups} />
        ) : (
          <p className="text-muted-foreground">
            Couldn&apos;t reach the portfolio service — is the gateway running?
          </p>
        )}
      </section>
    </Container>
  );
}
