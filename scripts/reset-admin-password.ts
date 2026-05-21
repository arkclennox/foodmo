import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? process.argv[2] ?? '').toLowerCase();
  const newPassword = process.env.NEW_ADMIN_PASSWORD ?? process.argv[3] ?? '';

  if (!email || !newPassword) {
    console.error('Usage:');
    console.error('  ADMIN_EMAIL=you@example.com NEW_ADMIN_PASSWORD=your-new-pass npx tsx scripts/reset-admin-password.ts');
    console.error('  or: npx tsx scripts/reset-admin-password.ts you@example.com your-new-pass');
    process.exit(1);
  }
  if (newPassword.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({ where: { email }, data: { passwordHash } });
    console.log(`Password updated for: ${email}`);
  } else {
    await prisma.user.create({
      data: { email, passwordHash, name: 'Admin', role: 'admin' },
    });
    console.log(`Admin user created: ${email}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
