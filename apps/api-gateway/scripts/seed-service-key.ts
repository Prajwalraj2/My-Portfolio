/**
 * Service API Key Seed
 *
 * Creates (or reuses) a dedicated "AI service" user and mints an API key with read scopes
 * + meetings:write, so the ai-service agent can call the gateway on behalf of visitors.
 *
 * Usage:
 *   cd apps/api-gateway
 *   pnpm seed:service-key
 *
 * Then copy the printed key into apps/ai-service/.env as GATEWAY_API_KEY.
 */
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const { prisma } = await import('../src/db/index.js');
  const { generateApiKey } = await import('../src/auth/apiKey.js');
  const { DEFAULT_KEY_SCOPES } = await import('../src/auth/scopes.js');

  const email = 'ai-service@internal';

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: { email, name: 'AI Service', role: 'user', emailVerified: true },
    });
    console.log(`✅ Created system user ${email}`);
  } else {
    console.log(`ℹ️  Reusing system user ${email}`);
  }

  // Revoke previous ai-service keys so only the newest is active.
  await prisma.apiKey.updateMany({
    where: { userId: user.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  const { raw, hash, prefix } = generateApiKey();
  await prisma.apiKey.create({
    data: {
      userId: user.id,
      name: 'ai-service',
      keyHash: hash,
      prefix,
      scopes: DEFAULT_KEY_SCOPES,
      rateLimitPerHour: 100000, // high — this is a trusted internal service
    },
  });

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Service API key — copy into apps/ai-service/.env');
  console.log('  GATEWAY_API_KEY=' + raw);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Scopes: ${DEFAULT_KEY_SCOPES.join(', ')}`);
  console.log('  (Shown once. Previous ai-service keys were revoked.)');
  console.log('');

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('❌ Failed:', e);
  process.exit(1);
});
