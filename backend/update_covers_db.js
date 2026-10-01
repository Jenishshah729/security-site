import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const coversData = JSON.parse(fs.readFileSync(path.join(__dirname, 'covers.json'), 'utf8'));

async function main() {
  const offerings = await prisma.offering.findMany();
  for (const off of offerings) {
    for (const cover of coversData.covers) {
      if (
        off.coverImage &&
        (off.coverImage.includes(cover.id) ||
         off.title.toLowerCase().includes(cover.id.replace(/-/g, ' ')) ||
         off.title.toLowerCase().includes(cover.title.toLowerCase()))
      ) {
        const coverPayload = {
          ...cover,
          renderingSystem: coversData.renderingSystem
        };
        await prisma.offering.update({
          where: { id: off.id },
          data: { coverPageData: JSON.stringify(coverPayload, null, 2) }
        });
        console.log(`Updated database coverPageData for offering ${off.id} (${off.title})`);
      }
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(err => {
    console.error(err);
    prisma.$disconnect();
  });
