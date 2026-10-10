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

  // Seed Default PDF Offerings
  const defaultOfferings = [
    {
      title: "How Hackers Actually Use AI",
      description: "The real ways AI is changing both attacks and defense — and what beginners actually need to know right now.",
      price: 249,
      coverImage: "/ai-in-cybersecurity.jpg"
    },
    {
      title: "The Mistake Map for Beginners",
      description: "The invisible mistakes that cost beginners the most time — skip them entirely.",
      price: 149,
      coverImage: "/top-10-mistakes.png"
    },
    {
      title: "The Toolkit Nobody Hands You",
      description: "20 free tools real hackers use — what to grab, and when.",
      price: 149,
      coverImage: "/hackers-toolkit.jpg"
    },
    {
      title: "Your First CTF, Made Simple",
      description: "The mindset and strategy to land your first flag, fast.",
      price: 199,
      coverImage: "/ctf-guide.jpg"
    },
    {
      title: "Burp Suite, Minus the Confusion",
      description: "Go from install to your first intercepted request, step by step.",
      price: 249,
      coverImage: "/burp-suite.jpg"
    },
    {
      title: "Before You Walk Into a SOC",
      description: "The real tools and responsibilities nobody explains upfront.",
      price: 249,
      coverImage: "/soc-analyst.jpg"
    },
    {
      title: "The Cloud Security Gap",
      description: "Close the exact gap that trips most beginners up.",
      price: 199,
      coverImage: "/cloud-security-v4.jpg"
    }
  ];

  for (const offering of defaultOfferings) {
    const exists = await prisma.offering.findFirst({
      where: {
        OR: [
          { title: offering.title },
          { coverImage: offering.coverImage }
        ]
      }
    });
    if (!exists) {
      await prisma.offering.create({ data: offering });
    } else {
      await prisma.offering.update({
        where: { id: exists.id },
        data: offering
      });
    }
  }

  console.log('Database seeded with default data and all 7 PDF offerings!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
