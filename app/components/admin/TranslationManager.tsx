'use client';

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Globe, RefreshCw } from 'lucide-react';

interface Translation {
  id: string;
  key: string;
  locale: string;
  value: string;
  category?: string;
}

export default function TranslationManager() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Navbar');
  const [selectedLocale, setSelectedLocale] = useState<string>('lv');
  const [newKey, setNewKey] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const locales = [
    { code: 'lv', name: 'Latviešu', flag: '🇱🇻' },
    { code: 'en', name: 'English', flag: 'EN' },
    { code: 'ru', name: 'Русский', flag: 'RU' }
  ];

  const categories = ['Navbar', 'Footer', 'Hero', 'Services', 'Contact', 'About'];

  useEffect(() => {
    loadTranslations();
  }, [selectedCategory, selectedLocale]);

  const loadTranslations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/translations?category=${selectedCategory}&locale=${selectedLocale}`);
      if (response.ok) {
        const data = await response.json();
        setTranslations(data);
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

  const addNewTranslation = async () => {
    if (!newKey.trim()) {
      setError('Ievadiet atslēgas nosaukumu');
      return;
    }
    
    await saveTranslation(newKey, '');
    setNewKey('');
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

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Globe className="h-6 w-6 mr-3 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Tulkojumu rediģēšana</h2>
          </div>
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
                <option key={cat} value={cat}>{cat}</option>
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
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Jauna atslēga (piemēram: Navlink5)"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={addNewTranslation}
            disabled={loading || !newKey.trim()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Pievienot
          </button>
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
  loading: boolean;
}

function TranslationRow({ translation, onSave, onDelete, loading }: TranslationRowProps) {
  const [value, setValue] = useState(translation.value);
  const [hasChanged, setHasChanged] = useState(false);

  const keyParts = translation.key.split('.');
  const displayKey = keyParts[keyParts.length - 1];

  const handleSave = () => {
    onSave(displayKey, value);
    setHasChanged(false);
  };

  const handleChange = (newValue: string) => {
    setValue(newValue);
    setHasChanged(newValue !== translation.value);
  };

  return (
    <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="w-32 flex-shrink-0">
        <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
          {displayKey}
        </span>
      </div>
      
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Tulkojuma teksts..."
      />
      
      <button
        onClick={handleSave}
        disabled={!hasChanged || loading}
        className={`px-3 py-2 rounded-lg flex items-center transition-colors ${
          hasChanged 
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