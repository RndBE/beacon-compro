<script lang="ts">
	import { onMount } from 'svelte';
	import { ArrowRight, MessageCircle, Download, ChevronRight, ShieldCheck, LockKeyhole, Wifi, Siren, Zap, BarChart3 } from '@lucide/svelte';
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
		{ name: 'BE APLR-1000', subtitle: 'Protection Logging Recorder', desc: 'Pencatatan kondisi aset, alarm anomali, dan telemetri keamanan untuk fasilitas strategis. Dirancang untuk area utilitas, energi, bendungan, dan titik akses kritis.', use: 'Utilitas, energi, bendungan, fasilitas strategis' ,
		specs: [
		{ label: 'Mode Proteksi', value: 'Asset condition logging' },
		{ label: 'Pencatatan', value: 'Otomatis tanpa intervensi manual' },
		{ label: 'Alarm', value: 'Deteksi anomali dan tamper event' },
		{ label: 'Proteksi', value: 'IP67' },
		{ label: 'Komunikasi', value: '4G/LTE, GSM' },
		{ label: 'Power Supply', value: 'Solar Panel + Battery' },
		{ label: 'Interval Data', value: '1 – 60 menit (konfigurabel)' },
		{ label: 'Material', value: 'Stainless Steel 316L' },
		{ label: 'Logger', value: 'BL-1100 Terintegrasi' },
		{ label: 'Platform', value: 'STESY Integration' },
		{ label: 'Output', value: '4-20mA / RS485' },
		{ label: 'Standar', value: 'SNI Compliant' }
	]
	}
	];

	// Keep product media from API, but use local editorial copy for Infrastructure Security.
	const variants = $derived(
		data.subSolutionDetail?.products && data.subSolutionDetail.products.length > 0
			? data.subSolutionDetail.products.map((p: any, i: number) => {
				const editorial = fallbackVariants[i] ?? fallbackVariants[0];
				return {
				name: editorial.name,
				subtitle: editorial.subtitle,
				desc: editorial.desc,
				use: editorial.use,
				image: p.main_image ?? p.thumbnail ?? null,
				brochure_pdf: p.brochure_pdf ?? null,
				specs: editorial.specs?.length
					? editorial.specs
					: Array.isArray(p.highlight_points)
					? p.highlight_points.map((pt: string, i: number) => ({ label: `Fitur ${i + 1}`, value: pt }))
					: [],
				components: Array.isArray(p.components) ? p.components : []
			};
			})
			: fallbackVariants
	);

	const useCases = [
		'Pemantauan fasilitas energi dan utilitas kritis',
		'Proteksi area bendungan, intake, dan rumah pompa',
		'Pencatatan kondisi aset di lokasi terpencil',
		'Alarm anomali untuk titik akses infrastruktur',
		'Integrasi sensor keamanan lapangan ke dashboard STESY'
	];

	const fallbackProjects = [
		{ name: 'Area Utilitas Energi', client: 'Operator Infrastruktur Nasional', year: '2024', location: null },
		{ name: 'Rumah Pompa Bendungan', client: 'Balai Wilayah Sungai', year: '2023', location: null },
		{ name: 'Koridor Pipa Distribusi', client: 'BUMD Air Minum', year: '2023', location: null },
		{ name: 'Aset Remote Monitoring', client: 'Kontraktor EPC', year: '2022', location: null }
	];

	const projects = $derived(
		mapTrackRecords(data.subSolutionDetail?.track_records, fallbackProjects)
	);


	const features = [
		{ title: 'Asset Condition Logging', desc: 'Merekam kondisi sensor keamanan dan status perangkat secara otomatis untuk audit operasional.', icon: ShieldCheck },
		{ title: 'Fully Automatic', desc: 'Pencatatan dan pengiriman data berjalan 24/7 tanpa intervensi manual di lokasi.', icon: Zap },
		{ title: 'Real-time Alert', desc: 'Anomali lapangan dikirim ke dashboard STESY agar respons dapat dimulai lebih cepat.', icon: BarChart3 },
		{ title: 'Tamper Awareness', desc: 'Event akses, gangguan enclosure, atau perubahan kondisi kritis dapat dicatat sebagai sinyal risiko.', icon: LockKeyhole },
		{ title: 'STESY Integration', desc: 'Terhubung langsung ke platform STESY untuk analisis tren, alarm, dan pelaporan otomatis.', icon: Wifi },
		{ title: 'Industrial Grade', desc: 'Enclosure IP67 dan material tahan korosi untuk lokasi terpencil dengan cuaca berat.', icon: Siren }
	];
