const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // FOOTER SETTINGS
  const existingFooter = await prisma.footerSettings.findFirst();

  if (!existingFooter) {
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
    console.log("✅ Footer settings saglabāti datubāzē.");
  } else {
    console.log("ℹ️ Footer settings jau eksistē. Nekas netika mainīts.");
  }

  // NAVIGATION SETTINGS
  const existingNav = await prisma.navigationSettings.findFirst();

  if (!existingNav) {
    await prisma.navigationSettings.create({
      data: {
        logoAlt: "Vestate logo",
        phone: "+371 28446677",
        securityText: "DARĪJUMA DROŠĪBAS GARANTIJA",
        menuItems: [
          { label: "Kāpēc mēs?", link: "#kapeec", isVisible: true },
          { label: "Mūsu komanda", link: "#komanda", isVisible: true },
          { label: "Mūsu darbi", link: "#darbi", isVisible: true },
          { label: "Atsauksmes", link: "#atsauksmes", isVisible: true },
          { label: "Kontakti", link: "#kontakti", isVisible: true },
          { label: "Blogs", link: "#blogs", isVisible: true },
        ],
      },
    });
    console.log("✅ Navigation settings saglabāti datubāzē.");
  } else {
    console.log("ℹ️ Navigation settings jau eksistē. Nekas netika mainīts.");
  }

const existingSlides = await prisma.slide.findFirst()

  if (!existingSlides) {
    await prisma.slide.createMany({
      data: [
        {
          title: "Piemērs virsraksts 1",
          subtitle: "Apakšvirsraksts 1",
          description: "Apraksts 1",
          buttonText: "Uzzināt vairāk",
          buttonLink: "#",
          imageUrl: "/slider1.jpg",
          order: 1,
        },
        {
          title: "Piemērs virsraksts 2",
          subtitle: "Apakšvirsraksts 2",
          description: "Apraksts 2",
          buttonText: "Uzzināt vairāk",
          buttonLink: "#",
          imageUrl: "/slider2.jpg",
          order: 2,
        },

      ],
    })
    console.log("✅ Slide settings saglabāti datubāzē.")
  } else {
    console.log("ℹ️ Slide settings jau eksistē. Nekas netika mainīts.")
  }

}

main()
  .catch((e) => {
    console.error("❌ Seed kļūda:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
