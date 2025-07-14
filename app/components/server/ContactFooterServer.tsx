import { getTranslations } from "next-intl/server"
import ContactSection from "../ContactSection"
import FooterSection from "../FooterSection"

async function getContactData() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/contact`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch contact data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching contact data:', error);
    return null;
  }
}

async function getFooterData() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/footer-settings`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch footer data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching footer data:', error);
    return null;
  }
}

// ========== ContactSectionServer ==========
export async function ContactSectionServer() {
  const contactData = await getContactData()
  const t = await getTranslations("ContactSection")

  // Sagatavo ContactSection tulkojumus
  const contactTranslations: { [key: string]: string } = {
    defaultHeading: (() => {
      try {
        return t('defaultHeading');
      } catch {
        return "Sazināties ar mums";
      }
    })(),
    defaultSubtext: (() => {
      try {
        return t('defaultSubtext');
      } catch {
        return "Mēs palīdzēsim atrast jūsu sapņu īpašumu";
      }
    })(),
    formNamePlaceholder: (() => {
      try {
        return t('formNamePlaceholder');
      } catch {
        return "Vārds un uzvārds";
      }
    })(),
    formEmailPlaceholder: (() => {
      try {
        return t('formEmailPlaceholder');
      } catch {
        return "E-pasts";
      }
    })(),
    formMessagePlaceholder: (() => {
      try {
        return t('formMessagePlaceholder');
      } catch {
        return "Jūsu ziņojums";
      }
    })(),
    securityQuestion: (() => {
      try {
        return t('securityQuestion');
      } catch {
        return "Drošības jautājums";
      }
    })(),
    securityQuestionDesc: (() => {
      try {
        return t('securityQuestionDesc');
      } catch {
        return "Atbildiet uz šo vienkāršo jautājumu, lai pierādītu, ka neesat robots.";
      }
    })(),
    submitButton: (() => {
      try {
        return t('submitButton');
      } catch {
        return "Nosūtīt ziņu";
      }
    })(),
    successMessage: (() => {
      try {
        return t('successMessage');
      } catch {
        return "Paldies, ziņa nosūtīta veiksmīgi!";
      }
    })(),
    errorMessage: (() => {
      try {
        return t('errorMessage');
      } catch {
        return "Neizdevās nosūtīt ziņu. Mēģiniet vēlreiz.";
      }
    })(),
    emailError: (() => {
      try {
        return t('emailError');
      } catch {
        return "Lūdzu, ievadiet derīgu e-pastu.";
      }
    })(),
    securityError: (() => {
      try {
        return t('securityError');
      } catch {
        return "Nepareiza atbilde uz jautājumu.";
      }
    })(),
    sendMessageTitle: (() => {
      try {
        return t('sendMessageTitle');
      } catch {
        return "Nosūtīt ziņu";
      }
    })(),
    sendMessageDesc: (() => {
      try {
        return t('sendMessageDesc');
      } catch {
        return "Mēs atbildēsim 24 stundu laikā";
      }
    })(),
    addressLabel: (() => {
      try {
        return t('addressLabel');
      } catch {
        return "Adrese";
      }
    })(),
    phoneLabel: (() => {
      try {
        return t('phoneLabel');
      } catch {
        return "Telefons";
      }
    })(),
    emailLabel: (() => {
      try {
        return t('emailLabel');
      } catch {
        return "E-pasts";
      }
    })(),
    hoursLabel: (() => {
      try {
        return t('hoursLabel');
      } catch {
        return "Darba laiks";
      }
    })(),
    quiz1: (() => {
      try {
        return t('quiz1');
      } catch {
        return "Cik ir 2 + 3?";
      }
    })(),
    quiz2: (() => {
      try {
        return t('quiz2');
      } catch {
        return "Cik ir 4 - 1?";
      }
    })(),
    quiz3: (() => {
      try {
        return t('quiz3');
      } catch {
        return "Cik ir 10 / 2?";
      }
    })(),
    quiz4: (() => {
      try {
        return t('quiz4');
      } catch {
        return "Cik ir 3 + 4?";
      }
    })(),
    quiz5: (() => {
      try {
        return t('quiz5');
      } catch {
        return "Cik ir 6 - 2?";
      }
    })(),
  };

  return (
    <ContactSection 
      data={contactData}
      translations={contactTranslations} 
    />
  )
}

// ========== FooterSectionServer ==========
export async function FooterSectionServer() {
  const footerData = await getFooterData()
  const t = await getTranslations("FooterSection")

  // Sagatavo FooterSection tulkojumus
  const footerTranslations: { [key: string]: string } = {
    defaultCompanyName: (() => {
      try {
        return t('defaultCompanyName');
      } catch {
        return "Vestate";
      }
    })(),
    defaultDescription: (() => {
      try {
        return t('defaultDescription');
      } catch {
        return "Nekustamo īpašumu pārdošana un konsultācijas";
      }
    })(),
    sitemapTitle: (() => {
      try {
        return t('sitemapTitle');
      } catch {
        return "Lapas karte";
      }
    })(),
    servicesTitle: (() => {
      try {
        return t('servicesTitle');
      } catch {
        return "Pakalpojumi";
      }
    })(),
    contactTitle: (() => {
      try {
        return t('contactTitle');
      } catch {
        return "Kontaktinformācija";
      }
    })(),
    homeLink: (() => {
      try {
        return t('homeLink');
      } catch {
        return "Sākums";
      }
    })(),
    aboutLink: (() => {
      try {
        return t('aboutLink');
      } catch {
        return "Par mums";
      }
    })(),
    propertiesLink: (() => {
      try {
        return t('propertiesLink');
      } catch {
        return "Īpašumi";
      }
    })(),
    contactLink: (() => {
      try {
        return t('contactLink');
      } catch {
        return "Kontakti";
      }
    })(),
    salesService: (() => {
      try {
        return t('salesService');
      } catch {
        return "Īpašumu pārdošana";
      }
    })(),
    rentalService: (() => {
      try {
        return t('rentalService');
      } catch {
        return "Noma un izīrēšana";
      }
    })(),
    consultationService: (() => {
      try {
        return t('consultationService');
      } catch {
        return "Konsultācijas";
      }
    })(),
    evaluationService: (() => {
      try {
        return t('evaluationService');
      } catch {
        return "Vērtējumi";
      }
    })(),
    copyrightText: (() => {
      try {
        return t('copyrightText');
      } catch {
        return footerData?.copyrightText || "© 2024 Vestate. Visas tiesības aizsargātas.";
      }
    })(),
    developmentText: (() => {
      try {
        return t('developmentText');
      } catch {
        return " Izstrāde: ";
      }
    })(),
    defaultDeveloperName: (() => {
      try {
        return t('defaultDeveloperName');
      } catch {
        return "Izstrādātājs";
      }
    })(),
  };

  return (
    <FooterSection 
      data={footerData}
      translations={footerTranslations} 
    />
  )
}