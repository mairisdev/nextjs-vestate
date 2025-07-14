import { upsertTranslation } from "./translations"
import type { NavigationSettings, Slide, FirstSection, SecondSection, ThirdSection,  SevenSection, Agent } from "@prisma/client"

export async function syncSlideTranslations(slide: Slide) {
  const locales = ["lv", "en", "ru"]
  const category = "HeroSlider"

  const keysAndValues = {
    defaultHeadline: slide.title,
    defaultSubtitle: slide.subtitle,
    defaultButtonText: slide.buttonText,
  }

  for (const [key, value] of Object.entries(keysAndValues)) {
    for (const locale of locales) {
      await upsertTranslation(
        `${category}.${key}`,
        locale,
        locale === "lv" ? value : "",
        category
      )
    }
  }
}

export async function syncFirstSectionTranslations(section: FirstSection) {
    const locales = ["lv", "en", "ru"]
    const category = "FirstSection"
  
    const keysAndValues = {
      defaultHeadline: section.headline,
      defaultButtonText: section.buttonText,
      defaultButtonLink: section.buttonLink
    }
  
    for (const [key, value] of Object.entries(keysAndValues)) {
      for (const locale of locales) {
        await upsertTranslation(
          `${category}.${key}`,
          locale,
          locale === "lv" ? value : "",
          category
        )
      }
    }
}

export async function syncAgentReasonsTranslations(section: SecondSection) {
    const locales = ["lv", "en", "ru"]
    const category = "AgentReasons"
  
    const keysAndValues: Record<string, string> = {
      defaultHeading: section.heading,
      defaultImageAlt: "Mākleris nodod atslēgas"
    }
  
    const reasons = Array.isArray(section.reasons) ? section.reasons : []
  
    reasons.forEach((reason, index) => {
      if (typeof reason === "string") {
        keysAndValues[`reason${index + 1}`] = reason
      }
    })
  
    for (const [key, value] of Object.entries(keysAndValues)) {
      for (const locale of locales) {
        await upsertTranslation(
          `${category}.${key}`,
          locale,
          locale === "lv" ? value : "",
          category
        )
      }
    }
}

export async function syncSevenSectionTranslations(section: SevenSection) {
  const locales = ["lv", "en", "ru"]
  const category = "LegalConsultSection2"

  const keysAndValues = {
    defaultTitle: section.title,
    defaultButtonText: section.buttonText,
  }

  for (const [key, value] of Object.entries(keysAndValues)) {
    for (const locale of locales) {
      await upsertTranslation(
        `${category}.${key}`,
        locale,
        locale === "lv" ? value : "",
        category
      )
    }
  }
}

export async function syncThirdSectionTranslations(section: ThirdSection) {
  const locales = ["lv", "en", "ru"]
  const category = "ServicesSection"

  const keysAndValues: Record<string, string> = {
    defaultSubheading: section.subheading,
    defaultHeading: section.heading,
  }

  const services = Array.isArray(section.services) ? section.services : []

  services.forEach((service, index) => {
    if (typeof service === "string") {
      keysAndValues[`service${index + 1}`] = service
    }
  })

  for (const [key, value] of Object.entries(keysAndValues)) {
    for (const locale of locales) {
      await upsertTranslation(
        `${category}.${key}`,
        locale,
        locale === "lv" ? value : "",
        category
      )
    }
  }
}

export async function syncNavigationTranslations(settings: NavigationSettings) {
  const locales = ["lv", "en", "ru"]
  const category = "Navbar"

  if (!Array.isArray(settings.menuItems)) return;

  for (let i = 0; i < settings.menuItems.length; i++) {
    const menuItem = settings.menuItems[i];
    let value = "";
    if (typeof menuItem === "object" && menuItem !== null && "label" in menuItem && typeof (menuItem as any).label === "string") {
      value = (menuItem as any).label;
    }
    const key = `Navlink${i + 1}`;

    for (const locale of locales) {
      await upsertTranslation(
        `${category}.${key}`,
        locale,
        locale === "lv" ? value : "",
        category
      )
    }
  }
}

