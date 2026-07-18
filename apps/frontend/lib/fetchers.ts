// Typed server-side data fetchers (Server Components).
import { serverFetch } from "./api.server";
import type {
  ApiData,
  ApiList,
  Blog,
  BlogListItem,
  CategoryDetail,
  CategoryListItem,
  CategoryWithProjects,
  Guide,
  Meeting,
  PortfolioData,
  ProjectSummary,
} from "@/types/api";

export async function getMyMeetings(): Promise<Meeting[]> {
  const { data } = await serverFetch<ApiData<Meeting[]>>("/api/meetings/mine", { auth: true });
  return data;
}

export async function getPortfolio(): Promise<PortfolioData> {
  const json = await serverFetch<ApiData<PortfolioData>>("/api/portfolio");
  return json.data;
}

// Visible, non-empty categories (by displayOrder) with their published projects
// (by project displayOrder). Powers the Home "work" columns and the Projects index.
export async function getCategoriesWithProjects(): Promise<CategoryWithProjects[]> {
  const { data: categories } = await serverFetch<ApiData<CategoryListItem[]>>(
    "/api/categories"
  );

  const visible = categories
    .filter((c) => c.isVisible && (c._count?.projects ?? 0) > 0)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const groups = await Promise.all(
    visible.map(async (category) => {
      const { data: detail } = await serverFetch<ApiData<CategoryDetail>>(
        `/api/categories/${category.slug}`
      );
      const projects = (detail.projects ?? [])
        .map((p) => ({ id: p.id, slug: p.slug, title: p.title, displayOrder: p.displayOrder }))
        .sort((a, b) => a.displayOrder - b.displayOrder);
      return { category, projects };
    })
  );

  return groups;
}

// Lightweight: visible, non-empty categories (ordered) — for the header dropdown. One call.
export async function getCategoryList(): Promise<CategoryListItem[]> {
  const { data } = await serverFetch<ApiData<CategoryListItem[]>>("/api/categories");
  return data
    .filter((c) => c.isVisible && (c._count?.projects ?? 0) > 0)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getCategory(slug: string): Promise<CategoryDetail> {
  const { data } = await serverFetch<ApiData<CategoryDetail>>(
    `/api/categories/${encodeURIComponent(slug)}`
  );
  return data;
}

export async function getProject(slug: string): Promise<ProjectSummary> {
  const { data } = await serverFetch<ApiData<ProjectSummary>>(
    `/api/projects/${encodeURIComponent(slug)}`
  );
  return data;
}

// --- Guides ---
export async function getGuides(): Promise<Guide[]> {
  const { data } = await serverFetch<ApiData<Guide[]>>("/api/guides");
  return data;
}

export async function getGuide(slug: string): Promise<Guide> {
  const { data } = await serverFetch<ApiData<Guide>>(
    `/api/guides/${encodeURIComponent(slug)}`
  );
  return data;
}

// --- Blogs ---
export async function getBlogs(): Promise<BlogListItem[]> {
  const { data } = await serverFetch<ApiList<BlogListItem>>("/api/blogs");
  return data;
}

export async function getBlog(slug: string): Promise<Blog> {
  const { data } = await serverFetch<ApiData<Blog>>(
    `/api/blogs/${encodeURIComponent(slug)}`
  );
  return data;
}
