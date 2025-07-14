import { getTestimonials } from "@/lib/queries/testimonials";
import { getTranslations } from "next-intl/server";
import TestimonialsSection from "../Testimonials";

export default async function TestimonialsServer() {
  const testimonialsRaw = await getTestimonials();
  const t = await getTranslations("Testimonials");

  // Sagatavo tulkojumus
  const translations: { [key: string]: string } = {
    defaultHeading: (() => {
      try {
        return t('defaultHeading');
      } catch {
        return "Ko klienti saka par mums";
      }
    })(),
    defaultSubheading: (() => {
      try {
        return t('defaultSubheading');
      } catch {
        return "Mēs augstu vērtējam katra klienta viedokli — lūk, daži no tiem:";
      }
    })(),
  };

  // Pievienojam katras atsauksmes tulkojumus
  testimonialsRaw.forEach((_, index) => {
    const nameKey = `testimonial${index + 1}Name`;
    const messageKey = `testimonial${index + 1}Message`;
    
    try {
      translations[nameKey] = t(nameKey);
    } catch {
      // Ja nav tulkojuma, nekas nemainās
    }
    
    try {
      translations[messageKey] = t(messageKey);
    } catch {
      // Ja nav tulkojuma, nekas nemainās
    }
  });

  return (
    <TestimonialsSection 
      testimonials={testimonialsRaw}
      translations={translations as { [key: string]: string; defaultHeading: string; defaultSubheading: string; }} 
    />
  );
}