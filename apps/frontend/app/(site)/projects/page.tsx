import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { CategoryColumns } from "@/components/projects/category-columns";
import { getCategoriesWithProjects } from "@/lib/fetchers";
import type { CategoryWithProjects } from "@/types/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects",
  description: "Projects by Prajwal Raj across web, DevOps, AI, MCP tooling, and automation.",
};

export default async function ProjectsPage() {
  let groups: CategoryWithProjects[] = [];
  let reachable = true;
  try {
    groups = await getCategoriesWithProjects();
  } catch {
    reachable = false;
  }

  return (
    <Container className="py-16 md:py-24">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Projects</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        A tour of what I&apos;ve built — grouped by discipline.
      </p>
      <div className="mt-12">
        {reachable ? (
          <CategoryColumns groups={groups} />
        ) : (
          <p className="text-muted-foreground">
            Couldn&apos;t reach the portfolio service — is the gateway running?
          </p>
        )}
      </div>
    </Container>
  );
}
