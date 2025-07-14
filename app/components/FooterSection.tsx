import Link from "next/link"
import {
  Facebook,
  Instagram,
  Linkedin,
  Phone,
  Mail,
  MapPin,
} from "lucide-react"

interface FooterData {
  id: string
  companyName: string
  description: string
  phone: string
  email: string
  address: string
  facebookUrl: string
  instagramUrl: string
  linkedinUrl: string
  copyrightText: string
  developerName: string
  developerUrl: string
}

interface FooterSectionProps {
  data: FooterData | null
  translations: {
    defaultCompanyName: string
    defaultDescription: string
    sitemapTitle: string
    servicesTitle: string
    contactTitle: string
    homeLink: string
    aboutLink: string
    propertiesLink: string
    contactLink: string
    salesService: string
    rentalService: string
    consultationService: string
    evaluationService: string
    developmentText: string
    [key: string]: string
  }
}

export default function FooterSection({ data, translations }: FooterSectionProps) {
  if (!data && !translations.defaultCompanyName) return null

  const companyName = translations.defaultCompanyName || data?.companyName || ""
  const description = translations.defaultDescription || data?.description || ""

  return (
    <footer className="bg-[#00332D] text-white pt-16 pb-8 px-4 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h2 className="text-2xl font-bold mb-4">{companyName}</h2>
          <p className="text-sm text-gray-300">{description}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-4 text-white">{translations.sitemapTitle}</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link href="/">{translations.homeLink}</Link></li>
            <li><Link href="pakalpojumi">{translations.aboutLink}</Link></li>
            <li><Link href="/ipasumu-kategorijas">{translations.propertiesLink}</Link></li>
            <li><Link href="kontakti">{translations.contactLink}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4 text-white">{translations.servicesTitle}</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>{translations.salesService}</li>
            <li>{translations.rentalService}</li>
            <li>{translations.consultationService}</li>
            <li>{translations.evaluationService}</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4 text-white">{translations.contactTitle}</h3>
          <ul className="space-y-3 text-sm text-gray-300">
            {data?.phone && (
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> {data.phone}
              </li>
            )}
            {data?.email && (
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> {data.email}
              </li>
            )}
            {data?.address && (
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1" /> {data.address}
              </li>
            )}
          </ul>

          <div className="flex gap-4 mt-6">
            {data?.facebookUrl && (
              <a href={data.facebookUrl} target="_blank" className="hover:text-[#77D4B4]">
                <Facebook className="w-5 h-5" />
              </a>
            )}
            {data?.instagramUrl && (
              <a href={data.instagramUrl} target="_blank" className="hover:text-[#77D4B4]">
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {data?.linkedinUrl && (
              <a href={data.linkedinUrl} target="_blank" className="hover:text-[#77D4B4]">
                <Linkedin className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 mt-12 pt-6 text-sm text-gray-400 text-center">
        {translations.copyrightText || data?.copyrightText}
        {translations.developmentText}
        <a
          href={data?.developerUrl || "#"}
          target="_blank"
          className="text-[#77D4B4] hover:underline"
        >
          {data?.developerName || translations.defaultDeveloperName || "Izstrādātājs"}
        </a>
      </div>
    </footer>
  )
}
