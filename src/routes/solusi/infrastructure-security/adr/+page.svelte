<script lang="ts">
	import { onMount } from 'svelte';
	import {
		ArrowRight,
		MessageCircle,
		ChevronRight,
		ShieldCheck,
		Crosshair,
		Move,
		Layers,
		Bell,
		Cpu,
		HardDrive,
		Radio,
		LayoutDashboard,
		Waves,
		Mountain,
		TriangleAlert,
		Construction,
		Building2
	} from '@lucide/svelte';
	import { locale } from '$lib/i18n';
	import { openChat } from '$lib/stores/chat';
	import ProductVariantDossier from '$lib/components/ProductVariantDossier.svelte';
	import { mapTrackRecords } from '$lib/loaders/sub-solution';

	let { data } = $props();

	// Brand identity stays RED. Green only as the tiny "live" status dot.
	const ACCENT = '#C8102E';
	const ACCENT_SOFT = '#FF4D6D';
	const LIVE = '#1B7F3A';

	const ss = $derived(data.subSolutionDetail?.sub_solution ?? null);
	const mainContent = $derived(
		ss?.main_content?.trim() ||
			'<p>Sistem telemetri otomatis untuk memantau deformasi atau pergeseran struktur secara real-time, akurat, dan tanpa intervensi manual ke lapangan.</p>'
	);

	// ─── PRODUCT DATA (kept as-is — feeds ProductVariantDossier) ───
	const fallbackVariants = [
		{ name: 'BD-400', subtitle: 'Surface Deformation', desc: 'Pemantauan pergeseran permukaan tubuh bendungan menggunakan LVDT dan crack meter. Instalasi di permukaan, mudah maintenance.', use: 'Crest bendungan, retaining wall, terowongan' ,
		specs: [
		{ label: 'Resolusi', value: '0.001 mm' },
		{ label: 'Range Pengukuran', value: '±50 mm' },
		{ label: 'Akurasi', value: '±0.005 mm' },
		{ label: 'Tipe Sensor', value: 'LVDT / Crack Meter' },
		{ label: 'Jumlah Channel', value: 'Hingga 16 sensor' },
		{ label: 'Proteksi', value: 'IP67' },
		{ label: 'Interval Data', value: '1 – 60 menit (konfigurabel)' },
		{ label: 'Komunikasi', value: '4G/LTE, GSM' },
		{ label: 'Power Supply', value: 'Solar Panel + Battery' },
		{ label: 'Alert System', value: 'Multi-level threshold' },
		{ label: 'Platform', value: 'STESY Integration' },
		{ label: 'Standar', value: 'SNI Compliant' }
	]
	},
		{ name: 'BD-410', subtitle: 'Deep Settlement', desc: 'Monitoring settlement dan penurunan tanah dalam menggunakan settlement gauge dan extensometer. Sensor tertanam di tubuh bendungan.', use: 'Pondasi bendungan, timbunan, lereng dalam' ,
		specs: [
		{ label: 'Resolusi', value: '0.001 mm' },
		{ label: 'Range Pengukuran', value: '±50 mm' },
		{ label: 'Akurasi', value: '±0.005 mm' },
		{ label: 'Tipe Sensor', value: 'LVDT / Crack Meter' },
		{ label: 'Jumlah Channel', value: 'Hingga 16 sensor' },
		{ label: 'Proteksi', value: 'IP67' },
		{ label: 'Interval Data', value: '1 – 60 menit (konfigurabel)' },
		{ label: 'Komunikasi', value: '4G/LTE, GSM' },
		{ label: 'Power Supply', value: 'Solar Panel + Battery' },
		{ label: 'Alert System', value: 'Multi-level threshold' },
		{ label: 'Platform', value: 'STESY Integration' },
		{ label: 'Standar', value: 'SNI Compliant' }
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

	const fallbackProjects = [
		{ name: 'Bendungan Ciawi', client: 'BBWS Ciliwung-Cisadane', year: '2023' },
		{ name: 'Bendungan Sukamahi', client: 'BBWS Ciliwung-Cisadane', year: '2023' },
		{ name: 'Bendungan Margatiga', client: 'BWS Mesuji-Sekampung', year: '2024' },
		{ name: 'Bendungan Gondang', client: 'BWS Bengawan Solo', year: '2022' }
	];

	const projects = $derived(mapTrackRecords(data.subSolutionDetail?.track_records, fallbackProjects));

	const copy = $derived(
		$locale === 'EN'
			? {
					home: 'Home',
					solutions: 'Solutions',
					eyebrow: 'Infrastructure Security · Structural Monitoring',
					title1: 'Before it cracks,',
					title2: 'it shifts.',
					consult: 'Consult ADR',
					other: 'Other Solutions',
					live: 'LIVE',
					fig: 'FIG.02 — DEFORMATION MONITOR',
					peak: 'PEAK Δ',
					status: 'NORMAL',
					chainBadge: 'Signal Chain',
					chainTitle: 'From a micron of movement to your dashboard',
					chainDesc:
						'Surface and embedded sensors are read by a multi-channel datalogger and streamed over RS485 / 4G — straight into STESY, with no field visit.',
					capBadge: 'Capabilities',
					capTitle: 'Built to catch what the eye never will',
					appBadge: 'Where it works',
					appTitle: 'For structures that must not move unnoticed',
					appDesc: 'Dams, embankments, slopes, landslide-prone cliffs, tunnels, and retaining walls.',
					trackBadge: 'Track Record',
					trackTitle: 'Already deployed at',
					ctaBadge: 'Next Step',
					ctaTitle: 'Monitor your structure with ADR',
					ctaDesc:
						'Our engineers will map the right deformation-monitoring layout and integrate it into your STESY dashboard.',
					ctaPrimary: 'Consult ADR',
					ctaSecondary: 'Explore Other Products'
				}
			: {
					home: 'Beranda',
					solutions: 'Solusi',
					eyebrow: 'Infrastructure Security · Structural Monitoring',
					title1: 'Sebelum retak,',
					title2: 'struktur bergeser.',
					consult: 'Konsultasi ADR',
					other: 'Solusi Lain',
					live: 'LIVE',
					fig: 'FIG.02 — MONITOR DEFORMASI',
					peak: 'PUNCAK Δ',
					status: 'NORMAL',
					chainBadge: 'Rantai Sinyal',
					chainTitle: 'Dari satu mikron pergerakan hingga dashboard Anda',
					chainDesc:
						'Sensor permukaan dan tertanam dibaca datalogger multi-kanal lalu dialirkan lewat RS485 / 4G — langsung ke STESY, tanpa kunjungan lapangan.',
					capBadge: 'Kemampuan',
					capTitle: 'Menangkap yang tak pernah terlihat mata',
					appBadge: 'Penerapan',
					appTitle: 'Untuk struktur yang tak boleh bergeser diam-diam',
					appDesc: 'Bendungan, tanggul, lereng, tebing rawan longsor, terowongan, dan retaining wall.',
					trackBadge: 'Track Record',
					trackTitle: 'Sudah Terpasang Di',
					ctaBadge: 'Langkah Selanjutnya',
					ctaTitle: 'Pantau struktur Anda dengan ADR',
					ctaDesc:
						'Tim engineer kami akan merancang tata letak monitoring deformasi yang tepat dan mengintegrasikannya ke dashboard STESY.',
					ctaPrimary: 'Konsultasi ADR',
					ctaSecondary: 'Jelajahi Produk Lain'
				}
	);

	// ── Live deformation monitor (3 channels, gentle micron drift) ──
	let dx = $state(0);
	let dy = $state(0);
	let dz = $state(0);
	let mounted = $state(false);

	const fmtMM = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(3)}`;
	const peak = $derived(Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz)));
	const off = (v: number) => Math.max(-88, Math.min(88, v * 1600));

	onMount(() => {
		mounted = true;
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const r = () => Math.round((Math.random() * 0.1 - 0.05) * 1000) / 1000;
		if (reduce) {
			dx = 0.012; dy = -0.007; dz = 0.019;
			return;
		}
		const tick = () => { dx = r(); dy = r(); dz = r(); };
		tick();
		const id = setInterval(tick, 2200);
		return () => clearInterval(id);
	});

	const channels = $derived([
		{ key: $locale === 'EN' ? 'Δ HORIZONTAL' : 'Δ HORIZONTAL', get: () => dx },
		{ key: $locale === 'EN' ? 'Δ LATERAL' : 'Δ LATERAL', get: () => dy },
		{ key: $locale === 'EN' ? 'Δ SETTLEMENT' : 'Δ SETTLEMENT', get: () => dz }
	]);

	const chain = [
		{ icon: Crosshair, k: '01', t: $locale === 'EN' ? 'Deformation Sensor' : 'Sensor Deformasi', d: 'LVDT · Crack meter' },
		{ icon: HardDrive, k: '02', t: 'Datalogger', d: $locale === 'EN' ? 'Up to 16 channels' : 'Hingga 16 kanal' },
		{ icon: Radio, k: '03', t: $locale === 'EN' ? 'Transmission' : 'Transmisi', d: 'RS485 · 4G/LTE' },
		{ icon: LayoutDashboard, k: '04', t: 'STESY', d: 'Dashboard' }
	];

	const capabilities = $derived([
		{ icon: Crosshair, value: '0.001', unit: 'mm', label: $locale === 'EN' ? 'Micro-millimeter resolution' : 'Resolusi mikro-milimeter' },
		{ icon: Move, value: '±50', unit: 'mm', label: $locale === 'EN' ? 'Measurement range' : 'Range pengukuran' },
		{ icon: Layers, value: '16', unit: $locale === 'EN' ? 'ch' : 'kanal', label: $locale === 'EN' ? 'Multi-channel logging' : 'Perekaman multi-kanal' },
		{ icon: Bell, value: $locale === 'EN' ? 'Multi' : 'Multi', unit: '', label: $locale === 'EN' ? 'Level alert thresholds' : 'Ambang alert berjenjang' }
	]);

	const applications = $derived([
		{ icon: Waves, label: $locale === 'EN' ? 'Dams' : 'Bendungan' },
		{ icon: Layers, label: $locale === 'EN' ? 'Embankments' : 'Tanggul' },
		{ icon: Mountain, label: $locale === 'EN' ? 'Slopes' : 'Lereng' },
		{ icon: TriangleAlert, label: $locale === 'EN' ? 'Cliffs' : 'Tebing Longsor' },
		{ icon: Construction, label: $locale === 'EN' ? 'Tunnels' : 'Terowongan' },
		{ icon: Building2, label: $locale === 'EN' ? 'Retaining Walls' : 'Retaining Wall' }
	]);
</script>

<svelte:head>
	<title>ADR — Automatic Deformation Recorder — Beacon Engineering</title>
	<meta name="description" content="ADR Beacon Engineering: rekam pergeseran dan deformasi struktur dalam satuan mikro-milimeter, 24/7 monitoring, terintegrasi STESY." />
</svelte:head>

<!-- Breadcrumb -->
<div class="border-b" style="background: #100A0B; border-color: rgba(200,16,46,0.18);">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
		<nav class="flex items-center gap-1.5 text-xs font-mono" style="color: #8a767a;">
			<a href="/" class="hover:text-[#FF4D6D] transition-colors">{copy.home}</a>
			<ChevronRight size={11} />
			<a href="/solusi" class="hover:text-[#FF4D6D] transition-colors">{copy.solutions}</a>
			<ChevronRight size={11} />
			<a href="/solusi/infrastructure-security" class="hover:text-[#FF4D6D] transition-colors">Infrastructure Security</a>
			<ChevronRight size={11} />
			<span class="font-semibold" style="color: {ACCENT_SOFT};">ADR</span>
		</nav>
	</div>
</div>

<!-- ════════ HERO — dark blueprint instrument panel ════════ -->
<section class="relative overflow-hidden" style="background: #0C0809;">
	<div class="adr-grid absolute inset-0 pointer-events-none"></div>
	<div class="absolute -top-40 right-[-10%] w-[680px] h-[680px] rounded-full pointer-events-none" style="background: radial-gradient(circle, rgba(200,16,46,0.18) 0%, transparent 62%);"></div>
	<div class="absolute inset-x-0 top-0 h-px" style="background: linear-gradient(90deg, transparent, rgba(200,16,46,0.55), transparent);"></div>

	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
		<div class="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-10 items-center">
			<div>
				<div
					class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.18em] mb-8"
					style="background: rgba(200,16,46,0.1); color: #FF8095; border: 1px solid rgba(200,16,46,0.28); opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 10}px); transition: all .7s cubic-bezier(.16,1,.3,1) .05s;"
				>
					<ShieldCheck size={13} />
					{copy.eyebrow}
				</div>

				<h1
					class="font-heading font-extrabold tracking-tighter text-white leading-[0.98] text-5xl sm:text-6xl lg:text-[72px]"
					style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 18}px); transition: all .8s cubic-bezier(.16,1,.3,1) .15s;"
				>
					{copy.title1}<br />
					<span class="adr-gradient">{copy.title2}</span>
				</h1>

				<div class="mt-7 flex items-baseline gap-3" style="opacity: {mounted ? 1 : 0}; transition: opacity .8s ease .3s;">
					<span class="font-heading text-2xl font-bold" style="color: {ACCENT_SOFT};">ADR</span>
					<span class="text-sm text-zinc-500 font-mono">Automatic Deformation Recorder</span>
				</div>

				<div
					class="adr-lead mt-5 max-w-[46ch] text-lg leading-relaxed text-zinc-400"
					style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 12}px); transition: all .8s cubic-bezier(.16,1,.3,1) .4s;"
				>
					{@html mainContent}
				</div>

				<div class="mt-10 flex flex-wrap gap-3" style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 12}px); transition: all .8s cubic-bezier(.16,1,.3,1) .5s;">
					<button
						type="button"
						onclick={openChat}
						class="btn-tactile inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white"
						style="background: linear-gradient(135deg, #C8102E, #A50D25); box-shadow: 0 10px 30px -10px rgba(200,16,46,0.7);"
					>
						<MessageCircle size={16} />
						{copy.consult}
					</button>
					<a
						href="/solusi/infrastructure-security"
						class="btn-tactile inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-zinc-200 transition-colors hover:text-white"
						style="border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.03);"
					>
						{copy.other}
						<ArrowRight size={15} />
					</a>
				</div>
			</div>

			<!-- Right: live deformation monitor -->
			<div
				class="relative flex justify-center lg:justify-end"
				style="opacity: {mounted ? 1 : 0}; transform: scale({mounted ? 1 : 0.94}); transition: all .9s cubic-bezier(.16,1,.3,1) .35s;"
			>
				<div class="adr-instrument relative w-[360px] max-w-full rounded-[28px] p-6">
					<div class="flex items-center justify-between mb-6">
						<span class="font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-500">{copy.fig}</span>
						<span class="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-300">
							<span class="relative flex h-2 w-2">
								<span class="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping" style="background: {LIVE};"></span>
								<span class="relative inline-flex h-2 w-2 rounded-full" style="background: {LIVE};"></span>
							</span>
							{copy.live}
						</span>
					</div>

					<!-- channels -->
					<div class="space-y-5">
						{#each channels as ch}
							{@const v = ch.get()}
							<div>
								<div class="flex items-center justify-between mb-2">
									<span class="font-mono text-[10px] tracking-[0.18em] text-zinc-500">{ch.key}</span>
									<span class="font-mono text-sm font-bold tabular-nums" style="color: {ACCENT_SOFT};">{fmtMM(v)} mm</span>
								</div>
								<div class="adr-track">
									<div class="adr-track-center"></div>
									<div class="adr-marker" style="transform: translate(calc(-50% + {off(v)}px), -50%);"></div>
								</div>
							</div>
						{/each}
					</div>

					<!-- footer -->
					<div class="grid grid-cols-2 gap-2.5 mt-6">
						<div class="adr-readout">
							<span class="font-mono text-[9px] tracking-[0.2em] text-zinc-500">{copy.peak}</span>
							<span class="font-mono text-base font-bold tabular-nums text-white">{peak.toFixed(3)} mm</span>
						</div>
						<div class="adr-readout">
							<span class="font-mono text-[9px] tracking-[0.2em] text-zinc-500">STATUS</span>
							<span class="inline-flex items-center gap-1.5 font-mono text-base font-bold" style="color: {LIVE};">
								<span class="w-1.5 h-1.5 rounded-full" style="background: {LIVE};"></span>{copy.status}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- ════════ SIGNAL CHAIN ════════ -->
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

<!-- ════════ CAPABILITIES band (dark) ════════ -->
<section class="relative py-20 lg:py-24 overflow-hidden" style="background: #130A0C;">
	<div class="adr-grid absolute inset-0 pointer-events-none opacity-60"></div>
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

<!-- ════════ PRODUCT — kept as-is (already good) ════════ -->
<ProductVariantDossier {variants} productName="ADR" />

<!-- ════════ APPLICATIONS ════════ -->
<section class="relative py-20 lg:py-28 bg-[#FAFAFA] overflow-hidden">
	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="max-w-2xl mb-14">
			<span class="font-mono text-xs font-bold uppercase tracking-[0.2em]" style="color: {ACCENT};">{copy.appBadge}</span>
			<h2 class="font-heading text-3xl sm:text-4xl font-bold mt-3 leading-[1.12]" style="color: #1A1A1A; letter-spacing: -0.02em;">{copy.appTitle}</h2>
			<p class="text-base leading-relaxed mt-4" style="color: #5C5C5C;">{copy.appDesc}</p>
		</div>
		<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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

<!-- ════════ TRACK RECORD ════════ -->
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
					{#if proj.location}
						<p class="text-[11px] mt-1 font-mono" style="color: #8A8A8A;">{proj.location}</p>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ════════ CTA ════════ -->
<section class="relative py-20 bg-white">
	<div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
		<div class="relative overflow-hidden rounded-[2.5rem] p-10 sm:p-16 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-12 group" style="background: #1A0A0D; box-shadow: 0 40px 80px -24px rgba(26,10,13,0.55);">
			<div class="adr-grid absolute inset-0 pointer-events-none opacity-50"></div>
			<div class="absolute -top-32 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none" style="background: rgba(200,16,46,0.18);"></div>
			<div class="relative z-10 text-center lg:text-left flex-1 max-w-2xl">
				<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.2em] mb-6" style="background: rgba(200,16,46,0.16); color: #FF8095; border: 1px solid rgba(200,16,46,0.32);">
					<span class="w-1.5 h-1.5 rounded-full" style="background: {ACCENT_SOFT}; box-shadow: 0 0 10px {ACCENT_SOFT};"></span>
					{copy.ctaBadge}
				</span>
				<h2 class="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tighter mb-4">{copy.ctaTitle}</h2>
				<p class="text-lg text-zinc-400 font-medium">{copy.ctaDesc}</p>
			</div>
			<div class="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto shrink-0">
				<button type="button" onclick={openChat} class="btn-tactile w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white" style="background: linear-gradient(135deg, #C8102E, #A50D25); box-shadow: 0 10px 30px -10px rgba(200,16,46,0.7);">
					<MessageCircle size={18} />
					{copy.ctaPrimary}
				</button>
				<a href="/solusi/infrastructure-security" class="btn-tactile w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white transition-colors hover:bg-white/5" style="border: 1px solid rgba(255,255,255,0.15);">
					<ArrowRight size={18} />
					{copy.ctaSecondary}
				</a>
			</div>
		</div>
	</div>
</section>

<style>
	.adr-gradient {
		background: linear-gradient(100deg, #FF4D6D 0%, #C8102E 55%, #A50D25 100%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}

	.adr-lead :global(p) { margin: 0; }

	.adr-grid {
		background-image:
			linear-gradient(rgba(200, 16, 46, 0.07) 1px, transparent 1px),
			linear-gradient(90deg, rgba(200, 16, 46, 0.07) 1px, transparent 1px);
		background-size: 38px 38px;
		mask-image: radial-gradient(120% 100% at 50% 0%, #000 30%, transparent 78%);
		-webkit-mask-image: radial-gradient(120% 100% at 50% 0%, #000 30%, transparent 78%);
	}

	.adr-instrument {
		background: linear-gradient(180deg, rgba(200, 16, 46, 0.05), rgba(12, 8, 9, 0.6));
		border: 1px solid rgba(200, 16, 46, 0.22);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 40px 80px -30px rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(6px);
	}

	.adr-track {
		position: relative;
		height: 10px;
		border-radius: 9999px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(200, 16, 46, 0.14);
		overflow: hidden;
	}
	.adr-track-center {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 1px;
		height: 100%;
		transform: translate(-50%, -50%);
		background: rgba(255, 255, 255, 0.18);
	}
	.adr-marker {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 12px;
		height: 12px;
		border-radius: 9999px;
		background: radial-gradient(circle at 35% 30%, #ff8095, #c8102e);
		box-shadow: 0 0 12px rgba(200, 16, 46, 0.8);
		transition: transform 2s cubic-bezier(0.25, 0.8, 0.3, 1);
	}
	.adr-readout {
		display: flex;
		flex-direction: column;
		gap: 2px;
		border-radius: 12px;
		padding: 10px 12px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(200, 16, 46, 0.16);
	}

	@media (prefers-reduced-motion: reduce) {
		.adr-marker { transition: none; }
	}
</style>
