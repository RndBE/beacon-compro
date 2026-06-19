<script lang="ts">
	import { onMount } from 'svelte';
	import {
		ArrowRight,
		MessageCircle,
		ChevronRight,
		ShieldCheck,
		Beaker,
		Droplets,
		Thermometer,
		RefreshCw,
		Activity,
		Radio,
		HardDrive,
		LayoutDashboard,
		Waves,
		Factory,
		FlaskConical
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
			'<p>Logam berat, sedimentasi, limbah — terdeteksi sebelum sampai ke ledeng masyarakat. Monitoring kualitas air real-time: pH, turbidity, DO, TDS, suhu, dan lebih banyak lagi.</p>'
	);

	// ─── PRODUCT DATA (kept as-is — feeds ProductVariantDossier) ───
	const fallbackVariants = [
		{ name: 'BQ-500', subtitle: 'Multi-Parameter Probe', desc: 'Sonde multi-parameter terintegrasi: pH, DO, turbidity, TDS, suhu, dan conductivity dalam satu probe. Auto-cleaning terjadwal.', use: 'Sungai utama, intake PDAM, outlet IPAL',
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
		] },
		{ name: 'BQ-510', subtitle: 'Modular Sensor Array', desc: 'Konfigurasi modular — pilih parameter yang dibutuhkan. Setiap sensor bisa diganti individual tanpa mengganggu sistem.', use: 'Riset, laboratorium lapangan, custom monitoring',
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
		{ name: 'Sungai Citarum Hilir', client: 'BWS Citarum', year: '2024' },
		{ name: 'Waduk Jatiluhur', client: 'Perum Jasa Tirta II', year: '2023' },
		{ name: 'Intake PDAM Surakarta', client: 'PDAM Kota Surakarta', year: '2023' },
		{ name: 'Sungai Brantas Tengah', client: 'BBWS Brantas', year: '2024' }
	];
	const projects = $derived(mapTrackRecords(data.subSolutionDetail?.track_records, fallbackProjects));

	const copy = $derived(
		$locale === 'EN'
			? {
					home: 'Home', solutions: 'Solutions', parent: 'Water Security',
					eyebrow: 'Water Security · Water Quality',
					title1: 'Catch the pollution,', title2: 'before the tap does.',
					consult: 'Consult AWQR', other: 'Other Solutions', live: 'LIVE',
					fig: 'FIG.08 — WATER QUALITY', status: 'NORMAL', wqi: 'WQI',
					chainBadge: 'Signal Chain', chainTitle: 'From a submerged sonde to a quality alert',
					chainDesc: 'Six parameters are sampled simultaneously by a self-cleaning probe and streamed over 4G into STESY — anomalies trip an alert long before water reaches the household.',
					capBadge: 'Capabilities', capTitle: 'Lab-grade water quality, in the field',
					appBadge: 'Where it works', appTitle: 'For every source that must stay clean',
					appDesc: 'Raw-water rivers, industrial outfalls, reservoirs, mining areas, and estuaries.',
					trackBadge: 'Track Record', trackTitle: 'Already deployed at',
					ctaBadge: 'Next Step', ctaTitle: 'Watch your water with AWQR',
					ctaDesc: 'Our engineers will select the right parameter suite and integrate it into your STESY dashboard.',
					ctaPrimary: 'Consult AWQR', ctaSecondary: 'Explore Other Products'
				}
			: {
					home: 'Beranda', solutions: 'Solusi', parent: 'Water Security',
					eyebrow: 'Water Security · Kualitas Air',
					title1: 'Tangkap pencemaran,', title2: 'sebelum sampai ke keran.',
					consult: 'Konsultasi AWQR', other: 'Solusi Lain', live: 'LIVE',
					fig: 'FIG.08 — KUALITAS AIR', status: 'NORMAL', wqi: 'WQI',
					chainBadge: 'Rantai Sinyal', chainTitle: 'Dari sonde terendam menjadi peringatan kualitas',
					chainDesc: 'Enam parameter disampel serempak oleh probe self-cleaning dan dialirkan lewat 4G ke STESY — anomali memicu peringatan jauh sebelum air sampai ke rumah warga.',
					capBadge: 'Kemampuan', capTitle: 'Kualitas air sekelas lab, di lapangan',
					appBadge: 'Penerapan', appTitle: 'Untuk setiap sumber yang harus tetap bersih',
					appDesc: 'Sungai air baku, outlet industri, waduk, kawasan tambang, dan estuari.',
					trackBadge: 'Track Record', trackTitle: 'Sudah Terpasang Di',
					ctaBadge: 'Langkah Selanjutnya', ctaTitle: 'Pantau air Anda dengan AWQR',
					ctaDesc: 'Tim engineer kami akan memilih paket parameter yang tepat dan mengintegrasikannya ke dashboard STESY.',
					ctaPrimary: 'Konsultasi AWQR', ctaSecondary: 'Jelajahi Produk Lain'
				}
	);

	// ── Live water quality sonde ──
	let mounted = $state(false);
	let ph = $state(0);
	let doO2 = $state(0); // mg/L
	let turb = $state(0); // NTU
	let cond = $state(0); // mS/cm
	let temp = $state(0); // °C
	let wqi = $state(0); // index 0–100

	onMount(() => {
		mounted = true;
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const tick = () => {
			ph = Math.round((6.6 + Math.random() * 1.6) * 100) / 100;
			doO2 = Math.round((5 + Math.random() * 4) * 10) / 10;
			turb = Math.round((4 + Math.random() * 52) * 10) / 10;
			cond = Math.round((0.2 + Math.random() * 1.5) * 100) / 100;
			temp = Math.round((26 + Math.random() * 5) * 10) / 10;
			wqi = Math.round(74 + Math.random() * 18);
		};
		tick();
		if (reduce) return;
		const id = setInterval(tick, 2600);
		return () => clearInterval(id);
	});

	const params = $derived([
		{ label: 'pH', get: () => ph.toFixed(2), unit: '', fill: () => (ph / 14) * 100 },
		{ label: 'DO', get: () => doO2.toFixed(1), unit: 'mg/L', fill: () => (doO2 / 12) * 100 },
		{ label: 'TURB', get: () => turb.toFixed(1), unit: 'NTU', fill: () => Math.min(100, turb) },
		{ label: 'COND', get: () => cond.toFixed(2), unit: 'mS', fill: () => (cond / 3) * 100 },
		{ label: 'TEMP', get: () => temp.toFixed(1), unit: '°C', fill: () => (temp / 40) * 100 }
	]);

	const chain = [
		{ icon: FlaskConical, k: '01', t: $locale === 'EN' ? 'Sonde Probe' : 'Probe Sonde', d: $locale === 'EN' ? '6 parameters' : '6 parameter' },
		{ icon: RefreshCw, k: '02', t: $locale === 'EN' ? 'Self-cleaning' : 'Self-cleaning', d: $locale === 'EN' ? 'Auto wiper' : 'Wiper otomatis' },
		{ icon: HardDrive, k: '03', t: 'Datalogger', d: 'RS485 · 4G/LTE' },
		{ icon: LayoutDashboard, k: '04', t: 'STESY', d: 'Dashboard' }
	];

	const capabilities = $derived([
		{ icon: Beaker, value: '6+', unit: $locale === 'EN' ? 'param' : 'param', label: $locale === 'EN' ? 'Multi-parameter' : 'Multi-parameter' },
		{ icon: RefreshCw, value: 'Auto', unit: '', label: $locale === 'EN' ? 'Self-cleaning sonde' : 'Sonde self-cleaning' },
		{ icon: ShieldCheck, value: 'IP68', unit: '', label: $locale === 'EN' ? 'Fully submersible' : 'Terendam penuh' },
		{ icon: Activity, value: '24/7', unit: '', label: $locale === 'EN' ? 'Real-time stream' : 'Aliran data real-time' }
	]);

	const applications = $derived([
		{ icon: Waves, label: $locale === 'EN' ? 'Raw-water Rivers' : 'Sungai Air Baku' },
		{ icon: Factory, label: $locale === 'EN' ? 'Industrial Outfalls' : 'Outlet Industri' },
		{ icon: Droplets, label: $locale === 'EN' ? 'Reservoirs' : 'Waduk' },
		{ icon: Thermometer, label: $locale === 'EN' ? 'Mining Areas' : 'Kawasan Tambang' },
		{ icon: Activity, label: $locale === 'EN' ? 'Estuaries' : 'Estuari' }
	]);
