import re

with open('src/lib/components/Header.svelte', 'r') as f:
    content = f.read()

# Replace Top Utility Bar
top_bar_old = """<!-- Top Utility Bar -->
<div
	class="relative z-50 transition-all duration-300"
	class:glass-top-bar={scrollY > 50}
>
	<div
		class="w-full text-white text-xs"
		style="background: {scrollY > 50 ? 'rgba(200,16,46,0.85)' : '#C8102E'}; backdrop-filter: {scrollY > 50 ? 'blur(12px)' : 'none'};"
	>
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-8">
			<span class="hidden sm:inline font-medium tracking-wide" style="font-size: 11px;">
				Sistem Telemetri Buatan Indonesia · Sejak 2013
			</span>
			<div class="flex items-center gap-4 text-[11px] ml-auto sm:ml-0">
				<a href="tel:02744986899" class="flex items-center gap-1 hover:opacity-80 transition-opacity">
					<Phone size={11} />
					<span class="hidden md:inline">(0274) 4986899</span>
				</a>
				<a href="https://wa.me/628112850986" class="flex items-center gap-1 hover:opacity-80 transition-opacity">
					<MessageCircle size={11} />
					<span>WA 0811-2850-9986</span>
				</a>
				<a href="mailto:info@bejogja.com" class="hidden lg:flex items-center gap-1 hover:opacity-80 transition-opacity">
					<Mail size={11} />
					<span>info@bejogja.com</span>
				</a>
			</div>
		</div>
	</div>
</div>"""

top_bar_new = """<!-- Top Utility Bar — SKILL: Cockpit Mode & Liquid Glass -->
<div class="relative z-50 transition-all duration-300 border-b border-white/5" style="background: {scrollY > 50 ? 'rgba(26,26,26,0.85)' : 'linear-gradient(90deg, #1A1A1A 0%, #2D0A10 100%)'}; backdrop-filter: {scrollY > 50 ? 'blur(12px)' : 'none'};">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-9">
		<span class="hidden sm:inline font-mono font-bold tracking-[0.15em] text-[10px] text-zinc-400 uppercase">
			Sistem Telemetri Buatan Indonesia · Sejak 2013
		</span>
		<div class="flex items-center gap-5 text-[11px] font-medium text-zinc-300 ml-auto sm:ml-0">
			<a href="tel:02744986899" class="flex items-center gap-1.5 hover:text-white transition-colors">
				<Phone size={12} class="text-[#C8102E]" />
				<span class="hidden md:inline tabular-nums">(0274) 4986899</span>
			</a>
			<a href="https://wa.me/628112850986" class="flex items-center gap-1.5 hover:text-white transition-colors">
				<MessageCircle size={12} class="text-[#C8102E]" />
				<span class="tabular-nums">WA 0811-2850-9986</span>
			</a>
			<a href="mailto:info@bejogja.com" class="hidden lg:flex items-center gap-1.5 hover:text-white transition-colors">
				<Mail size={12} class="text-[#C8102E]" />
				<span>info@bejogja.com</span>
			</a>
		</div>
	</div>
</div>"""
content = content.replace(top_bar_old, top_bar_new)


# Replace Main Header definition
main_old = """<!-- Main Header -->
<header
	class="sticky top-0 z-40 w-full transition-all duration-300"
	style="
		background: {scrollY > 50 ? 'rgba(255,255,255,0.75)' : '#FFFFFF'};
		backdrop-filter: {scrollY > 50 ? 'blur(20px) saturate(180%)' : 'none'};
		box-shadow: {scrollY > 50 ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'};
	"
>
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between transition-all duration-300" style="height: {scrollY > 50 ? '64px' : '72px'};">
			<!-- Logo -->
			<a href="/" class="flex items-center gap-3 shrink-0">
				<img src={logoBeacon} alt="Beacon Engineering" class="transition-all duration-300" style="height: {scrollY > 50 ? '32px' : '40px'}; width: auto;" />
			</a>

			<!-- Desktop Navigation -->
			<nav class="hidden lg:flex items-center gap-1">"""

main_new = """<!-- Main Header — SKILL: Liquid Glass & Pill Nav -->
<header
	class="sticky top-0 z-40 w-full transition-all duration-300"
	style="
		background: {scrollY > 50 ? 'rgba(255,255,255,0.85)' : '#FFFFFF'};
		backdrop-filter: {scrollY > 50 ? 'blur(24px) saturate(200%)' : 'none'};
		border-bottom: 1px solid {scrollY > 50 ? 'rgba(229,229,229,0.8)' : '#E5E5E5'};
		box-shadow: {scrollY > 50 ? '0 20px 40px -20px rgba(0,0,0,0.05)' : 'none'};
	"
>
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between transition-all duration-300" style="height: {scrollY > 50 ? '64px' : '80px'};">
			<!-- Logo -->
			<a href="/" class="flex items-center gap-3 shrink-0 group">
				<img src={logoBeacon} alt="Beacon Engineering" class="transition-all duration-300 group-hover:opacity-80" style="height: {scrollY > 50 ? '28px' : '36px'}; width: auto;" />
			</a>

			<!-- Desktop Navigation -->
			<nav class="hidden lg:flex items-center gap-0.5">"""
