<script lang="ts">
	import { onMount } from 'svelte';
	import { ArrowRight, Check, MessageCircle, Download, ChevronRight, Cloud, Sun, Wind, Thermometer, Wifi, ShieldCheck } from '@lucide/svelte';
	import Ornaments from '$lib/components/Ornaments.svelte';
	import ProductSpecs from '$lib/components/ProductSpecs.svelte';

	let { data } = $props();

	let mounted = $state(false);
	onMount(() => { mounted = true; });

	let activeVariant = $state(0);

	const fallbackVariants = [
		{ name: 'BW-700', subtitle: 'Full AWS Station', desc: 'Stasiun cuaca otomatis lengkap dengan 7+ parameter. Tiang met-tower, sensor suite, data logger, dan panel surya — siap pasang.', use: 'Bandara, pertanian skala besar, BMKG, bendungan' ,
		specs: [
		{ label: 'Suhu Udara', value: '-40°C – +60°C (±0.3°C)' },
		{ label: 'Kelembaban Relatif', value: '0 – 100% RH (±2%)' },
		{ label: 'Tekanan Udara', value: '300 – 1100 hPa (±0.5)' },
		{ label: 'Kec. Angin', value: '0 – 60 m/s (±0.3 m/s)' },
		{ label: 'Arah Angin', value: '0 – 360° (±3°)' },
		{ label: 'Radiasi Matahari', value: '0 – 1500 W/m² (±5%)' },
		{ label: 'Curah Hujan', value: '0 – 500 mm/jam (±0.2mm)' },
		{ label: 'Interval Data', value: '1 – 60 menit' },
		{ label: 'Komunikasi', value: '4G/LTE, GSM, Satellite' },
		{ label: 'Power Supply', value: 'Solar Panel + Battery' },
		{ label: 'Platform', value: 'STESY Integration' },
		{ label: 'Standar', value: 'WMO / BMKG Compatible' }
	]
	},
		{ name: 'BW-710', subtitle: 'Compact AWS', desc: 'Stasiun cuaca kompak dengan parameter esensial: suhu, kelembaban, curah hujan, dan angin. Form factor mini untuk instalasi cepat.', use: 'Perkebunan, pos hujan, sekolah lapang, riset' ,
		specs: [
		{ label: 'Suhu Udara', value: '-40°C – +60°C (±0.3°C)' },
		{ label: 'Kelembaban Relatif', value: '0 – 100% RH (±2%)' },
		{ label: 'Tekanan Udara', value: '300 – 1100 hPa (±0.5)' },
		{ label: 'Kec. Angin', value: '0 – 60 m/s (±0.3 m/s)' },
		{ label: 'Arah Angin', value: '0 – 360° (±3°)' },
		{ label: 'Radiasi Matahari', value: '0 – 1500 W/m² (±5%)' },
		{ label: 'Curah Hujan', value: '0 – 500 mm/jam (±0.2mm)' },
		{ label: 'Interval Data', value: '1 – 60 menit' },
		{ label: 'Komunikasi', value: '4G/LTE, GSM, Satellite' },
		{ label: 'Power Supply', value: 'Solar Panel + Battery' },
		{ label: 'Platform', value: 'STESY Integration' },
		{ label: 'Standar', value: 'WMO / BMKG Compatible' }
	]
	}
	];

	// API data wins: use products from DB, fallback to static when DB has no products
	const variants = $derived(
		data.subSolutionDetail?.products && data.subSolutionDetail.products.length > 0
			? data.subSolutionDetail.products.map((p: any) => ({
				name: p.name,
				subtitle: p.use_case ?? '',
				desc: p.description ?? '',
				use: p.use_case ?? '',
				image: p.main_image ?? p.thumbnail ?? null,
				brochure_pdf: p.brochure_pdf ?? null,
				specs: Array.isArray(p.highlight_points)
					? p.highlight_points.map((pt: string, i: number) => ({ label: `Fitur ${i + 1}`, value: pt }))
					: [],
				components: Array.isArray(p.components) ? p.components : []
			}))
			: fallbackVariants
	);

	const useCases = [
		'Pertanian presisi yang bergantung pada data cuaca akurat',
		'Bandara dan helipad yang memerlukan data aviasi real-time',
		'Bendungan yang wajib mencatat data klimatologi harian',
		'Perkebunan sawit dan karet dengan area ribuan hektar',
		'Proyek IKN dan infrastruktur skala nasional'
	];

	const fallbackProjects = [
		{ name: 'BMKG Stasiun Tangerang', client: 'BMKG', year: '2023' },
		{ name: 'Perkebunan Sawit Kaltim', client: 'PT Sawit Nusantara', year: '2024' },
		{ name: 'Bendungan Margatiga', client: 'BWS Mesuji-Sekampung', year: '2023' },
		{ name: 'IKN Area Sepaku', client: 'OIKN', year: '2024' }
	];

	// API data wins: use track records from DB, fallback to static
	const projects = $derived(
		data.subSolutionDetail?.track_records && data.subSolutionDetail.track_records.length > 0
			? data.subSolutionDetail.track_records.map((tr: any) => ({
				name: tr.project_name,
				client: tr.client,
				year: tr.year
			}))
			: fallbackProjects
	);


	const features = [
		{ title: 'Multi-Parameter', desc: '7+ parameter cuaca direkam simultan dari satu stasiun: suhu, kelembaban, angin, tekanan, radiasi, hujan.', icon: Cloud },
		{ title: 'WMO Compatible', desc: 'Spesifikasi sensor sesuai standar World Meteorological Organization — data Anda diterima di level internasional.', icon: Check },
		{ title: 'Solar Independent', desc: 'Beroperasi mandiri dengan panel surya dan baterai lithium. Tidak butuh listrik PLN di lokasi remote.', icon: Sun },
		{ title: 'Tahan Angin Kencang', desc: 'Met-tower dan sensor suite dirancang tahan angin hingga 60 m/s. Stabil di cuaca ekstrem Indonesia.', icon: Wind },
		{ title: 'Real-time ke STESY', desc: 'Data dikirim setiap menit ke dashboard STESY. Akses dari smartphone, tablet, atau desktop.', icon: Wifi },
		{ title: 'Tahan Iklim Tropis', desc: 'Semua sensor IP65+, anti-korosi, teruji di suhu dan kelembaban tinggi khas Indonesia.', icon: ShieldCheck }
	];
