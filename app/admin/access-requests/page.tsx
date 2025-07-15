"use client"

import { useEffect, useState } from "react"
import { Input } from "../../components/ui/input"
import { Search, Mail, Phone, Calendar, CheckCircle, XCircle, Eye } from "lucide-react"
import AlertMessage from "../../components/ui/alert-message"

interface AccessRequest {
  id: string
  email: string
  phone: string
  code: string
  verified: boolean
  validUntil: string | null
  createdAt: string
  property?: {
    id: string
    title: string
  } | null
}

export default function AccessRequestsAdmin() {
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      const res = await fetch("/api/admin/access-requests")
      const data = await res.json()
      setRequests(data)
    } catch (error) {
      setErrorMessage("Neizdevās ielādēt pieprasījumus")
    } finally {
      setLoading(false)
    }
  }

  const deleteRequest = async (id: string) => {
    if (!confirm("Vai tiešām dzēst šo pieprasījumu?")) return

    try {
      const res = await fetch(`/api/admin/access-requests/${id}`, {
        method: "DELETE"
      })

      if (res.ok) {
        setSuccessMessage("Pieprasījums dzēsts!")
        loadRequests()
      } else {
        setErrorMessage("Kļūda dzēšot pieprasījumu")
      }
    } catch (error) {
      setErrorMessage("Kļūda dzēšot pieprasījumu")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('lv-LV', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isExpired = (validUntil: string | null) => {
    if (!validUntil) return false
    return new Date(validUntil) < new Date()
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.phone.includes(searchTerm) ||
      (request.property?.title && request.property.title.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = 
      filterStatus === "all" || 
      (filterStatus === "verified" && request.verified) ||
      (filterStatus === "pending" && !request.verified) ||
      (filterStatus === "expired" && request.verified && request.validUntil && isExpired(request.validUntil))
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return <div className="flex justify-center items-center h-64">Ielādē...</div>
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-10">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Privāto sludinājumu pieprasījumi</h2>
        <div className="text-sm text-gray-600">
          Kopā: {requests.length} pieprasījumi
        </div>
      </div>

      {successMessage && <AlertMessage type="success" message={successMessage} />}
      {errorMessage && <AlertMessage type="error" message={errorMessage} />}

      {/* Filtri */}
      <div className="flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Meklēt pēc e-pasta, tālruņa vai īpašuma..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Visi pieprasījumi</option>
          <option value="verified">Apstiprināti</option>
          <option value="pending">Gaida apstiprinājumu</option>
          <option value="expired">Beidzies termiņš</option>
        </select>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {requests.filter(r => !r.verified).length}
          </div>
          <div className="text-sm text-blue-600">Gaida apstiprinājumu</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {requests.filter(r => r.verified && !isExpired(r.validUntil)).length}
          </div>
          <div className="text-sm text-green-600">Aktīvi</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {requests.filter(r => r.verified && isExpired(r.validUntil)).length}
          </div>
          <div className="text-sm text-red-600">Beidzies termiņš</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">
            {new Set(requests.map(r => r.email)).size}
          </div>
          <div className="text-sm text-gray-600">Unikāli lietotāji</div>
        </div>
      </div>

      {/* Tabula */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kontakti
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Īpašums
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datums
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Derīgs līdz
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Darbības
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <a 
                          href={`mailto:${request.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {request.email}
                        </a>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <a 
                          href={`tel:${request.phone}`}
                          className="hover:underline"
                        >
                          {request.phone}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {request.property ? (
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {request.property.title}
                        </div>
                        <div className="text-gray-500">
                          ID: {request.property.id}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Vispārējs</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {request.verified ? (
                        <>
                          {isExpired(request.validUntil) ? (
                            <>
                              <XCircle className="w-5 h-5 text-red-500 mr-2" />
                              <span className="text-red-600 text-sm font-medium">Beidzies</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                              <span className="text-green-600 text-sm font-medium">Aktīvs</span>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="w-5 h-5 bg-yellow-200 rounded-full mr-2"></div>
                          <span className="text-yellow-600 text-sm font-medium">Gaida</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {formatDate(request.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {request.validUntil ? (
                      <div className={isExpired(request.validUntil) ? "text-red-600" : ""}>
                        {formatDate(request.validUntil)}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {request.property && (
                      <a
                        href={`/admin/properties/${request.property.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Skatīt īpašumu
                      </a>
                    )}
                    <button
                      onClick={() => deleteRequest(request.id)}
                      className="text-red-600 hover:text-red-900 ml-4"
                    >
                      Dzēst
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">Nav atrasti pieprasījumi</div>
          </div>
        )}
      </div>
    </div>
  )
}