export async function syncAgentTranslations(agents: Agent[]) {
  const locales = ["lv", "en", "ru"]
  const category = "AgentsSection"

  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i]

    const keysAndValues: Record<string, string> = {
      [`agentName${i + 1}`]: agent.name || `Aģents ${i + 1}`,
      [`agentTitle${i + 1}`]: agent.title || `Nekustamo īpašumu speciālists`,
    };

    for (const [key, value] of Object.entries(keysAndValues)) {
      for (const locale of locales) {
        await upsertTranslation(`${category}.${key}`, locale, locale === "lv" ? value : "", category)
      }
    }
  }

  // Pievieno arī fiksētās pogas un teksta atslēgas
  const staticKeys: Record<string, string> = {
    reviewsButton: "Atsauksmes",
    noReviewsText: "Nav atsauksmju",
    imageClickHint: "Nospied uz attēla, lai to palielinātu",
    agentImageAlt: "Aģenta portrets",
  }

  for (const [key, value] of Object.entries(staticKeys)) {
    for (const locale of locales) {
      await upsertTranslation(`${category}.${key}`, locale, locale === "lv" ? value : "", category)
    }
  }
}

export async function syncTestimonialsTranslations(testimonials: any[]) {
  const locales = ["lv", "en", "ru"]
  const category = "Testimonials"

  // Statiskās atslēgas sekcijas virsrakstiem
  const staticKeys = {
    defaultHeading: "Ko klienti saka par mums",
    defaultSubheading: "Mēs augstu vērtējam katra klienta viedokli — lūk, daži no tiem:",
  }

  // Sinhronizējam statiskās atslēgas
  for (const [key, value] of Object.entries(staticKeys)) {
    for (const locale of locales) {
      await upsertTranslation(
        `${category}.${key}`,
        locale,
        locale === "lv" ? value : "",
        category
      )
    }
  }

  // Sinhronizējam katru atsauksmi
  for (let i = 0; i < testimonials.length; i++) {
    const testimonial = testimonials[i]
    
    const keysAndValues = {
      [`testimonial${i + 1}Name`]: testimonial.name || `Klients ${i + 1}`,
      [`testimonial${i + 1}Message`]: testimonial.message || `Atsauksme ${i + 1}`,
    }

    for (const [key, value] of Object.entries(keysAndValues)) {
      for (const locale of locales) {
        await upsertTranslation(
          `${category}.${key}`,
          locale,
          locale === "lv" ? value : "",
          category
        )
      }
    }
  }

  const additionalKeys = {
    sectionId: "atsauksmes",
    noTestimonialsText: "Nav atsauksmju",
    testimonialPrefix: "Atsauksme no",
    ratingAlt: "Vērtējums zvaigznēs",
  }
  

  for (const [key, value] of Object.entries(additionalKeys)) {
    for (const locale of locales) {
      await upsertTranslation(
        `${category}.${key}`,
        locale,
        locale === "lv" ? value : "",
        category
      )
    }
  }
}

export async function syncRecentSalesTranslations(properties: any[]) {
  const locales = ["lv", "en", "ru"]
  const category = "RecentSales"

  // Statiskās atslēgas sekcijas virsrakstiem un elementiem
  const staticKeys = {
    defaultHeading: "Karstākie piedāvājumi",
    defaultSubheading: "Atrodi savu sapņu īpašumu jau šodien!",
    statusSold: "PĀRDOTS",
    statusActive: "PĀRDOŠANĀ", 
    viewMoreButton: "Apskatīt vairāk",
    modalCloseButton: "Aizvērt",
    noPropertiesText: "Pašlaik nav pieejamu piedāvājumu",
    sectionId: "musu-darbi",
    priceLabel: "Cena",
    sizeLabel: "Platība", 
    typeLabel: "Tips",
    floorLabel: "Stāvs",
    descriptionLabel: "Apraksts",
    fullInfoButton: "Apskatīt pilnu informāciju",
  }

  // Sinhronizējam statiskās atslēgas
  for (const [key, value] of Object.entries(staticKeys)) {
    for (const locale of locales) {
      await upsertTranslation(
        `${category}.${key}`,
        locale,
        locale === "lv" ? value : "",
        category
      )
    }
  }

  // Sinhronizējam katru īpašumu
  for (let i = 0; i < properties.length; i++) {
    const property = properties[i]
    
    const keysAndValues = {
      [`property${i + 1}Title`]: property.title || `Īpašums ${i + 1}`,
      [`property${i + 1}Price`]: property.price || "Nav norādīta",
      [`property${i + 1}Size`]: property.size || "Nav norādīta",
      [`property${i + 1}Type`]: property.series || property.type || "Nav norādīts",
      [`property${i + 1}Floor`]: property.floor || "Nav norādīts",
      [`property${i + 1}Description`]: property.description || `Apraksts ${i + 1}`,
    }

    for (const [key, value] of Object.entries(keysAndValues)) {
      for (const locale of locales) {
        await upsertTranslation(
          `${category}.${key}`,
          locale,
          locale === "lv" ? value : "",
          category
        )
      }
    }
  }
}

