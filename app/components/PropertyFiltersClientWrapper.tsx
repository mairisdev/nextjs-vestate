'use client'

import { getSafeTranslations } from "@/lib/safeTranslations"
import PropertyFilters from './PropertyFilters'
import type { PropertyFiltersProps } from './PropertyFilters'
import { useEffect, useState } from 'react'

// Client wrapper ar client-side tulkojumiem
export default function PropertyFiltersClientWrapper(props: Omit<PropertyFiltersProps, 'translations'>) {
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

  useEffect(() => {
    // Client-side tulkojumu ielāde
    const loadTranslations = async () => {
      try {
        const response = await fetch('/api/admin/translations?category=PropertyFilters&locale=lv')
        if (response.ok) {
          const data = await response.json()
          
          const translationsMap: { [key: string]: string } = {}
          data.forEach((t: any) => {
            const key = t.key.split('.').pop()
            if (key) {
              translationsMap[key] = t.value
            }
          })
          
          // Atjaunojam tulkojumus ar server vērtībām, bet saglabājam fallback
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
        }
      } catch (error) {
        console.warn('Failed to load PropertyFilters translations:', error)
        // Saglabājam fallback tulkojumus
      }
    }

    loadTranslations()
  }, [])

  return <PropertyFilters {...props} translations={translations} />
}
