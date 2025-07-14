'use client';

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Globe, RefreshCw, SaveAll } from 'lucide-react';

interface Translation {
  id: string;
  key: string;
  locale: string;
  value: string;
  category?: string;
  createdAt?: string;
}

interface TranslationChanges {
  [key: string]: string;
}

export default function TranslationManager() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Navbar');
  const [selectedLocale, setSelectedLocale] = useState<string>('lv');
  const [newKey, setNewKey] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [changes, setChanges] = useState<TranslationChanges>({}); // Glabā visas izmaiņas
  const [isSavingAll, setIsSavingAll] = useState(false);

  const locales = [
    { code: 'lv', name: 'Latviešu', flag: 'LV' },
    { code: 'en', name: 'English', flag: 'EN' },
    { code: 'ru', name: 'Русский', flag: 'RU' }
  ];

  const categoryMapping = {
    'HeroSlider': 'Slaideris',
    'FirstSection': 'Pirmā sadaļa',
    'AgentReasons': 'Kāpēc izvēlēties mākleri',
    'LegalConsultSection2': 'Otrā sadaļa',
    'ServicesSection': 'Pakalpojumi',
    'AgentsSection': 'Aģenti',
    'BlogSection': 'Blogs',
    'ContactSection': 'Kontaktu sekcija',
    'CookieConsentBanner': 'Sīkdatņu paziņojums',
    'DropdownMenu': 'Izkrītošā izvēlne',
    'FooterSection': 'Kājenes sekcija',
    'HashNavigationHandler': 'Hash navigācija',
    'ImageModal': 'Attēlu modālis',
    'LanguageSwitcher': 'Valodu pārslēdzējs',
    'LegalConsultSection': 'Juridiskās konsultācijas',
    'MobileMenu': 'Mobilā izvēlne',
    'Navbar': 'Navigācijas josla',
    'PartnersSection': 'Partneru sekcija',
    'PrivateOffers': 'Privātie piedāvājumi',
    'PropertyCategories': 'Īpašumu kategorijas',
    'PropertyContact': 'Īpašuma kontakti',
    'PropertyDetails': 'Īpašuma detaļas',
    'PropertyFilters': 'Īpašuma filtri',
    'PropertyFiltersClientWrapper': 'Īpašuma filtru wrapper',
    'PropertyGrid': 'Īpašumu režģis',
    'PropertyImageGallery': 'Īpašumu attēlu galerija',
    'RecentSales': 'Pēdējie pārdošanas darījumi',
    'RecentSalesGallery': 'Pārdošanas galerija',
    'ReviewModal': 'Atsauksmju modālis',
    'ShareButton': 'Dalīšanās poga',
    'StatsSection': 'Statistikas sekcija',
    'Testimonials': 'Atsauksmes',
    'WhyChooseUs': 'Kāpēc izvēlēties mūs',
  };
  
  const categories = Object.keys(categoryMapping);

  useEffect(() => {
    loadTranslations();
    setChanges({}); // Notīrām izmaiņas, kad mainām kategoriju/valodu
  }, [selectedCategory, selectedLocale]);

  const loadTranslations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/translations?category=${selectedCategory}&locale=${selectedLocale}`);
      if (response.ok) {
        const data = await response.json();
        // Sakārtojam pēc createdAt datuma (jaunākie pēdējie)
        const sortedData = data.sort((a: Translation, b: Translation) => 
          new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
        );
        setTranslations(sortedData);
      } else {
        setError('Neizdevās ielādēt tulkojumus');
      }
    } catch (error) {
      console.error('Error loading translations:', error);
      setError('Radās kļūda ielādējot tulkojumus');
    } finally {
      setLoading(false);
    }
  };

  const saveTranslation = async (key: string, value: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: `${selectedCategory}.${key}`,
          locale: selectedLocale,
          value,
          category: selectedCategory
        })
      });
      
      if (response.ok) {
        await loadTranslations();
        // Noņemam šo izmaiņu no changes objekta
        const newChanges = { ...changes };
        delete newChanges[key];
        setChanges(newChanges);
        setError('');
      } else {
        setError('Neizdevās saglabāt tulkojumu');
      }
    } catch (error) {
      console.error('Error saving translation:', error);
      setError('Radās kļūda saglabājot tulkojumu');
    } finally {
      setLoading(false);
    }
  };

  // Jauna funkcija - saglabāt visas izmaiņas
  const saveAllChanges = async () => {
    if (Object.keys(changes).length === 0) {
      setError('Nav izmaiņu, ko saglabāt');
      return;
    }

    setIsSavingAll(true);
    setError('');

    try {
      // Saglabājam visas izmaiņas paralēli
      const savePromises = Object.entries(changes).map(([key, value]) =>
        fetch('/api/admin/translations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: `${selectedCategory}.${key}`,
            locale: selectedLocale,
            value,
            category: selectedCategory
          })
        })
      );

      const results = await Promise.all(savePromises);
      
      // Pārbaudām vai visi pieprasījumi bija veiksmīgi
      const failedSaves = results.filter(response => !response.ok);
      
      if (failedSaves.length === 0) {
        setChanges({}); // Notīrām visas izmaiņas
        await loadTranslations(); // Pārlādējam datus
        setError('');
      } else {
        setError(`Neizdevās saglabāt ${failedSaves.length} tulkojumus`);
      }
    } catch (error) {
      console.error('Error saving all translations:', error);
      setError('Radās kļūda saglabājot tulkojumus');
    } finally {
      setIsSavingAll(false);
    }
  };

  const addNewTranslation = async () => {
    if (!newKey.trim()) {
      setError('Ievadiet atslēgas nosaukumu');
      return;
    }
    
    await saveTranslation(newKey, '');
    setNewKey('');
  };

  // Jauna funkcija - izveido atslēgu visām valodām uzreiz (tikai tajās, kur nav)
  const addTranslationToAllLocales = async () => {
    if (!newKey.trim()) {
      setError('Ievadiet atslēgas nosaukumu');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Vispirms pārbaudām, kurās valodās šī atslēga jau eksistē
      const checkPromises = locales.map(async (locale) => {
        const response = await fetch(`/api/admin/translations?category=${selectedCategory}&locale=${locale.code}`);
        if (response.ok) {
          const existingTranslations = await response.json();
          const keyExists = existingTranslations.some((t: Translation) => 
            t.key === `${selectedCategory}.${newKey}`
          );
          return { locale: locale.code, exists: keyExists };
        }
        return { locale: locale.code, exists: false };
      });

      const existingChecks = await Promise.all(checkPromises);
      
      // Filtrējam tikai tās valodas, kurās atslēga vēl neeksistē
      const localesToCreate = existingChecks
        .filter(check => !check.exists)
        .map(check => check.locale);

      if (localesToCreate.length === 0) {
        setError(`Atslēga "${newKey}" jau eksistē visās valodās`);
        setLoading(false);
        return;
      }

      // Izveidojam pieprasījumus tikai trūkstošajām valodām
      const createPromises = localesToCreate.map(locale =>
        fetch('/api/admin/translations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: `${selectedCategory}.${newKey}`,
            locale: locale,
            value: '', // Sākotnēji tukša vērtība
            category: selectedCategory
          })
        })
      );

      const results = await Promise.all(createPromises);
      
      // Pārbaudām vai visi pieprasījumi bija veiksmīgi
      const failedCreates = results.filter(response => !response.ok);
      
      if (failedCreates.length === 0) {
        setNewKey('');
        await loadTranslations(); // Pārlādējam tikai pašreizējo valodu
        
        // Parādām informatīvu ziņojumu
        const existingLocales = existingChecks
          .filter(check => check.exists)
          .map(check => check.locale.toUpperCase());
        
        const createdLocales = localesToCreate.map(locale => locale.toUpperCase());
        
        let message = `✅ Atslēga izveidota: ${createdLocales.join(', ')}`;
        if (existingLocales.length > 0) {
          message += ` (jau eksistēja: ${existingLocales.join(', ')})`;
        }
        
        // Parādām success ziņojumu uz 3 sekundēm
        setError('');
        const successDiv = document.createElement('div');
        successDiv.className = 'mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700';
        successDiv.textContent = message;
        
        const errorContainer = document.querySelector('.p-6 > div:first-child');
        if (errorContainer) {
          errorContainer.parentNode?.insertBefore(successDiv, errorContainer);
          setTimeout(() => successDiv.remove(), 3000);
        }
        
      } else {
        setError(`Neizdevās izveidot tulkojumu ${failedCreates.length} valodās`);
      }
    } catch (error) {
      console.error('Error creating translations for all locales:', error);
      setError('Radās kļūda veidojot tulkojumus');
    } finally {
      setLoading(false);
    }
  };

  const deleteTranslation = async (id: string) => {
    if (!confirm('Vai tiešām vēlaties dzēst šo tulkojumu?')) return;
    
    try {
      const response = await fetch(`/api/admin/translations/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await loadTranslations();
        setError('');
      } else {
        setError('Neizdevās dzēst tulkojumu');
      }
    } catch (error) {
      console.error('Error deleting translation:', error);
      setError('Radās kļūda dzēšot tulkojumu');
    }
  };

  // Funkcija, lai reģistrētu izmaiņas
  const handleTranslationChange = (key: string, newValue: string, originalValue: string) => {
    if (newValue !== originalValue) {
      setChanges(prev => ({ ...prev, [key]: newValue }));
    } else {
      // Ja vērtība atgriezta pie oriģinālās, noņemam no izmaiņām
      const newChanges = { ...changes };
      delete newChanges[key];
      setChanges(newChanges);
    }
  };

  const hasUnsavedChanges = Object.keys(changes).length > 0;

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Globe className="h-6 w-6 mr-3 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Tulkojumu rediģēšana</h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Saglabāt visu poga */}
            {hasUnsavedChanges && (
              <button
                onClick={saveAllChanges}
                disabled={isSavingAll}
                className="flex items-center px-4 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <SaveAll className={`h-4 w-4 mr-2 ${isSavingAll ? 'animate-pulse' : ''}`} />
                {isSavingAll ? 'Saglabā...' : `Saglabāt visu (${Object.keys(changes).length})`}
              </button>
            )}
            
            <button
              onClick={loadTranslations}
              disabled={loading}
              className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atjaunot
            </button>
          </div>
        </div>
        
        {/* Izmaiņu indikators */}
        {hasUnsavedChanges && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Jums ir {Object.keys(changes).length} nesaglabātas izmaiņas
            </p>
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Filtri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kategorija</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {(categoryMapping as Record<string, string>)[cat] ?? cat} ({cat})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Valoda</label>
            <select
              value={selectedLocale}
              onChange={(e) => setSelectedLocale(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {locales.map(locale => (
                <option key={locale.code} value={locale.code}>
                  {locale.flag} {locale.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Jauna atslēga */}
        <div className="space-y-3 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Jauna atslēga (piemēram: benefit1)"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={addNewTranslation}
              disabled={loading || !newKey.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              Pievienot tikai {selectedLocale.toUpperCase()}
            </button>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1"></div>
            <button
              onClick={addTranslationToAllLocales}
              disabled={loading || !newKey.trim()}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50 transition-colors"
            >
              <Globe className="h-4 w-4 mr-1" />
              Pievienot VISĀM valodām (LV, EN, RU)
            </button>
          </div>
          
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            💡 <strong>Smart funkcija:</strong> "Pievienot VISĀM valodām" izveidos atslēgu tikai tajās valodās, kurās tā vēl neeksistē. Jau esošās atslēgas netiks dublētas.
          </div>
        </div>

        {/* Tulkojumi */}
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Ielādē tulkojumus...</p>
          </div>
        ) : translations.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Globe className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">Nav tulkojumu šai kategorijai un valodai</p>
            <p className="text-sm text-gray-400">Pievienojiet jaunu tulkojumu augstāk</p>
          </div>
        ) : (
          <div className="space-y-4">
            {translations.map((translation) => (
              <TranslationRow
                key={translation.id}
                translation={translation}
                onSave={saveTranslation}
                onDelete={deleteTranslation}
                onChange={handleTranslationChange}
                hasChanges={changes.hasOwnProperty(translation.key.split('.').pop() || '')}
                loading={loading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface TranslationRowProps {
  translation: Translation;
  onSave: (key: string, value: string) => void;
  onDelete: (id: string) => void;
  onChange: (key: string, newValue: string, originalValue: string) => void;
  hasChanges: boolean;
  loading: boolean;
}

function TranslationRow({ translation, onSave, onDelete, onChange, hasChanges, loading }: TranslationRowProps) {
  const [value, setValue] = useState(translation.value);

  const keyParts = translation.key.split('.');
  const displayKey = keyParts[keyParts.length - 1];

  const handleSave = () => {
    onSave(displayKey, value);
  };

  const handleChange = (newValue: string) => {
    setValue(newValue);
    onChange(displayKey, newValue, translation.value);
  };

  // Atjaunojam value, kad translation mainās (pēc kategorijas/valodas maiņas)
  useEffect(() => {
    setValue(translation.value);
  }, [translation.value]);

  return (
    <div className={`flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
      hasChanges ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
    }`}>
      <div className="w-40 flex-shrink-0">
        <span className={`text-sm font-medium px-2 py-1 rounded ${
          hasChanges 
            ? 'text-yellow-800 bg-yellow-200' 
            : 'text-gray-700 bg-gray-100'
        }`}>
          {displayKey}
        </span>
      </div>
      
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className={`flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          hasChanges ? 'border-yellow-300' : 'border-gray-300'
        }`}
        placeholder="Tulkojuma teksts..."
      />
      
      <button
        onClick={handleSave}
        disabled={!hasChanges || loading}
        className={`px-3 py-2 rounded-lg flex items-center transition-colors ${
          hasChanges 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        <Save className="h-4 w-4" />
      </button>
      
      <button
        onClick={() => onDelete(translation.id)}
        disabled={loading}
        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center disabled:opacity-50 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}