content = content.replace(main_old, main_new)


# Update regular Nav Links
content = content.replace(
    'class="px-4 py-2 text-sm font-medium text-[#1A1A1A] hover:text-[#C8102E] transition-colors link-hover-underline relative"',
    'class="px-4 py-2.5 rounded-full text-sm font-semibold text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80 transition-all"'
)


# Update Dropdown Nav Buttons
def replace_dropdown(match):
    name = match.group(1)
    return f"""<button
						class="px-4 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 {{activeMegaMenu === '{name}' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80'}}"
						onclick={{() => toggleMegaMenu('{name}')}}
						onmouseenter={{() => activeMegaMenu = '{name}'}}
					>"""

content = re.sub(
    r'<button\s+class="px-4 py-2 text-sm font-medium text-\[#1A1A1A\] hover:text-\[#C8102E\] transition-colors flex items-center gap-1"\s+onclick={\(\) => toggleMegaMenu\(\'(.*?)\'\)}\s+onmouseenter={\(\) => activeMegaMenu = \'.*?\'}\s+>',
    replace_dropdown,
    content
)


# Update Dropdown Icons
def replace_chevron(match):
    name = match.group(1)
    return f'<ChevronDown size={{14}} class="transition-transform duration-300 {{activeMegaMenu === \'{name}\' ? \'rotate-180 text-zinc-900\' : \'text-zinc-400\'}}" />'

content = re.sub(
    r'<ChevronDown size=\{14\} class="transition-transform duration-200 \{activeMegaMenu === \'(.*?)\' \? \'rotate-180\' : \'\'\}" />',
    replace_chevron,
    content
)


# Update Mega Menu Container (Solusi)
content = content.replace(
    """<div
							class="absolute top-full left-1/2 -translate-x-1/2 w-[720px] mt-2 p-6 rounded-2xl"
							style="background: #FFFFFF; border: 1px solid rgba(229,229,229,0.7); box-shadow: 0 20px 60px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.5);"
							onmouseleave={closeMegaMenu}
							role="menu"
						>""",
    """<div
							class="absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 w-[760px] p-8 rounded-[2rem] origin-top animate-in fade-in slide-in-from-top-4 duration-300"
							style="background: rgba(255,255,255,0.98); backdrop-filter: blur(24px); border: 1px solid rgba(229,229,229,0.8); box-shadow: 0 40px 80px -20px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.8);"
							onmouseleave={closeMegaMenu}
							role="menu"
						>"""
)

# Update Mega Menu Container (Tentang / Wawasan)
content = content.replace(
    """<div
							class="absolute top-full right-0 w-[340px] mt-2 p-4 rounded-2xl"
							style="background: #FFFFFF; border: 1px solid rgba(229,229,229,0.7); box-shadow: 0 20px 60px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.5);"
							onmouseleave={closeMegaMenu}
							role="menu"
						>""",
    """<div
							class="absolute top-[calc(100%+0.5rem)] right-0 w-[360px] p-6 rounded-[2rem] origin-top-right animate-in fade-in slide-in-from-top-4 duration-300"
							style="background: rgba(255,255,255,0.98); backdrop-filter: blur(24px); border: 1px solid rgba(229,229,229,0.8); box-shadow: 0 40px 80px -20px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.8);"
							onmouseleave={closeMegaMenu}
							role="menu"
						>"""
)


# Update Right Actions - Konsultasi Gratis Button
old_btn = """<a
					href="https://wa.me/628112850986?text=Halo%20Beacon%2C%20saya%20tertarik%20dengan%20solusi%20telemetri%20Anda."
					class="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
					style="
						background: #C8102E;
						box-shadow: 0 1px 2px rgba(200,16,46,0.1), 0 4px 12px rgba(200,16,46,0.15), inset 0 1px 0 rgba(255,255,255,0.15);
						letter-spacing: -0.01em;
					"
					target="_blank"
					rel="noopener"
				>"""

new_btn = """<a
					href="https://wa.me/628112850986?text=Halo%20Beacon%2C%20saya%20tertarik%20dengan%20solusi%20telemetri%20Anda."
					class="hidden lg:inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 btn-tactile"
					style="
						background: linear-gradient(135deg, #C8102E 0%, #A50D25 100%);
						border: 1px solid #910B20;
						box-shadow: 0 8px 20px -8px rgba(200,16,46,0.5), inset 0 1px 1px rgba(255,255,255,0.3);
						letter-spacing: -0.01em;
					"
					target="_blank"
					rel="noopener"
				>"""
content = content.replace(old_btn, new_btn)

with open('src/lib/components/Header.svelte', 'w') as f:
    f.write(content)

print("Done.")