</script>

<svelte:head>
	<title>APLR — Automatic Protection Logging Recorder — Beacon Engineering</title>
	<meta name="description" content="APLR Beacon Engineering: pencatatan kondisi aset, alarm anomali, dan telemetri keamanan untuk infrastruktur kritis." />
</svelte:head>

<!-- Breadcrumb -->
<div class="bg-[#FAFAFA] border-b" style="border-color: #E5E5E5;">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
		<nav class="flex items-center gap-1.5 text-xs" style="color: #9A9A9A;">
			<a href="/" class="hover:text-[#C8102E] transition-colors">{$locale === "EN" ? "Home" : "Beranda"}</a>
			<ChevronRight size={11} />
			<a href="/solusi" class="hover:text-[#C8102E] transition-colors">{$locale === "EN" ? "Solutions" : "Solusi"}</a>
			<ChevronRight size={11} />
			<a href="/solusi/{solutionSlug}" class="hover:text-[#10B981] transition-colors">{solutionName}</a>
			<ChevronRight size={11} />
			<span style="color: #10B981;" class="font-medium">APLR</span>
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
					<span class="text-xs font-semibold uppercase tracking-widest" style="color: #10B981;">{solutionName}</span>
					<span style="color: #E5E5E5;">·</span>
					<span class="text-xs" style="color: #9A9A9A;">Infrastructure Protection</span>
				</div>
				<h1
					class="font-heading text-3xl sm:text-4xl lg:text-[52px] font-extrabold leading-tight"
					style="letter-spacing: -0.03em; color: #1A1A1A; opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 20}px); transition: all 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s;"
				>
					Aset Kritis Terpantau <span style="color: #10B981;">Setiap Detik</span>
				</h1>
				<div>
					<span class="font-heading text-xl font-bold" style="color: #1A1A1A;">APLR</span>
					<span class="text-sm ml-2" style="color: #5C5C5C;">— Automatic Protection Logging Recorder</span>
				</div>
				<p class="text-base leading-relaxed" style="color: #5C5C5C;">
					Dari rumah pompa hingga koridor utilitas, setiap kondisi kritis tercatat, terkirim, dan teranalisis otomatis 24/7.
				</p>
				<div class="flex flex-wrap gap-3">
					<button type="button" onclick={openChat}
						class="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] text-sm font-semibold text-white transition-all hover:scale-[1.02]"
						style="background: linear-gradient(135deg, #C8102E, #A50D25); box-shadow: 0 4px 12px rgba(200,16,46,0.25);">
						<MessageCircle size={15} />
						{$locale === "EN" ? "Consult APLR" : "Konsultasi APLR"}
					</button>
					<button class="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] text-sm font-semibold transition-all hover:bg-[#D1FAE5]" style="border: 1.5px solid #E5E5E5; color: #1A1A1A;">
						<Download size={15} />
						Download Datasheet
					</button>
				</div>
			</div>

			<div class="relative flex justify-center">
				<div class="relative w-64 h-80 rounded-3xl overflow-hidden" style="background: linear-gradient(180deg, #10B981 0%, #059669 100%); box-shadow: 0 20px 60px rgba(16,185,129,0.2);">
					<div class="absolute inset-0 flex flex-col items-center justify-center p-6 text-white">
						<ShieldCheck size={48} class="mb-4 opacity-80" />
						<span class="font-heading text-3xl font-extrabold">APLR</span>
						<span class="text-xs mt-1 opacity-70 uppercase tracking-widest">BE APLR-1000</span>
						<div class="mt-6 w-full space-y-2">
							<div class="flex justify-between text-xs opacity-80">
								<span>Security Index</span>
								<span class="font-mono tabular-nums">87.3</span>
							</div>
							<div class="h-1 rounded-full bg-white/20">
								<div class="h-full rounded-full bg-white/80" style="width: 28.2%;"></div>
							</div>
							<div class="flex justify-between text-xs opacity-80">
								<span>Status</span>
								<span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>Online</span>
							</div>
						</div>
					</div>
				</div>
				<div class="absolute -bottom-3 -right-3 px-4 py-2 rounded-xl bg-white text-xs font-semibold" style="border: 1px solid #E5E5E5; box-shadow: 0 4px 12px rgba(0,0,0,0.06); color: #10B981;">
					IP67 Field Unit
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
				<div class="px-5 py-3 rounded-xl text-sm font-medium bg-[#FAFAFA] transition-all hover:bg-[#D1FAE5] hover:-translate-y-0.5" style="border: 1px solid #E5E5E5; color: #3A3A3A;">
					{useCase}
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Features -->
<section class="relative py-16 lg:py-24 overflow-hidden" style="background: linear-gradient(180deg, #FAFAFA 0%, #ECFDF5 100%);">
	<Ornaments variant="dense" />
	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-12">
			<span class="text-xs font-semibold uppercase tracking-widest" style="color: #10B981;">Keunggulan</span>
			<h2 class="font-heading text-3xl sm:text-4xl font-bold mt-3" style="color: #1A1A1A;">{$locale === "EN" ? "Why APLR Beacon" : "Mengapa APLR Beacon"}</h2>
		</div>
		<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each features as feat, i}
				<div
					class="group p-6 rounded-2xl bg-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
					style="border: 1px solid #E5E5E5; opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 24}px); transition: opacity 0.6s ease-out {0.3 + i * 0.08}s, transform 0.6s ease-out {0.3 + i * 0.08}s, box-shadow 0.3s;"
				>
					<div class="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110" style="background: #D1FAE5;">
						<svelte:component this={feat.icon} size={18} style="color: #10B981;" />
					</div>
					<h3 class="font-heading text-base font-bold mb-2 group-hover:text-[#10B981] transition-colors" style="color: #1A1A1A;">{feat.title}</h3>
					<p class="text-sm leading-relaxed" style="color: #5C5C5C;">{feat.desc}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<ProductVariantDossier {variants} productName="APLR" />

