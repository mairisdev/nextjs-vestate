import { Home, Ruler, Building, MapPin, Calendar, Dock } from "lucide-react"

interface Property {
  id: string
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
  videoUrl?: string

}

interface PropertyDetailsProps {
  property: Property
}

export default function PropertyDetails({ property }: PropertyDetailsProps) {
  const details = [
    {
      icon: Home,
      label: "Istabu skaits",
      value: property.rooms ? `${property.rooms} istabas` : "Nav norādīts"
    },
    {
      icon: Ruler,
      label: "Platība",
      value: property.area ? `${property.area} m²` : "Nav norādīta"
    },
    {
      icon: Building,
      label: "Stāvs",
      value: property.floor && property.totalFloors 
        ? `${property.floor}/${property.totalFloors}` 
        : property.floor 
        ? `${property.floor}. stāvs`
        : "Nav norādīts"
    },
    {
      icon: MapPin,
      label: "Atrašanās vieta",
      value: `${property.address}, ${property.city}${property.district ? `, ${property.district}` : ''}`
    },
    {
      icon: Calendar,
      label: "Publicēts",
      value: new Date(property.createdAt).toLocaleDateString('lv-LV')
    }
  ]

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Īpašuma detaļas</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {details.map((detail, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="p-2">
              <detail.icon className="w-6 h-6 text-[#00332D]" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">{detail.label}</p>
              <p className="text-gray-900">{detail.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center space-x-3">
          <div className="p-2">
            <Dock className="w-6 h-6 text-[#00332D]" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Kategorija</p>
            <p className="text-gray-900">{property.category.name}</p>
          </div>
        </div>
      </div>

      {property.videoUrl && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-semibold mb-4">Īpašuma video</h3>
          <div className="aspect-video w-full rounded-lg overflow-hidden">
            <iframe
              src={property.videoUrl}
              title="Īpašuma video"
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

    </div>
  )
}