</script>

<svelte:head>
	<title>AWQR — Automatic Water Quality Recorder — Beacon Engineering</title>
	<meta name="description" content="AWQR Beacon Engineering: monitoring kualitas air real-time — pH, turbidity, DO, TDS, suhu — data langsung ke dashboard STESY." />
</svelte:head>

<div class="border-b" style="background: #100A0B; border-color: rgba(200,16,46,0.18);">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
		<nav class="flex items-center gap-1.5 text-xs font-mono" style="color: #8a767a;">
			<a href="/" class="hover:text-[#FF4D6D] transition-colors">{copy.home}</a>
			<ChevronRight size={11} />
			<a href="/solusi" class="hover:text-[#FF4D6D] transition-colors">{copy.solutions}</a>
			<ChevronRight size={11} />
			<a href="/solusi/water-security" class="hover:text-[#FF4D6D] transition-colors">{copy.parent}</a>
			<ChevronRight size={11} />
			<span class="font-semibold" style="color: {ACCENT_SOFT};">AWQR</span>
		</nav>
	</div>
</div>

<!-- HERO -->
<section class="relative overflow-hidden" style="background: #0C0809;">
	<div class="awqr-grid absolute inset-0 pointer-events-none"></div>
	<div class="absolute -top-40 right-[-10%] w-[680px] h-[680px] rounded-full pointer-events-none" style="background: radial-gradient(circle, rgba(200,16,46,0.18) 0%, transparent 62%);"></div>
	<div class="absolute inset-x-0 top-0 h-px" style="background: linear-gradient(90deg, transparent, rgba(200,16,46,0.55), transparent);"></div>

	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
		<div class="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-10 items-center">
			<div>
				<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.18em] mb-8" style="background: rgba(200,16,46,0.1); color: #FF8095; border: 1px solid rgba(200,16,46,0.28); opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 10}px); transition: all .7s cubic-bezier(.16,1,.3,1) .05s;">
					<ShieldCheck size={13} />{copy.eyebrow}
				</div>
				<h1 class="font-heading font-extrabold tracking-tighter text-white leading-[0.98] text-5xl sm:text-6xl lg:text-[60px]" style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 18}px); transition: all .8s cubic-bezier(.16,1,.3,1) .15s;">
					{copy.title1}<br /><span class="awqr-gradient">{copy.title2}</span>
				</h1>
				<div class="mt-7 flex items-baseline gap-3" style="opacity: {mounted ? 1 : 0}; transition: opacity .8s ease .3s;">
					<span class="font-heading text-2xl font-bold" style="color: {ACCENT_SOFT};">AWQR</span>
					<span class="text-sm text-zinc-500 font-mono">Automatic Water Quality Recorder</span>
				</div>
				<div class="awqr-lead mt-5 max-w-[46ch] text-lg leading-relaxed text-zinc-400" style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 12}px); transition: all .8s cubic-bezier(.16,1,.3,1) .4s;">
					{@html mainContent}
				</div>
				<div class="mt-10 flex flex-wrap gap-3" style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 12}px); transition: all .8s cubic-bezier(.16,1,.3,1) .5s;">
					<button type="button" onclick={openChat} class="btn-tactile inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white" style="background: linear-gradient(135deg, #C8102E, #A50D25); box-shadow: 0 10px 30px -10px rgba(200,16,46,0.7);">
						<MessageCircle size={16} />{copy.consult}
					</button>
					<a href="/solusi/water-security" class="btn-tactile inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-zinc-200 transition-colors hover:text-white" style="border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.03);">
						{copy.other}<ArrowRight size={15} />
					</a>
				</div>
			</div>

			<!-- Live water quality sonde -->
			<div class="relative flex justify-center lg:justify-end" style="opacity: {mounted ? 1 : 0}; transform: scale({mounted ? 1 : 0.94}); transition: all .9s cubic-bezier(.16,1,.3,1) .35s;">
				<div class="awqr-instrument relative w-[360px] max-w-full rounded-[28px] p-6">
					<div class="flex items-center justify-between mb-5">
						<span class="font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-500">{copy.fig}</span>
						<span class="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-300">
							<span class="relative flex h-2 w-2">
								<span class="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping" style="background: {LIVE};"></span>
								<span class="relative inline-flex h-2 w-2 rounded-full" style="background: {LIVE};"></span>
							</span>{copy.live}
						</span>
					</div>

					<!-- WQI banner -->
					<div class="awqr-wqi mb-4">
						<div>
							<div class="font-mono text-[9px] tracking-[0.2em] text-zinc-500">{copy.wqi}</div>
							<div class="flex items-baseline gap-2">
								<span class="font-heading text-3xl font-extrabold text-white tabular-nums leading-none">{wqi}</span>
								<span class="inline-flex items-center gap-1.5 font-mono text-xs font-bold" style="color: {LIVE};">
									<span class="w-1.5 h-1.5 rounded-full" style="background: {LIVE};"></span>{copy.status}
								</span>
							</div>
						</div>
						<div class="awqr-wqibar"><div class="awqr-wqifill" style="width: {wqi}%;"></div></div>
					</div>

					<!-- parameter rows -->
					<div class="flex flex-col gap-2.5">
						{#each params as p}
							<div class="awqr-param">
								<span class="font-mono text-[10px] font-bold tracking-[0.12em] text-zinc-400 w-12 shrink-0">{p.label}</span>
								<div class="awqr-bar"><div class="awqr-fill" style="width: {Math.max(4, Math.min(100, p.fill()))}%;"></div></div>
								<span class="font-mono text-xs font-bold tabular-nums text-white w-[68px] text-right shrink-0">{p.get()}<span class="text-[9px] text-zinc-500"> {p.unit}</span></span>
							</div>
						{/each}
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
	<div class="awqr-grid absolute inset-0 pointer-events-none opacity-60"></div>
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
<ProductVariantDossier {variants} productName="AWQR" />

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
			<div class="awqr-grid absolute inset-0 pointer-events-none opacity-50"></div>
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
				<a href="/solusi/water-security" class="btn-tactile w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white transition-colors hover:bg-white/5" style="border: 1px solid rgba(255,255,255,0.15);">
					<ArrowRight size={18} />{copy.ctaSecondary}
				</a>
			</div>
		</div>
	</div>
</section>

<style>
	.awqr-gradient { background: linear-gradient(100deg, #FF4D6D 0%, #C8102E 55%, #A50D25 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
	.awqr-lead :global(p) { margin: 0; }
	.awqr-grid {
		background-image: linear-gradient(rgba(200,16,46,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(200,16,46,0.07) 1px, transparent 1px);
		background-size: 38px 38px;
		mask-image: radial-gradient(120% 100% at 50% 0%, #000 30%, transparent 78%);
		-webkit-mask-image: radial-gradient(120% 100% at 50% 0%, #000 30%, transparent 78%);
	}
	.awqr-instrument {
		background: linear-gradient(180deg, rgba(200,16,46,0.05), rgba(12,8,9,0.6));
		border: 1px solid rgba(200,16,46,0.22);
		box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 40px 80px -30px rgba(0,0,0,0.8);
		backdrop-filter: blur(6px);
	}
	.awqr-wqi {
		display: flex; align-items: center; justify-content: space-between; gap: 16px;
		border-radius: 14px; padding: 12px 14px;
		background: rgba(255,255,255,0.03); border: 1px solid rgba(200,16,46,0.18);
	}
	.awqr-wqibar { flex: 1; height: 6px; border-radius: 6px; background: rgba(255,255,255,0.06); overflow: hidden; }
	.awqr-wqifill { height: 100%; border-radius: 6px; background: linear-gradient(90deg, #C8102E, #FF4D6D); transition: width 2.2s cubic-bezier(0.25,0.8,0.3,1); }
	.awqr-param { display: flex; align-items: center; gap: 10px; border-radius: 11px; padding: 8px 11px; background: rgba(255,255,255,0.03); border: 1px solid rgba(200,16,46,0.14); }
	.awqr-bar { flex: 1; height: 5px; border-radius: 5px; background: rgba(255,255,255,0.06); overflow: hidden; }
	.awqr-fill { height: 100%; border-radius: 5px; background: linear-gradient(90deg, rgba(200,16,46,0.7), #FF4D6D); transition: width 2.2s cubic-bezier(0.25,0.8,0.3,1); }
	@media (prefers-reduced-motion: reduce) { .awqr-wqifill, .awqr-fill { transition: none; } }
</style>
