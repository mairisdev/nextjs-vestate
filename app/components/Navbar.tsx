import { getTranslations } from 'next-intl/server';
import { getNavigationSettings } from "@/lib/queries/navigation";
import NavbarClient from './NavbarClient';

export default async function Navbar() {
  const data = await getNavigationSettings();
  const t = await getTranslations('Navbar');
  
  if (!data) return null;

  // Sagatavo tulkojumus ar pareiziem tipiem
  const translations = {
    navlink1: t('Navlink1'),
    navlink2: t('Navlink2'),
    navlink3: t('Navlink3'),
    navlink4: t('Navlink4'),
    navlink5: t('Navlink5'),
    navlink6: t('Navlink6'),
    navlink7: t('Navlink7'),
    navlink8: t('Navlink8')
  };

  // Normalizē data, lai atbilstu NavbarClient tipiem
  const normalizedData = {
    logoUrl: data.logoUrl || undefined,
    logoAlt: data.logoAlt || undefined,
    phone: data.phone || '',
    securityText: data.securityText || undefined,
    menuItems: Array.isArray(data.menuItems) ? data.menuItems.map((item: any) => ({
      label: item.label || '',
      link: item.link || '',
      isVisible: Boolean(item.isVisible),
      isHighlighted: Boolean(item.isHighlighted)
    })) : [],
    dropdownItems: Array.isArray(data.dropdownItems) ? data.dropdownItems.map((item: any) => ({
      label: item.label || '',
      link: item.link || '',
      isVisible: Boolean(item.isVisible),
      subItems: Array.isArray(item.subItems) ? item.subItems.map((subItem: any) => ({
        label: subItem.label || '',
        link: subItem.link || ''
      })) : []
    })) : []
  };

  return (
    <NavbarClient 
      data={normalizedData}
      translations={translations}
    />
  );
}