export async function syncStatsSectionTranslations(statistics: any[]) {
  const locales = ["lv", "en", "ru"]
  const category = "StatsSection"

  // Statiskās atslēgas sekcijas virsrakstiem
  const staticKeys = {
    defaultSubheading: "Pieredzes bagāti nekustamo īpašumu speciālisti",
    defaultHeading: "Mūsu pārdošanas prakse",
    noStatsText: "Pašlaik nav pieejamas statistikas",
    sectionBackground: "bg-white",
    iconBackground: "bg-[#00332D]",
    cardBackground: "bg-[#E6F4F1]",
  }

  // Sinhronizējam statiskās atslēgas
  for (const [key, value] of Object.entries(staticKeys)) {
    for (const locale of locales) {
      await upsertTranslation(
        `${category}.${key}`,
        locale,
        locale === "lv" ? value : "",
        category
      )
    }
  }

  // Sinhronizējam katru statistiku
  for (let i = 0; i < statistics.length; i++) {
    const stat = statistics[i]
    
    const keysAndValues = {
      [`stat${i + 1}Value`]: stat.value || `Vērtība ${i + 1}`,
      [`stat${i + 1}Description`]: stat.description || `Apraksts ${i + 1}`,
      [`stat${i + 1}Icon`]: stat.icon || "HelpCircle",
    }

    for (const [key, value] of Object.entries(keysAndValues)) {
      for (const locale of locales) {
        await upsertTranslation(
          `${category}.${key}`,
          locale,
          locale === "lv" ? value : "",
          category
        )
      }
    }
  }

  // Papildu atslēgas
  const additionalKeys = {
    gridLayout: "md:grid-cols-3",
    cardShadow: "hover:shadow-lg",
    iconSize: "w-6 h-6",
    valueSize: "text-3xl",
    descriptionSize: "text-sm",
  }

  for (const [key, value] of Object.entries(additionalKeys)) {
    for (const locale of locales) {
      await upsertTranslation(
        `${category}.${key}`,
        locale,
        locale === "lv" ? value : "",
        category
      )
    }
  }
}

export async function syncWhyChooseUsTranslations(whyChooseUsData: any) {
  const locales = ["lv", "en", "ru"]
  const category = "WhyChooseUs"

  if (!whyChooseUsData) return

  // Statiskās atslēgas sekcijas galvenajiem elementiem
  const staticKeys = {
    defaultTitle: whyChooseUsData.title || "Kāpēc izvēlēties mūs?",
    defaultButtonText: whyChooseUsData.buttonText || "Sazināties",
    defaultImageAlt: "Kāpēc izvēlēties mūs?",
    noDataText: "Saturs nav pieejams",
    sectionId: "kapec-mes",
    checkIconName: "CheckCheck",
    arrowIconName: "arrow-right",
    backgroundGradient: "bg-gradient-to-br from-white via-[#F9FAFB] to-white",
  }

  // Sinhronizējam statiskās atslēgas
  for (const [key, value] of Object.entries(staticKeys)) {
    for (const locale of locales) {
      await upsertTranslation(
        `${category}.${key}`,
        locale,
        locale === "lv" ? value : "",
        category
      )
    }
  }

  // Sinhronizējam katru punktu
  if (Array.isArray(whyChooseUsData.points)) {
    for (let i = 0; i < whyChooseUsData.points.length; i++) {
      const point = whyChooseUsData.points[i]
      
      const pointKey = `point${i + 1}`
      const pointValue = point || `Punkts ${i + 1}`

      for (const locale of locales) {
        await upsertTranslation(
          `${category}.${pointKey}`,
          locale,
          locale === "lv" ? pointValue : "",
          category
        )
      }
    }
  }

  // Papildu stilizācijas atslēgas
  const styleKeys = {
    titleSize: "text-3xl sm:text-4xl lg:text-5xl",
    buttonStyle: "bg-gradient-to-r from-[#00332D] to-[#00443B]",
    cardBackground: "bg-white/90 backdrop-blur-xl",
    hoverEffect: "hover:shadow-3xl hover:shadow-[#77dDB4]/20",
    imageAspect: "aspect-[3/2] sm:aspect-[4/3]",
  }

  for (const [key, value] of Object.entries(styleKeys)) {
    for (const locale of locales) {
      await upsertTranslation(
        `${category}.${key}`,
        locale,
        locale === "lv" ? value : "",
        category
      )
    }
  }
}

