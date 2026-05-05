<script lang="ts">
	import { ArrowRight, Check, MessageCircle, Download, ChevronRight, Waves } from '@lucide/svelte';
	import Ornaments from '$lib/components/Ornaments.svelte';
	import ProductSpecs from '$lib/components/ProductSpecs.svelte';
	import productImage from '$lib/assets/product_awlr.webp';

	let { data } = $props();

	let activeVariant = $state(0);

	const fallbackVariants = [
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
		'Sistem irigasi yang harus presisi',
		'Bendungan yang tidak boleh kehilangan data sehari pun',
		'Sungai yang melayani jutaan jiwa',
		'Sumur pantau yang tersebar dan sulit diakses',
		'Pos hidrologi BBWS/BWS standar SNI'
	];

	const fallbackProjects = [
		{ name: 'Bendungan Cipanas', client: 'BWS Ciliwung-Cisadane', year: '2022' },
		{ name: 'Bendungan Sepaku IKN', client: 'BWS Kalimantan IV', year: '2024' },
		{ name: 'Bendungan Keureuto Aceh', client: 'BWS Sumatera I', year: '2023' },
		{ name: 'Sungai Bengawan Solo', client: 'BBWS Bengawan Solo', year: '2022' },
		{ name: 'DAS Bogowonto', client: 'BBWS Serayu Opak', year: '2023' }
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
		{ title: 'Akurasi Lab-Grade', desc: 'Sensor pressure transducer dengan akurasi ±1mm, melebihi standar SNI untuk pos hidrologi.' },
		{ title: 'Real-time 24/7', desc: 'Data terkirim setiap interval yang dikonfigurasi langsung ke dashboard STESY.' },
		{ title: 'Tahan Iklim Tropis', desc: 'IP68 waterproof, teruji di banjir, sungai deras, dan suhu ekstrem Indonesia.' },
		{ title: 'Solar Powered', desc: 'Panel surya + baterai backup — beroperasi tanpa listrik PLN di lokasi remote.' },
		{ title: 'Multi-Konektivitas', desc: '4G/LTE, GSM, dan opsi satelit untuk area tanpa sinyal seluler.' },
		{ title: 'Alert Otomatis', desc: 'Alarm threshold otomatis via SMS dan notifikasi STESY saat level kritis.' }
	];
</script>

<svelte:head>
	<title>AWLR — Automatic Water Level Recorder — Beacon Engineering</title>
	<meta name="description" content="AWLR Beacon Engineering: pengukuran ketinggian muka air otomatis, akurasi ±1mm, 100% online, terkirim langsung ke STESY." />
</svelte:head>

<!-- Breadcrumb -->
<div class="bg-[#FAFAFA] border-b" style="border-color: #E5E5E5;">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
		<nav class="flex items-center gap-1.5 text-xs" style="color: #9A9A9A;">
			<a href="/" class="hover:text-[#C8102E] transition-colors">Beranda</a>
			<ChevronRight size={11} />
			<a href="/solusi" class="hover:text-[#C8102E] transition-colors">Solusi</a>
			<ChevronRight size={11} />
			<a href="/solusi/water-security" class="hover:text-[#C8102E] transition-colors">Water Security</a>
			<ChevronRight size={11} />
			<span style="color: #C8102E;" class="font-medium">AWLR</span>
		</nav>
	</div>
</div>

