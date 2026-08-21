import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.offering.deleteMany({
    where: {
      title: 'Sample PDF'
    }
  });
  console.log('Deleted Sample PDF');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