</script>

<svelte:head>
	<title>AWR — Automatic Weather Recorder — Beacon Engineering</title>
	<meta name="description" content="AWR Beacon Engineering: stasiun cuaca otomatis multi-parameter, WMO compatible, terintegrasi STESY." />
</svelte:head>

<!-- Breadcrumb -->
<div class="bg-[#FAFAFA] border-b" style="border-color: #E5E5E5;">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
		<nav class="flex items-center gap-1.5 text-xs" style="color: #9A9A9A;">
			<a href="/" class="hover:text-[#C8102E] transition-colors">Beranda</a>
			<ChevronRight size={11} />
			<a href="/solusi" class="hover:text-[#C8102E] transition-colors">Solusi</a>
			<ChevronRight size={11} />
			<a href="/solusi/weather-forecast" class="hover:text-[#C8102E] transition-colors">Weather Forecast</a>
			<ChevronRight size={11} />
			<span style="color: #6366F1;" class="font-medium">AWR</span>
		</nav>
	</div>
</div>

<!-- Hero -->
<section class="relative pt-24 pb-16 lg:pt-32 lg:pb-24 bg-[#FAFAFA] border-b border-[#E5E5E5] overflow-hidden">
	<!-- Subtle Grid Pattern -->
	<div class="absolute inset-0 z-0 opacity-[0.03]" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>
	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid lg:grid-cols-2 gap-12 items-center">
			<div class="space-y-6">
				<div class="flex items-center gap-2">
					<span class="text-xs font-semibold uppercase tracking-widest" style="color: #6366F1;">Weather Forecast</span>
					<span style="color: #E5E5E5;">·</span>
					<span class="text-xs" style="color: #9A9A9A;">AWS Station</span>
				</div>
				<h1
					class="font-heading text-3xl sm:text-4xl lg:text-[52px] font-extrabold leading-tight"
					style="letter-spacing: -0.03em; color: #1A1A1A; opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 20}px); transition: all 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s;"
				>
					Data Cuaca Akurat <span style="color: #C8102E;">Setiap Menit</span>
				</h1>
				<div>
					<span class="font-heading text-xl font-bold" style="color: #1A1A1A;">AWR</span>
					<span class="text-sm ml-2" style="color: #5C5C5C;">— Automatic Weather Recorder</span>
				</div>
				<p class="text-base leading-relaxed" style="color: #5C5C5C;">
					Cuaca tidak bisa dilawan, tapi bisa diprediksi — dengan data akurat setiap menit. Stasiun cuaca otomatis 7+ parameter, standar WMO, terintegrasi STESY.
				</p>
				<div class="flex flex-wrap gap-3">
					<a href="https://wa.me/628112850986?text=Halo%20Beacon%2C%20saya%20ingin%20konsultasi%20tentang%20AWR." target="_blank" rel="noopener"
						class="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] text-sm font-semibold text-white transition-all hover:scale-[1.02]"
						style="background: linear-gradient(135deg, #C8102E, #A50D25); box-shadow: 0 4px 12px rgba(200,16,46,0.25);">
						<MessageCircle size={15} />
						Konsultasi AWR
					</a>
					<button class="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] text-sm font-semibold transition-all hover:bg-[#EDE9FE]" style="border: 1.5px solid #E5E5E5; color: #1A1A1A;">
						<Download size={15} />
						Download Datasheet
					</button>
				</div>
			</div>

			<div class="relative flex justify-center">
				<div class="relative w-64 h-80 rounded-3xl overflow-hidden" style="background: linear-gradient(180deg, #6366F1 0%, #4338CA 100%); box-shadow: 0 20px 60px rgba(99,102,241,0.2);">
					<div class="absolute inset-0 flex flex-col items-center justify-center p-6 text-white">
						<Cloud size={48} class="mb-4 opacity-80" />
						<span class="font-heading text-3xl font-extrabold">AWR</span>
						<span class="text-xs mt-1 opacity-70 uppercase tracking-widest">BW-700</span>
						<div class="mt-6 w-full space-y-2">
							<div class="flex justify-between text-xs opacity-80">
								<span>Temp</span>
								<span class="font-mono tabular-nums">28.4°C</span>
							</div>
							<div class="flex justify-between text-xs opacity-80">
								<span>Wind</span>
								<span class="font-mono tabular-nums">12.3 km/h NW</span>
							</div>
							<div class="flex justify-between text-xs opacity-80">
								<span>Status</span>
								<span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>Online</span>
							</div>
						</div>
					</div>
				</div>
				<div class="absolute -bottom-3 -right-3 px-4 py-2 rounded-xl bg-white text-xs font-semibold" style="border: 1px solid #E5E5E5; box-shadow: 0 4px 12px rgba(0,0,0,0.06); color: #6366F1;">
					WMO Compatible
				</div>
			</div>
		</div>
	</div>

