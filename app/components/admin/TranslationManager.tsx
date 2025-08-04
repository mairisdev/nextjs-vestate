'use client';

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Globe, RefreshCw, SaveAll, Copy } from 'lucide-react';

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
  const [newValue, setNewValue] = useState<string>(''); // Pievienojam value lauku
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [changes, setChanges] = useState<TranslationChanges>({});
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
    'LanguageSwitcher': 'Valodu pārslēdzējs',
    'LegalConsultSection': 'Juridiskās konsultācijas',
    'Navbar': 'Navigācijas josla',
    'PartnersSection': 'Partneru sekcija',
    'PrivateOffers': 'Privātie piedāvājumi',
    'PropertyCategories': 'Īpašumu kategorijas',
    'PropertyContact': 'Īpašuma kontakti',
    'PropertyDetails': 'Īpašuma detaļas',
    'PropertyFilters': 'Īpašuma filtri',
    'PropertyFiltersClientWrapper': 'Īpašuma filtru wrapper',
    'RecentSales': 'Pēdējie pārdošanas darījumi',
    'RecentSalesGallery': 'Pārdošanas galerija',
    'StatsSection': 'Statistikas sekcija',
    'Testimonials': 'Atsauksmes',
    'WhyChooseUs': 'Kāpēc izvēlēties mūs',
  };
  
  const categories = Object.keys(categoryMapping);

  useEffect(() => {
    loadTranslations();
    setChanges({});
    setError('');
    setSuccess('');
  }, [selectedCategory, selectedLocale]);

  const loadTranslations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/translations?category=${selectedCategory}&locale=${selectedLocale}`);
      if (response.ok) {
        const data = await response.json();
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
        const newChanges = { ...changes };
        delete newChanges[key];
        setChanges(newChanges);
        setError('');
        setSuccess(`Tulkojums "${key}" saglabāts!`);
        setTimeout(() => setSuccess(''), 3000);
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

  const saveAllChanges = async () => {
    if (Object.keys(changes).length === 0) {
      setError('Nav izmaiņu, ko saglabāt');
      return;
    }

    setIsSavingAll(true);
    setError('');

    try {
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
      const failedSaves = results.filter(response => !response.ok);
      
      if (failedSaves.length === 0) {
        setChanges({});
        await loadTranslations();
        setError('');
        setSuccess(`Visi ${Object.keys(changes).length} tulkojumi saglabāti!`);
        setTimeout(() => setSuccess(''), 3000);
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

    await saveTranslation(newKey.trim(), newValue);
    setNewKey('');
    setNewValue('');
  };

  // JAUNA FUNKCIJA: Pievienot tulkojumu visām valodām
  const addTranslationToAllLocales = async () => {
    if (!newKey.trim()) {
      setError('Ievadiet atslēgas nosaukumu');
      return;
    }

    if (!newValue.trim()) {
      setError('Ievadiet tulkojuma vērtību');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const promises = locales.map(async (locale) => {
        // Vispirms pārbaudām, vai tulkojums jau eksistē
        const checkResponse = await fetch(`/api/admin/translations?category=${selectedCategory}&locale=${locale.code}`);
        if (checkResponse.ok) {
          const existingTranslations = await checkResponse.json();
          const exists = existingTranslations.some((t: Translation) => 
            t.key === `${selectedCategory}.${newKey.trim()}`
          );
          
          if (exists) {
            console.log(`Translation ${newKey} already exists for ${locale.code}, skipping`);
            return { locale: locale.code, skipped: true };
          }
        }

        // Ja neeksistē, izveidojam jaunu
        const response = await fetch('/api/admin/translations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: `${selectedCategory}.${newKey.trim()}`,
            locale: locale.code,
            value: newValue.trim(),
            category: selectedCategory
          })
        });

        return {
          locale: locale.code,
          success: response.ok,
          skipped: false
        };
      });

      const results = await Promise.all(promises);
      
      const created = results.filter(r => r.success && !r.skipped).length;
      const skipped = results.filter(r => r.skipped).length;
      const failed = results.filter(r => !r.success && !r.skipped).length;

      let message = '';
      if (created > 0) message += `Izveidoti: ${created} tulkojumi. `;
      if (skipped > 0) message += `Izlaisti (jau eksistē): ${skipped}. `;
      if (failed > 0) message += `Neizdevās: ${failed}. `;

      if (failed === 0) {
        setSuccess(`✅ ${message}`);
        setNewKey('');
        setNewValue('');
        // Pārlādējam pašreizējo kategoriju
        await loadTranslations();
      } else {
        setError(`❌ ${message}`);
      }

      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);

    } catch (error) {
      console.error('Error adding translation to all locales:', error);
      setError('Radās kļūda pievienojot tulkojumu visām valodām');
    } finally {
      setLoading(false);
    }
  };

  // JAUNA FUNKCIJA: Kopēt tulkojumu uz citām valodām
  const copyTranslationToAllLocales = async (key: string, value: string) => {
    if (!value.trim()) {
      setError('Nav vērtības, ko kopēt');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const keyWithoutCategory = key.split('.').pop() || key;
      
      const promises = locales
        .filter(locale => locale.code !== selectedLocale) // Neiekļaujam pašreizējo locale
        .map(async (locale) => {
          const response = await fetch('/api/admin/translations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              key: `${selectedCategory}.${keyWithoutCategory}`,
              locale: locale.code,
              value: value.trim(),
              category: selectedCategory
            })
          });

          return {
            locale: locale.code,
            success: response.ok
          };
        });

      const results = await Promise.all(promises);
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      if (failed.length === 0) {
        setSuccess(`✅ Tulkojums kopēts uz ${successful.length} valodām: ${successful.map(r => r.locale.toUpperCase()).join(', ')}`);
      } else {
        setError(`❌ Neizdevās kopēt uz: ${failed.map(r => r.locale.toUpperCase()).join(', ')}`);
      }

      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 4000);

    } catch (error) {
      console.error('Error copying translation:', error);
      setError('Radās kļūda kopējot tulkojumu');
    } finally {
      setLoading(false);
    }
  };

  const deleteTranslation = async (id: string) => {
    if (!confirm('Vai tiešām vēlaties dzēst šo tulkojumu?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/translations/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await loadTranslations();
        setError('');
        setSuccess('Tulkojums dzēsts!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Neizdevās dzēst tulkojumu');
      }
    } catch (error) {
      console.error('Error deleting translation:', error);
      setError('Radās kļūda dzēšot tulkojumu');
    } finally {
      setLoading(false);
    }
  };

  const handleTranslationChange = (key: string, newValue: string, originalValue: string) => {
    if (newValue !== originalValue) {
      setChanges(prev => ({ ...prev, [key]: newValue }));
    } else {
      const newChanges = { ...changes };
      delete newChanges[key];
      setChanges(newChanges);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {/* Saglabāt visas izmaiņas poga */}
        {Object.keys(changes).length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-800 font-medium">
                  Jums ir {Object.keys(changes).length} nesaglabātas izmaiņas
                </p>
                <p className="text-yellow-700 text-sm">
                  Saglabājiet tās pirms kategorijas vai valodas maiņas
                </p>
              </div>
              <button
                onClick={saveAllChanges}
                disabled={isSavingAll}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center disabled:opacity-50 transition-colors"
              >
                {isSavingAll ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <SaveAll className="h-4 w-4 mr-2" />
                )}
                {isSavingAll ? 'Saglabā...' : 'Saglabāt visas izmaiņas'}
              </button>
            </div>
          </div>
        )}

        {/* Kategorijas un valodas izvēle */}
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
                  {categoryMapping[cat as keyof typeof categoryMapping]} ({cat})
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

        {/* Jauna tulkojuma pievienošana */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900">Pievienot jaunu tulkojumu</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Atslēgas nosaukums
              </label>
              <input
                type="text"
                placeholder="piemēram: menuItem1"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tulkojuma vērtība
              </label>
              <input
                type="text"
                placeholder="piemēram: Pakalpojumi"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={addNewTranslation}
              disabled={loading || !newKey.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center disabled:opacity-50 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Pievienot tikai {selectedLocale.toUpperCase()}
            </button>
            
            <button
              onClick={addTranslationToAllLocales}
              disabled={loading || !newKey.trim() || !newValue.trim()}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center disabled:opacity-50 transition-colors"
            >
              <Globe className="h-4 w-4 mr-2" />
              Pievienot VISĀM valodām (LV, EN, RU)
            </button>
          </div>
          
          <div className="text-xs text-gray-600 bg-white p-3 rounded border">
            <strong>💡 Smart funkcija:</strong> "Pievienot VISĀM valodām" izveidos atslēgu tikai tajās valodās, 
            kurās tā vēl neeksistē. Jau esošās atslēgas netiks pārrakstītas.
          </div>
        </div>
      </div>

      {/* Tulkojumi */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tulkojumi: {categoryMapping[selectedCategory as keyof typeof categoryMapping]} ({selectedLocale.toUpperCase()})
        </h3>

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
                onCopyToAll={copyTranslationToAllLocales}
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
  onCopyToAll: (key: string, value: string) => void;
  onChange: (key: string, newValue: string, originalValue: string) => void;
  hasChanges: boolean;
  loading: boolean;
}

function TranslationRow({ 
  translation, 
  onSave, 
  onDelete, 
  onCopyToAll,
  onChange, 
  hasChanges, 
  loading 
}: TranslationRowProps) {
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

  const handleCopyToAll = () => {
    onCopyToAll(translation.key, value);
  };

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
          hasChanges ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'
        }`}
        placeholder="Tulkojuma vērtība"
      />
      
      <div className="flex items-center gap-2">
        {/* Kopēt uz visām valodām poga */}
        <button
          onClick={handleCopyToAll}
          disabled={loading || !value.trim()}
          className="text-green-600 hover:text-green-700 hover:bg-green-50 p-2 rounded-lg transition-colors disabled:opacity-50"
          title="Kopēt šo tulkojumu uz visām citām valodām"
        >
          <Copy className="h-4 w-4" />
        </button>

        {/* Saglabāt poga */}
        <button
          onClick={handleSave}
          disabled={loading || !hasChanges}
          className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
            hasChanges
              ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
              : 'text-gray-400'
          }`}
          title="Saglabāt izmaiņas"
        >
          <Save className="h-4 w-4" />
        </button>

        {/* Dzēst poga */}
        <button
          onClick={() => onDelete(translation.id)}
          disabled={loading}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50"
          title="Dzēst tulkojumu"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}