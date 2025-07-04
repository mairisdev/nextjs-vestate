'use client'
import PropertyFilters from '../components/PropertyFilters'
import type { PropertyFiltersProps } from './PropertyFilters'

export default function PropertyFiltersClientWrapper(props: Omit<PropertyFiltersProps, 'projects'>) {
  return <PropertyFilters {...props} />
}
