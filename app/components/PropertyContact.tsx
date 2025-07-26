'use client';

import { Phone, Mail, MessageSquare, User } from "lucide-react"

interface Agent {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
}

interface PropertyContactProps {
  agent: Agent | null;
  propertyId: string;
  propertyTitle: string;
  propertyPrice: number;
}

export default function PropertyContact({ 
  agent, 
  propertyId, 
  propertyTitle, 
  propertyPrice 
}: PropertyContactProps) {
  const formatPrice = (price: number) => {
    return `€${(price / 100).toLocaleString('lv-LV')}`
  }

  const phoneNumber = agent?.phone || "+37128446677"
  const agentEmail = agent?.email || "info@vestate.lv"
  const agentName = agent ? `${agent.firstName || ''} ${agent.lastName || ''}`.trim() : 'Vestate'

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm sticky top-8">
      <h3 className="text-lg font-semibold mb-4">Sazināties</h3>
      
      <div className="space-y-4">
        <div className="text-center p-4 bg-gray-100 rounded-lg">
          <div className="text-2xl font-bold text-[#00332D] mb-1">
            {formatPrice(propertyPrice)}
          </div>
          <div className="text-sm text-gray-600">Cena</div>
        </div>

        {agent && (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-[#00332D] rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {agentName || 'Nekustamā īpašuma aģents'}
              </p>
              <p className="text-sm text-gray-600">Nekustamā īpašuma aģents</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <a
            href={`tel:${phoneNumber}`}
            className="flex items-center justify-center space-x-2 w-full bg-[#00332D] text-white py-3 px-4 rounded-lg hover:bg-[#004940] transition-colors"
          >
            <Phone className="w-5 h-5" />
            <span>{phoneNumber.replace("+371", "")}</span>
          </a>

          <a
            href={`mailto:${agentEmail}?subject=Interese par īpašumu: ${propertyTitle}`}
            className="flex items-center justify-center space-x-2 w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span>Sūtīt e-pastu</span>
          </a>

          <a
            href={`https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=Sveiki! Interesē īpašums: ${propertyTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            <span>WhatsApp</span>
          </a>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Īpašuma ID: {propertyId}
          </p>
        </div>
      </div>
    </div>
  )
}