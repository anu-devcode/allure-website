import 'dotenv/config';
import bcrypt from 'bcrypt';
import prisma from '../src/services/prisma.js';

const DEFAULT_ADMIN_EMAIL = 'admin@allure.local';
const DEFAULT_ADMIN_PASSWORD = 'Admin@123456';
const DEFAULT_ADMIN_NAME = 'Allure Admin';

const DEFAULT_CATEGORIES = [
  { name: 'Clothing - Women (Adult)', productType: 'Clothing' },
  { name: 'Clothing - Men (Adult)', productType: 'Clothing' },
  { name: 'Clothing - Girls (Kids)', productType: 'Clothing' },
  { name: 'Clothing - Boys (Kids)', productType: 'Clothing' },
  { name: 'Shoes - Women', productType: 'Shoes' },
  { name: 'Shoes - Men', productType: 'Shoes' },
  { name: 'Shoes - Girls', productType: 'Shoes' },
  { name: 'Shoes - Boys', productType: 'Shoes' },
  { name: 'Jewelry', productType: 'Jewelry' },
  { name: 'Accessories', productType: 'Accessories' },
  { name: 'Cosmetics', productType: 'Cosmetics' },
  { name: 'Perfumes', productType: 'Perfumes' },
  { name: 'Shein - Other (Non-Electronics)', productType: 'Other' },
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

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

async function seedCategories() {
  const results = await Promise.all(
    DEFAULT_CATEGORIES.map(({ name, productType }) => {
      const slug = slugify(name);
      return prisma.category.upsert({
        where: { slug },
        update: { name, productType },
        create: { name, slug, productType },
        select: { id: true, name: true, slug: true, productType: true },
      });
    })
  );

  console.log(`✅ Categories seeded/updated (${results.length})`);
}

seedAdmin()
  .then(() => seedCategories())
  .catch((error) => {
    console.error('❌ Failed to seed admin');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
