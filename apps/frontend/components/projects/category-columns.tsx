import Link from "next/link";
import type { CategoryWithProjects } from "@/types/api";

// Columns: one per category (in displayOrder), heading = category name, then its projects
// (name only, in displayOrder) as hover-highlighted links → /projects/:cat/:project.
// Layout wraps 3-per-row (1 2 3 / 4 5 …), matching the mockup.
export function CategoryColumns({ groups }: { groups: CategoryWithProjects[] }) {
  if (groups.length === 0) {
    return <p className="text-muted-foreground">Projects will appear here soon.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map(({ category, projects }) => (
        <div key={category.id}>
          <h3 className="mb-3 border-b pb-2 font-heading text-base font-semibold">
            {category.name}
          </h3>
          <ul className="-mx-3">
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/projects/${category.slug}/${project.slug}`}
                  title={project.title}
                  className="block truncate rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {project.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
