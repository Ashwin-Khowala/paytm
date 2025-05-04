import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Checking existing tables...");

  const tables = await prisma.$queryRawUnsafe(
    `SELECT table_name FROM information_schema.tables WHERE table_schema='public';`
  );

  console.log("Tables in DB:", tables);

  await prisma.$executeRawUnsafe(`
    SELECT create_hypertable('"OnRampTransaction"', 'startTime', if_not_exists => TRUE, migrate_data => TRUE);
  `);
  
  

  console.log("Hypertable created successfully.");
}

main()
  .catch((e) => {
    console.error("ERROR:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("Disconnected from the database.");
  });
