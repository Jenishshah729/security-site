import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const pdfs = [
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

async function main() {
  await prisma.offering.deleteMany({});
  for (const p of pdfs) {
    await prisma.offering.create({ data: p });
  }
  console.log("PDFs seeded cleanly with only current 3D covers and updated descriptions");
}

main().catch(console.error).finally(() => prisma.$disconnect());
