// Stitches a single "portfolio snapshot" from the DB for the get_portfolio tool + the
// website home page: profile + featured projects + top skills + experience + resume.
import { prisma } from '../db/index.js';

export async function getPortfolio() {
  const [profile, featuredProjects, topSkills, experience, resume, projectCount] = await Promise.all([
    prisma.profile.findFirst(),
    prisma.project.findMany({
      where: { isFeatured: true, isPublished: true },
      include: { category: { select: { id: true, name: true, slug: true, color: true } } },
      orderBy: { displayOrder: 'asc' },
      take: 6,
    }),
    prisma.skill.findMany({
      orderBy: [{ isFeatured: 'desc' }, { proficiency: 'desc' }],
      take: 12,
    }),
    prisma.experience.findMany({
      orderBy: [{ isCurrent: 'desc' }, { startDate: 'desc' }],
    }),
    prisma.resumeVersion.findFirst({
      where: { isDefault: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.project.count({ where: { isPublished: true } }),
  ]);

  return {
    profile,
    featuredProjects,
    topSkills,
    experience,
    resume,
    stats: { projects: projectCount, skills: topSkills.length },
  };
}
