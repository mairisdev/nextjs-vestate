'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ChevronDown, Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const languages = [
  { code: 'lv', name: 'Latviešu', flag: 'lv' },
  { code: 'en', name: 'English', flag: 'en' },
  { code: 'ru', name: 'Русский', flag: 'ру' }
];

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  // Aizvērt dropdown, ja klikšķina ārpus tā
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    setIsOpen(false);
    
    // Nomaina URL, saglabājot pašreizējo ceļu
    const segments = pathname.split('/');
    segments[1] = langCode; // Aizvieto locale daļu
    const newPath = segments.join('/');
    
    router.push(newPath);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
        aria-label="Izvēlēties valodu"
      >
        <Globe className="w-4 h-4 text-[#00332D]" />
        <span className="text-sm font-medium text-[#00332D]">
          {currentLanguage.name.toUpperCase()}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-[#00332D] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px] z-50">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center space-x-2 ${
                language.code === locale 
                  ? 'bg-[#77dDB4]/10 text-[#00332D] font-medium' 
                  : 'text-gray-700'
              }`}
            >
              <span>{language.flag}</span>
              <span>{language.name}</span>
              {language.code === locale && (
                <span className="ml-auto text-[#77dDB4]">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}