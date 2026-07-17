// API keys for local MCP / programmatic access.
// High-entropy random strings → hashed with SHA-256 (fast; bcrypt is only for low-entropy
// passwords). We store the hash + a display prefix; the raw key is shown to the user once.
import crypto from 'node:crypto';
import { prisma } from '../db/index.js';

export const API_KEY_PREFIX = 'pk_live_';

export function hashApiKey(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export function generateApiKey() {
  const raw = API_KEY_PREFIX + crypto.randomBytes(24).toString('base64url');
  return {
    raw,
    hash: hashApiKey(raw),
    prefix: raw.slice(0, 12), // e.g. "pk_live_ab12"
  };
}

// Look up a key by its raw value and validate it's usable. Returns the key + owner, or null.
export async function loadValidApiKey(raw: string) {
  if (!raw.startsWith(API_KEY_PREFIX)) return null;

  const key = await prisma.apiKey.findUnique({
    where: { keyHash: hashApiKey(raw) },
    include: { user: true },
  });

  if (!key) return null;
  if (key.revokedAt) return null;
  if (key.expiresAt && key.expiresAt < new Date()) return null;
  if (!key.user.isActive) return null;

  return key;
}

export function touchApiKey(id: string) {
  // Fire-and-forget last-used stamp; never block the request on it.
  return prisma.apiKey
    .update({ where: { id }, data: { lastUsedAt: new Date() } })
    .catch(() => {});
}
