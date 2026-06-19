<script lang="ts">
	import { onMount } from 'svelte';
	import {
		ArrowRight,
		MessageCircle,
		ChevronRight,
		ShieldCheck,
		Radio,
		Cpu,
		Wifi,
		Gauge,
		Activity,
		Sun,
		HardDrive,
		LayoutDashboard,
		Waves,
		Layers,
		Box
	} from '@lucide/svelte';
	import { locale } from '$lib/i18n';
	import { openChat } from '$lib/stores/chat';
	import ProductVariantDossier from '$lib/components/ProductVariantDossier.svelte';
	import { mapTrackRecords } from '$lib/loaders/sub-solution';

	let { data } = $props();

	const ACCENT = '#C8102E';
	const ACCENT_SOFT = '#FF4D6D';
	const LIVE = '#1B7F3A';

	const ss = $derived(data.subSolutionDetail?.sub_solution ?? null);
	const mainContent = $derived(
		ss?.main_content?.trim() ||
			'<p>Puluhan sensor vibrating wire, dibaca simultan, dipantau dari satu layar. Kompatibel dengan semua merek sensor VW, auto-calibrate temperatur.</p>'
	);

	// ─── PRODUCT DATA (kept as-is — feeds ProductVariantDossier) ───
	const fallbackVariants = [
		{ name: 'BV-600', subtitle: '16-Channel Standard', desc: 'Data logger 16-channel vibrating wire untuk instalasi standar. Cocok untuk bendungan kecil-menengah dengan jumlah sensor terbatas.', use: 'Bendungan kecil, embankment, cofferdam',
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
		] },
		{ name: 'BV-610', subtitle: '32-Channel Extended', desc: 'Data logger 32-channel dengan multiplexer terintegrasi. Untuk bendungan besar dengan puluhan sensor VW tersebar di berbagai section.', use: 'Bendungan besar, dam-gallery, multi-section',
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
		] }
	];

	const variants = $derived(
		data.subSolutionDetail?.products && data.subSolutionDetail.products.length > 0
			? data.subSolutionDetail.products.map((p: any) => ({
				name: p.name, subtitle: p.use_case ?? '', desc: p.description ?? '', use: p.use_case ?? '',
				image: p.main_image ?? p.thumbnail ?? null, brochure_pdf: p.brochure_pdf ?? null,
				specs: Array.isArray(p.highlight_points) ? p.highlight_points.map((pt: string, i: number) => ({ label: `Fitur ${i + 1}`, value: pt })) : [],
				components: Array.isArray(p.components) ? p.components : []
			}))
			: fallbackVariants
	);

	const fallbackProjects = [
		{ name: 'Bendungan Ciawi', client: 'BBWS Ciliwung-Cisadane', year: '2023' },
		{ name: 'Bendungan Cipanas', client: 'BWS Ciliwung-Cisadane', year: '2022' },
		{ name: 'Bendungan Keureuto', client: 'BWS Sumatera I', year: '2023' },
		{ name: 'Bendungan Sepaku IKN', client: 'BWS Kalimantan IV', year: '2024' }
	];
	const projects = $derived(mapTrackRecords(data.subSolutionDetail?.track_records, fallbackProjects));

	const copy = $derived(
		$locale === 'EN'
			? {
					home: 'Home', solutions: 'Solutions', parent: 'Infrastructure Security',
					eyebrow: 'Infrastructure Security · Vibrating Wire',
					title1: 'Dozens of sensors,', title2: 'one screen.',
					consult: 'Consult AVWR', other: 'Other Solutions', live: 'LIVE',
					fig: 'FIG.09 — VW RECORDER', active: 'ACTIVE CH', freq: 'FREQUENCY', status: 'ONLINE',
					chainBadge: 'Signal Chain', chainTitle: 'From a gallery of gauges to one dashboard',
					chainDesc: 'Every vibrating-wire sensor is sampled simultaneously, temperature-corrected, and streamed over 4G / RS-485 into STESY — dam-body data, all in sync.',
					capBadge: 'Capabilities', capTitle: 'Read the whole dam body at once',
					appBadge: 'Where it works', appTitle: 'For every gauge buried in the structure',
					appDesc: 'Dam galleries, piezometers, settlement gauges, load cells, and strain gauges.',
					trackBadge: 'Track Record', trackTitle: 'Already deployed at',
					ctaBadge: 'Next Step', ctaTitle: 'Wire up your dam with AVWR',
					ctaDesc: 'Our engineers will map your sensor channels and integrate the logger into your STESY dashboard.',
					ctaPrimary: 'Consult AVWR', ctaSecondary: 'Explore Other Products'
				}
			: {
					home: 'Beranda', solutions: 'Solusi', parent: 'Infrastructure Security',
					eyebrow: 'Infrastructure Security · Vibrating Wire',
					title1: 'Puluhan sensor,', title2: 'satu layar.',
					consult: 'Konsultasi AVWR', other: 'Solusi Lain', live: 'LIVE',
					fig: 'FIG.09 — VW RECORDER', active: 'CH AKTIF', freq: 'FREKUENSI', status: 'ONLINE',
					chainBadge: 'Rantai Sinyal', chainTitle: 'Dari galeri instrumen ke satu dashboard',
					chainDesc: 'Setiap sensor vibrating wire dibaca simultan, dikoreksi suhu, dan dialirkan lewat 4G / RS-485 ke STESY — data tubuh bendungan, semuanya sinkron.',
					capBadge: 'Kemampuan', capTitle: 'Baca seluruh tubuh bendungan sekaligus',
					appBadge: 'Penerapan', appTitle: 'Untuk setiap sensor yang tertanam di struktur',
					appDesc: 'Galeri bendungan, piezometer, settlement gauge, load cell, dan strain gauge.',
					trackBadge: 'Track Record', trackTitle: 'Sudah Terpasang Di',
					ctaBadge: 'Langkah Selanjutnya', ctaTitle: 'Hubungkan bendungan Anda dengan AVWR',
					ctaDesc: 'Tim engineer kami akan memetakan channel sensor Anda dan mengintegrasikan logger ke dashboard STESY.',
					ctaPrimary: 'Konsultasi AVWR', ctaSecondary: 'Jelajahi Produk Lain'
				}
	);

	// ── Live VW channel matrix ──
	let mounted = $state(false);
	let cells = $state<number[]>(Array(32).fill(0.5));
	let freq = $state(0);
	const activeCh = $derived(cells.filter((c) => c > 0.18).length);

	onMount(() => {
		mounted = true;
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const tick = () => {
			cells = Array.from({ length: 32 }, () => Math.round(Math.random() * 100) / 100);
			freq = Math.round(2820 + Math.random() * 460);
		};
		tick();
		if (reduce) return;
		const id = setInterval(tick, 2000);
		return () => clearInterval(id);
	});

	const chain = [
		{ icon: Radio, k: '01', t: $locale === 'EN' ? 'VW Sensors' : 'Sensor VW', d: $locale === 'EN' ? 'All brands' : 'Semua merek' },
		{ icon: Cpu, k: '02', t: $locale === 'EN' ? 'Multiplexer' : 'Multiplexer', d: $locale === 'EN' ? '32-ch logger' : 'Logger 32-ch' },
		{ icon: HardDrive, k: '03', t: $locale === 'EN' ? 'Transmission' : 'Transmisi', d: 'RS-485 · 4G/LTE' },
		{ icon: LayoutDashboard, k: '04', t: 'STESY', d: 'Dashboard' }
	];

	const capabilities = $derived([
		{ icon: Cpu, value: '32', unit: 'ch', label: $locale === 'EN' ? 'Simultaneous channels' : 'Channel simultan' },
		{ icon: Gauge, value: '±0.025', unit: '%', label: $locale === 'EN' ? 'Full-scale accuracy' : 'Akurasi full-scale' },
		{ icon: Radio, value: 'Any', unit: '', label: $locale === 'EN' ? 'VW brand support' : 'Semua merek VW' },
		{ icon: ShieldCheck, value: 'IP67', unit: '', label: $locale === 'EN' ? 'Gallery-rated' : 'Tahan galeri dam' }
	]);

	const applications = $derived([
		{ icon: Waves, label: $locale === 'EN' ? 'Dam Galleries' : 'Galeri Bendungan' },
		{ icon: Gauge, label: 'Piezometer' },
		{ icon: Layers, label: $locale === 'EN' ? 'Settlement Gauge' : 'Settlement Gauge' },
		{ icon: Box, label: 'Load Cell' },
		{ icon: Activity, label: 'Strain Gauge' }
	]);
