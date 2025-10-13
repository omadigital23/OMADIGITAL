import json
import re

# Read the i18n.ts file
with open('src/lib/i18n.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract French translations
fr_match = re.search(r'const frTranslations = \{[\s\S]*?translation: (\{[\s\S]*?\n  \}\n)\};', content)
fr_text = fr_match.group(1) if fr_match else '{}'

# Extract English translations
en_match = re.search(r'const enTranslations = \{[\s\S]*?translation: (\{[\s\S]*?\n  \}\n)\};', content)
en_text = en_match.group(1) if en_match else '{}'

def parse_translations(text):
    """Parse JavaScript object to Python dict"""
    translations = {}
    
    # Find all key-value pairs
    pattern = r"'([^']+)':\s*(?:'([^']*(?:\\'[^']*)*)'|\{[^}]*\})"
    matches = re.findall(pattern, text)
    
    for key, value in matches:
        # Unescape single quotes
        value = value.replace("\\'", "'")
        translations[key] = value
    
    # Handle nested objects (like blog.categories)
    nested_pattern = r"'([^']+)':\s*\{([^}]+)\}"
    nested_matches = re.findall(nested_pattern, text)
    
    for key, nested_content in nested_matches:
        nested_dict = {}
        nested_pairs = re.findall(r"'([^']+)':\s*'([^']*(?:\\'[^']*)*)'", nested_content)
        for nested_key, nested_value in nested_pairs:
            nested_value = nested_value.replace("\\'", "'")
            nested_dict[nested_key] = nested_value
        translations[key] = nested_dict
    
    return translations

# Parse translations
fr_translations = parse_translations(fr_text)
en_translations = parse_translations(en_text)

# Write to JSON files
with open('public/locales/fr/common.json', 'w', encoding='utf-8') as f:
    json.dump(fr_translations, f, ensure_ascii=False, indent=2)

with open('public/locales/en/common.json', 'w', encoding='utf-8') as f:
    json.dump(en_translations, f, ensure_ascii=False, indent=2)

print(f"✅ Created French translations: {len(fr_translations)} keys")
print(f"✅ Created English translations: {len(en_translations)} keys")
