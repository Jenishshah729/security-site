import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const pdfs = [
  {
    title: "The Mistake Map for Beginners",
    description: "The invisible mistakes that cost beginners the most time — skip them entirely.",
    price: 199,
    coverImage: "/top-10-mistakes.png"
  },
  {
    title: "The Toolkit Nobody Hands You",
    description: "20 free tools real hackers use — what to grab, and when.",
    price: 199,
    coverImage: "/hackers-toolkit.jpg"
  },
  {
    title: "Burp Suite, Minus the Confusion",
    description: "Go from install to your first intercepted request, step by step.",
    price: 199,
    coverImage: "/burp-suite.jpg"
  },
  {
    title: "Your First CTF, Made Simple",
    description: "The mindset and strategy to land your first flag, fast.",
    price: 199,
    coverImage: "/ctf-guide.jpg"
  },
  {
    title: "The Cloud Security Gap",
    description: "Close the exact gap that trips most beginners up.",
    price: 199,
    coverImage: "/cloud-security-v4.jpg"
  },
  {
    title: "Before You Walk Into a SOC",
    description: "The real tools and responsibilities nobody explains upfront.",
    price: 199,
    coverImage: "/soc-analyst.jpg"
  }
];

async function main() {
  await prisma.offering.deleteMany({});
  for (const p of pdfs) {
    await prisma.offering.create({ data: p });
  }
  console.log("PDFs seeded cleanly with only current 3D covers and updated descriptions");
}

main().catch(console.error).finally(() => prisma.$disconnect());
