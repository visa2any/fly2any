import re

# Read the file
with open('components/flights/EnhancedSearchBar.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the extra closing div tag issue (lines 789-791)
content = re.sub(
    r'(                  />)\n(                </div>)\n\n(              </div>)\n(            </div>)',
    r'\1\n\2\n\4',
    content
)

# Write the fixed content
with open('components/flights/EnhancedSearchBar.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: Fixed syntax error")
