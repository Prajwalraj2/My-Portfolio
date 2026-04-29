export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  isVisible: boolean;
  displayOrder: number;
  createdAt: string;
  _count?: {
    projects: number;
  };
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription: string | null;
  coverImage: string | null;
  thumbnailUrl: string | null;
  images: string[];
  techStack: string[];
  liveUrl: string | null;
  githubUrl: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  displayOrder: number;
  startDate: string | null;
  endDate: string | null;
  categoryId: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  slug?: string;
  category: string;
  proficiency: number;
  yearsExperience: number | null;
  iconUrl: string | null;
  color?: string | null;
  isFeatured: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string | null;
  isCurrent: boolean;
  description: string | null;
  responsibilities: string[];
  techStack: string[];
  startDate: string;
  endDate: string | null;
  companyUrl: string | null;
  companyLogoUrl: string | null;
  displayOrder: number;
}

export interface Testimonial {
  id: string;
  authorName: string;
  authorTitle: string | null;
  authorCompany: string | null;
  authorImage: string | null;
  authorLinkedIn: string | null;
  content: string;
  rating: number | null;
  projectId: string | null;
  featured: boolean;
  status: "pending" | "approved" | "rejected";
  approvedAt: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  company: string | null;
  subject: string;
  message: string;
  inquiryType: "general" | "project" | "job" | "collaboration" | "other";
  status: "new" | "read" | "replied" | "archived" | "spam";
  repliedAt: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  referrer: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeVersion {
  id: string;
  version: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  isDefault: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeDownload {
  id: string;
  resumeId: string;
  ipAddress: string | null;
  userAgent: string | null;
  referrer: string | null;
  downloadedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}