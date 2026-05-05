import os
import re
import glob

# Paths to process
pattern = '/Users/artacomunindo/Documents/WEBSITE_SOFTWARE/Q1_2026/be-jogja2/beacon-compro/src/routes/solusi/*/*/+page.svelte'
files = glob.glob(pattern)

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content
    
    # 1. Replace section class and style
    # E.g., <section class="relative py-16 lg:py-28 overflow-hidden" style="background: linear-gradient(165deg, ...)">
    sec_pattern = re.compile(r'<section class="relative py-16 lg:py-28 overflow-hidden"\s+style="background:\s*linear-gradient[^"]+">')
    
    new_sec = '<section class="relative pt-24 pb-16 lg:pt-32 lg:pb-24 bg-[#FAFAFA] border-b border-[#E5E5E5] overflow-hidden">\n\t<!-- Subtle Grid Pattern -->\n\t<div class="absolute inset-0 z-0 opacity-[0.03]" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>'
    content = sec_pattern.sub(new_sec, content)
    
    # 2. Remove <Ornaments variant="hero" />
    content = re.sub(r'\t<Ornaments variant="hero" />\n\n?', '', content)
    
    # 3. Remove SVG wave at bottom of section
    svg_pattern = re.compile(r'\t<div class="absolute bottom-0 left-0 right-0 pointer-events-none"[^>]*>\n\t\t<svg viewBox="0 0 1440 50".*?</svg>\n\t</div>\n', re.DOTALL)
    content = svg_pattern.sub('', content)

    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated: {filepath}")
    else:
        print(f"No changes for: {filepath}")

for f in files:
    process_file(f)

