import re

with open('src/routes/solusi/water-security/awlr/+page.svelte', 'r') as f:
    content = f.read()

# 1. Replace the data arrays in script
old_data = """	const specs = [
		{ label: 'Range Pengukuran', value: '0 – 30 m' },
		{ label: 'Akurasi', value: '±1 mm' },
		{ label: 'Resolusi', value: '0.1 mm' },
		{ label: 'Tipe Sensor', value: 'Pressure transducer' },
		{ label: 'Proteksi', value: 'IP68' },
		{ label: 'Interval Data', value: '1 – 60 menit (konfigurabel)' },
		{ label: 'Komunikasi', value: '4G/LTE, GSM, Satellite' },
		{ label: 'Power Supply', value: 'Solar Panel + Battery' },
		{ label: 'Kapasitas Logger', value: '100.000+ data points' },
		{ label: 'Operasi Suhu', value: '-20°C sampai +60°C' },
		{ label: 'Platform', value: 'STESY Integration' },
		{ label: 'Standar', value: 'SNI Compliant' }
	];

	const variants = [
		{ name: 'BL-1100', desc: 'Varian utama untuk pos hidrologi bendungan dan sungai besar. Full feature, multi-sensor.', use: 'Bendungan, sungai besar, DAS utama', image: productImage },
		{ name: 'BL-110', desc: 'Varian kompak untuk sumur pantau, saluran irigasi, dan titik monitoring terdistribusi.', use: 'Sumur pantau, irigasi, monitoring terdistribusi', image: null }
	];"""

new_data = """	let activeVariant = $state(0);

	const variants = [
		{ 
			name: 'BL-1100', 
			subtitle: 'Professional Grade',
			desc: 'Varian utama untuk pos hidrologi bendungan dan sungai besar. Mendukung sensor presisi tinggi dan redundansi telemetri untuk critical infrastructure.', 
			use: 'Bendungan, sungai besar, DAS utama', 
			image: productImage,
			specs: [
				{ label: 'Range Pengukuran', value: '0 – 30 m' },
				{ label: 'Akurasi', value: '±1 mm' },
				{ label: 'Resolusi', value: '0.1 mm' },
				{ label: 'Tipe Sensor', value: 'Pressure transducer' },
				{ label: 'Proteksi', value: 'IP68 (Submersible)' },
				{ label: 'Interval Data', value: '1 – 60 menit' },
				{ label: 'Komunikasi', value: '4G/LTE, GSM, Satellite' },
				{ label: 'Power Supply', value: '100W Solar + 100Ah Battery' }
			]
		},
		{ 
			name: 'BL-110', 
			subtitle: 'Compact Node',
			desc: 'Varian kompak dan efisien untuk sumur pantau, saluran irigasi, dan titik monitoring hidrologi yang tersebar massal.', 
			use: 'Sumur pantau, irigasi, monitoring massal', 
			image: null,
			specs: [
				{ label: 'Range Pengukuran', value: '0 – 10 m' },
				{ label: 'Akurasi', value: '±3 mm' },
				{ label: 'Resolusi', value: '1 mm' },
				{ label: 'Tipe Sensor', value: 'Ultrasonic / Pressure' },
				{ label: 'Proteksi', value: 'IP67' },
				{ label: 'Interval Data', value: '5 – 60 menit' },
				{ label: 'Komunikasi', value: 'NB-IoT / GSM' },
				{ label: 'Power Supply', value: '20W Solar + 12Ah Battery' }
			]
		}
	];"""

content = content.replace(old_data, new_data)

# 2. Extract out old "Spesifikasi Teknis" and "Varian" UI
# Note: we can use regex to find the specific sections and delete them, then insert the new combined section.
# The old specs start with: <!-- Spesifikasi Teknis -->
# The old variants end before: <!-- Sudah Terpasang Di -->

import re
pattern = r'<!-- Spesifikasi Teknis -->.*?<!-- Sudah Terpasang Di -->'

