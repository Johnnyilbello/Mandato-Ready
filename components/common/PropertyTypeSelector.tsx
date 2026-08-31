import React, { useState } from 'react';
import { getAvailablePropertyTypes } from '@/lib/propertyTaxonomy';
import { useApp } from '@/context/AppContext';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';

interface PropertyTypeSelectorProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export const PropertyTypeSelector: React.FC<PropertyTypeSelectorProps> = ({ value, onChange, className = '' }) => {
  const { agencyProfile } = useApp();
  const taxonomyConfig = agencyProfile.workPreferences.taxonomyConfig || {
    disabledCategories: [],
    customCategories: [],
    preferredCategories: [],
  };

  const taxonomy = getAvailablePropertyTypes(
    taxonomyConfig.disabledCategories,
    taxonomyConfig.customCategories,
    taxonomyConfig.preferredCategories
  );

  const [search, setSearch] = useState('');
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsDropdownOpen(false);
    setSearch('');
  };

  const allAvailable = [
    ...taxonomy.preferred,
    ...taxonomy.residenziale,
    ...taxonomy.commerciale,
    ...taxonomy.terreno_altro,
    ...taxonomy.custom,
  ];

  const filtered = search ? allAvailable.filter(c => c.toLowerCase().includes(search.toLowerCase())) : [];

  return (
    <div className={`relative ${className}`}>
      <div 
        className="flex items-center justify-between border border-[#c7c6ca] rounded-md px-3 py-2 bg-white cursor-pointer"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <span className={value ? 'text-[#1a1c1a]' : 'text-[#747775]'}>{value || 'Seleziona tipologia...'}</span>
        <ChevronDown className="w-4 h-4 text-[#747775]" />
      </div>

      {isDropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#c7c6ca] rounded-md shadow-lg z-50 max-h-[300px] overflow-y-auto">
          <div className="p-2 sticky top-0 bg-white border-b border-[#e6e5e8]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-2 text-[#747775]" />
              <input
                type="text"
                placeholder="Cerca tipologia..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-2 py-1 border border-[#c7c6ca] rounded focus:outline-none focus:border-[#434746]"
                onClick={e => e.stopPropagation()}
              />
            </div>
          </div>

          {search ? (
            <div className="py-2">
              {filtered.length > 0 ? (
                filtered.map((cat, i) => (
                  <div key={i} className="px-4 py-2 hover:bg-[#f4f3f1] cursor-pointer text-sm" onClick={() => handleSelect(cat)}>
                    {cat}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-[#747775]">Nessun risultato</div>
              )}
            </div>
          ) : (
            <div className="py-2">
              {taxonomy.preferred.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-1 text-xs font-semibold text-[#747775] uppercase">Più usati</div>
                  {taxonomy.preferred.map((cat, i) => (
                    <div key={i} className="px-4 py-2 hover:bg-[#f4f3f1] cursor-pointer text-sm" onClick={() => handleSelect(cat)}>
                      {cat}
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-[#e6e5e8] pt-1">
                <div className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-[#f4f3f1]" onClick={() => toggleSection('residenziale')}>
                  <span className="font-medium text-sm">Residenziale</span>
                  {openSection === 'residenziale' ? <ChevronDown className="w-4 h-4 text-[#747775]" /> : <ChevronRight className="w-4 h-4 text-[#747775]" />}
                </div>
                {openSection === 'residenziale' && taxonomy.residenziale.map((cat, i) => (
                  <div key={i} className="px-8 py-2 hover:bg-[#f4f3f1] cursor-pointer text-sm" onClick={() => handleSelect(cat)}>
                    {cat}
                  </div>
                ))}
              </div>

              <div className="border-t border-[#e6e5e8]">
                <div className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-[#f4f3f1]" onClick={() => toggleSection('commerciale')}>
                  <span className="font-medium text-sm">Commerciale</span>
                  {openSection === 'commerciale' ? <ChevronDown className="w-4 h-4 text-[#747775]" /> : <ChevronRight className="w-4 h-4 text-[#747775]" />}
                </div>
                {openSection === 'commerciale' && taxonomy.commerciale.map((cat, i) => (
                  <div key={i} className="px-8 py-2 hover:bg-[#f4f3f1] cursor-pointer text-sm" onClick={() => handleSelect(cat)}>
                    {cat}
                  </div>
                ))}
              </div>

              <div className="border-t border-[#e6e5e8]">
                <div className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-[#f4f3f1]" onClick={() => toggleSection('terreno')}>
                  <span className="font-medium text-sm">Terreno / Altro</span>
                  {openSection === 'terreno' ? <ChevronDown className="w-4 h-4 text-[#747775]" /> : <ChevronRight className="w-4 h-4 text-[#747775]" />}
                </div>
                {openSection === 'terreno' && taxonomy.terreno_altro.map((cat, i) => (
                  <div key={i} className="px-8 py-2 hover:bg-[#f4f3f1] cursor-pointer text-sm" onClick={() => handleSelect(cat)}>
                    {cat}
                  </div>
                ))}
              </div>
              
              {taxonomy.custom.length > 0 && (
                <div className="border-t border-[#e6e5e8]">
                  <div className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-[#f4f3f1]" onClick={() => toggleSection('custom')}>
                    <span className="font-medium text-sm">Personalizzati</span>
                    {openSection === 'custom' ? <ChevronDown className="w-4 h-4 text-[#747775]" /> : <ChevronRight className="w-4 h-4 text-[#747775]" />}
                  </div>
                  {openSection === 'custom' && taxonomy.custom.map((cat, i) => (
                    <div key={i} className="px-8 py-2 hover:bg-[#f4f3f1] cursor-pointer text-sm" onClick={() => handleSelect(cat)}>
                      {cat}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