<!-- Hero -->
<section class="relative pt-24 pb-16 lg:pt-32 lg:pb-24 bg-[#FAFAFA] border-b border-[#E5E5E5] overflow-hidden">
	<!-- Subtle Grid Pattern -->
	<div class="absolute inset-0 z-0 opacity-[0.03]" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>
	<div class="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
		<div class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
			<div class="space-y-8">
				<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest" style="background: rgba(200,16,46,0.08); color: #C8102E; border: 1px solid rgba(200,16,46,0.15);">
					<span class="w-1.5 h-1.5 rounded-full" style="background: #C8102E;"></span>
					Water Security
					<span class="mx-1" style="color: #C8102E; opacity: 0.5;">/</span>
					Produk Unggulan
				</div>
				
				<h1 class="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tighter text-zinc-950">
					Karena Setiap Sentimeter <br /> <span style="color: #C8102E;">Berarti</span>
				</h1>
				
				<div>
					<span class="font-heading text-2xl font-bold text-zinc-950">AWLR</span>
					<span class="text-base ml-2 text-zinc-500 font-medium">— Automatic Water Level Recorder</span>
				</div>
				
				<p class="text-lg leading-relaxed text-zinc-600 max-w-[50ch] font-medium">
					Pengukuran ketinggian muka air otomatis, 100% online, terkirim langsung ke STESY. Akurasi ±1mm, IP68, solar-powered — siap di pos hidrologi manapun di Indonesia.
				</p>
				
				<div class="flex flex-wrap gap-4 pt-2">
					<a href="https://wa.me/628112850986?text=Halo%20Beacon%2C%20saya%20ingin%20konsultasi%20tentang%20AWLR." target="_blank" rel="noopener"
						class="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] text-sm font-semibold text-white transition-all hover:scale-[1.02]"
						style="background: linear-gradient(135deg, #C8102E, #A50D25); box-shadow: 0 4px 12px rgba(200,16,46,0.25);">
						<MessageCircle size={15} />
						Konsultasi AWLR
					</a>
					<button class="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] text-sm font-semibold transition-all hover:bg-[#FBE9EC]" style="border: 1.5px solid #E5E5E5; color: #1A1A1A;">
						<Download size={15} />
						Download Datasheet
					</button>
				</div>
			</div>

			<!-- Product Visual Mockup using Uploaded Image -->
			<div class="relative flex justify-center lg:justify-end">
				<div class="relative w-full max-w-[460px] aspect-[4/5] sm:aspect-square rounded-[2rem] overflow-hidden group" style="background: #FAFAFA; border: 1px solid #E5E5E5; box-shadow: 0 30px 60px -15px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,1);">
                    <div class="absolute inset-0 bg-gradient-to-tr from-[#C8102E]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10"></div>
					<img src={productImage} alt="Varian Produk AWLR Beacon" class="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />
					
					<!-- Inner Shadow Overlay for depth -->
					<div class="absolute inset-0 pointer-events-none" style="box-shadow: inset 0 0 0 1px rgba(0,0,0,0.04);"></div>
				</div>
				
				<!-- Premium Float Badge -->
				<div class="absolute -bottom-6 -left-4 sm:left-[-10%] px-5 py-4 rounded-2xl bg-white/85 backdrop-blur-xl z-20 hover:-translate-y-1 transition-transform cursor-default" style="border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6);">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-[#1B7F3A]/10 flex items-center justify-center">
                            <Check size={18} class="text-[#1B7F3A]" />
                        </div>
                        <div class="pr-4">
                            <span class="block text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-0.5">Sertifikasi Resmi</span>
                            <span class="block text-sm font-extrabold text-zinc-950 font-heading">SNI Compliant</span>
                        </div>
                    </div>
				</div>
			</div>
		</div>
	</div>

</section>

<!-- "Untuk Anda yang..." -->
<section class="relative py-16 lg:py-20 bg-white overflow-hidden">
	<Ornaments />
	<div class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
		<h2 class="font-heading text-2xl sm:text-3xl font-bold mb-8" style="color: #1A1A1A;">Untuk Anda yang Bertanggung Jawab Atas...</h2>
		<div class="flex flex-wrap justify-center gap-3">
			{#each useCases as useCase}
				<div class="px-5 py-3 rounded-xl text-sm font-medium bg-[#FAFAFA] transition-all hover:bg-[#FBE9EC] hover:-translate-y-0.5" style="border: 1px solid #E5E5E5; color: #3A3A3A;">
					{useCase}
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- 6 Keunggulan -->
<section class="relative py-16 lg:py-24 overflow-hidden" style="background: linear-gradient(180deg, #FAFAFA 0%, #FFF5F6 100%);">
	<Ornaments variant="dense" />
	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-12">
			<span class="text-xs font-semibold uppercase tracking-widest" style="color: #C8102E;">Keunggulan</span>
			<h2 class="font-heading text-3xl sm:text-4xl font-bold mt-3" style="color: #1A1A1A;">Mengapa AWLR Beacon</h2>
		</div>
		<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each features as feat, i}
				<div class="group p-6 rounded-2xl bg-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style="border: 1px solid #E5E5E5;">
					<div class="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110" style="background: #FBE9EC;">
						<Check size={18} style="color: #C8102E;" />
					</div>
					<h3 class="font-heading text-base font-bold mb-2 group-hover:text-[#C8102E] transition-colors" style="color: #1A1A1A;">{feat.title}</h3>
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


						<ProductSpecs {variants} {activeVariant} />

					</div>

				</div>
			{/key}
		</div>
	</div>
</section>

<!-- Sudah Terpasang Di -->
<section class="relative py-16 lg:py-20 bg-white overflow-hidden">
	<Ornaments />
	<div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-10">
			<span class="text-xs font-semibold uppercase tracking-widest" style="color: #C8102E;">Track Record</span>
			<h2 class="font-heading text-3xl font-bold mt-3" style="color: #1A1A1A;">Sudah Terpasang Di</h2>
		</div>
		<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each projects as proj}
				<div class="p-5 rounded-2xl bg-[#FAFAFA] hover:bg-[#FBE9EC] transition-all" style="border: 1px solid #E5E5E5;">
					<div class="flex items-center gap-2 mb-2">
						<span class="text-[10px] font-semibold px-2 py-0.5 rounded-md text-white tabular-nums" style="background: #C8102E;">{proj.year}</span>
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
				<h2 class="font-heading text-4xl sm:text-5xl font-extrabold text-white tracking-tighter mb-4">Mulai Proyek dengan AWLR</h2>
				<p class="text-lg text-zinc-400 font-medium">Tim engineer kami akan merancang arsitektur telemetri yang tepat dan menghitung kebutuhan riil proyek Anda.</p>
			</div>

			<div class="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto shrink-0">
				<a href="https://wa.me/628112850986?text=Halo%20Beacon%2C%20saya%20ingin%20konsultasi%20tentang%20AWLR%20untuk%20proyek%20saya." target="_blank" rel="noopener"
					class="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-zinc-950 bg-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] btn-tactile">
					<MessageCircle size={18} />
					Konsultasi AWLR
				</a>
				<a href="/solusi/water-security" class="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white transition-all hover:bg-zinc-800 btn-tactile" style="border: 1px solid rgba(255,255,255,0.15);">
					<ArrowRight size={18} />
					Jelajahi Produk Lain
				</a>
			</div>
		</div>
	</div>
</section>
