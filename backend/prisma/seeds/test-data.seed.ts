import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking if users exist...');

  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log(
      'Users already exist in the database. Aborting user and listing creation.',
    );
    return; // Exit gracefully
  }

  console.log('No users found. Start seeding users and listings...');

  // 1. Hash the password
  const hashedPassword = await bcrypt.hash('1', 10);

  // 2. Create users
  const usersToCreate = [];
  for (let i = 1; i <= 5; i++) {
    usersToCreate.push({
      email: `${i}@purdue.edu`,
      passwordHash: hashedPassword,
    });
  }

  // Add the admin user
  usersToCreate.push({
    email: 'lee3291@purdue.edu',
    passwordHash: hashedPassword,
    role: Role.ADMIN,
  });

  const createdUsers = [];
  for (const userData of usersToCreate) {
    const user = await prisma.user.create({ data: userData });
    createdUsers.push(user);
    console.log(`Created user with id: ${user.id}`);
  }

  const testUser = createdUsers.find(
    (user) => user.email === 'lee3291@purdue.edu',
  );

  if (!testUser) {
    throw new Error(
      'Admin user lee3291@purdue.edu not found after creation. Cannot assign listings.',
    );
  }

  // 3. Create listings
  const twentySevenDaysAgo = new Date();
  twentySevenDaysAgo.setDate(twentySevenDaysAgo.getDate() - 27);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const listing27 = await prisma.listing.create({
    data: {
      title: 'Listing 27 days old',
      description: 'This is a test listing for the 27-day reminder.',
      price: 50000,
      pricing: 50000,
      user: 'lee3291',
      location: 'West Lafayette',
      userId: testUser.id,
      updatedAt: twentySevenDaysAgo,
      mediaUrls: [],
      moveInStart: new Date('2025-12-01'),
      moveInEnd: new Date('2026-05-01'),
    },
  });
  console.log(`Created listing with id: ${listing27.id}`);

  const listing30 = await prisma.listing.create({
    data: {
      title: 'Listing 30 days old',
      description: 'This is a test listing for the 30-day archival.',
      price: 60000,
      pricing: 60000,
      user: 'lee3291',
      location: 'Lafayette',
      userId: testUser.id,
      updatedAt: thirtyDaysAgo,
      mediaUrls: [],
      moveInStart: new Date('2025-12-15'),
      moveInEnd: new Date('2026-06-15'),
    },
  });
  console.log(`Created listing with id: ${listing30.id}`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