</section>

<!-- Use Cases -->
<section class="relative py-16 lg:py-20 bg-white overflow-hidden">
	<Ornaments />
	<div class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
		<h2 class="font-heading text-2xl sm:text-3xl font-bold mb-8" style="color: #1A1A1A;">Untuk Anda yang Bertanggung Jawab Atas...</h2>
		<div class="flex flex-wrap justify-center gap-3">
			{#each useCases as useCase}
				<div class="px-5 py-3 rounded-xl text-sm font-medium bg-[#FAFAFA] transition-all hover:bg-[#EDE9FE] hover:-translate-y-0.5" style="border: 1px solid #E5E5E5; color: #3A3A3A;">
					{useCase}
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Features -->
<section class="relative py-16 lg:py-24 overflow-hidden" style="background: linear-gradient(180deg, #FAFAFA 0%, #FFF5F6 100%);">
	<Ornaments variant="dense" />
	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-12">
			<span class="text-xs font-semibold uppercase tracking-widest" style="color: #6366F1;">Keunggulan</span>
			<h2 class="font-heading text-3xl sm:text-4xl font-bold mt-3" style="color: #1A1A1A;">Mengapa AWR Beacon</h2>
		</div>
		<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each features as feat, i}
				<div
					class="group p-6 rounded-2xl bg-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
					style="border: 1px solid #E5E5E5; opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 24}px); transition: opacity 0.6s ease-out {0.3 + i * 0.08}s, transform 0.6s ease-out {0.3 + i * 0.08}s, box-shadow 0.3s;"
				>
					<div class="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110" style="background: #EDE9FE;">
						<svelte:component this={feat.icon} size={18} style="color: #6366F1;" />
					</div>
					<h3 class="font-heading text-base font-bold mb-2 group-hover:text-[#6366F1] transition-colors" style="color: #1A1A1A;">{feat.title}</h3>
					<p class="text-sm leading-relaxed" style="color: #5C5C5C;">{feat.desc}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Interactive Variant & Specs Explorer (SKILL: Bento 2.0 & Contextual UI) -->
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
					<span class="block text-[11px] font-semibold uppercase tracking-widest mt-1 transition-colors duration-300 {activeVariant === i ? 'text-white/80' : 'text-zinc-400'}">{v.subtitle || 'Varian ' + v.name}</span>
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
								<span class="text-sm font-bold text-zinc-950">{variants[activeVariant].use || 'Berbagai kebutuhan'}</span>
							</div>

							<!-- Image Viewer -->
							<div class="relative h-72 sm:h-80 w-full rounded-3xl overflow-hidden bg-white/50 border border-[#E5E5E5] flex items-center justify-center p-8 group-hover/card:bg-white transition-colors duration-500">
								{#if variants[activeVariant].image}
									<img src={variants[activeVariant].image} alt="Varian {variants[activeVariant].name}" class="w-full h-full object-contain transition-transform duration-700 group-hover/card:scale-110 drop-shadow-2xl" />
								{:else}
									<div class="w-full h-full flex flex-col items-center justify-center">
										<div class="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
											<span class="font-heading text-xl font-bold text-zinc-400">{variants[activeVariant].name}</span>
										</div>
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

						<ProductSpecs {variants} {activeVariant} />
					</div>

				</div>
			{/key}
		</div>
	</div>
</section>

<!-- Track Record -->
<section class="relative py-16 lg:py-20 bg-white overflow-hidden">
	<Ornaments />
	<div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-10">
			<span class="text-xs font-semibold uppercase tracking-widest" style="color: #6366F1;">Track Record</span>
			<h2 class="font-heading text-3xl font-bold mt-3" style="color: #1A1A1A;">Sudah Terpasang Di</h2>
		</div>
		<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{#each projects as proj}
				<div class="p-5 rounded-2xl bg-[#FAFAFA] hover:bg-[#EDE9FE] transition-all" style="border: 1px solid #E5E5E5;">
					<div class="flex items-center gap-2 mb-2">
						<span class="text-[10px] font-semibold px-2 py-0.5 rounded-md text-white tabular-nums" style="background: #6366F1;">{proj.year}</span>
						<div class="w-1.5 h-1.5 rounded-full bg-[#1B7F3A] animate-pulse-dot"></div>
					</div>
					<h3 class="font-heading text-sm font-bold" style="color: #1A1A1A;">{proj.name}</h3>
					<p class="text-xs mt-1" style="color: #5C5C5C;">{proj.client}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Premium Floating CTA (SKILL: Cockpit Mode) -->
<section class="relative py-20 bg-white">
	<div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
		<div class="relative overflow-hidden rounded-[2.5rem] bg-zinc-950 p-10 sm:p-16 lg:p-20 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-12 group" style="box-shadow: 0 40px 80px -20px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.05);">
			
			<!-- Subtle glow / Liquid Glass refraction -->
			<div class="absolute inset-0 bg-gradient-to-br from-[#C8102E]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"></div>
			<div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#C8102E]/10 blur-3xl pointer-events-none z-0"></div>

			<div class="relative z-10 text-center lg:text-left flex-1 max-w-2xl">
				<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6" style="background: rgba(200,16,46,0.15); color: #FF4D6D; border: 1px solid rgba(200,16,46,0.3);">
					<span class="w-1.5 h-1.5 rounded-full" style="background: #FF4D6D; box-shadow: 0 0 10px #FF4D6D;"></span>
					Next Step
				</span>
				<h2 class="font-heading text-4xl sm:text-5xl font-extrabold text-white tracking-tighter mb-4">Mulai Proyek dengan AWR</h2>
				<p class="text-lg text-zinc-400 font-medium">Tim engineer kami akan merancang arsitektur telemetri yang tepat dan menghitung kebutuhan riil proyek Anda.</p>
			</div>

			<div class="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto shrink-0">
				<a href="https://wa.me/628112850986?text=Halo%20Beacon%2C%20saya%20ingin%20konsultasi%20tentang%20AWR%20untuk%20proyek%20saya." target="_blank" rel="noopener"
					class="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-zinc-950 bg-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] btn-tactile">
					<MessageCircle size={18} />
					Konsultasi AWR
				</a>
				<a href="/solusi/weather-forecast" class="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white transition-all hover:bg-zinc-800 btn-tactile" style="border: 1px solid rgba(255,255,255,0.15);">
					<ArrowRight size={18} />
					Jelajahi Produk Lain
				</a>
			</div>
		</div>
	</div>
</section>
