import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Update Consultation Setting
  await prisma.consultationSetting.upsert({
    where: { id: 1 },
    update: { price: 349, duration: 30 },
    create: { id: 1, price: 349, duration: 30 },
  });

  // Seed Connect Links
  const links = [
    { title: 'WhatsApp', url: 'https://whatsapp.com/channel/thejenishshah', order: 1 },
    { title: 'Instagram', url: 'https://instagram.com/thejenishshah', order: 2 },
    { title: 'Facebook', url: 'https://facebook.com/thejenishshah', order: 3 },
    { title: 'YouTube', url: 'https://www.youtube.com/@thejenishshah', order: 4 },
    { title: 'LinkedIn', url: 'https://www.linkedin.com/in/thejenishshah/', order: 5 },
  ];

  for (const link of links) {
    const exists = await prisma.connectLink.findFirst({ where: { title: link.title } });
    if (!exists) {
      await prisma.connectLink.create({ data: link });
    } else {
      await prisma.connectLink.update({ where: { id: exists.id }, data: link });
    }
  }

  // Removed Sample PDF

  console.log('Database seeded with default data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
