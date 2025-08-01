import { getSafeTranslations } from "@/lib/safeTranslations"
import PropertyFilters, { PropertyFiltersProps } from "../PropertyFilters"

interface ServerPropertyFiltersProps extends Omit<PropertyFiltersProps, 'translations'> {
  // Pārējie props bez translations
}

export default async function PropertyFiltersServer(props: ServerPropertyFiltersProps) {
  const { safe } = await getSafeTranslations("PropertyFilters")
  
  const translations = {
    filtersTitle: safe("filtersTitle", "Filtri"),
    clearAllButton: safe("clearAllButton", "Notīrīt visus"),
    cityLabel: safe("cityLabel", "Pilsēta"),
    allCitiesOption: safe("allCitiesOption", "Visas pilsētas"),
    districtLabel: safe("districtLabel", "Rajons"),
    allDistrictsOption: safe("allDistrictsOption", "Visi rajoni"),
    projectLabel: safe("projectLabel", "Projekts"),
    allProjectsOption: safe("allProjectsOption", "Visi projekti"),
    priceLabel: safe("priceLabel", "Cena EUR"),
    priceFromPlaceholder: safe("priceFromPlaceholder", "No"),
    priceToPlaceholder: safe("priceToPlaceholder", "Līdz"),
    roomsLabel: safe("roomsLabel", "Istabu skaits"),
    areaLabel: safe("areaLabel", "Platība / m²"),
    areaFromPlaceholder: safe("areaFromPlaceholder", "No"),
    areaToPlaceholder: safe("areaToPlaceholder", "Līdz"),
    applyFiltersButton: safe("applyFiltersButton", "Pielietot filtrus")
  }

  return <PropertyFilters {...props} translations={translations} />
}
