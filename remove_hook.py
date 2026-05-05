import glob
import re

files = glob.glob('src/routes/solusi/*/+page.svelte')

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    # Remove hook and desc from the product card
    content = re.sub(
        r'\s*<p class="text-sm font-medium italic text-white/90 mb-3 line-clamp-2">\s*"{product.hook}"\s*</p>\s*<p class="text-sm leading-relaxed text-white/60 mb-6 line-clamp-2 group-hover:line-clamp-none transition-all duration-500">\s*\{product\.desc\}\s*</p>',
        '',
        content
    )
    
    with open(file, 'w') as f:
        f.write(content)

print("Done")
