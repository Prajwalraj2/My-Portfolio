import { prisma } from '../db/index.js';
import type { OAuthProfile } from '../auth/principal.js';

// Find an existing user by email or create one from an OAuth profile.
// Social sign-ups have no password (passwordHash null) and are email-verified by the provider.
export async function findOrCreateUserByEmail(profile: OAuthProfile) {
  const existing = await prisma.user.findUnique({ where: { email: profile.email } });
  if (existing) {
    // Backfill name/avatar if we didn't have them yet.
    if ((!existing.name && profile.name) || (!existing.avatarUrl && profile.avatarUrl)) {
      return prisma.user.update({
        where: { id: existing.id },
        data: {
          name: existing.name ?? profile.name,
          avatarUrl: existing.avatarUrl ?? profile.avatarUrl,
        },
      });
    }
    return existing;
  }

  return prisma.user.create({
    data: {
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      emailVerified: true,
    },
  });
}

// Link (idempotently) a social account to a user.
export async function linkOAuthAccount(userId: string, provider: string, providerUserId: string) {
  await prisma.oAuthAccount.upsert({
    where: { provider_providerUserId: { provider, providerUserId } },
    update: { userId },
    create: { userId, provider, providerUserId },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}