<!-- Track Record -->
<section class="relative py-16 lg:py-20 bg-white overflow-hidden">
	<Ornaments />
	<div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-10">
			<span class="text-xs font-semibold uppercase tracking-widest" style="color: #10B981;">Track Record</span>
			<h2 class="font-heading text-3xl font-bold mt-3" style="color: #1A1A1A;">Sudah Terpasang Di</h2>
		</div>
		<div class="flex flex-wrap justify-center gap-4">
			{#each projects as proj}
				<div class="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)] max-w-sm sm:max-w-[260px] p-5 rounded-2xl bg-[#FAFAFA] hover:bg-[#D1FAE5] transition-all" style="border: 1px solid #E5E5E5;">
					<div class="flex items-center gap-2 mb-2">
						<span class="text-[10px] font-semibold px-2 py-0.5 rounded-md text-white tabular-nums" style="background: #10B981;">{proj.year}</span>
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
				<h2 class="font-heading text-4xl sm:text-5xl font-extrabold text-white tracking-tighter mb-4">Mulai Proyek dengan APLR</h2>
				<p class="text-lg text-zinc-400 font-medium">Tim engineer kami akan merancang arsitektur telemetri yang tepat dan menghitung kebutuhan riil proyek Anda.</p>
			</div>

			<div class="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto shrink-0">
				<button type="button" onclick={openChat}
					class="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-zinc-950 bg-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] btn-tactile">
					<MessageCircle size={18} />
					{$locale === "EN" ? "Consult APLR" : "Konsultasi APLR"}
				</button>
				<a href="/solusi/{solutionSlug}" class="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white transition-all hover:bg-zinc-800 btn-tactile" style="border: 1px solid rgba(255,255,255,0.15);">
					<ArrowRight size={18} />
					{$locale === "EN" ? "Explore Other Products" : "Jelajahi Produk Lain"}
				</a>
			</div>
		</div>
	</div>
</section>