new_ui = """<!-- Interactive Variant & Specs Explorer (SKILL: Bento 2.0 & Contextual UI) -->
<section class="relative py-24 lg:py-32 overflow-hidden bg-white">
	<Ornaments variant="dense" />
	<div class="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
		<div class="max-w-4xl mb-12 space-y-6 text-center mx-auto">
			<div class="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mx-auto" style="background: rgba(200,16,46,0.08); color: #C8102E; border: 1px solid rgba(200,16,46,0.15);">
				<span class="w-1.5 h-1.5 rounded-full" style="background: #C8102E;"></span>
				Varian & Spesifikasi
			</div>
			<h2 class="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tighter text-zinc-950">
				Pilih <span style="color: #C8102E;">Varian</span> yang <span class="text-zinc-400">Tepat</span>
			</h2>
		</div>

		<!-- Variant Selector Tabs -->
		<div class="flex flex-wrap items-center justify-center gap-4 mb-16">
			{#each variants as v, i}
				<button 
					onclick={() => activeVariant = i}
					class="group px-8 py-4 rounded-[1.25rem] text-left transition-all duration-500 min-w-[260px] cursor-pointer {activeVariant === i ? 'bg-[#C8102E] text-white shadow-[0_20px_40px_-15px_rgba(200,16,46,0.4)] -translate-y-1' : 'bg-[#FAFAFA] text-zinc-500 hover:bg-[#FBE9EC] hover:text-[#C8102E] border border-[#E5E5E5]'}"
				>
					<span class="block font-heading text-2xl font-extrabold transition-colors duration-300 {activeVariant === i ? 'text-white' : 'text-zinc-900 group-hover:text-[#C8102E]'}">{v.name}</span>
					<span class="block text-[11px] font-semibold uppercase tracking-widest mt-1 transition-colors duration-300 {activeVariant === i ? 'text-white/80' : 'text-zinc-400'}">{v.subtitle}</span>
				</button>
			{/each}
		</div>

		<!-- Active Variant Display -->
		<div class="relative min-h-[600px]">
			{#key activeVariant}
				<div class="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-start animate-in fade-in slide-in-from-bottom-8 duration-500">
					
					<!-- Left: Variant Info & Image -->
					<div class="space-y-8">
						<div class="p-8 sm:p-10 rounded-[2.5rem] bg-[#FAFAFA] border border-[#E5E5E5] relative overflow-hidden group/card shadow-sm">
							<!-- Subtle liquid shine -->
							<div class="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent pointer-events-none z-0"></div>
							
							<h3 class="relative z-10 font-heading text-4xl font-extrabold text-[#C8102E] tracking-tight mb-4">{variants[activeVariant].name}</h3>
							<p class="relative z-10 text-lg leading-relaxed text-zinc-600 font-medium mb-8 max-w-[40ch]">{variants[activeVariant].desc}</p>
							
							<div class="relative z-10 mb-10 inline-flex flex-col sm:flex-row sm:items-center gap-3 bg-white px-5 py-3.5 rounded-2xl border border-[#E5E5E5] shadow-sm">
								<span class="inline-flex text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">Cocok Untuk</span>
								<span class="text-sm font-bold text-zinc-950">{variants[activeVariant].use}</span>
							</div>

							<!-- Image Viewer -->
							<div class="relative h-72 sm:h-80 w-full rounded-3xl overflow-hidden bg-white/50 border border-[#E5E5E5] flex items-center justify-center p-8 group-hover/card:bg-white transition-colors duration-500">
								{#if variants[activeVariant].image}
									<img src={variants[activeVariant].image} alt="Varian {variants[activeVariant].name}" class="w-full h-full object-contain transition-transform duration-700 group-hover/card:scale-110 drop-shadow-2xl" />
								{:else}
									<div class="w-full h-full flex flex-col items-center justify-center">
										<Waves size={32} class="text-zinc-300 mb-2" />
										<span class="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Gambar Menyusul</span>
									</div>
								{/if}
								<div class="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
							</div>
						</div>
					</div>

					<!-- Right: Technical Specs for this variant -->
					<div class="space-y-6 pt-4">
						<div class="flex items-center justify-between mb-4">
							<h3 class="font-heading text-2xl font-bold text-zinc-950">Spesifikasi Teknis</h3>
							<span class="px-3 py-1 rounded-lg bg-zinc-100 text-xs font-bold text-zinc-500 font-mono border border-zinc-200">{variants[activeVariant].name}</span>
						</div>
						
						<!-- Bento Style Specs Table -->
						<div class="rounded-[2rem] overflow-hidden border border-[#E5E5E5] bg-white shadow-sm">
							{#each variants[activeVariant].specs as spec, idx}
								<div class="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 transition-colors hover:bg-[#FAFAFA] {idx !== variants[activeVariant].specs.length - 1 ? 'border-b border-[#E5E5E5]' : ''}">
									<span class="text-sm font-medium text-zinc-500 mb-1 sm:mb-0">{spec.label}</span>
									<span class="text-sm font-semibold font-mono text-zinc-950 bg-zinc-50 px-3 py-1.5 rounded-xl border border-[#E5E5E5]">{spec.value}</span>
								</div>
							{/each}
						</div>
						
						<div class="pt-6">
							<button class="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0 btn-tactile" style="background: #FBE9EC; border: 1px solid #F8D7DC; color: #C8102E; box-shadow: 0 4px 12px rgba(200,16,46,0.05);">
								<Download size={16} />
								Download Datasheet {variants[activeVariant].name}
							</button>
						</div>
					</div>

				</div>
			{/key}
		</div>
	</div>
</section>

<!-- Sudah Terpasang Di -->"""

content = re.sub(pattern, new_ui, content, flags=re.DOTALL)

with open('src/routes/solusi/water-security/awlr/+page.svelte', 'w') as f:
    f.write(content)

print("Done AWLR refactor")
