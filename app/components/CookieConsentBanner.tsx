'use client'

import { useState, useEffect } from 'react'
import { X, Settings, Shield, Eye, BarChart3, MessageSquare } from 'lucide-react'

interface CookieConsent {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  preferences: boolean
}

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showFloatingButton, setShowFloatingButton] = useState(false)
  const [consent, setConsent] = useState<CookieConsent>({
    necessary: true, // Vienmēr true, nevar mainīt
    analytics: false,
    marketing: false,
    preferences: false
  })

  useEffect(() => {
    // Pārbaudam, vai jau ir dots piekrišana
    const savedConsent = localStorage.getItem('cookie-consent')
    if (!savedConsent) {
      setShowBanner(true)
    } else {
      setShowFloatingButton(true)
    }
  }, [])

  const saveConsent = (consentData: CookieConsent) => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      ...consentData,
      timestamp: new Date().toISOString()
    }))
    setShowBanner(false)
    setShowSettings(false)
    setShowFloatingButton(true)
    
    // Šeit var pievienot loģiku cookie iestatīšanai
    console.log('Consent saved:', consentData)
  }

  const acceptAll = () => {
    const fullConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    }
    setConsent(fullConsent)
    saveConsent(fullConsent)
  }

  const rejectAll = () => {
    const minimalConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    }
    setConsent(minimalConsent)
    saveConsent(minimalConsent)
  }

  const saveCustom = () => {
    saveConsent(consent)
  }

  const openSettings = () => {
    const savedConsent = localStorage.getItem('cookie-consent')
    if (savedConsent) {
      const parsed = JSON.parse(savedConsent)
      setConsent({
        necessary: true,
        analytics: parsed.analytics || false,
        marketing: parsed.marketing || false,
        preferences: parsed.preferences || false
      })
    }
    setShowBanner(true)
    setShowSettings(true)
  }

  if (!showBanner && !showFloatingButton) return null

  return (
    <>
      {showFloatingButton && !showBanner ? (
        <button
          onClick={openSettings}
          className="fixed bottom-6 right-6 z-50 group"
          title="Sīkdatņu iestatījumi"
          >
          <div className="relative">
            {/* Glow efekts */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#77dDB4] to-[#00332D] rounded-full blur-lg opacity-25 group-hover:opacity-40 transition-opacity duration-300 scale-110"></div>
            
            {/* Galvenā poga */}
            <div className="relative w-14 h-14 bg-gradient-to-r from-[#77dDB4] to-[#00332D] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <Shield className="w-7 h-7 text-white" />
            </div>
            
            {/* Pulse animācija */}
            <div className="absolute inset-0 rounded-full border-2 border-[#77dDB4] opacity-0 group-hover:opacity-100 animate-ping"></div>
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-gray-900 text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap">
              Sīkdatņu iestatījumi
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </button>
      ) : null}

      {showBanner && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />}
      
      {showBanner && (
        <>
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            
            {!showSettings ? (
              // Galvenais banner
              <div className="p-6 sm:p-8">
                <div className="flex items-start gap-6">
                  {/* Ikona */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#77dDB4] to-[#00332D] rounded-full flex items-center justify-center shadow-lg">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  {/* Saturs */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold text-[#00332D] mb-3">
                      Mēs respektējam jūsu privātumu
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Mēs izmantojam sīkdatnes, lai uzlabotu jūsu pārlūkošanas pieredzi, analizētu trafiku un personalizētu saturu. 
                      Jūs varat izvēlēties, kuras sīkdatnes pieņemt.
                    </p>
                    
                    {/* Pogas */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={acceptAll}
                        className="px-6 py-3 bg-gradient-to-r from-[#00332D] to-[#00443B] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-transparent hover:border-[#77dDB4]"
                      >
                        Pieņemt visas
                      </button>
                      
                      <button
                        onClick={rejectAll}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 border-2 border-gray-300 hover:border-gray-400"
                      >
                        Noraidīt visas
                      </button>
                      
                      <button
                        onClick={() => setShowSettings(true)}
                        className="px-6 py-3 bg-white text-[#00332D] rounded-xl font-semibold border-2 border-[#77dDB4] hover:bg-[#77dDB4]/10 transition-all duration-200 flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Pielāgot
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Iestatījumu panelis
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-[#00332D]">
                    Sīkdatņu iestatījumi
                  </h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                <div className="space-y-6 mb-8">
                  {/* Nepieciešamās sīkdatnes */}
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <Shield className="w-6 h-6 text-[#00332D] mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-[#00332D]">Nepieciešamās sīkdatnes</h4>
                        <div className="px-3 py-1 bg-[#00332D] text-white text-sm rounded-full">
                          Obligāti
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Šīs sīkdatnes ir nepieciešamas vietnes darbībai un nevar tikt atslēgtas.
                      </p>
                    </div>
                  </div>
                  
                  {/* Analītikas sīkdatnes */}
                  <div className="flex items-start gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[#77dDB4]/50 transition-colors">
                    <BarChart3 className="w-6 h-6 text-[#77dDB4] mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-[#00332D]">Analītikas sīkdatnes</h4>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={consent.analytics}
                            onChange={(e) => setConsent({...consent, analytics: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#77dDB4]"></div>
                        </label>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Palīdz mums saprast, kā apmeklētāji izmanto vietni, lai to uzlabotu.
                      </p>
                    </div>
                  </div>
                  
                  {/* Mārketinga sīkdatnes */}
                  <div className="flex items-start gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[#77dDB4]/50 transition-colors">
                    <Eye className="w-6 h-6 text-[#77dDB4] mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-[#00332D]">Mārketinga sīkdatnes</h4>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={consent.marketing}
                            onChange={(e) => setConsent({...consent, marketing: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#77dDB4]"></div>
                        </label>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Ļauj rādīt personalizētas reklāmas un piedāvājumus.
                      </p>
                    </div>
                  </div>
                  
                  {/* Preferences sīkdatnes */}
                  <div className="flex items-start gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[#77dDB4]/50 transition-colors">
                    <MessageSquare className="w-6 h-6 text-[#77dDB4] mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-[#00332D]">Preferences sīkdatnes</h4>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={consent.preferences}
                            onChange={(e) => setConsent({...consent, preferences: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#77dDB4]"></div>
                        </label>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Atceras jūsu izvēles un personalizē pieredzi.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Pogas */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
                  >
                    Atcelt
                  </button>
                  <button
                    onClick={saveCustom}
                    className="px-6 py-3 bg-gradient-to-r from-[#00332D] to-[#00443B] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-transparent hover:border-[#77dDB4]"
                  >
                    Saglabāt izvēli
                  </button>
                </div>
                
                {/* Papildu informācija */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500 text-center">
                    Vairāk informācijas par sīkdatņu izmantošanu mūsu{' '}
                    <a href="/privatuma-politika" className="text-[#77dDB4] hover:underline">
                      privātuma politikā
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
        </>
      )}
</>
  )}