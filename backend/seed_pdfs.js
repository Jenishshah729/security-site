import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const pdfs = [
  {
    title: "10 Hacking Mistakes That Waste Your First Year",
    description: "The costly mistakes almost everyone makes when starting out — and exactly how to skip them and move faster.",
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
    title: "Burp Suite: A Step-by-Step Guide to Intercepting Your First Request",
    description: "Set up Burp Suite from scratch and intercept your first web request — the exact steps real pentesters use to get started.",
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
    title: "Capture The Flag: A Beginner's Playbook to Your First Win",
    description: "Categories, tools, and strategy to solve your first CTF challenge — from the basics to your first flag.",
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
    title: "Cloud Security: The Skill Everyone Skips (And Regrets)",
    description: "The cloud security fundamentals nobody teaches you in a course — the exact gap that trips people up in interviews and on the job.",
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
    title: "Inside a SOC: Tools, Responsibilities & the Basics You Need",
    description: "The tools SOC analysts actually use, their core responsibilities on the job, and the fundamentals you need to understand the role.",
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
