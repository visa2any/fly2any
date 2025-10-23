import re

# Read the file
with open('components/flights/EnhancedSearchBar.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Step 1: Remove state variables departureFlex and tripDuration (lines 203-204)
content = re.sub(
    r'  const \[directFlights, setDirectFlights\] = useState\(false\);\n  const \[departureFlex, setDepartureFlex\] = useState\(0\);  // ±N days \(0-5\)\n  const \[tripDuration, setTripDuration\] = useState\(7\);     // Number of nights \(1-14\)',
    '  const [directFlights, setDirectFlights] = useState(false);',
    content
)

# Step 2: Remove departureFlex and tripDuration from search params (lines 358, 364)
content = re.sub(r',\n      departureFlex: departureFlex\.toString\(\),', '', content)
content = re.sub(r'      params\.append\(\'tripDuration\', tripDuration\.toString\(\)\);\n', '', content)

# Step 3: Remove desktop departure inline flex controls (lines 444-483)
# Replace the entire departure date section with a simple button
desktop_depart_old = r'''          \{/\* Depart Date with Inline Flex Controls \*/\}
          <div ref=\{departureDateRef\} className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Depart
            </label>
            <div className="flex items-center gap-2">
              \{/\* Date Display/Picker \*/\}
              <button
                type="button"
                onClick=\{\(\) => handleOpenDatePicker\('departure'\)\}
                className=\{\`flex-1 relative px-4 py-3 bg-white border rounded-lg hover:border-\[#0087FF\] transition-all cursor-pointer \$\{
                  errors\.departureDate \? 'border-red-500' : 'border-gray-300'
                \}\`\}
              >
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size=\{18\} />
                <span className="block pl-7 text-sm font-medium text-gray-900">
                  \{departureDate \? formatDateForDisplay\(departureDate\) : 'Select date'\}
                </span>
              </button>

              \{/\* Inline Flex Controls \*/\}
              <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1 border border-gray-200">
                <button
                  type="button"
                  onClick=\{\(\) => setDepartureFlex\(Math\.max\(0, departureFlex - 1\)\)\}
                  disabled=\{departureFlex === 0\}
                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-white hover:text-\[#0087FF\] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-bold"
                  aria-label="Decrease flex days"
                >
                  −
                </button>
                <span className="text-xs font-semibold text-gray-700 min-w-\[32px\] text-center">
                  \{departureFlex === 0 \? 'Exact' : `±\$\{departureFlex\}`\}
                </span>
                <button
                  type="button"
                  onClick=\{\(\) => setDepartureFlex\(Math\.min\(5, departureFlex \+ 1\)\)\}
                  disabled=\{departureFlex === 5\}
                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-white hover:text-\[#0087FF\] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-bold"
                  aria-label="Increase flex days"
                >
                  \+
                </button>
              </div>
            </div>
            \{errors\.departureDate && \(
              <p className="mt-1 text-xs text-red-600" role="alert">
                \{errors\.departureDate\}
              </p>
            \)\}
          </div>'''

desktop_depart_new = '''          {/* Depart Date */}
          <div ref={departureDateRef} className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Depart
            </label>
            <button
              type="button"
              onClick={() => handleOpenDatePicker('departure')}
              className={`w-full relative px-4 py-3 bg-white border rounded-lg hover:border-[#0087FF] transition-all cursor-pointer ${
                errors.departureDate ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <span className="block pl-7 text-sm font-medium text-gray-900">
                {departureDate ? formatDateForDisplay(departureDate) : 'Select date'}
              </span>
            </button>
            {errors.departureDate && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.departureDate}
              </p>
            )}
          </div>'''

content = re.sub(desktop_depart_old, desktop_depart_new, content, flags=re.DOTALL)

# Step 4: Remove desktop trip duration section (lines 540-582)
desktop_duration_pattern = r'''
          \{/\* Trip Duration - Stepper with Editable Input \*/\}
          \{tripType === 'roundtrip' && \(
            <div className="flex-shrink-0 w-40">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg px-2 py-3 hover:border-\[#0087FF\] transition-all">
                <button
                  type="button"
                  onClick=\{\(\) => setTripDuration\(Math\.max\(1, tripDuration - 1\)\)\}
                  disabled=\{tripDuration <= 1\}
                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-50 hover:text-\[#0087FF\] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-bold"
                  aria-label="Decrease duration"
                >
                  −
                </button>
                <input
                  type="number"
                  value=\{tripDuration\}
                  onChange=\{\(e\) => \{
                    const val = parseInt\(e\.target\.value\);
                    if \(!isNaN\(val\) && val >= 1 && val <= 30\) \{
                      setTripDuration\(val\);
                    \}
                  \}\}
                  min="1"
                  max="30"
                  className="w-10 text-center text-sm font-semibold text-gray-900 border-0 outline-none bg-transparent"
                  aria-label="Trip duration"
                />
                <button
                  type="button"
                  onClick=\{\(\) => setTripDuration\(Math\.min\(30, tripDuration \+ 1\)\)\}
                  disabled=\{tripDuration >= 30\}
                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-50 hover:text-\[#0087FF\] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-bold"
                  aria-label="Increase duration"
                >
                  \+
                </button>
                <span className="text-xs text-gray-600 ml-1">nights</span>
              </div>
            </div>
          \)\}'''

content = re.sub(desktop_duration_pattern, '', content, flags=re.DOTALL)

# Step 5: Remove mobile departure flex controls (lines 866-888)
mobile_depart_pattern = r'''
                \{/\* Inline Flex Controls \*/\}
                <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-2 border-2 border-gray-200">
                  <button
                    type="button"
                    onClick=\{\(\) => setDepartureFlex\(Math\.max\(0, departureFlex - 1\)\)\}
                    disabled=\{departureFlex === 0\}
                    className="w-7 h-7 rounded flex items-center justify-center hover:bg-white hover:text-\[#0087FF\] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-bold"
                  >
                    −
                  </button>
                  <span className="text-xs font-semibold text-gray-700 min-w-\[28px\] text-center">
                    \{departureFlex === 0 \? 'Ex' : `±\$\{departureFlex\}`\}
                  </span>
                  <button
                    type="button"
                    onClick=\{\(\) => setDepartureFlex\(Math\.min\(5, departureFlex \+ 1\)\)\}
                    disabled=\{departureFlex === 5\}
                    className="w-7 h-7 rounded flex items-center justify-center hover:bg-white hover:text-\[#0087FF\] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-bold"
                  >
                    \+
                  </button>
                </div>'''

content = re.sub(mobile_depart_pattern, '', content, flags=re.DOTALL)

# Also need to update mobile departure to not have flex container
mobile_depart_container_old = r'''              <div className="flex items-center gap-2">
                <div className="flex-1 relative">'''
mobile_depart_container_new = '''              <div className="relative">'''

content = re.sub(mobile_depart_container_old, mobile_depart_container_new, content)

# Close the div properly for mobile departure
mobile_depart_close_old = r'''                </div>
              </div>
            </div>'''
mobile_depart_close_new = '''              </div>
            </div>'''

content = re.sub(mobile_depart_close_old, mobile_depart_close_new, content, count=1)

# Step 6: Remove mobile trip duration section (lines 909-948)
mobile_duration_pattern = r'''
          \{/\* Mobile Trip Duration - Stepper \*/\}
          \{tripType === 'roundtrip' && \(
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1\.5">
                Duration
              </label>
              <div className="flex items-center gap-2 bg-gray-50 border-2 border-gray-200 rounded-lg px-3 py-2">
                <button
                  type="button"
                  onClick=\{\(\) => setTripDuration\(Math\.max\(1, tripDuration - 1\)\)\}
                  disabled=\{tripDuration <= 1\}
                  className="w-7 h-7 rounded flex items-center justify-center hover:bg-white hover:text-\[#0087FF\] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-bold"
                >
                  −
                </button>
                <input
                  type="number"
                  value=\{tripDuration\}
                  onChange=\{\(e\) => \{
                    const val = parseInt\(e\.target\.value\);
                    if \(!isNaN\(val\) && val >= 1 && val <= 30\) \{
                      setTripDuration\(val\);
                    \}
                  \}\}
                  min="1"
                  max="30"
                  className="flex-1 text-center text-sm font-semibold text-gray-900 border-0 outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick=\{\(\) => setTripDuration\(Math\.min\(30, tripDuration \+ 1\)\)\}
                  disabled=\{tripDuration >= 30\}
                  className="w-7 h-7 rounded flex items-center justify-center hover:bg-white hover:text-\[#0087FF\] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-bold"
                >
                  \+
                </button>
                <span className="text-xs text-gray-600">nights</span>
              </div>
            </div>
          \)\}'''

content = re.sub(mobile_duration_pattern, '', content, flags=re.DOTALL)

# Write the modified content
with open('components/flights/EnhancedSearchBar.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: Flexible dates and trip duration controls removed from EnhancedSearchBar.tsx")
