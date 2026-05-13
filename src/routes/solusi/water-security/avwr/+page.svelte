<script lang="ts">
	import { onMount } from 'svelte';
	import { ArrowRight, Check, MessageCircle, Download, ChevronRight, Radio, Cpu, Wifi, ShieldCheck, Zap, BarChart3 } from '@lucide/svelte';
	import Ornaments from '$lib/components/Ornaments.svelte';
	import { locale } from "$lib/i18n";
	import ProductVariantDossier from '$lib/components/ProductVariantDossier.svelte';
	import { mapTrackRecords } from '$lib/loaders/sub-solution';

	let { data } = $props();

	let mounted = $state(false);
	onMount(() => { mounted = true; });

	let activeVariant = $state(0);

	const fallbackVariants = [
		{ name: 'BV-600', subtitle: '16-Channel Standard', desc: 'Data logger 16-channel vibrating wire untuk instalasi standar. Cocok untuk bendungan kecil-menengah dengan jumlah sensor terbatas.', use: 'Bendungan kecil, embankment, cofferdam' ,
		specs: [
		{ label: 'Jumlah Channel', value: '32 channel (expandable)' },
		{ label: 'Tipe Sensor', value: 'Vibrating Wire (semua merek)' },
		{ label: 'Resolusi Frekuensi', value: '0.01 Hz' },
		{ label: 'Akurasi', value: '±0.025% F.S.' },
		{ label: 'Pembacaan Simultan', value: 'Ya (semua channel)' },
		{ label: 'Auto-calibrate', value: 'Koreksi temperatur otomatis' },
		{ label: 'Proteksi', value: 'IP67' },
		{ label: 'Komunikasi', value: '4G/LTE, GSM, RS-485' },
		{ label: 'Power Supply', value: 'Solar Panel + Battery' },
		{ label: 'Logger Memory', value: '4 GB internal' },
		{ label: 'Platform', value: 'STESY Integration' },
		{ label: 'Standar', value: 'ICOLD / SNI Compliant' }
	]
	},
		{ name: 'BV-610', subtitle: '32-Channel Extended', desc: 'Data logger 32-channel dengan multiplexer terintegrasi. Untuk bendungan besar dengan puluhan sensor VW tersebar di berbagai section.', use: 'Bendungan besar, dam-gallery, multi-section' ,
		specs: [
		{ label: 'Jumlah Channel', value: '32 channel (expandable)' },
		{ label: 'Tipe Sensor', value: 'Vibrating Wire (semua merek)' },
		{ label: 'Resolusi Frekuensi', value: '0.01 Hz' },
		{ label: 'Akurasi', value: '±0.025% F.S.' },
		{ label: 'Pembacaan Simultan', value: 'Ya (semua channel)' },
		{ label: 'Auto-calibrate', value: 'Koreksi temperatur otomatis' },
		{ label: 'Proteksi', value: 'IP67' },
		{ label: 'Komunikasi', value: '4G/LTE, GSM, RS-485' },
		{ label: 'Power Supply', value: 'Solar Panel + Battery' },
		{ label: 'Logger Memory', value: '4 GB internal' },
		{ label: 'Platform', value: 'STESY Integration' },
		{ label: 'Standar', value: 'ICOLD / SNI Compliant' }
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
		'Bendungan dengan puluhan sensor vibrating wire tersebar',
		'Gallery instrumentasi yang perlu dibaca dari jarak jauh',
		'Piezometer dan settlement gauge di tubuh bendungan',
		'Load cell dan strain gauge di struktur beton',
		'Monitoring tekanan pore water di tanah lunak'
	];

	const fallbackProjects = [
		{ name: 'Bendungan Ciawi', client: 'BBWS Ciliwung-Cisadane', year: '2023' },
		{ name: 'Bendungan Cipanas', client: 'BWS Ciliwung-Cisadane', year: '2022' },
		{ name: 'Bendungan Keureuto', client: 'BWS Sumatera I', year: '2023' },
		{ name: 'Bendungan Sepaku IKN', client: 'BWS Kalimantan IV', year: '2024' }
	];

	// API data wins: use track records from DB, fallback to static
	const projects = $derived(
		mapTrackRecords(data.subSolutionDetail?.track_records, fallbackProjects)
	);


	const features = [
		{ title: '32 Channel Simultan', desc: 'Baca semua sensor vibrating wire secara bersamaan — tidak ada delay antar channel, data sinkron sempurna.', icon: Cpu },
		{ title: 'Kompatibel Semua Merek', desc: 'Bekerja dengan sensor VW dari Geokon, RST, Sisgeo, Encardio-Rite, dan produsen lainnya.', icon: Radio },
		{ title: 'Auto-calibrate', desc: 'Koreksi temperatur otomatis untuk setiap pembacaan. Akurasi tetap terjaga di cuaca tropis yang fluktuatif.', icon: BarChart3 },
		{ title: 'High Resolution', desc: 'Resolusi frekuensi 0.01 Hz menghasilkan data yang sangat halus untuk analisis tren jangka panjang.', icon: Zap },
		{ title: 'Remote Access', desc: 'Konfigurasi dan monitoring dari jarak jauh via STESY. Tidak perlu turun ke gallery instrumentasi.', icon: Wifi },
		{ title: 'Tahan Lingkungan Dam', desc: 'IP67, tahan kelembaban tinggi di gallery bendungan. Dirancang untuk operasi non-stop bertahun-tahun.', icon: ShieldCheck }
	];
</script>

<svelte:head>
	<title>AVWR — Automatic Vibrating Wire Recorder — Beacon Engineering</title>
	<meta name="description" content="AVWR Beacon Engineering: pembacaan otomatis sensor vibrating wire untuk monitoring tekanan pore, settlement, dan stress pada bendungan." />
</svelte:head>

<!-- Breadcrumb -->
<div class="bg-[#FAFAFA] border-b" style="border-color: #E5E5E5;">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
		<nav class="flex items-center gap-1.5 text-xs" style="color: #9A9A9A;">
			<a href="/" class="hover:text-[#C8102E] transition-colors">{$locale === "EN" ? "Home" : "Beranda"}</a>
			<ChevronRight size={11} />
			<a href="/solusi" class="hover:text-[#C8102E] transition-colors">{$locale === "EN" ? "Solutions" : "Solusi"}</a>
			<ChevronRight size={11} />
			<a href="/solusi/water-security" class="hover:text-[#C8102E] transition-colors">Water Security</a>
			<ChevronRight size={11} />
			<span style="color: #C8102E;" class="font-medium">AVWR</span>
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
					<span class="text-xs" style="color: #9A9A9A;">Vibrating Wire</span>
				</div>
				<h1
					class="font-heading text-3xl sm:text-4xl lg:text-[52px] font-extrabold leading-tight"
					style="letter-spacing: -0.03em; color: #1A1A1A; opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 20}px); transition: all 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s;"
				>
					Puluhan Sensor, <span style="color: #C8102E;">Satu Layar</span>
				</h1>
				<div>
					<span class="font-heading text-xl font-bold" style="color: #1A1A1A;">AVWR</span>
					<span class="text-sm ml-2" style="color: #5C5C5C;">— Automatic Vibrating Wire Recorder</span>
				</div>
				<p class="text-base leading-relaxed" style="color: #5C5C5C;">
					Puluhan sensor vibrating wire, dibaca simultan, dipantau dari satu layar. Kompatibel dengan semua merek sensor VW, auto-calibrate temperatur.
				</p>
				<div class="flex flex-wrap gap-3">
					<a href="https://wa.me/628112632151?text=Halo%20CS%20Marketing%20Beacon%2C%20saya%20ingin%20konsultasi%20tentang%20AVWR." target="_blank" rel="noopener"
						class="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] text-sm font-semibold text-white transition-all hover:scale-[1.02]"
						style="background: linear-gradient(135deg, #C8102E, #A50D25); box-shadow: 0 4px 12px rgba(200,16,46,0.25);">
						<MessageCircle size={15} />
						{$locale === "EN" ? "Consult AVWR" : "Konsultasi AVWR"}
					</a>
					<button class="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] text-sm font-semibold transition-all hover:bg-[#FBE9EC]" style="border: 1.5px solid #E5E5E5; color: #1A1A1A;">
						<Download size={15} />
						Download Datasheet
					</button>
				</div>
			</div>

			<div class="relative flex justify-center">
				<div class="relative w-64 h-80 rounded-3xl overflow-hidden" style="background: linear-gradient(180deg, #8B5CF6 0%, #6D28D9 100%); box-shadow: 0 20px 60px rgba(139,92,246,0.2);">
					<div class="absolute inset-0 flex flex-col items-center justify-center p-6 text-white">
						<Radio size={48} class="mb-4 opacity-80" />
						<span class="font-heading text-3xl font-extrabold">AVWR</span>
						<span class="text-xs mt-1 opacity-70 uppercase tracking-widest">BV-610</span>
						<div class="mt-6 w-full space-y-2">
							<div class="flex justify-between text-xs opacity-80">
								<span>Channels</span>
								<span class="font-mono tabular-nums">28/32</span>
							</div>
							<div class="h-1 rounded-full bg-white/20">
								<div class="h-full rounded-full bg-white/80" style="width: 87.5%;"></div>
							</div>
							<div class="flex justify-between text-xs opacity-80">
								<span>Status</span>
								<span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>Online</span>
							</div>
						</div>
					</div>
				</div>
				<div class="absolute -bottom-3 -right-3 px-4 py-2 rounded-xl bg-white text-xs font-semibold" style="border: 1px solid #E5E5E5; box-shadow: 0 4px 12px rgba(0,0,0,0.06); color: #C8102E;">
					32 Channel Simultaneous
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
			<h2 class="font-heading text-3xl sm:text-4xl font-bold mt-3" style="color: #1A1A1A;">{$locale === "EN" ? "Why AVWR Beacon" : "Mengapa AVWR Beacon"}</h2>
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

<ProductVariantDossier {variants} productName="AVWR" />

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
				<h2 class="font-heading text-4xl sm:text-5xl font-extrabold text-white tracking-tighter mb-4">Mulai Proyek dengan AVWR</h2>
				<p class="text-lg text-zinc-400 font-medium">Tim engineer kami akan merancang arsitektur telemetri yang tepat dan menghitung kebutuhan riil proyek Anda.</p>
			</div>

			<div class="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto shrink-0">
				<a href="https://wa.me/628112632151?text=Halo%20CS%20Marketing%20Beacon%2C%20saya%20ingin%20konsultasi%20tentang%20AVWR%20untuk%20proyek%20saya." target="_blank" rel="noopener"
					class="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-zinc-950 bg-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] btn-tactile">
					<MessageCircle size={18} />
					{$locale === "EN" ? "Consult AVWR" : "Konsultasi AVWR"}
				</a>
				<a href="/solusi/water-security" class="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white transition-all hover:bg-zinc-800 btn-tactile" style="border: 1px solid rgba(255,255,255,0.15);">
					<ArrowRight size={18} />
					{$locale === "EN" ? "Explore Other Products" : "Jelajahi Produk Lain"}
				</a>
			</div>
		</div>
	</div>
</section>
