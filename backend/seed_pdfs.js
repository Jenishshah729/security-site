import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const pdfs = [
  {
    title: "Beginner Blind Spots",
    description: "The invisible mistakes that cost beginners the most time — skip them entirely.",
    price: 149,
    coverImage: "/top-10-mistakes.png"
  },
  {
    title: "The Hacker's Arsenal",
    description: "20 free tools real hackers use — what to grab, and when.",
    price: 149,
    coverImage: "/hackers-toolkit.jpg"
  },
  {
    title: "Mastering Burp Suite",
    description: "Go from install to your first intercepted request, step by step.",
    price: 249,
    coverImage: "/burp-suite.jpg"
  },
  {
    title: "Flag Hunter's Playbook (CTF)",
    description: "The mindset and strategy to land your first flag, fast.",
    price: 199,
    coverImage: "/ctf-guide.jpg"
  },
  {
    title: "Breach in the Cloud",
    description: "Close the exact gap that trips most beginners up.",
    price: 199,
    coverImage: "/cloud-security-v4.jpg"
  },
  {
    title: "Behind the Screens (SOC)",
    description: "The real tools and responsibilities nobody explains upfront.",
    price: 249,
    coverImage: "/soc-analyst.jpg"
  },
  {
    title: "How Hackers Actually Use AI",
    description: "The real ways AI is changing both attacks and defense — and what beginners actually need to know right now.",
    price: 249,
    coverImage: "/ai-in-cybersecurity.jpg"
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