export async function syncPartnersSectionTranslations(partnersData: any) {
  const locales = ["lv", "en", "ru"]
  const category = "PartnersSection"

  if (!partnersData) return

  // Tikai statiskās atslēgas (title un subtitle)
  const staticKeys = {
    defaultTitle: partnersData.title || "Mūsu partneri",
    defaultSubtitle: partnersData.subtitle || "Uzticamā sadarbība",
    noPartnersText: "Pašlaik nav pievienoti partneri",
    noLogoText: "Nav logo",
    sectionBackground: "bg-gradient-to-br from-[#F3F4F6] via-white to-[#F3F4F6]",
    titleSize: "text-4xl sm:text-5xl",
    subtitleStyle: "text-sm uppercase text-[#77dDB4] font-bold tracking-wider",
    gridLayout: "grid-cols-2 sm:grid-cols-3 md:grid-cols-6",
    cardHover: "hover:shadow-2xl hover:shadow-[#77dDB4]/20",
  }

  // Sinhronizējam tikai statiskās atslēgas
  for (const [key, value] of Object.entries(staticKeys)) {
    for (const locale of locales) {
      await upsertTranslation(
        `${category}.${key}`,
        locale,
        locale === "lv" ? value : "",
        category
      )
    }
  }

  // Papildu vizuālās atslēgas
  const visualKeys = {
    decorBackground1: "bg-gradient-to-br from-[#77dDB4]/10 to-transparent",
    decorBackground2: "bg-gradient-to-tl from-[#00332D]/5 to-transparent",
    badgeBackground: "bg-[#77dDB4]/10",
    badgeDot: "w-2 h-2 bg-[#77dDB4] rounded-full animate-pulse",
    titleGradient: "bg-gradient-to-r from-[#77dDB4] to-[#00332D]",
    cardTransition: "transition-all duration-500",
    hoverTransform: "transform hover:-translate-y-2",
  }

  for (const [key, value] of Object.entries(visualKeys)) {
    for (const locale of locales) {
      await upsertTranslation(
        `${category}.${key}`,
        locale,
        locale === "lv" ? value : "",
        category
      )
    }
  }
}

