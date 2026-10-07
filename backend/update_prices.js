import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const priceMap = [
  { coverImage: '/top-10-mistakes.png', title: 'Beginner Blind Spots', price: 149 },
  { coverImage: '/hackers-toolkit.jpg', title: "The Hacker's Arsenal", price: 149 },
  { coverImage: '/ctf-guide.jpg', title: "Flag Hunter's Playbook (CTF)", price: 199 },
  { coverImage: '/cloud-security-v4.jpg', title: 'Breach in the Cloud', price: 199 },
  { coverImage: '/burp-suite.jpg', title: 'Mastering Burp Suite', price: 249 },
  { coverImage: '/soc-analyst.jpg', title: 'Behind the Screens (SOC)', price: 249 },
  { coverImage: '/ai-in-cybersecurity.jpg', title: 'How Hackers Actually Use AI', price: 249 }
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
