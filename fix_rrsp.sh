#!/bin/bash
# Fix RRSP field to be a number input instead of slider

# Create the updated index.html
python3 << 'ENDOFPYTHON'
# Read the file
with open('index.html', 'r') as f:
    content = f.read()

# Replace the RRSP slider section
content = content.replace(
    '''  <div class="input-group">
    <label data-i18n="rrspContribution">Contribution RRSP ($)</label>
    <input type="range" id="rrspSlider" min="0" max="31560" value="0" step="100" oninput="updateRrsp(this.value)">
    <div id="rrspValue">$0</div>
  </div>''',
    '''  <div class="input-group">
    <label data-i18n="rrspContribution">Contribution RRSP ($)</label>
    <input type="number" id="rrspInput" step="100" min="0" max="31560" value="0" placeholder="Ex: 5000">
    <div class="hint" data-i18n="hintRRSP">Maximum: $31,560 (2025 limit)</div>
  </div>'''
)

# Remove the updateRrsp function
import re
content = re.sub(
    r'\s*function updateRrsp\(val\) \{[^}]+\}\s*',
    '\n',
    content
)

# Update the calculate() function to use rrspInput instead of rrspSlider
content = content.replace(
    "document.getElementById('rrspSlider').value",
    "document.getElementById('rrspInput').value"
)

# Add hintRRSP to English translations
content = content.replace(
    '"rrspContribution": "RRSP Contribution ($)",',
    '"rrspContribution": "RRSP Contribution ($)",\n        hintRRSP: "Maximum: $31,560 (2025 limit)",'
)

# Add hintRRSP to French translations
content = content.replace(
    '"rrspContribution": "Contribution RRSP ($)",',
    '"rrspContribution": "Contribution RRSP ($)",\n        hintRRSP: "Maximum : 31 560 $ (limite 2025)",'
)

# Write back
with open('index.html', 'w') as f:
    f.write(content)

print("✅ Fixed RRSP field - now a number input!")
ENDOFPYTHON