export async function syncContactSectionTranslations(contactData: any) {
  const locales = ["lv", "en", "ru"]
  const category = "ContactSection"

  if (!contactData) return

  // Statiskās atslēgas kontaktiem
  const staticKeys = {
    defaultHeading: contactData.heading || "Sazināties ar mums",
    defaultSubtext: contactData.subtext || "Mēs palīdzēsim atrast jūsu sapņu īpašumu",
    formNamePlaceholder: "Vārds un uzvārds",
    formEmailPlaceholder: "E-pasts",
    formMessagePlaceholder: "Jūsu ziņojums",
    securityQuestion: "Drošības jautājums",
    securityQuestionDesc: "Atbildiet uz šo vienkāršo jautājumu, lai pierādītu, ka neesat robots.",
    submitButton: "Nosūtīt ziņu",
    successMessage: "Paldies, ziņa nosūtīta veiksmīgi!",
    errorMessage: "Neizdevās nosūtīt ziņu. Mēģiniet vēlreiz.",
    emailError: "Lūdzu, ievadiet derīgu e-pastu.",
    securityError: "Nepareiza atbilde uz jautājumu.",
    sendMessageTitle: "Nosūtīt ziņu",
    sendMessageDesc: "Mēs atbildēsim 24 stundu laikā",
    addressLabel: "Adrese",
    phoneLabel: "Telefons",
    emailLabel: "E-pasts",
    hoursLabel: "Darba laiks",
    sectionId: "kontakti",
  }

  // Sinhronizējam statiskās atslēgas
  for (const [key, value] of Object.entries(staticKeys)) {
    for (const locale of locales) {
      await upsertTranslation(
        `${category}.${key}`,
        locale,
        locale === "lv" ? value : "",
        category
      )
    }
  }

  // Quiz jautājumi
  const quizKeys = {
    quiz1: "Cik ir 2 + 3?",
    quiz2: "Cik ir 4 - 1?",
    quiz3: "Cik ir 10 / 2?",
    quiz4: "Cik ir 3 + 4?",
    quiz5: "Cik ir 6 - 2?",
  }

  for (const [key, value] of Object.entries(quizKeys)) {
    for (const locale of locales) {
      await upsertTranslation(
        `${category}.${key}`,
        locale,
        locale === "lv" ? value : "",
        category
      )
    }
  }

  // Vizuālās atslēgas
  const visualKeys = {
    sectionBackground: "bg-[#F9FAFB]",
    cardBackground: "bg-white",
    buttonGradient: "bg-gradient-to-r from-[#00332D] to-[#00443B]",
    iconBackground: "bg-[#77dDB4]",
    inputFocus: "focus:border-[#77dDB4]",
    shadowHover: "hover:shadow-3xl",
  }

  for (const [key, value] of Object.entries(visualKeys)) {
    for (const locale of locales) {
      await upsertTranslation(
        `${category}.${key}`,
        locale,
        locale === "lv" ? value : "",
        category
      )
    }
  }
}

// ========== FooterSection sinhronizācijas funkcija ==========
export async function syncFooterSectionTranslations(footerData: any) {
  const locales = ["lv", "en", "ru"]
  const category = "FooterSection"

  if (!footerData) return

  // Statiskās atslēgas footer
  const staticKeys = {
    defaultCompanyName: footerData.companyName || "Vestate",
    defaultDescription: footerData.description || "Nekustamo īpašumu pārdošana un konsultācijas",
    sitemapTitle: "Lapas karte",
    servicesTitle: "Pakalpojumi",
    contactTitle: "Kontaktinformācija",
    homeLink: "Sākums",
    aboutLink: "Par mums",
    propertiesLink: "Īpašumi",
    contactLink: "Kontakti",
    salesService: "Īpašumu pārdošana",
    rentalService: "Noma un izīrēšana",
    consultationService: "Konsultācijas",
    evaluationService: "Vērtējumi",
    copyrightText: footerData.copyrightText || "© 2024 Vestate. Visas tiesības aizsargātas.",
    developmentText: " Izstrāde: ",
    defaultDeveloperName: footerData.developerName || "Izstrādātājs",
  }

  // Sinhronizējam statiskās atslēgas
  for (const [key, value] of Object.entries(staticKeys)) {
    for (const locale of locales) {
      await upsertTranslation(
        `${category}.${key}`,
        locale,
        locale === "lv" ? value : "",
        category
      )
    }
  }

  // Vizuālās un stilizācijas atslēgas
  const visualKeys = {
    footerBackground: "bg-[#00332D]",
    footerTextColor: "text-white",
    linkHoverColor: "hover:text-[#77D4B4]",
    borderColor: "border-white/10",
    copyrightTextColor: "text-gray-400",
    developerLinkColor: "text-[#77D4B4]",
    gridLayout: "grid-cols-1 md:grid-cols-4",
    socialIconSize: "w-5 h-5",
    contactIconSize: "w-4 h-4",
  }

  for (const [key, value] of Object.entries(visualKeys)) {
    for (const locale of locales) {
      await upsertTranslation(
        `${category}.${key}`,
        locale,
        locale === "lv" ? value : "",
        category
      )
    }
  }
}
