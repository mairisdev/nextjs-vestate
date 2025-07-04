import { Phone, Mail, MessageSquare } from "lucide-react"

interface Property {
  id: string
  title: string
  price: number
  currency: string
}

interface PropertyContactProps {
  property: Property
}

export default function PropertyContact({ property }: PropertyContactProps) {
  const formatPrice = (price: number, currency: string) => {
    return `${(price / 100).toLocaleString()} ${currency}`
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm sticky top-8">
      <h3 className="text-lg font-semibold mb-4">Sazināties</h3>
      
      <div className="space-y-4">
        <div className="text-center p-4 bg-gray-100 rounded-lg">
          <div className="text-2xl font-bold text-[#00332D] mb-1">
            {formatPrice(property.price, property.currency)}
          </div>
          <div className="text-sm text-gray-600">Cena</div>
        </div>

        <div className="space-y-3">
          <a
            href="tel:+37128446677"
            className="flex items-center justify-center space-x-2 w-full bg-[#00332D] text-white py-3 px-4 rounded-lg hover:bg-[#004940] transition-colors"
          >
            <Phone className="w-5 h-5" />
            <span>28 44 66 77</span>
          </a>

          <a
            href="mailto:info@vestate.lv?subject=Interese par īpašumu&body=Sveiki! Man ir interese par īpašumu: "
            className="flex items-center justify-center space-x-2 w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span>Sūtīt e-pastu</span>
          </a>

          <button className="flex items-center justify-center space-x-2 w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">
            <MessageSquare className="w-5 h-5" />
            <span>WhatsApp</span>
          </button>
        </div>

        <div className="pt-4 border-t text-center">
          <p className="text-sm text-gray-600 mb-2">Vai vēlaties saņemt līdzīgus piedāvājumus?</p>
          <button className="text-[#00332D] text-sm font-medium hover:underline">
            Abonēt jaunumus
          </button>
        </div>
      </div>
    </div>
  )
}
