import { prisma } from '@/lib/prisma'
import { getTranslations } from "next-intl/server";
import TestimonialsSection from "../Testimonials";

export default async function TestimonialsServer() {
  const testimonials = await prisma.testimonial.findMany({
  orderBy: { createdAt: "desc" }
})
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
  testimonials.forEach((_, index) => {
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
      testimonials={testimonials}
      translations={translations as { [key: string]: string; defaultHeading: string; defaultSubheading: string; }} 
    />
  );
}