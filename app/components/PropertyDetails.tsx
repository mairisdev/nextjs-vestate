import { Asterisk, Bed, BedDouble, Calendar, ChevronsUpDown, Dock, Home, MapPin, Ruler, TrendingUp } from "lucide-react"

interface Property {
  id: string
  title: string
  description: string
  rooms: number | null
  area: number | null
  floor: number | null
  totalFloors: number | null
  address: string
  city: string
  district: string | null
  status: string
  createdAt: Date
  category: {
    name: string
  }
  videoUrl?: string | null
  series?: string | null
  hasElevator?: boolean | null
  amenities?: string[] | null
  propertyProject?: string | null
}

interface PropertyDetailsProps {
  property: Property
}

export default function PropertyDetails({ property }: PropertyDetailsProps) {
  const details = [
    {
      icon: BedDouble,
      label: "Istabu skaits",
      value: property.rooms ? `${property.rooms} istabas` : "Nav norādīts"
    },
    {
      icon: Ruler,
      label: "Platība",
      value: property.area ? `${property.area} m²` : "Nav norādīta"
    },
    {
      icon: TrendingUp,
      label: "Stāvs",
      value: property.floor && property.totalFloors 
        ? `${property.floor}/${property.totalFloors}` 
        : property.floor 
        ? `${property.floor}. stāvs`
        : "Nav norādīts"
    },
    {
      icon: Home,
      label: "Sērija",
      value: property.series || "Nav norādīta"
    },
    {
      icon: ChevronsUpDown,
      label: "Lifts",
      value: property.hasElevator ? "Ir" : "Nav"
    },
    {
      icon: Asterisk,
      label: "Ērtības",
      value: property.amenities && property.amenities.length > 0 
        ? property.amenities.join(", ") 
        : "Nav norādītas"
    },    
    {
      icon: MapPin,
      label: "Atrašanās vieta",
      value: `${property.address}, ${property.city}${property.district ? `, ${property.district}` : ''}`
    },
    {
      icon: Calendar,
      label: "Pievienots",
      value: new Date(property.createdAt).toLocaleDateString('lv-LV')
    }
  ]

  return (
    <div className="space-y-8">
      {/* Īpašuma detaļas */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Īpašuma detaļas</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {details.map((detail, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-[#77dDB4]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <detail.icon className="w-5 h-5 text-[#00332D]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">{detail.label}</p>
                <p className="text-sm text-gray-600 break-words">{detail.value}</p>
              </div>
            </div>
          ))}
        </div>

        {property.propertyProject && (
          <div className="mt-6 p-3 bg-[#77dDB4]/10 rounded-lg">
            <p className="text-sm font-medium text-[#00332D]">
              Projekts: {property.propertyProject}
            </p>
          </div>
        )}
      </div>

      {/* Apraksts */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Apraksts</h2>
        <div className="prose max-w-none text-gray-700">
          {property.description.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-3">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Video sekcija */}
      {property.videoUrl && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Video apskats</h2>
          <div className="aspect-video rounded-lg overflow-hidden">
            <iframe
              src={property.videoUrl}
              className="w-full h-full"
              allowFullScreen
              title="Īpašuma video"
            />
          </div>
        </div>
      )}
    </div>
  )
}