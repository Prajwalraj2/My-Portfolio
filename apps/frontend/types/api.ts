// Local API types (mirrors the gateway's responses — no shared package, per project decision).

export interface Profile {
  id: string;
  name: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  email: string | null;
  avatarUrl: string | null;
  resumeUrl: string | null;
  socials: Record<string, string> | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

// Full category as returned by GET /api/categories (list) — includes ordering + counts.
export interface CategoryListItem extends Category {
  description: string | null;
  icon: string | null;
  isVisible: boolean;
  displayOrder: number;
  _count?: { projects: number };
}

// A project as listed under a category (name/slug/order enough for the columns).
export interface ProjectLink {
  id: string;
  slug: string;
  title: string;
  displayOrder: number;
}

// GET /api/categories/:slug → category + its published projects.
export interface CategoryDetail extends CategoryListItem {
  projects: (ProjectLink & Partial<ProjectSummary>)[];
}

// Grouped shape for the Home / Projects columns.
export interface CategoryWithProjects {
  category: CategoryListItem;
  projects: ProjectLink[];
}

export interface ProjectSummary {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  longDescription?: string | null;
  techStack: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  thumbnailUrl: string | null;
  images?: string[];
  isFeatured: boolean;
  isPublished?: boolean;
  githubStars?: number;
  githubForks?: number;
  displayOrder?: number;
  categoryId?: string;
  category?: Category | null;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  isFeatured: boolean;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  techStack: string[];
}

export interface ResumeVersion {
  id: string;
  version: string;
  label: string | null;
  s3Url: string;
}

export interface PortfolioData {
  profile: Profile | null;
  featuredProjects: ProjectSummary[];
  topSkills: Skill[];
  experience: Experience[];
  resume: ResumeVersion | null;
  stats: { projects: number; skills: number };
}

export interface Guide {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  bodyMd: string;
  category: string | null;
  displayOrder: number;
  isPublished: boolean;
}

export interface BlogListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverUrl: string | null;
  tags: string[];
  publishedAt: string | null;
  views: number;
  createdAt: string;
}

export interface Blog extends BlogListItem {
  contentMd: string;
  status: string;
}

export interface Meeting {
  id: string;
  attendeeName: string;
  attendeeEmail: string;
  title: string | null;
  topic: string | null;
  startTime: string;
  endTime: string | null;
  meetingUrl: string | null;
  status: string;
  createdAt: string;
}

// Standard gateway envelopes
export interface ApiData<T> {
  data: T;
}

export interface ApiList<T> {
  data: T[];
  pagination?: { total: number; limit: number; offset: number; has_more: boolean };
}
