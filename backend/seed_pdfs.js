import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const pdfs = [
  {
    title: "Top 10 Beginner Mistakes When Starting Cybersecurity",
    description: "The costly mistakes every beginner makes early on, and exactly how to skip them.",
    price: 69,
    coverImage: "/top-10-mistakes.png"
  },
  {
    title: "Free Tools Every Beginner Hacker Should Know",
    description: "A curated list of the free tools real hackers actually use, with why and when to use each.",
    price: 69,
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
    title: "Burp Suite for Beginners",
    description: "A simple, step-by-step guide to setting up Burp Suite and intercepting your first request.",
    price: 69,
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
    title: "CTF (Capture The Flag) Beginner Guide",
    description: "Everything you need to solve your first CTF challenge, from categories to strategy.",
    price: 69,
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
    title: "Cloud Security Basics",
    description: "Understand how cloud platforms get attacked, and the fundamentals every security beginner needs to know.",
    price: 69,
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
    title: "The SOC Analyst 101 Guide",
    description: "What a SOC Analyst actually does day-to-day, and how to start building toward the role.",
    price: 69,
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