</script>

<svelte:head>
	<title>AVWR — Automatic Vibrating Wire Recorder — Beacon Engineering</title>
	<meta name="description" content="AVWR Beacon Engineering: pembacaan otomatis sensor vibrating wire untuk monitoring tekanan pore, settlement, dan stress pada bendungan." />
</svelte:head>

<div class="border-b" style="background: #100A0B; border-color: rgba(200,16,46,0.18);">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
		<nav class="flex items-center gap-1.5 text-xs font-mono" style="color: #8a767a;">
			<a href="/" class="hover:text-[#FF4D6D] transition-colors">{copy.home}</a>
			<ChevronRight size={11} />
			<a href="/solusi" class="hover:text-[#FF4D6D] transition-colors">{copy.solutions}</a>
			<ChevronRight size={11} />
			<a href="/solusi/infrastructure-security" class="hover:text-[#FF4D6D] transition-colors">{copy.parent}</a>
			<ChevronRight size={11} />
			<span class="font-semibold" style="color: {ACCENT_SOFT};">AVWR</span>
		</nav>
	</div>
</div>

<!-- HERO -->
<section class="relative overflow-hidden" style="background: #0C0809;">
	<div class="avwr-grid absolute inset-0 pointer-events-none"></div>
	<div class="absolute -top-40 right-[-10%] w-[680px] h-[680px] rounded-full pointer-events-none" style="background: radial-gradient(circle, rgba(200,16,46,0.18) 0%, transparent 62%);"></div>
	<div class="absolute inset-x-0 top-0 h-px" style="background: linear-gradient(90deg, transparent, rgba(200,16,46,0.55), transparent);"></div>

	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
		<div class="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-10 items-center">
			<div>
				<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.18em] mb-8" style="background: rgba(200,16,46,0.1); color: #FF8095; border: 1px solid rgba(200,16,46,0.28); opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 10}px); transition: all .7s cubic-bezier(.16,1,.3,1) .05s;">
					<ShieldCheck size={13} />{copy.eyebrow}
				</div>
				<h1 class="font-heading font-extrabold tracking-tighter text-white leading-[0.98] text-5xl sm:text-6xl lg:text-[64px]" style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 18}px); transition: all .8s cubic-bezier(.16,1,.3,1) .15s;">
					{copy.title1}<br /><span class="avwr-gradient">{copy.title2}</span>
				</h1>
				<div class="mt-7 flex items-baseline gap-3" style="opacity: {mounted ? 1 : 0}; transition: opacity .8s ease .3s;">
					<span class="font-heading text-2xl font-bold" style="color: {ACCENT_SOFT};">AVWR</span>
					<span class="text-sm text-zinc-500 font-mono">Automatic Vibrating Wire Recorder</span>
				</div>
				<div class="avwr-lead mt-5 max-w-[46ch] text-lg leading-relaxed text-zinc-400" style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 12}px); transition: all .8s cubic-bezier(.16,1,.3,1) .4s;">
					{@html mainContent}
				</div>
				<div class="mt-10 flex flex-wrap gap-3" style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 12}px); transition: all .8s cubic-bezier(.16,1,.3,1) .5s;">
					<button type="button" onclick={openChat} class="btn-tactile inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white" style="background: linear-gradient(135deg, #C8102E, #A50D25); box-shadow: 0 10px 30px -10px rgba(200,16,46,0.7);">
						<MessageCircle size={16} />{copy.consult}
					</button>
					<a href="/solusi/infrastructure-security" class="btn-tactile inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-zinc-200 transition-colors hover:text-white" style="border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.03);">
						{copy.other}<ArrowRight size={15} />
					</a>
				</div>
			</div>

			<!-- Live VW channel matrix -->
			<div class="relative flex justify-center lg:justify-end" style="opacity: {mounted ? 1 : 0}; transform: scale({mounted ? 1 : 0.94}); transition: all .9s cubic-bezier(.16,1,.3,1) .35s;">
				<div class="avwr-instrument relative w-[360px] max-w-full rounded-[28px] p-6">
					<div class="flex items-center justify-between mb-5">
						<span class="font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-500">{copy.fig}</span>
						<span class="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-300">
							<span class="relative flex h-2 w-2">
								<span class="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping" style="background: {LIVE};"></span>
								<span class="relative inline-flex h-2 w-2 rounded-full" style="background: {LIVE};"></span>
							</span>{copy.live}
						</span>
					</div>

					<!-- channel matrix -->
					<div class="avwr-matrix mb-5">
						{#each cells as c, i}
							<div class="avwr-cell" style="background: rgba(200,16,46,{0.12 + c * 0.78}); box-shadow: {c > 0.7 ? '0 0 8px rgba(255,77,109,0.7)' : 'none'};">
								<span class="avwr-cell-id">{String(i + 1).padStart(2, '0')}</span>
							</div>
						{/each}
					</div>

					<!-- readouts -->
					<div class="grid grid-cols-3 gap-2.5">
						<div class="avwr-readout">
							<span class="font-mono text-[8px] tracking-[0.14em] text-zinc-500">{copy.active}</span>
							<span class="font-mono text-sm font-bold tabular-nums" style="color: {ACCENT_SOFT};">{activeCh}<span class="text-[9px] text-zinc-500">/32</span></span>
						</div>
						<div class="avwr-readout">
							<span class="font-mono text-[8px] tracking-[0.14em] text-zinc-500">{copy.freq}</span>
							<span class="font-mono text-sm font-bold tabular-nums text-white">{freq}<span class="text-[9px] text-zinc-500"> Hz</span></span>
						</div>
						<div class="avwr-readout">
							<span class="font-mono text-[8px] tracking-[0.14em] text-zinc-500">STATUS</span>
							<span class="inline-flex items-center gap-1.5 font-mono text-[13px] font-bold" style="color: {LIVE};">
								<span class="w-1.5 h-1.5 rounded-full" style="background: {LIVE};"></span>{copy.status}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- SIGNAL CHAIN -->
<section class="relative py-20 lg:py-28 bg-white overflow-hidden">
	<div class="absolute inset-0 pointer-events-none opacity-[0.5]" style="background: radial-gradient(60% 60% at 50% 0%, rgba(200,16,46,0.05), transparent 70%);"></div>
	<div class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="max-w-2xl mb-14">
			<span class="font-mono text-xs font-bold uppercase tracking-[0.2em]" style="color: {ACCENT};">{copy.chainBadge}</span>
			<h2 class="font-heading text-3xl sm:text-4xl font-bold mt-3 leading-[1.12]" style="color: #1A1A1A; letter-spacing: -0.02em;">{copy.chainTitle}</h2>
			<p class="text-base leading-relaxed mt-4" style="color: #5C5C5C;">{copy.chainDesc}</p>
		</div>
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-3">
			{#each chain as step, i}
				{@const Icon = step.icon}
				<div class="group relative rounded-2xl p-6 bg-white transition-all duration-300 hover:-translate-y-1" style="border: 1px solid #E5E5E5;">
					{#if i < chain.length - 1}
						<div class="hidden lg:flex absolute top-0 bottom-0 right-[-6px] translate-x-1/2 z-20 items-center">
							<div class="flex items-center justify-center w-[26px] h-[26px] rounded-full bg-white text-[#C8102E]" style="border: 1px solid #E5E5E5; box-shadow: 0 2px 6px rgba(0,0,0,0.05);"><ArrowRight size={13} strokeWidth={2.5} /></div>
						</div>
					{/if}
					<div class="flex items-center justify-between mb-5">
						<div class="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style="background: rgba(200,16,46,0.09);">
							<Icon size={20} style="color: {ACCENT};" />
						</div>
						<span class="font-mono text-[11px] font-bold tracking-widest text-[#CFCFCF]">{step.k}</span>
					</div>
					<h3 class="font-heading text-lg font-bold" style="color: #1A1A1A;">{step.t}</h3>
					<p class="text-xs font-mono mt-1" style="color: #9A9A9A;">{step.d}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- CAPABILITIES -->
<section class="relative py-20 lg:py-24 overflow-hidden" style="background: #130A0C;">
	<div class="avwr-grid absolute inset-0 pointer-events-none opacity-60"></div>
	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="max-w-2xl mb-12">
			<span class="font-mono text-xs font-bold uppercase tracking-[0.2em]" style="color: {ACCENT_SOFT};">{copy.capBadge}</span>
			<h2 class="font-heading text-3xl sm:text-4xl font-bold mt-3 text-white leading-[1.12]" style="letter-spacing: -0.02em;">{copy.capTitle}</h2>
		</div>
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
			{#each capabilities as cap}
				{@const Icon = cap.icon}
				<div class="rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1" style="background: rgba(255,255,255,0.025); border: 1px solid rgba(200,16,46,0.18);">
					<div class="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style="background: rgba(200,16,46,0.13);">
						<Icon size={20} style="color: {ACCENT_SOFT};" />
					</div>
					<div class="flex items-baseline gap-1.5">
						<span class="font-heading text-3xl font-extrabold text-white tabular-nums tracking-tight">{cap.value}</span>
						{#if cap.unit}<span class="text-sm font-medium text-zinc-500">{cap.unit}</span>{/if}
					</div>
					<p class="text-xs mt-2 leading-snug" style="color: #B49AA0;">{cap.label}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- PRODUCT — kept as-is -->
<ProductVariantDossier {variants} productName="AVWR" />

<!-- APPLICATIONS -->
<section class="relative py-20 lg:py-28 bg-[#FAFAFA] overflow-hidden">
	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="max-w-2xl mb-14">
			<span class="font-mono text-xs font-bold uppercase tracking-[0.2em]" style="color: {ACCENT};">{copy.appBadge}</span>
			<h2 class="font-heading text-3xl sm:text-4xl font-bold mt-3 leading-[1.12]" style="color: #1A1A1A; letter-spacing: -0.02em;">{copy.appTitle}</h2>
			<p class="text-base leading-relaxed mt-4" style="color: #5C5C5C;">{copy.appDesc}</p>
		</div>
		<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
			{#each applications as app}
				{@const Icon = app.icon}
				<div class="group flex flex-col items-center justify-center gap-3 rounded-2xl py-7 px-3 bg-white text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_-22px_rgba(200,16,46,0.5)]" style="border: 1px solid #E5E5E5;">
					<div class="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110" style="background: rgba(200,16,46,0.07);">
						<Icon size={22} style="color: {ACCENT};" />
					</div>
					<span class="text-xs font-semibold leading-tight" style="color: #3A3A3A;">{app.label}</span>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- TRACK RECORD -->
<section class="relative py-16 lg:py-24 bg-white overflow-hidden">
	<div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="max-w-2xl mb-12">
			<span class="font-mono text-xs font-bold uppercase tracking-[0.2em]" style="color: {ACCENT};">{copy.trackBadge}</span>
			<h2 class="font-heading text-3xl sm:text-4xl font-bold mt-3" style="color: #1A1A1A; letter-spacing: -0.02em;">{copy.trackTitle}</h2>
		</div>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{#each projects as proj}
				<div class="p-5 rounded-2xl bg-[#FAFAFA] transition-all hover:-translate-y-1 hover:shadow-[0_16px_36px_-22px_rgba(200,16,46,0.45)]" style="border: 1px solid #E5E5E5;">
					<div class="flex items-center gap-2 mb-2">
						<span class="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md text-white tabular-nums" style="background: {ACCENT};">{proj.year}</span>
						<div class="w-1.5 h-1.5 rounded-full animate-pulse-dot" style="background: {LIVE};"></div>
					</div>
					<h3 class="font-heading text-sm font-bold" style="color: #1A1A1A;">{proj.name}</h3>
					<p class="text-xs mt-1" style="color: #5C5C5C;">{proj.client}</p>
					{#if proj.location}<p class="text-[11px] mt-1 font-mono" style="color: #8A8A8A;">{proj.location}</p>{/if}
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- CTA -->
<section class="relative py-20 bg-white">
	<div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
		<div class="relative overflow-hidden rounded-[2.5rem] p-10 sm:p-16 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-12 group" style="background: #1A0A0D; box-shadow: 0 40px 80px -24px rgba(26,10,13,0.55);">
			<div class="avwr-grid absolute inset-0 pointer-events-none opacity-50"></div>
			<div class="absolute -top-32 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none" style="background: rgba(200,16,46,0.18);"></div>
			<div class="relative z-10 text-center lg:text-left flex-1 max-w-2xl">
				<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.2em] mb-6" style="background: rgba(200,16,46,0.16); color: #FF8095; border: 1px solid rgba(200,16,46,0.32);">
					<span class="w-1.5 h-1.5 rounded-full" style="background: {ACCENT_SOFT}; box-shadow: 0 0 10px {ACCENT_SOFT};"></span>{copy.ctaBadge}
				</span>
				<h2 class="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tighter mb-4">{copy.ctaTitle}</h2>
				<p class="text-lg text-zinc-400 font-medium">{copy.ctaDesc}</p>
			</div>
			<div class="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto shrink-0">
				<button type="button" onclick={openChat} class="btn-tactile w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white" style="background: linear-gradient(135deg, #C8102E, #A50D25); box-shadow: 0 10px 30px -10px rgba(200,16,46,0.7);">
					<MessageCircle size={18} />{copy.ctaPrimary}
				</button>
				<a href="/solusi/infrastructure-security" class="btn-tactile w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white transition-colors hover:bg-white/5" style="border: 1px solid rgba(255,255,255,0.15);">
					<ArrowRight size={18} />{copy.ctaSecondary}
				</a>
			</div>
		</div>
	</div>
</section>

<style>
	.avwr-gradient { background: linear-gradient(100deg, #FF4D6D 0%, #C8102E 55%, #A50D25 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
	.avwr-lead :global(p) { margin: 0; }
	.avwr-grid {
		background-image: linear-gradient(rgba(200,16,46,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(200,16,46,0.07) 1px, transparent 1px);
		background-size: 38px 38px;
		mask-image: radial-gradient(120% 100% at 50% 0%, #000 30%, transparent 78%);
		-webkit-mask-image: radial-gradient(120% 100% at 50% 0%, #000 30%, transparent 78%);
	}
	.avwr-instrument {
		background: linear-gradient(180deg, rgba(200,16,46,0.05), rgba(12,8,9,0.6));
		border: 1px solid rgba(200,16,46,0.22);
		box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 40px 80px -30px rgba(0,0,0,0.8);
		backdrop-filter: blur(6px);
	}
	.avwr-matrix {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		gap: 5px;
		border-radius: 14px;
		padding: 12px;
		background: rgba(255,255,255,0.03);
		border: 1px solid rgba(200,16,46,0.22);
		box-shadow: inset 0 0 30px rgba(0,0,0,0.5);
	}
	.avwr-cell {
		position: relative;
		aspect-ratio: 1;
		border-radius: 5px;
		border: 1px solid rgba(255,255,255,0.06);
		transition: background 1.6s ease, box-shadow 1.6s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.avwr-cell-id { font-family: var(--font-mono, monospace); font-size: 7px; font-weight: 700; color: rgba(255,255,255,0.55); }
	.avwr-readout { display: flex; flex-direction: column; gap: 2px; border-radius: 12px; padding: 9px 11px; background: rgba(255,255,255,0.03); border: 1px solid rgba(200,16,46,0.16); }
	@media (prefers-reduced-motion: reduce) { .avwr-cell { transition: none; } }
</style>
