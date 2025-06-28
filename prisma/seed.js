const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.footerSettings.create({
    data: {
      companyName: "SIA Vestate",
      description: "Profesionāli nekustamā īpašuma pakalpojumi Rīgā un visā Latvijā.",
      phone: "+371 28446677",
      email: "info@vestate.lv",
      address: "Dominas biroji, Ieriķu iela 3, Rīga, LV-1084",

      facebookUrl: "https://facebook.com/Vestate",
      instagramUrl: "https://instagram.com/Vestate",
      linkedinUrl: "https://linkedin.com/company/Vestate",

      copyrightText: "Visas tiesības aizsargātas",
      developerName: "MairisDigital",
      developerUrl: "https://facebook.com/MairisDigital",
    },
  });

}

main()
  .catch((e) => {
    console.error("❌ Seed kļūda:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
