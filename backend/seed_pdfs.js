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
    coverImage: "/hackers-toolkit.jpg",
    coverPageData: JSON.stringify({
      canvas: { width_px: 1600, height_px: 2560, background_color: "#0B0F19" },
      elements: [
        { type: "icon", name: "toolbox-outline", color: "#FF9F1C", size_px: 240, position: { x: "center", y: 500 } },
        { type: "text", role: "title", content: "The Toolkit Nobody Hands You", font_family: "Inter", font_weight: 800, font_size_px: 120, color: "#FFFFFF", text_align: "center", position: { x: "center", y: 1050 } },
        { type: "text", role: "subtitle", content: "20 free tools real hackers use — what to grab, and when.", font_family: "Inter", font_weight: 400, font_size_px: 48, color: "#FF9F1C", text_align: "center", position: { x: "center", y: 1250 } },
        { type: "text", role: "author_brand", content: "YOUR BRAND / NAME", font_family: "Inter", font_weight: 600, font_size_px: 36, color: "#A0AABF", text_align: "center", position: { x: "center", y: 2200 } }
      ]
    })
  },
  {
    title: "Burp Suite, Minus the Confusion",
    description: "Go from install to your first intercepted request, step by step.",
    price: 199,
    coverImage: "/burp-suite.jpg",
    coverPageData: JSON.stringify({
      canvas: { width_px: 1600, height_px: 2560, background_color: "#0B0F19" },
      elements: [
        { type: "icon", name: "bug-outline", color: "#FF5733", size_px: 240, position: { x: "center", y: 500 } },
        { type: "text", role: "title", content: "Burp Suite, Minus the Confusion", font_family: "Inter", font_weight: 800, font_size_px: 140, color: "#FFFFFF", text_align: "center", position: { x: "center", y: 1050 } },
        { type: "text", role: "subtitle", content: "Go from install to your first intercepted request, step by step.", font_family: "Inter", font_weight: 400, font_size_px: 48, color: "#FF5733", text_align: "center", position: { x: "center", y: 1250 } },
        { type: "text", role: "author_brand", content: "YOUR BRAND / NAME", font_family: "Inter", font_weight: 600, font_size_px: 36, color: "#A0AABF", text_align: "center", position: { x: "center", y: 2200 } }
      ]
    })
  },
  {
    title: "Your First CTF, Made Simple",
    description: "The mindset and strategy to land your first flag, fast.",
    price: 199,
    coverImage: "/ctf-guide.jpg",
    coverPageData: JSON.stringify({
      canvas: { width_px: 1600, height_px: 2560, background_color: "#0B0F19" },
      elements: [
        { type: "icon", name: "flag-outline", color: "#2ECC71", size_px: 240, position: { x: "center", y: 500 } },
        { type: "text", role: "title", content: "Your First CTF, Made Simple", font_family: "Inter", font_weight: 800, font_size_px: 110, color: "#FFFFFF", text_align: "center", position: { x: "center", y: 1050 } },
        { type: "text", role: "subtitle", content: "The mindset and strategy to land your first flag, fast.", font_family: "Inter", font_weight: 400, font_size_px: 48, color: "#2ECC71", text_align: "center", position: { x: "center", y: 1250 } },
        { type: "text", role: "author_brand", content: "YOUR BRAND / NAME", font_family: "Inter", font_weight: 600, font_size_px: 36, color: "#A0AABF", text_align: "center", position: { x: "center", y: 2200 } }
      ]
    })
  },
  {
    title: "The Cloud Security Gap",
    description: "Close the exact gap that trips most beginners up.",
    price: 199,
    coverImage: "/cloud-security-v4.jpg",
    coverPageData: JSON.stringify({
      canvas: { width_px: 1600, height_px: 2560, background_color: "#0B0F19" },
      elements: [
        { type: "icon", name: "cloud-outline", color: "#00A8FF", size_px: 240, position: { x: "center", y: 500 } },
        { type: "text", role: "title", content: "The Cloud Security Gap", font_family: "Inter", font_weight: 800, font_size_px: 105, color: "#FFFFFF", text_align: "center", position: { x: "center", y: 1050 } },
        { type: "text", role: "author_brand", content: "YOUR BRAND / NAME", font_family: "Inter", font_weight: 600, font_size_px: 36, color: "#A0AABF", text_align: "center", position: { x: "center", y: 2200 } }
      ]
    })
  },
  {
    title: "Before You Walk Into a SOC",
    description: "The real tools and responsibilities nobody explains upfront.",
    price: 199,
    coverImage: "/soc-analyst.jpg",
    coverPageData: JSON.stringify({
      canvas: { width_px: 1600, height_px: 2560, background_color: "#0B0F19" },
      elements: [
        { type: "icon", name: "shield-monitor-outline", color: "#9B51E0", size_px: 240, position: { x: "center", y: 500 } },
        { type: "text", role: "title", content: "Before You Walk Into a SOC", font_family: "Inter", font_weight: 800, font_size_px: 120, color: "#FFFFFF", text_align: "center", position: { x: "center", y: 1050 } },
        { type: "text", role: "subtitle", content: "The real tools and responsibilities nobody explains upfront.", font_family: "Inter", font_weight: 400, font_size_px: 48, color: "#9B51E0", text_align: "center", position: { x: "center", y: 1250 } },
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
  console.log("PDFs seeded in correct order with updated titles and descriptions");
}

main().catch(console.error).finally(() => prisma.$disconnect());
