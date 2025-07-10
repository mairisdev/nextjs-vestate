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
          className="fixed bottom-4 right-4 z-50 group"
          title="Sīkdatņu iestatījumi"
          >
          <div className="relative">
            {/* Glow efekts */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#77dDB4] to-[#00332D] rounded-full blur-lg opacity-25 group-hover:opacity-40 transition-opacity duration-300 scale-110"></div>
            
            {/* Galvenā poga - mazāka mobilajām ierīcēm */}
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-[#77dDB4] to-[#00332D] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            
            {/* Pulse animācija */}
            <div className="absolute inset-0 rounded-full border-2 border-[#77dDB4] opacity-0 group-hover:opacity-100 animate-ping"></div>
          </div>
          
          {/* Tooltip - paslēpts mobilajās ierīcēs */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden sm:block">
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
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[85vh] overflow-y-auto">
            
            {!showSettings ? (
              // Galvenais banner
              <div className="p-4 sm:p-6 md:p-8">
                <div className="flex items-start gap-3 sm:gap-4 md:gap-6">
                  {/* Ikona - mazāka mobilajām ierīcēm */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#77dDB4] to-[#00332D] rounded-full flex items-center justify-center shadow-lg">
                      <Shield className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                    </div>
                  </div>
                  
                  {/* Saturs */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#00332D] mb-2 sm:mb-3 leading-tight">
                      Mēs respektējam jūsu privātumu
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                      Mēs izmantojam sīkdatnes, lai uzlabotu jūsu pārlūkošanas pieredzi, analizētu trafiku un personalizētu saturu. 
                      Jūs varat izvēlēties, kuras sīkdatnes pieņemt.
                    </p>
                    
                    {/* Pogas */}
                    <div className="flex flex-col gap-2 sm:gap-3">
                      <button
                        onClick={acceptAll}
                        className="w-full px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-[#00332D] to-[#00443B] text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-transparent hover:border-[#77dDB4] text-sm sm:text-base"
                      >
                        Pieņemt visas
                      </button>
                      
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button
                          onClick={rejectAll}
                          className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 bg-gray-100 text-gray-700 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 border-2 border-gray-300 hover:border-gray-400 text-sm sm:text-base"
                        >
                          Noraidīt visas
                        </button>
                        
                        <button
                          onClick={() => setShowSettings(true)}
                          className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 bg-white text-[#00332D] rounded-lg sm:rounded-xl font-semibold border-2 border-[#77dDB4] hover:bg-[#77dDB4]/10 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                          <Settings className="w-4 h-4" />
                          Pielāgot
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Iestatījumu panelis
              <div className="p-4 sm:p-6 md:p-8">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#00332D]">
                    Sīkdatņu iestatījumi
                  </h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                  {/* Nepieciešamās sīkdatnes */}
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#00332D] mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <h4 className="text-sm sm:text-base font-semibold text-[#00332D]">Nepieciešamās sīkdatnes</h4>
                        <div className="px-2 py-1 sm:px-3 sm:py-1 bg-[#00332D] text-white text-xs sm:text-sm rounded-full">
                          Obligāti
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Šīs sīkdatnes ir nepieciešamas vietnes darbībai un nevar tikt atslēgtas.
                      </p>
                    </div>
                  </div>
                  
                  {/* Analītikas sīkdatnes */}
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 border-gray-200 hover:border-[#77dDB4]/50 transition-colors">
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-[#77dDB4] mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <h4 className="text-sm sm:text-base font-semibold text-[#00332D]">Analītikas sīkdatnes</h4>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={consent.analytics}
                            onChange={(e) => setConsent({...consent, analytics: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-[#77dDB4]"></div>
                        </label>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Palīdz mums saprast, kā apmeklētāji izmanto vietni, lai to uzlabotu.
                      </p>
                    </div>
                  </div>
                  
                  {/* Mārketinga sīkdatnes */}
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 border-gray-200 hover:border-[#77dDB4]/50 transition-colors">
                    <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-[#77dDB4] mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <h4 className="text-sm sm:text-base font-semibold text-[#00332D]">Mārketinga sīkdatnes</h4>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={consent.marketing}
                            onChange={(e) => setConsent({...consent, marketing: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-[#77dDB4]"></div>
                        </label>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Ļauj rādīt personalizētas reklāmas un piedāvājumus.
                      </p>
                    </div>
                  </div>
                  
                  {/* Preferences sīkdatnes */}
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 border-gray-200 hover:border-[#77dDB4]/50 transition-colors">
                    <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-[#77dDB4] mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <h4 className="text-sm sm:text-base font-semibold text-[#00332D]">Preferences sīkdatnes</h4>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={consent.preferences}
                            onChange={(e) => setConsent({...consent, preferences: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-[#77dDB4]"></div>
                        </label>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Atceras jūsu izvēles un personalizē pieredzi.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Pogas */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-2.5 sm:px-6 sm:py-3 bg-gray-100 text-gray-700 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 text-sm sm:text-base"
                  >
                    Atcelt
                  </button>
                  <button
                    onClick={saveCustom}
                    className="px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-[#00332D] to-[#00443B] text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-transparent hover:border-[#77dDB4] text-sm sm:text-base"
                  >
                    Saglabāt izvēli
                  </button>
                </div>
                
                {/* Papildu informācija */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                  <p className="text-xs sm:text-sm text-gray-500 text-center">
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