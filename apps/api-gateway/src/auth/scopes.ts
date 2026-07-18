// The catalog of API-key scopes (resource:action). Enforced by requireScopes() for
// API-key principals only; user sessions & admin have full access.
export const SCOPES = {
  projectsRead: 'projects:read',
  skillsRead: 'skills:read',
  experienceRead: 'experience:read',
  githubRead: 'github:read',
  portfolioRead: 'portfolio:read',
  guidesRead: 'guides:read',
  meetingsRead: 'meetings:read',
  meetingsWrite: 'meetings:write',
  testimonialsWrite: 'testimonials:write',
  inquiriesWrite: 'inquiries:write',
  emailWrite: 'email:write',
} as const;

export type Scope = (typeof SCOPES)[keyof typeof SCOPES];

// Default scopes granted to a local-MCP API key when the user doesn't specify any:
// all reads + booking a meeting.
export const DEFAULT_KEY_SCOPES: Scope[] = [
  SCOPES.projectsRead,
  SCOPES.skillsRead,
  SCOPES.experienceRead,
  SCOPES.githubRead,
  SCOPES.portfolioRead,
  SCOPES.guidesRead,
  SCOPES.meetingsRead,
  SCOPES.meetingsWrite,
];
