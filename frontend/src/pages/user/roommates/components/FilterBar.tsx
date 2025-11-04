import type { GetPreferencesResponse } from '@/types/preferences/preference';

interface FilterBarProps {
  allPreferences: GetPreferencesResponse;
  selectedPreferences: string[];
  importanceOperator: 'equal' | 'less_or_equal' | 'greater_or_equal';
  importanceValue: number;
  expandedCategories: Set<string>;
  onTogglePreference: (prefId: string) => void;
  onToggleCategory: (category: string) => void;
  onSetImportanceOperator: (operator: 'equal' | 'less_or_equal' | 'greater_or_equal') => void;
  onSetImportanceValue: (value: number) => void;
  onClearFilters: () => void;
}

export default function FilterBar({
  allPreferences,
  selectedPreferences,
  importanceOperator,
  importanceValue,
  expandedCategories,
  onTogglePreference,
  onToggleCategory,
  onSetImportanceOperator,
  onSetImportanceValue,
  onClearFilters,
}: FilterBarProps) {
  // Group preferences by category
  const preferencesByCategory = allPreferences.preferences.reduce((acc, pref) => {
    if (!acc[pref.category]) {
      acc[pref.category] = [];
    }
    acc[pref.category].push(pref);
    return acc;
  }, {} as Record<string, typeof allPreferences.preferences>);

  return (
    <div className='px-8 py-5 bg-white border-b border-gray-200'>
      <div className='flex items-start gap-4'>
        <div className='flex-shrink-0'>
          <h2 className='font-sourceserif4-18pt-regular text-maingray text-[24px] font-extralight tracking-[-0.02em]'>
            Filters
          </h2>
        </div>
        
        <div className='flex-1'>
          {/* Filter Pills Row */}
          <div className='flex items-center gap-2 flex-wrap mb-4'>
            {/* Importance filter pill */}
            <button
              onClick={() => onToggleCategory('IMPORTANCE')}
              className={`flex items-center gap-2 h-10 px-4 rounded-lg border-2 transition ${
                expandedCategories.has('IMPORTANCE')
                  ? 'bg-blue-50 border-blue-500 text-blue-900'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              <span className='text-sm font-semibold'>Importance:</span>
              <span className='text-sm font-bold'>
                {importanceOperator === 'equal' ? '=' : importanceOperator === 'greater_or_equal' ? '≥' : '≤'} {importanceValue}
              </span>
              <span className='text-xs ml-1'>
                {expandedCategories.has('IMPORTANCE') ? '▲' : '▼'}
              </span>
            </button>

            {/* Preference category pills */}
            {Object.entries(preferencesByCategory).map(([category, prefs]) => {
              const selectedCount = prefs.filter(p => selectedPreferences.includes(p.id)).length;
              const isActive = selectedCount > 0;
              const isExpanded = expandedCategories.has(category);
              
              return (
                <button
                  key={category}
                  onClick={() => onToggleCategory(category)}
                  className={`flex items-center gap-2 h-10 px-4 rounded-lg border-2 transition ${
                    isExpanded
                      ? 'bg-black border-black text-white'
                      : isActive
                      ? 'bg-gray-900 border-gray-900 text-white'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <span className='text-sm font-semibold'>{category}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isExpanded || isActive
                      ? 'bg-white/30 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {selectedCount}/{prefs.length}
                  </span>
                  <span className='text-xs'>
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </button>
              );
            })}

            {/* Right controls */}
            <div className='ml-auto flex items-center gap-3'>
              <div className='text-sm font-semibold text-gray-700 bg-gray-100 px-4 py-2 rounded-lg'>
                {selectedPreferences.length} selected
              </div>
              
              <button
                type='button'
                onClick={onClearFilters}
                className='h-10 px-5 rounded-lg border-2 border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition'
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Expanded Filter Panels - Below the pills */}
          <div className='space-y-3'>
            {/* Importance Filter Panel */}
            {expandedCategories.has('IMPORTANCE') && (
              <div className='p-5 bg-blue-50 rounded-xl border-2 border-blue-200'>
                <div className='flex items-center gap-4'>
                  <div className='flex-1'>
                    <label className='block text-sm font-semibold text-blue-900 mb-2'>Operator</label>
                    <select
                      value={importanceOperator}
                      onChange={(e) => onSetImportanceOperator(e.target.value as any)}
                      className='w-full h-11 rounded-lg border-2 border-blue-300 bg-white px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    >
                      <option value="equal">Equal to (=)</option>
                      <option value="greater_or_equal">At least (≥)</option>
                      <option value="less_or_equal">At most (≤)</option>
                    </select>
                  </div>
                  <div className='w-32'>
                    <label className='block text-sm font-semibold text-blue-900 mb-2'>Value</label>
                    <input
                      type='number'
                      min='1'
                      max='5'
                      step='1'
                      value={importanceValue}
                      onChange={(e) => onSetImportanceValue(parseInt(e.target.value))}
                      className='w-full h-11 rounded-lg border-2 border-blue-300 bg-white px-4 text-sm font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-center'
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Category Filter Panels */}
            {Object.entries(preferencesByCategory).map(([category, prefs]) => (
              expandedCategories.has(category) && (
                <div key={category} className='p-5 bg-gray-50 rounded-xl border-2 border-gray-300'>
                  <div className='text-sm font-bold text-gray-800 mb-3'>{category} Preferences</div>
                  <div className='flex flex-wrap gap-2'>
                    {prefs.map((pref) => (
                      <button
                        key={pref.id}
                        onClick={() => onTogglePreference(pref.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          selectedPreferences.includes(pref.id)
                            ? 'bg-black text-white border-2 border-black'
                            : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        {pref.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
