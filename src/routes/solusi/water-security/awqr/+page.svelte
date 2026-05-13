<script lang="ts">
	import { onMount } from 'svelte';
	import { ArrowRight, Check, MessageCircle, Download, ChevronRight, Beaker, Droplets, Thermometer, Wifi, ShieldCheck, RefreshCw } from '@lucide/svelte';
	import Ornaments from '$lib/components/Ornaments.svelte';
	import ProductVariantDossier from '$lib/components/ProductVariantDossier.svelte';
	import { mapTrackRecords } from '$lib/loaders/sub-solution';

	let { data } = $props();

	let mounted = $state(false);
	onMount(() => { mounted = true; });

	let activeVariant = $state(0);

	const fallbackVariants = [
		{ name: 'BQ-500', subtitle: 'Multi-Parameter Probe', desc: 'Sonde multi-parameter terintegrasi: pH, DO, turbidity, TDS, suhu, dan conductivity dalam satu probe. Auto-cleaning terjadwal.', use: 'Sungai utama, intake PDAM, outlet IPAL' ,
		specs: [
		{ label: 'Parameter pH', value: '0 – 14 pH (±0.1)' },
		{ label: 'Turbidity', value: '0 – 4000 NTU (±2%)' },
		{ label: 'Dissolved Oxygen', value: '0 – 20 mg/L (±0.2)' },
		{ label: 'TDS', value: '0 – 50,000 mg/L' },
		{ label: 'Suhu Air', value: '-5°C – 50°C (±0.5°C)' },
		{ label: 'Conductivity', value: '0 – 200 mS/cm' },
		{ label: 'Proteksi', value: 'IP68' },
		{ label: 'Self-cleaning', value: 'Auto wiper + air purge' },
		{ label: 'Komunikasi', value: '4G/LTE, GSM' },
		{ label: 'Power Supply', value: 'Solar Panel + Battery' },
		{ label: 'Platform', value: 'STESY Integration' },
		{ label: 'Standar', value: 'ISO 17025 Compatible' }
	]
	},
		{ name: 'BQ-510', subtitle: 'Modular Sensor Array', desc: 'Konfigurasi modular — pilih parameter yang dibutuhkan. Setiap sensor bisa diganti individual tanpa mengganggu sistem.', use: 'Riset, laboratorium lapangan, custom monitoring' ,
		specs: [
		{ label: 'Parameter pH', value: '0 – 14 pH (±0.1)' },
		{ label: 'Turbidity', value: '0 – 4000 NTU (±2%)' },
		{ label: 'Dissolved Oxygen', value: '0 – 20 mg/L (±0.2)' },
		{ label: 'TDS', value: '0 – 50,000 mg/L' },
		{ label: 'Suhu Air', value: '-5°C – 50°C (±0.5°C)' },
		{ label: 'Conductivity', value: '0 – 200 mS/cm' },
		{ label: 'Proteksi', value: 'IP68' },
		{ label: 'Self-cleaning', value: 'Auto wiper + air purge' },
		{ label: 'Komunikasi', value: '4G/LTE, GSM' },
		{ label: 'Power Supply', value: 'Solar Panel + Battery' },
		{ label: 'Platform', value: 'STESY Integration' },
		{ label: 'Standar', value: 'ISO 17025 Compatible' }
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
		'Sungai yang menjadi sumber air baku PDAM',
		'Outlet industri yang wajib dipantau kualitas limbahnya',
		'Waduk dengan risiko eutrofikasi dan algae bloom',
		'Kawasan tambang yang berpotensi mencemari perairan',
		'Estuari dan muara dengan dinamika salinitas tinggi'
	];

	const fallbackProjects = [
		{ name: 'Sungai Citarum Hilir', client: 'BWS Citarum', year: '2024' },
		{ name: 'Waduk Jatiluhur', client: 'Perum Jasa Tirta II', year: '2023' },
		{ name: 'Intake PDAM Surakarta', client: 'PDAM Kota Surakarta', year: '2023' },
		{ name: 'Sungai Brantas Tengah', client: 'BBWS Brantas', year: '2024' }
	];

	// API data wins: use track records from DB, fallback to static
	const projects = $derived(
		mapTrackRecords(data.subSolutionDetail?.track_records, fallbackProjects)
	);


	const features = [
		{ title: 'Multi-Parameter', desc: 'Satu probe mengukur 6+ parameter kualitas air secara simultan. Hemat ruang, hemat biaya instalasi.', icon: Beaker },
		{ title: 'Auto Self-cleaning', desc: 'Wiper otomatis dan air purge membersihkan sensor secara terjadwal — akurasi tetap terjaga tanpa turun ke lapangan.', icon: RefreshCw },
		{ title: 'Lab-grade Accuracy', desc: 'Akurasi setara peralatan laboratorium. Data bisa langsung digunakan untuk pelaporan regulasi.', icon: Thermometer },
		{ title: 'Cloud Data Real-time', desc: 'Setiap pembacaan langsung masuk ke STESY. Monitoring trend kualitas air dari mana saja.', icon: Wifi },
		{ title: 'Alert Pencemaran', desc: 'Threshold otomatis untuk parameter kritis. Notifikasi instan saat terjadi anomali kualitas air.', icon: Droplets },
		{ title: 'IP68 Submersible', desc: 'Probe terendam penuh di air secara permanen. Dirancang untuk sungai deras dan kedalaman hingga 10m.', icon: ShieldCheck }
	];
</script>

<svelte:head>
	<title>AWQR — Automatic Water Quality Recorder — Beacon Engineering</title>
	<meta name="description" content="AWQR Beacon Engineering: monitoring kualitas air real-time — pH, turbidity, DO, TDS, suhu — data langsung ke dashboard STESY." />
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
			<span style="color: #C8102E;" class="font-medium">AWQR</span>
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
					<span class="text-xs font-semibold uppercase tracking-widest" style="color: #C8102E;">Water Security</span>
					<span style="color: #E5E5E5;">·</span>
					<span class="text-xs" style="color: #9A9A9A;">Water Quality</span>
				</div>
				<h1
					class="font-heading text-3xl sm:text-4xl lg:text-[52px] font-extrabold leading-tight"
					style="letter-spacing: -0.03em; color: #1A1A1A; opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 20}px); transition: all 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s;"
				>
					Deteksi Pencemaran <span style="color: #C8102E;">Sebelum Sampai ke Warga</span>
				</h1>
				<div>
					<span class="font-heading text-xl font-bold" style="color: #1A1A1A;">AWQR</span>
					<span class="text-sm ml-2" style="color: #5C5C5C;">— Automatic Water Quality Recorder</span>
				</div>
				<p class="text-base leading-relaxed" style="color: #5C5C5C;">
					Logam berat, sedimentasi, limbah — terdeteksi sebelum sampai ke ledeng masyarakat. Monitoring kualitas air real-time: pH, turbidity, DO, TDS, suhu, dan lebih banyak lagi.
				</p>
				<div class="flex flex-wrap gap-3">
					<a href="https://wa.me/628112632151?text=Halo%20CS%20Marketing%20Beacon%2C%20saya%20ingin%20konsultasi%20tentang%20AWQR." target="_blank" rel="noopener"
						class="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] text-sm font-semibold text-white transition-all hover:scale-[1.02]"
						style="background: linear-gradient(135deg, #C8102E, #A50D25); box-shadow: 0 4px 12px rgba(200,16,46,0.25);">
						<MessageCircle size={15} />
						Konsultasi AWQR
					</a>
					<button class="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] text-sm font-semibold transition-all hover:bg-[#FBE9EC]" style="border: 1.5px solid #E5E5E5; color: #1A1A1A;">
						<Download size={15} />
						Download Datasheet
					</button>
				</div>
			</div>

			<div class="relative flex justify-center">
				<div class="relative w-64 h-80 rounded-3xl overflow-hidden" style="background: linear-gradient(180deg, #06B6D4 0%, #0E7490 100%); box-shadow: 0 20px 60px rgba(6,182,212,0.2);">
					<div class="absolute inset-0 flex flex-col items-center justify-center p-6 text-white">
						<Beaker size={48} class="mb-4 opacity-80" />
						<span class="font-heading text-3xl font-extrabold">AWQR</span>
						<span class="text-xs mt-1 opacity-70 uppercase tracking-widest">BQ-500</span>
						<div class="mt-6 w-full space-y-2">
							<div class="flex justify-between text-xs opacity-80">
								<span>pH</span>
								<span class="font-mono tabular-nums">7.24</span>
							</div>
							<div class="flex justify-between text-xs opacity-80">
								<span>Turb.</span>
								<span class="font-mono tabular-nums">18.6 NTU</span>
							</div>
							<div class="flex justify-between text-xs opacity-80">
								<span>Status</span>
								<span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>Normal</span>
							</div>
						</div>
					</div>
				</div>
				<div class="absolute -bottom-3 -right-3 px-4 py-2 rounded-xl bg-white text-xs font-semibold" style="border: 1px solid #E5E5E5; box-shadow: 0 4px 12px rgba(0,0,0,0.06); color: #C8102E;">
					Auto Self-cleaning
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
				<div class="px-5 py-3 rounded-xl text-sm font-medium bg-[#FAFAFA] transition-all hover:bg-[#FBE9EC] hover:-translate-y-0.5" style="border: 1px solid #E5E5E5; color: #3A3A3A;">
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
			<span class="text-xs font-semibold uppercase tracking-widest" style="color: #C8102E;">Keunggulan</span>
			<h2 class="font-heading text-3xl sm:text-4xl font-bold mt-3" style="color: #1A1A1A;">Mengapa AWQR Beacon</h2>
		</div>
		<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each features as feat, i}
				<div
					class="group p-6 rounded-2xl bg-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
					style="border: 1px solid #E5E5E5; opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 24}px); transition: opacity 0.6s ease-out {0.3 + i * 0.08}s, transform 0.6s ease-out {0.3 + i * 0.08}s, box-shadow 0.3s;"
				>
					<div class="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110" style="background: #FBE9EC;">
						<svelte:component this={feat.icon} size={18} style="color: #C8102E;" />
					</div>
					<h3 class="font-heading text-base font-bold mb-2 group-hover:text-[#C8102E] transition-colors" style="color: #1A1A1A;">{feat.title}</h3>
					<p class="text-sm leading-relaxed" style="color: #5C5C5C;">{feat.desc}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<ProductVariantDossier {variants} productName="AWQR" />

<!-- Track Record -->
<section class="relative py-16 lg:py-20 bg-white overflow-hidden">
	<Ornaments />
	<div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-10">
			<span class="text-xs font-semibold uppercase tracking-widest" style="color: #C8102E;">Track Record</span>
			<h2 class="font-heading text-3xl font-bold mt-3" style="color: #1A1A1A;">Sudah Terpasang Di</h2>
		</div>
		<div class="flex flex-wrap justify-center gap-4">
			{#each projects as proj}
				<div class="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)] max-w-sm sm:max-w-[260px] p-5 rounded-2xl bg-[#FAFAFA] hover:bg-[#FBE9EC] transition-all" style="border: 1px solid #E5E5E5;">
					<div class="flex items-center gap-2 mb-2">
						<span class="text-[10px] font-semibold px-2 py-0.5 rounded-md text-white tabular-nums" style="background: #C8102E;">{proj.year}</span>
						<div class="w-1.5 h-1.5 rounded-full bg-[#1B7F3A] animate-pulse-dot"></div>
					</div>
					<h3 class="font-heading text-sm font-bold" style="color: #1A1A1A;">{proj.name}</h3>
					<p class="text-xs mt-1" style="color: #5C5C5C;">{proj.client}</p>
					{#if proj.location}
						<p class="text-[11px] mt-1" style="color: #8A8A8A;">{proj.location}</p>
					{/if}
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
				<h2 class="font-heading text-4xl sm:text-5xl font-extrabold text-white tracking-tighter mb-4">Mulai Proyek dengan AWQR</h2>
				<p class="text-lg text-zinc-400 font-medium">Tim engineer kami akan merancang arsitektur telemetri yang tepat dan menghitung kebutuhan riil proyek Anda.</p>
			</div>

			<div class="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto shrink-0">
				<a href="https://wa.me/628112632151?text=Halo%20CS%20Marketing%20Beacon%2C%20saya%20ingin%20konsultasi%20tentang%20AWQR%20untuk%20proyek%20saya." target="_blank" rel="noopener"
					class="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-zinc-950 bg-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] btn-tactile">
					<MessageCircle size={18} />
					Konsultasi AWQR
				</a>
				<a href="/solusi/water-security" class="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white transition-all hover:bg-zinc-800 btn-tactile" style="border: 1px solid rgba(255,255,255,0.15);">
					<ArrowRight size={18} />
					Jelajahi Produk Lain
				</a>
			</div>
		</div>
	</div>
</section>
