import 'dotenv/config';
import bcrypt from 'bcrypt';
import prisma from '../src/services/prisma.js';

const DEFAULT_ADMIN_EMAIL = 'admin@allure.local';
const DEFAULT_ADMIN_PASSWORD = 'Admin@123456';
const DEFAULT_ADMIN_NAME = 'Allure Admin';

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
  const name = (process.env.ADMIN_NAME || DEFAULT_ADMIN_NAME).trim();

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be provided.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });

  const admin = existing
    ? await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          name,
          role: 'ADMIN',
        },
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
        },
      })
    : await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'ADMIN',
        },
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
        },
      });

  console.log('✅ Admin seeded/updated successfully');
  console.log(`   Email: ${admin.email}`);
  console.log(`   Role: ${admin.role}`);
  console.log(`   Name: ${admin.name ?? '-'}`);
}

seedAdmin()
  .catch((error) => {
    console.error('❌ Failed to seed admin');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
