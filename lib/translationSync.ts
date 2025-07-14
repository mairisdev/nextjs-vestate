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
