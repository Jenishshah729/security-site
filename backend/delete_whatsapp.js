import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.connectLink.deleteMany({
    where: {
      title: 'WhatsApp'
    }
  });
  console.log('Deleted WhatsApp link');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
