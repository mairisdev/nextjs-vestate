import Link from "next/link"
import {
  Facebook,
  Instagram,
  Linkedin,
  Phone,
  Mail,
  MapPin,
} from "lucide-react"
import { getFooterSettings } from "@/lib/queries/footer"

export default async function FooterSection() {
  const data = await getFooterSettings()

  if (!data || !data.companyName) return null

  return (
    <footer className="bg-[#00332D] text-white pt-16 pb-8 px-4 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h2 className="text-2xl font-bold mb-4">{data.companyName}</h2>
          <p className="text-sm text-gray-300">{data.description}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-4 text-white">Lapas karte</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link href="/">Sākums</Link></li>
            <li><Link href="/par-mums">Par mums</Link></li>
            <li><Link href="/ipasumi">Īpašumi</Link></li>
            <li><Link href="/kontakti">Kontakti</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4 text-white">Pakalpojumi</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>Īpašumu pārdošana</li>
            <li>Noma un izīrēšana</li>
            <li>Konsultācijas</li>
            <li>Vērtējumi</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4 text-white">Kontaktinformācija</h3>
          <ul className="space-y-3 text-sm text-gray-300">
            {data.phone && (
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> {data.phone}
              </li>
            )}
            {data.email && (
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> {data.email}
              </li>
            )}
            {data.address && (
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1" /> {data.address}
              </li>
            )}
          </ul>

          <div className="flex gap-4 mt-6">
            {data.facebookUrl && (
              <a href={data.facebookUrl} target="_blank" className="hover:text-[#77D4B4]">
                <Facebook className="w-5 h-5" />
              </a>
            )}
            {data.instagramUrl && (
              <a href={data.instagramUrl} target="_blank" className="hover:text-[#77D4B4]">
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {data.linkedinUrl && (
              <a href={data.linkedinUrl} target="_blank" className="hover:text-[#77D4B4]">
                <Linkedin className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 mt-12 pt-6 text-sm text-gray-400 text-center">
        {data?.copyrightText}
        {" Izstrāde: "}
        <a
          href={data.developerUrl || "#"}
          target="_blank"
          className="text-[#77D4B4] hover:underline"
        >
          {data.developerName || "Izstrādātājs"}
        </a>
      </div>
    </footer>
  )
}
