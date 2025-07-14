import { getWhyChooseUs } from "@/lib/queries/whyChooseUs"
import { getTranslations } from "next-intl/server"
import WhyChooseUs from "../WhyChooseUs"

export default async function WhyChooseUsServer() {
  const data = await getWhyChooseUs()
  const t = await getTranslations("WhyChooseUs")

  // Sagatavo tulkojumus
  const translations: { [key: string]: string } = {
    defaultTitle: (() => {
      try {
        return t('defaultTitle');
      } catch {
        return "Kāpēc izvēlēties mūs?";
      }
    })(),
    defaultButtonText: (() => {
      try {
        return t('defaultButtonText');
      } catch {
        return "Sazināties";
      }
    })(),
    defaultImageAlt: (() => {
      try {
        return t('defaultImageAlt');
      } catch {
        return "Kāpēc izvēlēties mūs?";
      }
    })(),
    noDataText: (() => {
      try {
        return t('noDataText');
      } catch {
        return "Saturs nav pieejams";
      }
    })(),
  };

  // Pievienojam katra punkta tulkojumus
  if (data?.points) {
    data.points.forEach((_, index) => {
      const pointKey = `point${index + 1}`;
      
      try {
        translations[pointKey] = t(pointKey);
      } catch {
        // Ja nav tulkojuma, nekas nemainās
      }
    });
  }

  return (
    <WhyChooseUs 
      data={data ? { 
        ...data, 
        buttonUrl: data.buttonUrl === null ? undefined : data.buttonUrl 
      } : null}
      translations={translations as {
        [key: string]: string;
        defaultTitle: string;
        defaultButtonText: string;
        defaultImageAlt: string;
        noDataText: string;
      }} 
    />
  )
}
