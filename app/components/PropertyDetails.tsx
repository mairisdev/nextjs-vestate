import { Asterisk, Bed, BedDouble, Calendar, ChevronsUpDown, Dock, Home, MapPin, Ruler, TrendingUp } from "lucide-react"
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('PropertyDetails')

  const details = [
    {
      icon: BedDouble,
      label: t('roomsLabel'),
      value: property.rooms ? t('roomsValue', { count: property.rooms }) : t('notSpecified')
    },
    {
      icon: Ruler,
      label: t('areaLabel'),
      value: property.area ? t('areaValue', { area: property.area }) : t('notSpecified')
    },
    {
      icon: TrendingUp,
      label: t('floorLabel'),
      value: property.floor && property.totalFloors 
        ? t('floorValue', { floor: property.floor, total: property.totalFloors })
        : property.floor 
        ? t('floorValueSingle', { floor: property.floor })
        : t('notSpecified')
    },
    {
      icon: Home,
      label: t('seriesLabel'),
      value: property.series || t('notSpecified')
    },
    {
      icon: ChevronsUpDown,
      label: t('elevatorLabel'),
      value: property.hasElevator ? t('elevatorYes') : t('elevatorNo')
    },
    {
      icon: Asterisk,
      label: t('amenitiesLabel'),
      value: property.amenities && property.amenities.length > 0 
        ? property.amenities.join(", ") 
        : t('notSpecified')
    },    
    {
      icon: MapPin,
      label: t('locationLabel'),
      value: `${property.address}, ${property.city}${property.district ? `, ${property.district}` : ''}`
    },
    {
      icon: Calendar,
      label: t('createdLabel'),
      value: new Date(property.createdAt).toLocaleDateString('lv-LV')
    },
    ...(property.propertyProject ? [{
      icon: Dock,
      label: t('projectLabel'),
      value: property.propertyProject
    }] : [])
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold text-[#00332D] mb-6">
        {t('title')}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {details.map((detail, index) => {
          const IconComponent = detail.icon
          return (
            <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-[#00332D] rounded-lg flex items-center justify-center mr-4">
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{detail.label}</p>
                <p className="font-semibold text-gray-900">{detail.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {property.description && (
        <div>
          <h3 className="text-lg font-semibold text-[#00332D] mb-4">
            {t('descriptionTitle')}
          </h3>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {property.description}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}