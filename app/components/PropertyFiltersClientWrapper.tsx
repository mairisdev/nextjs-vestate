'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import PropertyFilters from './PropertyFilters'
import type { PropertyFiltersProps } from './PropertyFilters'

// Client wrapper ar dynamic tulkojumu ielādi
export default function PropertyFiltersClientWrapper(props: Omit<PropertyFiltersProps, 'translations'>) {
  const params = useParams()
  const locale = params?.locale as string || 'lv' // Iegūstam pašreizējo valodu
  
  const [translations, setTranslations] = useState({
    filtersTitle: "Filtri",
    clearAllButton: "Notīrīt visus",
    cityLabel: "Pilsēta",
    allCitiesOption: "Visas pilsētas",
    districtLabel: "Rajons",
    allDistrictsOption: "Visi rajoni",
    projectLabel: "Projekts",
    allProjectsOption: "Visi projekti",
    priceLabel: "Cena EUR",
    priceFromPlaceholder: "No",
    priceToPlaceholder: "Līdz",
    roomsLabel: "Istabu skaits",
    areaLabel: "Platība / m²",
    areaFromPlaceholder: "No",
    areaToPlaceholder: "Līdz",
    applyFiltersButton: "Pielietot filtrus"
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setIsLoading(true)
        console.log(`🌐 Loading PropertyFilters translations for locale: ${locale}`)
        
        const response = await fetch(`/api/admin/translations?category=PropertyFilters&locale=${locale}`)
        if (response.ok) {
          const data = await response.json()
          
          console.log(`📝 Received ${data.length} translations for ${locale}:`, data)
          
          const translationsMap: { [key: string]: string } = {}
          data.forEach((t: any) => {
            const key = t.key.split('.').pop()
            if (key && t.value.trim()) { // Tikai ja ir vērtība
              translationsMap[key] = t.value
            }
          })
          
          console.log(`🔄 Mapped translations:`, translationsMap)
          
          // Atjaunojam tulkojumus ar server vērtībām
          setTranslations(prev => ({
            filtersTitle: translationsMap.filtersTitle || prev.filtersTitle,
            clearAllButton: translationsMap.clearAllButton || prev.clearAllButton,
            cityLabel: translationsMap.cityLabel || prev.cityLabel,
            allCitiesOption: translationsMap.allCitiesOption || prev.allCitiesOption,
            districtLabel: translationsMap.districtLabel || prev.districtLabel,
            allDistrictsOption: translationsMap.allDistrictsOption || prev.allDistrictsOption,
            projectLabel: translationsMap.projectLabel || prev.projectLabel,
            allProjectsOption: translationsMap.allProjectsOption || prev.allProjectsOption,
            priceLabel: translationsMap.priceLabel || prev.priceLabel,
            priceFromPlaceholder: translationsMap.priceFromPlaceholder || prev.priceFromPlaceholder,
            priceToPlaceholder: translationsMap.priceToPlaceholder || prev.priceToPlaceholder,
            roomsLabel: translationsMap.roomsLabel || prev.roomsLabel,
            areaLabel: translationsMap.areaLabel || prev.areaLabel,
            areaFromPlaceholder: translationsMap.areaFromPlaceholder || prev.areaFromPlaceholder,
            areaToPlaceholder: translationsMap.areaToPlaceholder || prev.areaToPlaceholder,
            applyFiltersButton: translationsMap.applyFiltersButton || prev.applyFiltersButton
          }))
        } else {
          console.warn(`⚠️ Failed to load translations for ${locale}:`, response.status)
        }
      } catch (error) {
        console.error('❌ Error loading PropertyFilters translations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTranslations()
  }, [locale]) // Atkārtoti ielādējam, kad mainās valoda

  // Rādām ielādes indikatoru vai fallback tulkojumus
  if (isLoading) {
    console.log(`⏳ Still loading translations for ${locale}...`)
  }

  console.log(`🎯 Final translations for ${locale}:`, translations)

  return <PropertyFilters {...props} translations={translations} />
}
