import re

with open('src/lib/components/Header.svelte', 'r') as f:
    content = f.read()

# 1. Add import
if "import { page } from '$app/stores';" not in content:
    content = content.replace("import { onMount } from 'svelte';", "import { onMount } from 'svelte';\n\timport { page } from '$app/stores';")


# 2. Update Beranda
content = content.replace(
    """<a href="/" class="px-4 py-2.5 rounded-full text-sm font-semibold text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80 transition-all">""",
    """<a href="/" class="px-4 py-2.5 rounded-full text-sm font-semibold transition-all {$page.url.pathname === '/' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80'}">"""
)

# 3. Update Proyek
content = content.replace(
    """<a href="/proyek" class="px-4 py-2.5 rounded-full text-sm font-semibold text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80 transition-all">""",
    """<a href="/proyek" class="px-4 py-2.5 rounded-full text-sm font-semibold transition-all {$page.url.pathname.startsWith('/proyek') ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80'}">"""
)

# 4. Update Kontak
content = content.replace(
    """<a href="/kontak" class="px-4 py-2.5 rounded-full text-sm font-semibold text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80 transition-all">""",
    """<a href="/kontak" class="px-4 py-2.5 rounded-full text-sm font-semibold transition-all {$page.url.pathname.startsWith('/kontak') ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80'}">"""
)

# 5. Update Solusi
content = content.replace(
    """class="px-4 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 {activeMegaMenu === 'solusi' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80'}\"""",
    """class="px-4 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 {$page.url.pathname.startsWith('/solusi') || activeMegaMenu === 'solusi' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80'}\""""
)

# 6. Update Tentang
content = content.replace(
    """class="px-4 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 {activeMegaMenu === 'tentang' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80'}\"""",
    """class="px-4 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 {$page.url.pathname.startsWith('/tentang') || activeMegaMenu === 'tentang' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80'}\""""
)

# 7. Update Wawasan
content = content.replace(
    """class="px-4 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 {activeMegaMenu === 'wawasan' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80'}\"""",
    """class="px-4 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 {$page.url.pathname.startsWith('/wawasan') || activeMegaMenu === 'wawasan' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80'}\""""
)

with open('src/lib/components/Header.svelte', 'w') as f:
    f.write(content)

print("Done")
