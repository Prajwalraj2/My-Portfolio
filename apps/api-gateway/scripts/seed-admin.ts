/**
 * Admin Seed Script
 * 
 * Creates the initial admin user for the portfolio.
 * Run this once after setting up the database.
 * 
 * Usage:
 *   cd apps/api-gateway
 *   pnpm seed:admin
 */

import dotenv from 'dotenv';

// Load env vars FIRST before anything else
dotenv.config();

const SALT_ROUNDS = 12;

async function main() {
  // Dynamic imports AFTER dotenv.config()
  const { prisma } = await import('../src/db/index.js');
  const bcrypt = await import('bcrypt');

  try {
    // Get admin credentials from environment or use defaults
    const email = process.env.ADMIN_EMAIL || 'admin@prajwalraj.me';
    const password = process.env.ADMIN_PASSWORD || 'AdminPassword123!';

    console.log('🔐 Setting up admin account...');
    console.log(`   Email: ${email}`);

    // Check if admin already exists
    const existing = await prisma.adminCredential.findUnique({
      where: { email },
    });

    if (existing) {
      console.log('⚠️  Admin with this email already exists.');
      
      const resetPassword = process.env.RESET_PASSWORD === 'true';
      
      if (resetPassword) {
        const passwordHash = await bcrypt.default.hash(password, SALT_ROUNDS);
        
        await prisma.adminCredential.update({
          where: { email },
          data: { passwordHash },
        });
        
        console.log('✅ Password has been reset.');
      } else {
        console.log('   To reset password, run with RESET_PASSWORD=true');
      }
      
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.default.hash(password, SALT_ROUNDS);

    // Create admin
    const admin = await prisma.adminCredential.create({
      data: {
        email,
        passwordHash,
        totpSecret: 'NOT_CONFIGURED',
        allowedIps: [],
      },
    });

    console.log('');
    console.log('✅ Admin account created successfully!');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Admin Credentials');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  ID:       ${admin.id}`);
    console.log(`  Email:    ${email}`);
    console.log(`  Password: ${password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password after first login!');
    console.log('');

  } catch (error) {
    console.error('❌ Failed to create admin:', error);
    process.exit(1);
  } finally {
    const { prisma } = await import('../src/db/index.js');
    await prisma.$disconnect();
  }
}

main();
