import { upsertTranslation } from "./translations"
import type { NavigationSettings, Slide, FirstSection, SecondSection, ThirdSection,  SevenSection, Agent } from "@prisma/client"

export async function syncSlideTranslations(slide: Slide) {
  const locales = ["lv", "en", "ru"]
  const category = "HeroSlider"

  // PAREIZĀS atslēgas, kas atbilst mūsu komponentam
  const keysAndValues = {
    defaultTitle: slide.title,
    defaultSubtitle: slide.subtitle,
    defaultDescription: slide.description,
    defaultButtonText: slide.buttonText,
  }

  // Sinhronizējam pamata slaida datus
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

  // Pievienojam fiksētus benefit tulkojumus, ja tie vēl neeksistē
  const defaultBenefits = {
    benefit1: "Profesionāla pieredze",
    benefit2: "Individuāla pieeja", 
    benefit3: "Tirgus analīze",
    benefit4: "Juridiskā palīdzība",
    benefit5: "Komunikācija un atbalsts",
    benefit6: "Mārketinga stratēģijas"
  }

  for (const [key, value] of Object.entries(defaultBenefits)) {
    for (const locale of locales) {
      // Pievienojam benefit tulkojumus tikai latviešu valodai
      // Citām valodām atstājam tukšus, lai admin var tos aizpildīt
      await upsertTranslation(
        `${category}.${key}`,
        locale,
        locale === "lv" ? value : "",
        category
      )
    }
  }

  console.log(`✅ Sinhronizēti slider tulkojumi: ${slide.title}`)
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
  const category = "RecentSalesGallery" // SVARĪGI: izmantojam RecentSalesGallery, nevis RecentSales

  // Statiskās atslēgas sekcijas virsrakstiem un elementiem
  const staticKeys = {
    defaultHeading: "Mūsu darbi",
    defaultSubheading: "Apskatieties mūsu veiksmīgi pārdotos īpašumus",
    statusSold: "Pārdots",
    statusActive: "Pārdošanā", 
    viewMoreButton: "Skatīt vairāk",
    modalCloseButton: "Aizvērt",
    noPropertiesText: "Pagaidām nav pārdoto īpašumu",
    sectionId: "musu-darbi",
    priceLabel: "Cena",
    sizeLabel: "Platība", 
    typeLabel: "Tips",
    floorLabel: "Stāvs",
    descriptionLabel: "Apraksts",
  }

  console.log(`🔄 Sinhronizē RecentSalesGallery: ${properties.length} īpašumi`);

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

    console.log(`📝 Property ${i + 1}: ${property.title}`);

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

  console.log(`✅ RecentSalesGallery tulkojumi sinhronizēti: ${properties.length} īpašumi`);
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

export async function syncPropertyCategoriesTranslations(categories: any[]) {
  const locales = ["lv", "en", "ru"]
  const category = "PropertyCategories"

  console.log(`🔄 Sinhronizē PropertyCategories: ${categories.length} kategorijas`);

  // Statiskās atslēgas sekcijas galvenajiem elementiem
  const staticKeys = {
    pageTitle: "Īpašumu Kategorijas",
    pageSubtitle: "Atrodiet savu ideālo īpašumu pie mums!",
    pageDescription: "VESTATE ĪPAŠUMU KATEGORIJAS",
    propertiesCountText: "īpašumi",
    noPropertiesText: "Nav īpašumu",
    viewCategoryButton: "Skatīt kategoriju",
    backToHomeButton: "Atpakaļ uz sākumu",
    noImageAlt: "Kategorijas attēls",
    loadingText: "Ielādē kategorijas...",
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

  // Sinhronizējam katras kategorijas nosaukumu un aprakstu
  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i]
    
    const keysAndValues = {
      [`category${i + 1}Name`]: cat.name || `Kategorija ${i + 1}`,
      [`category${i + 1}Description`]: cat.description || `Apraksts ${i + 1}`,
      [`category${i + 1}Slug`]: cat.slug || `kategorija-${i + 1}`,
    }

    console.log(`📝 Category ${i + 1}: ${cat.name} (${cat.slug})`);

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

  console.log(`✅ PropertyCategories tulkojumi sinhronizēti: ${categories.length} kategorijas`);
}

export async function syncPropertyFiltersTranslations() {
  const locales = ["lv", "en", "ru"]
  const category = "PropertyFilters"

  console.log(`🔄 Sinhronizē PropertyFilters tulkojumus...`);

  // Statiskās atslēgas filtru komponentam
  const staticKeys = {
    filtersTitle: "Filtri",
    clearAllButton: "Notīrīt visus", 
    cityLabel: "Pilsēta",
    allCitiesOption: "Visas pilsētas",
    districtLabel: "Rajons",
    allDistrictsOption: "Visi rajoni", 
    projectLabel: "Projekts",
    allProjectsOption: "Visi projekti",
    priceLabel: "Cena EUR",
    priceFromPlaceholder: "No",
    priceToPlaceholder: "Līdz",
    roomsLabel: "Istabu skaits",
    areaLabel: "Platība / m²",
    areaFromPlaceholder: "No", 
    areaToPlaceholder: "Līdz",
    applyFiltersButton: "Pielietot filtrus",
    // Papildu tulkojumi
    statusLabel: "Statuss",
    allStatusesOption: "Visi statusi",
    availableStatus: "Pieejams",
    reservedStatus: "Rezervēts", 
    soldStatus: "Pārdots",
    rentedStatus: "Iznomāts",
    sortLabel: "Kārtot pēc",
    sortNewest: "Jaunākie",
    sortOldest: "Vecākie",
    sortPriceAsc: "Cena: no lētākās",
    sortPriceDesc: "Cena: no dārgākās",
    sortAreaAsc: "Platība: no mazākās",
    sortAreaDesc: "Platība: no lielākās",
    noFiltersText: "Nav aktīvu filtru",
    activeFiltersText: "Aktīvie filtri"
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

  console.log(`✅ PropertyFilters tulkojumi sinhronizēti!`);
}

export async function syncPropertyDetailsTranslations() {
  const locales = ["lv", "en", "ru"]
  
  // PropertyDetails tulkojumi
  const propertyDetailsKeys = {
    title: "Īpašuma detaļas",
    roomsLabel: "Istabu skaits",
    roomsValue: "{count} istabas",
    areaLabel: "Platība", 
    areaValue: "{area} m²",
    floorLabel: "Stāvs",
    floorValue: "{floor}/{total}",
    floorValueSingle: "{floor}. stāvs",
    seriesLabel: "Sērija",
    elevatorLabel: "Lifts",
    elevatorYes: "Ir",
    elevatorNo: "Nav",
    amenitiesLabel: "Ērtības",
    locationLabel: "Atrašanās vieta",
    createdLabel: "Pievienots",
    projectLabel: "Projekts",
    notSpecified: "Nav norādīts",
    descriptionTitle: "Apraksts"
  }

  // PropertyContact tulkojumi
  const propertyContactKeys = {
    title: "Sazināties",
    priceLabel: "Cena",
    defaultAgentName: "Nekustamā īpašuma aģents",
    agentRole: "Nekustamā īpašuma aģents",
    emailSubject: "Interese par īpašumu: {title}",
    sendEmail: "Sūtīt e-pastu",
    whatsappMessage: "Sveiki! Interesē īpašums: {title}",
    propertyId: "Īpašuma ID: {id}"
  }

  // PropertyPage tulkojumi - PIEVIENOTA uniqueViews!
  const propertyPageKeys = {
    statusAvailable: "Pieejams",
    statusReserved: "Rezervēts",
    statusSold: "Pārdots", 
    statusRented: "Iznomāts",
    breadcrumbHome: "Sākums",
    breadcrumbProperties: "Īpašumi",
    backToList: "Atpakaļ uz sarakstu",
    pricePerSquare: "€{price}/m²",
    uniqueViews: "unikāli skatījumi", // ⭐ ŠEIT BIJA PROBLĒMA!
    viewsCounter: "skatījumi",
    viewsLabel: "Skatījumi"
  }

  // Sinhronizējam PropertyDetails
  const propertyDetailsCategory = "PropertyDetails"
  for (const [key, value] of Object.entries(propertyDetailsKeys)) {
    for (const locale of locales) {
      await upsertTranslation(
        `${propertyDetailsCategory}.${key}`,
        locale,
        locale === "lv" ? value : "",
        propertyDetailsCategory
      )
    }
  }

  // Sinhronizējam PropertyContact  
  const propertyContactCategory = "PropertyContact"
  for (const [key, value] of Object.entries(propertyContactKeys)) {
    for (const locale of locales) {
      await upsertTranslation(
        `${propertyContactCategory}.${key}`,
        locale,
        locale === "lv" ? value : "",
        propertyContactCategory
      )
    }
  }

  // Sinhronizējam PropertyPage
  const propertyPageCategory = "PropertyPage"
  for (const [key, value] of Object.entries(propertyPageKeys)) {
    for (const locale of locales) {
      await upsertTranslation(
        `${propertyPageCategory}.${key}`,
        locale,
        locale === "lv" ? value : "",
        propertyPageCategory
      )
    }
  }

  console.log("✅ Property details tulkojumi sinhronizēti");
}
