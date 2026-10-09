import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const priceMap = [
  { coverImage: '/ai-in-cybersecurity.jpg', title: 'How Hackers Actually Use AI', price: 249 },
  { coverImage: '/top-10-mistakes.png', title: 'The Mistake Map for Beginners', price: 149 },
  { coverImage: '/hackers-toolkit.jpg', title: 'The Toolkit Nobody Hands You', price: 149 },
  { coverImage: '/ctf-guide.jpg', title: 'Your First CTF, Made Simple', price: 199 },
  { coverImage: '/burp-suite.jpg', title: 'Burp Suite, Minus the Confusion', price: 249 },
  { coverImage: '/soc-analyst.jpg', title: 'Before You Walk Into a SOC', price: 249 },
  { coverImage: '/cloud-security-v4.jpg', title: 'The Cloud Security Gap', price: 199 }
];

async function main() {
  for (const item of priceMap) {
    const existing = await prisma.offering.findFirst({
      where: { coverImage: item.coverImage }
    });
    if (existing) {
      await prisma.offering.update({
        where: { id: existing.id },
        data: { title: item.title, price: item.price }
      });
    }
  }

  await prisma.consultationSetting.upsert({
    where: { id: 1 },
    update: { price: 349 },
    create: { id: 1, price: 349, duration: 30 }
  });

  console.log('Prices and titles updated successfully in DB');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
