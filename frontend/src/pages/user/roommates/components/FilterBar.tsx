/**
 * Filter Bar Component
 * Dropdown-based filter management with permanent importance controls
 */

import { useState } from 'react';
import type { GetPreferencesResponse } from '@/types/preferences/preference';

interface FilterConfig {
  id: string;
  label: string;
  category: string;
  values: string[];
}

interface FilterBarProps {
  allPreferences: GetPreferencesResponse;
  selectedPreferences: string[];
  importanceOperator: 'equal' | 'less_or_equal' | 'greater_or_equal';
  importanceValue: number;
  onApplyFilters: (filters: {
    preferenceIds: string[];
    importanceOperator: 'equal' | 'less_or_equal' | 'greater_or_equal';
    importanceValue: number;
  }) => void;
}

export default function FilterBar({
  allPreferences,
  selectedPreferences: initialSelectedPreferences,
  importanceOperator: initialImportanceOperator,
  importanceValue: initialImportanceValue,
  onApplyFilters,
}: FilterBarProps) {
  // Local state for filters before applying
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(initialSelectedPreferences);
  const [importanceOperator, setImportanceOperator] = useState(initialImportanceOperator);
  const [importanceValue, setImportanceValue] = useState(initialImportanceValue);
  
  const [activeFilters, setActiveFilters] = useState<FilterConfig[]>([]);
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);

  // Group preferences by category
  const preferencesByCategory = allPreferences.preferences.reduce((acc, pref) => {
    if (!acc[pref.category]) {
      acc[pref.category] = [];
    }
    acc[pref.category].push(pref);
    return acc;
  }, {} as Record<string, typeof allPreferences.preferences>);

  const categories = Object.keys(preferencesByCategory);

  const handleAddFilter = (filterId: string) => {
    setOpenFilterId(openFilterId === filterId ? null : filterId);
  };

  const handleRemoveFilter = (filterId: string) => {
    const filter = activeFilters.find(f => f.id === filterId);
    
    // Remove from active filters
    setActiveFilters(prev => prev.filter(f => f.id !== filterId));
    
    // Remove from selected preferences
    if (filter?.values) {
      setSelectedPreferences(prev => prev.filter(id => !filter.values.includes(id)));
    }
  };

  const handleSelectCategory = (category: string) => {
    const filterId = `category-${category}`;
    
    // Check if already exists
    if (activeFilters.some(f => f.id === filterId)) {
      setOpenFilterId(filterId);
      return;
    }

    // Add new filter
    const newFilter: FilterConfig = {
      id: filterId,
      label: category,
      category,
      values: [],
    };
    
    setActiveFilters(prev => [...prev, newFilter]);
    setOpenFilterId(filterId);
  };

  const handleTogglePreference = (filterId: string, prefId: string) => {
    setActiveFilters(prev =>
      prev.map(f => {
        if (f.id !== filterId) return f;
        
        const values = f.values || [];
        const newValues = values.includes(prefId)
          ? values.filter(id => id !== prefId)
          : [...values, prefId];
        
        return { ...f, values: newValues };
      })
    );

    // Update selected preferences
    setSelectedPreferences(prev =>
      prev.includes(prefId)
        ? prev.filter(id => id !== prefId)
        : [...prev, prefId]
    );
  };

  const handleApply = () => {
    onApplyFilters({
      preferenceIds: selectedPreferences,
      importanceOperator,
      importanceValue,
    });
    setOpenFilterId(null);
  };

  const handleHideAll = () => {
    setActiveFilters([]);
    setSelectedPreferences([]);
    setOpenFilterId(null);
  };

  const getFilterSummary = (filter: FilterConfig): string => {
    const count = filter.values?.length || 0;
    return `${count} selected`;
  };

  const operatorLabel = importanceOperator === 'equal' ? '=' : importanceOperator === 'greater_or_equal' ? '≥' : '≤';

  return (
    <div className='px-8 py-6 bg-white border-b border-gray-200'>
      <div className='flex items-center gap-4'>
        {/* Importance Controls - Always Visible */}
        <div className='flex items-center gap-3 h-12 px-5 rounded-lg border-2 border-blue-300 bg-blue-50'>
          <span className='text-base font-semibold text-blue-900'>Importance:</span>
          
          {/* Operator Selector */}
          <select
            value={importanceOperator}
            onChange={(e) => setImportanceOperator(e.target.value as any)}
            className='h-9 px-3 rounded border border-blue-300 bg-white text-base font-medium outline-none focus:border-blue-500'
          >
            <option value="greater_or_equal">≥</option>
            <option value="equal">=</option>
            <option value="less_or_equal">≤</option>
          </select>
          
          {/* Value Selector - Button Group (1-5) */}
          <div className='flex gap-1.5'>
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => setImportanceValue(num)}
                className={`w-9 h-9 rounded font-bold text-base transition ${
                  importanceValue === num
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-blue-300 hover:bg-blue-100'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div className='w-px h-10 bg-gray-300'></div>

        {/* Active Filter Pills */}
        {activeFilters.map(filter => (
          <div
            key={filter.id}
            className='relative flex items-center gap-2 h-12 px-5 rounded-lg border-2 border-gray-300 bg-white hover:border-gray-400 transition cursor-pointer'
            onClick={() => setOpenFilterId(openFilterId === filter.id ? null : filter.id)}
          >
            <span className='text-base font-semibold text-gray-700'>{filter.label}</span>
            <span className='text-sm font-bold text-gray-600'>{getFilterSummary(filter)}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFilter(filter.id);
              }}
              className='ml-2 text-gray-400 hover:text-gray-600 text-lg'
            >
              ✕
            </button>
          </div>
        ))}

        {/* Add Filter Dropdown */}
        <div className='relative'>
          <button
            onClick={() => handleAddFilter('add-menu')}
            className='flex items-center gap-2 h-12 px-5 rounded-lg border-2 border-dashed border-gray-300 bg-white text-gray-600 hover:border-blue-400 hover:text-blue-600 transition'
          >
            <span className='text-xl'>+</span>
            <span className='text-base font-semibold'>Add filter</span>
          </button>

          {/* Add Filter Menu - Improved Dropdown */}
          {openFilterId === 'add-menu' && (
            <>
              <div
                className='fixed inset-0 z-40'
                onClick={() => setOpenFilterId(null)}
              />
              <div className='absolute top-12 left-0 w-80 bg-white rounded-lg shadow-2xl border-2 border-gray-200 z-50 max-h-96 overflow-y-auto'>
                <div className='p-3'>
                  <div className='px-3 py-2 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 mb-2'>
                    Select Category
                  </div>
                  
                  {/* Category Options - Bigger and More Prominent */}
                  <div className='space-y-1'>
                    {categories.map(category => {
                      const prefs = preferencesByCategory[category];
                      const isActive = activeFilters.some(f => f.category === category);
                      
                      return (
                        <button
                          key={category}
                          onClick={() => {
                            handleSelectCategory(category);
                          }}
                          disabled={isActive}
                          className={`w-full px-4 py-3 text-left rounded-lg transition flex items-center justify-between ${
                            isActive
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'hover:bg-blue-50 hover:border-blue-200 border-2 border-transparent'
                          }`}
                        >
                          <div>
                            <div className='font-semibold text-gray-900'>{category}</div>
                            <div className='text-xs text-gray-500'>{prefs.length} options</div>
                          </div>
                          {isActive && (
                            <span className='text-xs font-bold text-gray-400'>✓ Added</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Show/Hide Controls */}
        <div className='ml-auto flex items-center gap-4'>
          <div className='text-base text-gray-600'>
            {selectedPreferences.length > 0 && (
              <span className='font-semibold'>{selectedPreferences.length} preferences selected</span>
            )}
          </div>
          
          {activeFilters.length > 0 && (
            <button
              onClick={handleHideAll}
              className='text-base font-semibold text-red-600 hover:text-red-700'
            >
              Clear All
            </button>
          )}

          <button
            onClick={handleApply}
            className='h-12 px-7 rounded-lg bg-blue-600 text-white text-base font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl'
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Filter Detail Dropdowns - Improved */}
      {openFilterId && openFilterId !== 'add-menu' && (
        <>
          {/* Backdrop */}
          <div
            className='fixed inset-0 bg-black/20 z-40'
            onClick={() => setOpenFilterId(null)}
          />

          {/* Filter Panel - Positioned better */}
          <div className='absolute left-8 right-8 top-24 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col'>
            {activeFilters.map(filter => {
              if (filter.id !== openFilterId) return null;

              const categoryPrefs = filter.category ? preferencesByCategory[filter.category] : [];
              
              return (
                <div key={filter.id} className='flex flex-col h-full'>
                  {/* Header */}
                  <div className='p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white'>
                    <h3 className='text-xl font-bold text-gray-900'>{filter.label}</h3>
                    <p className='text-sm text-gray-600 mt-1'>Select preferences that matter to you</p>
                  </div>
                  
                  {/* Scrollable Content */}
                  <div className='flex-1 overflow-y-auto p-6'>
                    <div className='grid grid-cols-2 gap-3'>
                      {categoryPrefs.map(pref => {
                        const isSelected = filter.values?.includes(pref.id) || false;
                        
                        return (
                          <label
                            key={pref.id}
                            className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition hover:shadow-md ${
                              isSelected
                                ? 'bg-blue-50 border-blue-500 shadow-sm'
                                : 'bg-white border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <input
                              type='checkbox'
                              checked={isSelected}
                              onChange={() => handleTogglePreference(filter.id, pref.id)}
                              className='mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                            />
                            <div className='flex-1 min-w-0'>
                              <div className='text-sm font-semibold text-gray-900 mb-1'>{pref.label}</div>
                              <div className='text-xs text-gray-500 break-words'>{pref.value}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className='p-6 border-t border-gray-200 bg-gray-50'>
                    <button
                      onClick={() => setOpenFilterId(null)}
                      className='w-full h-12 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-lg hover:shadow-xl transition'
                    >
                      Done ({filter.values.length} selected)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
