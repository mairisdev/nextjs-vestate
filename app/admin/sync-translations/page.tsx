"use client"

import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react"

interface SyncResult {
  success: boolean
  message: string
  category: string
}

export default function SyncTranslationsPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [results, setResults] = useState<SyncResult[]>([])

  const syncCategories = [
    {
      key: 'property-filters',
      name: 'PropertyFilters',
      description: 'Īpašumu filtru tulkojumi',
      endpoint: '/api/admin/sync-property-filters-translations'
    },
    {
      key: 'property-categories', 
      name: 'PropertyCategories',
      description: 'Īpašumu kategoriju tulkojumi',
      endpoint: '/api/admin/sync-categories-translations'
    },
    // Pievienot vairāk kategorijas, kad tās būs gatavs
  ]

  const syncCategory = async (category: typeof syncCategories[0]) => {
    setLoading(category.key)
    
    try {
      const response = await fetch(category.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      const result: SyncResult = {
        success: data.success,
        message: data.message || (data.success ? 'Sinhronizācija pabeigta' : 'Sinhronizācija neizdevās'),
        category: category.name
      }
      
      setResults(prev => [result, ...prev.filter(r => r.category !== category.name)])
      
    } catch (error) {
      const result: SyncResult = {
        success: false,
        message: `Kļūda: ${error instanceof Error ? error.message : 'Nezināma kļūda'}`,
        category: category.name
      }
      
      setResults(prev => [result, ...prev.filter(r => r.category !== category.name)])
    } finally {
      setLoading(null)
    }
  }

  const syncAllCategories = async () => {
    for (const category of syncCategories) {
      await syncCategory(category)
      // Mazs delay starp sync operācijām
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-10">
      <div>
        <h1 className="text-3xl font-bold">Tulkojumu Sinhronizācija</h1>
        <p className="text-gray-600 mt-2">
          Sinhronizē tulkojumus ar datubāzi. Šis process izveido trūkstošās tulkojumu atslēgas.
        </p>
      </div>

      {/* Sync All poga */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Sinhronizēt visu
          </CardTitle>
          <CardDescription>
            Sinhronizē visas pieejamās kategorijas vienā reizē
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={syncAllCategories}
            disabled={loading !== null}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sinhronizē...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sinhronizēt visas kategorijas
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Individuālās kategorijas */}
      <div className="grid gap-4">
        {syncCategories.map((category) => (
          <Card key={category.key}>
            <CardHeader>
              <CardTitle className="text-lg">{category.name}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {results.find(r => r.category === category.name) && (
                    <div className={`flex items-center gap-2 text-sm ${
                      results.find(r => r.category === category.name)?.success 
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {results.find(r => r.category === category.name)?.success ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      {results.find(r => r.category === category.name)?.message}
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={() => syncCategory(category)}
                  disabled={loading === category.key}
                  variant="outline"
                >
                  {loading === category.key ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sinhronizē...
                    </>
                  ) : (
                    'Sinhronizēt'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rezultātu vēsture */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sinhronizācijas vēsture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div 
                  key={index}
                  className={`flex items-center gap-2 p-2 rounded text-sm ${
                    result.success 
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {result.success ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="font-medium">{result.category}:</span>
                  <span>{result.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}