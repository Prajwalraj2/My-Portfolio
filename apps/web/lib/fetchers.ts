import { api } from "./api";
import type {
  Category,
  Project,
  Skill,
  Experience,
  Testimonial,
  ResumeVersion,
} from "@/types/api";

interface ApiListResponse<T> {
  data: T[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

interface ApiItemResponse<T> {
  data: T;
}

export async function getCategories(): Promise<Category[]> {
  const response = await api.get<ApiListResponse<Category>>("/api/categories", {
    next: { revalidate: 3600, tags: ["categories"] },
  });
  return response.data;
}

export async function getCategory(slug: string): Promise<Category | null> {
  try {
    const response = await api.get<ApiItemResponse<Category>>(`/api/categories/${slug}`, {
      next: { revalidate: 3600, tags: ["categories", `category-${slug}`] },
    });
    return response.data;
  } catch {
    return null;
  }
}

export async function getProjects(): Promise<Project[]> {
  const response = await api.get<ApiListResponse<Project>>("/api/projects", {
    next: { revalidate: 3600, tags: ["projects"] },
  });
  return response.data;
}

export async function getProject(slug: string): Promise<Project | null> {
  try {
    const response = await api.get<ApiItemResponse<Project>>(`/api/projects/${slug}`, {
      next: { revalidate: 3600, tags: ["projects", `project-${slug}`] },
    });
    return response.data;
  } catch {
    return null;
  }
}

export async function getSkills(): Promise<Skill[]> {
  const response = await api.get<ApiListResponse<Skill>>("/api/skills", {
    next: { revalidate: 3600, tags: ["skills"] },
  });
  return response.data;
}

export async function getSkillCategories(): Promise<string[]> {
  const skills = await getSkills();
  const categories = [...new Set(skills.map((s) => s.category))];
  return categories.sort();
}

export async function getExperience(): Promise<Experience[]> {
  const response = await api.get<ApiListResponse<Experience>>("/api/experience", {
    next: { revalidate: 3600, tags: ["experience"] },
  });
  return response.data;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const response = await api.get<ApiListResponse<Testimonial>>("/api/testimonials", {
    next: { revalidate: 3600, tags: ["testimonials"] },
  });
  return response.data;
}

export async function getDefaultResume(): Promise<ResumeVersion | null> {
  try {
    const response = await api.get<ApiItemResponse<ResumeVersion>>("/api/resume", {
      next: { revalidate: 3600, tags: ["resume"] },
    });
    return response.data;
  } catch {
    return null;
  }
}

export async function submitInquiry(data: {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  inquiryType?: string;
}): Promise<{ success: boolean; message: string }> {
  return api.post("/api/inquiries", data);
}

export async function submitTestimonial(data: {
  authorName: string;
  authorTitle?: string;
  authorCompany?: string;
  authorLinkedIn?: string;
  content: string;
  rating?: number;
}): Promise<{ success: boolean; message: string }> {
  return api.post("/api/testimonials", data);
}