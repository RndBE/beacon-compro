<script lang="ts">
	import { onMount } from 'svelte';
	import { ArrowRight, Check, MessageCircle, Download, ChevronRight, Monitor, Smartphone, Wifi, ShieldCheck, Zap, BarChart3 } from '@lucide/svelte';
	import Ornaments from '$lib/components/Ornaments.svelte';
	import { locale } from "$lib/i18n";
	import ProductVariantDossier from '$lib/components/ProductVariantDossier.svelte';
	import { mapTrackRecords } from '$lib/loaders/sub-solution';
	import { openChat } from '$lib/stores/chat';

	let { data } = $props();
	let solutionName = $derived(data.subSolutionDetail?.sub_solution?.solution?.name ?? 'Digital Monitoring Platform');
	let solutionSlug = $derived(data.subSolutionDetail?.sub_solution?.solution?.slug ?? 'digital-monitoring-platform');

	let mounted = $state(false);
	onMount(() => { mounted = true; });

	let activeVariant = $state(0);

	const fallbackVariants: any[] = [
		{ name: 'Smart Telemetry System', subtitle: 'Platform Monitoring Terpadu', desc: 'Platform monitoring real-time yang menyatukan semua perangkat telemetri Beacon dalam satu dashboard. Akses dari smartphone, tablet, atau desktop.', use: 'BBWS, BWS, BPBD, Dinas SDA, Operator Bendungan' ,
		specs: [
		{ label: 'Akses', value: 'Web Browser + Mobile App' },
		{ label: 'Data Source', value: 'AWLR, ARR, AWR, EWS, APLR, ADR, dll.' },
		{ label: 'Real-time', value: 'Data update per menit' },
		{ label: 'Notifikasi', value: 'SMS, Email, Push Notification' },
		{ label: 'Dashboard', value: 'Customizable per user' },
		{ label: 'Reporting', value: 'Auto-generate PDF/Excel' },
		{ label: 'Map View', value: 'GIS Integration' },
		{ label: 'Multi-User', value: 'Role-based Access Control' },
		{ label: 'Uptime', value: '99.9% SLA' },
		{ label: 'API', value: 'REST API untuk integrasi' },
		{ label: 'Security', value: 'SSL/TLS Encrypted' },
		{ label: 'Deployment', value: 'Cloud / On-Premise' }
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
		'Monitoring jaringan telemetri seluruh DAS dari satu layar',
		'Pelaporan otomatis harian/mingguan untuk pimpinan',
		'Integrasi data multi-sensor untuk analisis tren',
		'Early warning dashboard untuk ruang komando BPBD',
		'Audit trail dan akuntabilitas operasional balai'
	];

	const fallbackProjects = [
		{ name: 'BBWS Serayu Opak', client: 'Kementerian PUPR', year: '2024' },
		{ name: 'BBWS Ciliwung Cisadane', client: 'Kementerian PUPR', year: '2023' },
		{ name: 'BWS Kalimantan IV', client: 'Kementerian PUPR', year: '2023' },
		{ name: 'Dinas SDA Jawa Tengah', client: 'Pemprov Jateng', year: '2024' }
	];

	// API data wins: use track records from DB, fallback to static
	const projects = $derived(
		mapTrackRecords(data.subSolutionDetail?.track_records, fallbackProjects)
	);


	const features = [
		{ title: 'Unified Dashboard', desc: 'Semua perangkat AWLR, ARR, EWS, ADR dalam satu layar. Tidak perlu buka banyak aplikasi.', icon: Monitor },
		{ title: 'Mobile Ready', desc: 'Akses dari smartphone atau tablet. Data real-time di genggaman tangan kapan saja, di mana saja.', icon: Smartphone },
		{ title: 'Auto-Reporting', desc: 'Laporan harian, mingguan, bulanan ter-generate otomatis dalam format PDF dan Excel.', icon: BarChart3 },
		{ title: 'Multi-Alarm', desc: 'Threshold otomatis dengan notifikasi SMS, email, dan push notification ke tim terkait.', icon: Zap },
		{ title: 'GIS Integration', desc: 'Peta interaktif dengan lokasi semua stasiun. Klik untuk melihat data terkini setiap titik.', icon: Wifi },
		{ title: 'Enterprise Security', desc: 'SSL/TLS encryption, role-based access, audit trail. Tersedia deployment cloud atau on-premise.', icon: ShieldCheck }
	];
</script>

<svelte:head>
	<title>STESY — Smart Telemetry System — Beacon Engineering</title>
	<meta name="description" content="STESY: platform monitoring tunggal yang menyatukan semua perangkat telemetri Beacon dalam satu dashboard real-time." />
</svelte:head>

<!-- Breadcrumb -->
<div class="bg-[#FAFAFA] border-b" style="border-color: #E5E5E5;">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
		<nav class="flex items-center gap-1.5 text-xs" style="color: #9A9A9A;">
			<a href="/" class="hover:text-[#C8102E] transition-colors">{$locale === "EN" ? "Home" : "Beranda"}</a>
			<ChevronRight size={11} />
			<a href="/solusi" class="hover:text-[#C8102E] transition-colors">{$locale === "EN" ? "Solutions" : "Solusi"}</a>
			<ChevronRight size={11} />
			<a href="/solusi/{solutionSlug}" class="hover:text-[#C8102E] transition-colors">{solutionName}</a>
			<ChevronRight size={11} />
			<span style="color: #C8102E;" class="font-medium">Smart Telemetry System</span>
		</nav>
	</div>
</div>

<!-- Hero -->
<section class="relative pt-24 pb-16 lg:pt-32 lg:pb-24 bg-[#FAFAFA] border-b border-[#E5E5E5] overflow-hidden">
	<div class="absolute inset-0 z-0 opacity-[0.03]" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>
	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid lg:grid-cols-2 gap-12 items-center">
			<div class="space-y-6">
				<div class="flex items-center gap-2">
					<span class="text-xs font-semibold uppercase tracking-widest" style="color: #C8102E;">{solutionName}</span>
					<span style="color: #E5E5E5;">·</span>
					<span class="text-xs" style="color: #9A9A9A;">Monitoring Platform</span>
				</div>
				<h1
					class="font-heading text-3xl sm:text-4xl lg:text-[52px] font-extrabold leading-tight"
					style="letter-spacing: -0.03em; color: #1A1A1A; opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 20}px); transition: all 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s;"
				>
					Satu Layar untuk <span style="color: #C8102E;">Semua Aset</span>
				</h1>
				<div>
					<span class="font-heading text-xl font-bold" style="color: #1A1A1A;">STESY</span>
					<span class="text-sm ml-2" style="color: #5C5C5C;">— Smart Telemetry System</span>
				</div>
				<p class="text-base leading-relaxed" style="color: #5C5C5C;">
					Ketinggian air Bendungan A, curah hujan Stasiun B, deformasi Lereng C, status pintu air Bendung D — semua di satu dashboard. Real-time. Dari mana saja.
				</p>
				<div class="flex flex-wrap gap-3">
					<button type="button" onclick={openChat}
						class="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] text-sm font-semibold text-white transition-all hover:scale-[1.02]"
						style="background: linear-gradient(135deg, #C8102E, #A50D25); box-shadow: 0 4px 12px rgba(200,16,46,0.25);">
						<MessageCircle size={15} />
						{$locale === "EN" ? "Request STESY Demo" : "Minta Demo STESY"}
					</button>
					<button class="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] text-sm font-semibold transition-all hover:bg-[#FBE9EC]" style="border: 1.5px solid #E5E5E5; color: #1A1A1A;">
						<Download size={15} />
						{$locale === "EN" ? "Download Brochure" : "Download Brosur"}
					</button>
				</div>
			</div>

			<div class="relative flex justify-center">
				<div class="relative w-64 h-80 rounded-3xl overflow-hidden" style="background: linear-gradient(180deg, #C8102E 0%, #A50D25 100%); box-shadow: 0 20px 60px rgba(200,16,46,0.2);">
					<div class="absolute inset-0 flex flex-col items-center justify-center p-6 text-white">
						<Monitor size={48} class="mb-4 opacity-80" />
						<span class="font-heading text-3xl font-extrabold">STESY</span>
						<span class="text-xs mt-1 opacity-70 uppercase tracking-widest">Platform v4.0</span>
						<div class="mt-6 w-full space-y-2">
							<div class="flex justify-between text-xs opacity-80">
								<span>Stations</span>
								<span class="font-mono tabular-nums">347 online</span>
							</div>
							<div class="h-1 rounded-full bg-white/20">
								<div class="h-full rounded-full bg-white/80" style="width: 94.2%;"></div>
							</div>
							<div class="flex justify-between text-xs opacity-80">
								<span>Uptime</span>
								<span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>99.9%</span>
							</div>
						</div>
					</div>
				</div>
				<div class="absolute -bottom-3 -right-3 px-4 py-2 rounded-xl bg-white text-xs font-semibold" style="border: 1px solid #E5E5E5; box-shadow: 0 4px 12px rgba(0,0,0,0.06); color: #C8102E;">
					Real-time Dashboard
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
			<h2 class="font-heading text-3xl sm:text-4xl font-bold mt-3" style="color: #1A1A1A;">{$locale === "EN" ? "Why STESY Beacon" : "Mengapa STESY Beacon"}</h2>
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

<ProductVariantDossier {variants} productName="STESY" />

<!-- Track Record -->
<section class="relative py-16 lg:py-20 bg-white overflow-hidden">
	<Ornaments />
	<div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-10">
			<span class="text-xs font-semibold uppercase tracking-widest" style="color: #C8102E;">Track Record</span>
			<h2 class="font-heading text-3xl font-bold mt-3" style="color: #1A1A1A;">Sudah Digunakan Oleh</h2>
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

<!-- Premium Floating CTA -->
<section class="relative py-20 bg-white">
	<div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
		<div class="relative overflow-hidden rounded-[2.5rem] bg-zinc-950 p-10 sm:p-16 lg:p-20 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-12 group" style="box-shadow: 0 40px 80px -20px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.05);">
			<div class="absolute inset-0 bg-gradient-to-br from-[#C8102E]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"></div>
			<div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#C8102E]/10 blur-3xl pointer-events-none z-0"></div>

			<div class="relative z-10 text-center lg:text-left flex-1 max-w-2xl">
				<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6" style="background: rgba(200,16,46,0.15); color: #FF4D6D; border: 1px solid rgba(200,16,46,0.3);">
					<span class="w-1.5 h-1.5 rounded-full" style="background: #FF4D6D; box-shadow: 0 0 10px #FF4D6D;"></span>
					Next Step
				</span>
				<h2 class="font-heading text-4xl sm:text-5xl font-extrabold text-white tracking-tighter mb-4">Coba STESY Sekarang</h2>
				<p class="text-lg text-zinc-400 font-medium">Tim kami akan memberikan akses demo dan merancang konfigurasi dashboard sesuai kebutuhan organisasi Anda.</p>
			</div>

			<div class="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto shrink-0">
				<button type="button" onclick={openChat}
					class="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-zinc-950 bg-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] btn-tactile">
					<MessageCircle size={18} />
					{$locale === "EN" ? "Request Demo" : "Minta Demo"}
				</button>
				<a href="/solusi/{solutionSlug}" class="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white transition-all hover:bg-zinc-800 btn-tactile" style="border: 1px solid rgba(255,255,255,0.15);">
					<ArrowRight size={18} />
					{$locale === "EN" ? "Back to STESY" : "Kembali ke STESY"}
				</a>
			</div>
		</div>
	</div>
</section>
