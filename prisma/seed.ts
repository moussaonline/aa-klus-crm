import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      { name: "Ahmed AA Klus", email: "admin@aaklus.nl", role: "ADMIN" },
      { name: "Samira Planning", email: "planning@aaklus.nl", role: "MEDEWERKER" },
      { name: "Yassin Verkoop", email: "verkoop@aaklus.nl", role: "VERKOPER" },
      { name: "Nora Boekhouding", email: "boekhouding@aaklus.nl", role: "BOEKHOUDING" }
    ],
    skipDuplicates: true
  });

  console.log("AA Klus CRM seeddata is klaar.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
