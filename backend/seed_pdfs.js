import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const pdfs = [
  {
    title: "10 Mistakes That Get Beginner Hackers Nowhere",
    description: "The costly mistakes almost every beginner makes — and exactly how to skip them.",
    price: 169,
    coverImage: "/top-10-mistakes.png"
  },
  {
    title: "20 Free Tools Real Hackers Actually Use",
    description: "A curated list of the free tools real hackers rely on, with why and when to use each.",
    price: 169,
    coverImage: "/hackers-toolkit.jpg",
    coverPageData: JSON.stringify({
      canvas: { width_px: 1600, height_px: 2560, background_color: "#0B0F19" },
      elements: [
        { type: "icon", name: "toolbox-outline", color: "#FF9F1C", size_px: 240, position: { x: "center", y: 500 } },
        { type: "text", role: "title", content: "Hacker's Toolkit", font_family: "Inter", font_weight: 800, font_size_px: 120, color: "#FFFFFF", text_align: "center", position: { x: "center", y: 1050 } },
        { type: "text", role: "subtitle", content: "Free Tools Every Beginner Hacker Should Know", font_family: "Inter", font_weight: 400, font_size_px: 48, color: "#FF9F1C", text_align: "center", position: { x: "center", y: 1250 } },
        { type: "text", role: "author_brand", content: "YOUR BRAND / NAME", font_family: "Inter", font_weight: 600, font_size_px: 36, color: "#A0AABF", text_align: "center", position: { x: "center", y: 2200 } }
      ]
    })
  },
  {
    title: "Burp Suite in 30 Minutes",
    description: "Set up Burp Suite and intercept your first request — no prior experience needed.",
    price: 169,
    coverImage: "/burp-suite.jpg",
    coverPageData: JSON.stringify({
      canvas: { width_px: 1600, height_px: 2560, background_color: "#0B0F19" },
      elements: [
        { type: "icon", name: "bug-outline", color: "#FF5733", size_px: 240, position: { x: "center", y: 500 } },
        { type: "text", role: "title", content: "Burp Suite", font_family: "Inter", font_weight: 800, font_size_px: 140, color: "#FFFFFF", text_align: "center", position: { x: "center", y: 1050 } },
        { type: "text", role: "subtitle", content: "A Beginner's Guide to Setup and First Use", font_family: "Inter", font_weight: 400, font_size_px: 48, color: "#FF5733", text_align: "center", position: { x: "center", y: 1250 } },
        { type: "text", role: "author_brand", content: "YOUR BRAND / NAME", font_family: "Inter", font_weight: 600, font_size_px: 36, color: "#A0AABF", text_align: "center", position: { x: "center", y: 2200 } }
      ]
    })
  },
  {
    title: "Solve Your First CTF This Week",
    description: "Everything you need to crack your first CTF challenge — categories, tools, and strategy.",
    price: 169,
    coverImage: "/ctf-guide.jpg",
    coverPageData: JSON.stringify({
      canvas: { width_px: 1600, height_px: 2560, background_color: "#0B0F19" },
      elements: [
        { type: "icon", name: "flag-outline", color: "#2ECC71", size_px: 240, position: { x: "center", y: 500 } },
        { type: "text", role: "title", content: "CTF Beginner Guide", font_family: "Inter", font_weight: 800, font_size_px: 110, color: "#FFFFFF", text_align: "center", position: { x: "center", y: 1050 } },
        { type: "text", role: "subtitle", content: "Your First Steps Into Competitive Hacking", font_family: "Inter", font_weight: 400, font_size_px: 48, color: "#2ECC71", text_align: "center", position: { x: "center", y: 1250 } },
        { type: "text", role: "author_brand", content: "YOUR BRAND / NAME", font_family: "Inter", font_weight: 600, font_size_px: 36, color: "#A0AABF", text_align: "center", position: { x: "center", y: 2200 } }
      ]
    })
  },
  {
    title: "Why Companies Get Hacked in the Cloud",
    description: "The real attack patterns behind cloud breaches, and the fundamentals every beginner needs to know.",
    price: 169,
    coverImage: "/cloud-security-v4.jpg",
    coverPageData: JSON.stringify({
      canvas: { width_px: 1600, height_px: 2560, background_color: "#0B0F19" },
      elements: [
        { type: "icon", name: "cloud-outline", color: "#00A8FF", size_px: 240, position: { x: "center", y: 500 } },
        { type: "text", role: "title", content: "Cloud Security Basics", font_family: "Inter", font_weight: 800, font_size_px: 105, color: "#FFFFFF", text_align: "center", position: { x: "center", y: 1050 } },
        { type: "text", role: "author_brand", content: "YOUR BRAND / NAME", font_family: "Inter", font_weight: 600, font_size_px: 36, color: "#A0AABF", text_align: "center", position: { x: "center", y: 2200 } }
      ]
    })
  },
  {
    title: "What a SOC Analyst Actually Does All Day",
    description: "A real look at the day-to-day of the job, and how to start building toward the role.",
    price: 169,
    coverImage: "/soc-analyst.jpg",
    coverPageData: JSON.stringify({
      canvas: { width_px: 1600, height_px: 2560, background_color: "#0B0F19" },
      elements: [
        { type: "icon", name: "shield-monitor-outline", color: "#9B51E0", size_px: 240, position: { x: "center", y: 500 } },
        { type: "text", role: "title", content: "SOC Analyst 101", font_family: "Inter", font_weight: 800, font_size_px: 120, color: "#FFFFFF", text_align: "center", position: { x: "center", y: 1050 } },
        { type: "text", role: "subtitle", content: "Your Path Into Security Operations", font_family: "Inter", font_weight: 400, font_size_px: 48, color: "#9B51E0", text_align: "center", position: { x: "center", y: 1250 } },
        { type: "text", role: "author_brand", content: "YOUR BRAND / NAME", font_family: "Inter", font_weight: 600, font_size_px: 36, color: "#A0AABF", text_align: "center", position: { x: "center", y: 2200 } }
      ]
    })
  }
];

async function main() {
  await prisma.offering.deleteMany({});
  for (const p of pdfs) {
    await prisma.offering.create({ data: p });
  }
  console.log("PDFs seeded in correct order");
}

main().catch(console.error).finally(() => prisma.$disconnect());
