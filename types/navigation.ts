export interface SubItem {
  link: string
  label: string
}

export interface MenuItem {
  link: string
  label: string
  isVisible: boolean
}

export interface DropdownItem {
  link: string
  label: string
  isVisible: boolean
  subItems: SubItem[]
}

export interface NavigationData {
  logoAlt: string
  logoUrl?: string
  phone: string
  securityText: string
  menuItems: MenuItem[]
  dropdownItems: DropdownItem[]
}
