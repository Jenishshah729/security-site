import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.offering.updateMany({
    data: { price: 169 },
  });

  await prisma.consultationSetting.upsert({
    where: { id: 1 },
    update: { price: 449 },
    create: { id: 1, price: 449, duration: 30 }
  });

  console.log('Prices updated successfully in DB');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
