"use client"

import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { CheckCircle, AlertCircle, Loader2, RefreshCw, Copy, Globe, ArrowRight } from "lucide-react"

interface SyncResult {
  success: boolean
  message: string
  category: string
  details?: {
    created?: number
    updated?: number
    skipped?: number
    total?: number
  }
}

interface BulkSyncResult {
  success: boolean
  message: string
  sourceLocale: string
  targetLocales: string[]
  details: {
    totalKeys: number
    copied: number
    skipped: number
    failed: number
    categories: string[]
  }
}

export default function SyncTranslationsPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [results, setResults] = useState<SyncResult[]>([])
  const [bulkSyncResult, setBulkSyncResult] = useState<BulkSyncResult | null>(null)
  const [bulkSyncLoading, setBulkSyncLoading] = useState(false)

  const locales = [
    { code: 'lv', name: 'Latviešu', flag: '🇱🇻' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' }
  ]

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
        category: category.name,
        details: data.details
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
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  // JAUNA FUNKCIJA: Bulk tulkojumu sinhronizācija
  const performBulkSync = async (sourceLocale: string, targetLocales: string[]) => {
    setBulkSyncLoading(true)
    setBulkSyncResult(null)

    try {
      const response = await fetch('/api/admin/bulk-sync-translations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sourceLocale,
          targetLocales
        })
      })

      const data = await response.json()

      setBulkSyncResult({
        success: data.success,
        message: data.message,
        sourceLocale,
        targetLocales,
        details: data.details || {
          totalKeys: 0,
          copied: 0,
          skipped: 0,
          failed: 0,
          categories: []
        }
      })

    } catch (error) {
      setBulkSyncResult({
        success: false,
        message: `Kļūda: ${error instanceof Error ? error.message : 'Nezināma kļūda'}`,
        sourceLocale,
        targetLocales,
        details: {
          totalKeys: 0,
          copied: 0,
          skipped: 0,
          failed: 0,
          categories: []
        }
      })
    } finally {
      setBulkSyncLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-10">
      <div>
        <h1 className="text-3xl font-bold">Tulkojumu Sinhronizācija</h1>
        <p className="text-gray-600 mt-2">
          Sinhronizē tulkojumus ar datubāzi un kopē tulkojumus starp valodām.
        </p>
      </div>

      {/* JAUNA SEKCIJA: Bulk tulkojumu sinhronizācija */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Copy className="w-5 h-5" />
            Automātiskā tulkojumu sinhronizācija
          </CardTitle>
          <CardDescription className="text-blue-700">
            Kopē visus tulkojumus no vienas valodas uz citām valodām. Ideāli, lai aizpildītu tukšos tulkojumus.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bulk sync options */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* LV → EN, RU */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🇱🇻</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span className="text-lg">🇬🇧🇷🇺</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Kopē visus LV tulkojumus uz EN un RU valodām
              </p>
              <Button
                onClick={() => performBulkSync('lv', ['en', 'ru'])}
                disabled={bulkSyncLoading}
                className="w-full bg-green-600 hover:bg-green-700"
                size="sm"
              >
                LV → EN + RU
              </Button>
            </div>

            {/* EN → LV, RU */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🇬🇧</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span className="text-lg">🇱🇻🇷🇺</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Kopē visus EN tulkojumus uz LV un RU valodām
              </p>
              <Button
                onClick={() => performBulkSync('en', ['lv', 'ru'])}
                disabled={bulkSyncLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                EN → LV + RU
              </Button>
            </div>

            {/* RU → LV, EN */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🇷🇺</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span className="text-lg">🇱🇻🇬🇧</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Kopē visus RU tulkojumus uz LV un EN valodām
              </p>
              <Button
                onClick={() => performBulkSync('ru', ['lv', 'en'])}
                disabled={bulkSyncLoading}
                className="w-full bg-red-600 hover:bg-red-700"
                size="sm"
              >
                RU → LV + EN
              </Button>
            </div>
          </div>

          {/* Loading state */}
          {bulkSyncLoading && (
            <div className="bg-white p-6 rounded-lg border border-yellow-200 bg-yellow-50">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Notiek bulk sinhronizācija...</p>
                  <p className="text-sm text-yellow-700">Šis process var aizņemt dažas minūtes</p>
                </div>
              </div>
            </div>
          )}

          {/* Bulk sync results */}
          {bulkSyncResult && (
            <div className={`p-6 rounded-lg border ${
              bulkSyncResult.success 
                ? 'border-green-200 bg-green-50' 
                : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-start gap-3">
                {bulkSyncResult.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className={`font-semibold ${
                    bulkSyncResult.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    Bulk sinhronizācijas rezultāts
                  </h3>
                  <p className={`text-sm mt-1 ${
                    bulkSyncResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {bulkSyncResult.message}
                  </p>

                  {/* Detailed stats */}
                  {bulkSyncResult.details && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-white rounded border">
                        <div className="text-2xl font-bold text-blue-600">
                          {bulkSyncResult.details.totalKeys}
                        </div>
                        <div className="text-xs text-gray-600">Kopā atslēgas</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded border">
                        <div className="text-2xl font-bold text-green-600">
                          {bulkSyncResult.details.copied}
                        </div>
                        <div className="text-xs text-gray-600">Nokopēti</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded border">
                        <div className="text-2xl font-bold text-yellow-600">
                          {bulkSyncResult.details.skipped}
                        </div>
                        <div className="text-xs text-gray-600">Izlaisti</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded border">
                        <div className="text-2xl font-bold text-red-600">
                          {bulkSyncResult.details.failed}
                        </div>
                        <div className="text-xs text-gray-600">Neizdevās</div>
                      </div>
                    </div>
                  )}

                  {/* Categories */}
                  {bulkSyncResult.details?.categories && bulkSyncResult.details.categories.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-600 mb-2">Skartas kategorijas:</p>
                      <div className="flex flex-wrap gap-1">
                        {bulkSyncResult.details.categories.map((cat, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-white rounded border">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-900">Svarīgi!</h4>
                <p className="text-sm text-amber-800 mt-1">
                  Bulk sinhronizācija kopēs tulkojumus tikai uz tukšajām atslēgām. 
                  Esošie tulkojumi netiks pārrakstīti. Ja vēlaties pārrakstīt esošos tulkojumus, 
                  izmantojiet individuālo tulkojumu pārvaldību.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync All poga */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Sinhronizēt kategoriālos tulkojumus
          </CardTitle>
          <CardDescription>
            Sinhronizē visas pieejamās kategorijas vienā reizē (izveido trūkstošās atslēgas)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={syncAllCategories}
            disabled={loading !== null}
            className="w-full"
            variant="outline"
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
        <h2 className="text-xl font-semibold">Individuālā kategoriju sinhronizācija</h2>
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
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sinhronizēt
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}