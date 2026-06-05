<script lang="ts">
	import { onMount } from 'svelte';
	import {
		ArrowRight,
		MessageCircle,
		ChevronRight,
		ShieldCheck,
		Waves,
		Ruler,
		Radio,
		Gauge,
		Activity,
		Sun,
		HardDrive,
		LayoutDashboard,
		Droplets,
		Factory
	} from '@lucide/svelte';
	import { locale } from '$lib/i18n';
	import ProductVariantDossier from '$lib/components/ProductVariantDossier.svelte';
	import { mapTrackRecords } from '$lib/loaders/sub-solution';

	let { data } = $props();

	const ACCENT = '#C8102E';
	const ACCENT_SOFT = '#FF4D6D';
	const LIVE = '#1B7F3A';

	const ss = $derived(data.subSolutionDetail?.sub_solution ?? null);
	const mainContent = $derived(
		ss?.main_content?.trim() ||
			'<p>Pencatatan debit air otomatis menggunakan sensor ultrasonik non-kontak. Tidak ada bagian terendam — minim perawatan. Ideal untuk sungai, saluran irigasi, dan outflow bendungan.</p>'
	);

	// ─── PRODUCT DATA (kept as-is — feeds ProductVariantDossier) ───
	const fallbackVariants = [
		{ name: 'BF-300', subtitle: 'Non-Contact Ultrasonic', desc: 'Pengukuran debit menggunakan sensor ultrasonik non-kontak. Tidak ada bagian yang terendam — minim perawatan, tahan sedimen.', use: 'Sungai sedang, saluran irigasi, outflow bendungan',
		specs: [
			{ label: 'Tipe Sensor', value: 'Ultrasonic non-contact' },
			{ label: 'Range Pengukuran', value: '0.3 – 15 m' },
			{ label: 'Akurasi', value: '±2% (full scale)' },
			{ label: 'Resolusi', value: '1 mm' },
			{ label: 'Proteksi', value: 'IP67' },
			{ label: 'Interval Data', value: '1 – 60 menit (konfigurabel)' },
			{ label: 'Komunikasi', value: '4G/LTE, GSM' },
			{ label: 'Power Supply', value: 'Solar Panel + Battery' },
			{ label: 'Metode Kalkulasi', value: 'Area-Velocity / Rating Curve' },
			{ label: 'Operasi Suhu', value: '-10°C sampai +55°C' },
			{ label: 'Platform', value: 'STESY Integration' },
			{ label: 'Standar', value: 'SNI Compliant' }
		] },
		{ name: 'BF-310', subtitle: 'Doppler Profiling', desc: 'Acoustic Doppler untuk profiling kecepatan aliran multi-layer. Cocok untuk sungai besar dengan penampang kompleks.', use: 'Sungai besar, estuary, penampang cross-section',
		specs: [
			{ label: 'Tipe Sensor', value: 'Ultrasonic non-contact' },
			{ label: 'Range Pengukuran', value: '0.3 – 15 m' },
			{ label: 'Akurasi', value: '±2% (full scale)' },
			{ label: 'Resolusi', value: '1 mm' },
			{ label: 'Proteksi', value: 'IP67' },
			{ label: 'Interval Data', value: '1 – 60 menit (konfigurabel)' },
			{ label: 'Komunikasi', value: '4G/LTE, GSM' },
			{ label: 'Power Supply', value: 'Solar Panel + Battery' },
			{ label: 'Metode Kalkulasi', value: 'Area-Velocity / Rating Curve' },
			{ label: 'Operasi Suhu', value: '-10°C sampai +55°C' },
			{ label: 'Platform', value: 'STESY Integration' },
			{ label: 'Standar', value: 'SNI Compliant' }
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
		{ name: 'DAS Ciliwung Hilir', client: 'BBWS Ciliwung-Cisadane', year: '2023' },
		{ name: 'Saluran Irigasi Brantas', client: 'BBWS Brantas', year: '2024' },
		{ name: 'Outflow Waduk Saguling', client: 'BWS Citarum', year: '2023' },
		{ name: 'Sungai Progo', client: 'BBWS Serayu Opak', year: '2022' }
	];
	const projects = $derived(mapTrackRecords(data.subSolutionDetail?.track_records, fallbackProjects));

	const copy = $derived(
		$locale === 'EN'
			? {
					home: 'Home', solutions: 'Solutions', parent: 'Water Security',
					eyebrow: 'Water Security · Flow Measurement',
					title1: 'Discharge is data,', title2: 'never a guess.',
					consult: 'Consult AFMR', other: 'Other Solutions', live: 'LIVE',
					fig: 'FIG.06 — FLOW CHANNEL', disc: 'DISCHARGE', vel: 'VELOCITY', lvl: 'LEVEL', status: 'NORMAL',
					chainBadge: 'Signal Chain', chainTitle: 'From the water surface to a discharge figure',
					chainDesc: 'A non-contact sensor reads level; a per-site rating curve converts it to discharge, logged on-board and streamed over 4G into STESY — no part ever submerged.',
					capBadge: 'Capabilities', capTitle: 'Measure flow without touching the water',
					appBadge: 'Where it works', appTitle: 'For every channel that needs a real number',
					appDesc: 'Rivers, irrigation channels, dam outflow, estuaries, and water-balance stations.',
					trackBadge: 'Track Record', trackTitle: 'Already deployed at',
					ctaBadge: 'Next Step', ctaTitle: 'Meter your flow with AFMR',
					ctaDesc: 'Our engineers will build the right rating curve and integrate the station into your STESY dashboard.',
					ctaPrimary: 'Consult AFMR', ctaSecondary: 'Explore Other Products'
				}
			: {
					home: 'Beranda', solutions: 'Solusi', parent: 'Water Security',
					eyebrow: 'Water Security · Pengukuran Debit',
					title1: 'Debit air itu data,', title2: 'bukan tebakan.',
					consult: 'Konsultasi AFMR', other: 'Solusi Lain', live: 'LIVE',
					fig: 'FIG.06 — KANAL ALIRAN', disc: 'DEBIT', vel: 'KECEPATAN', lvl: 'LEVEL', status: 'NORMAL',
					chainBadge: 'Rantai Sinyal', chainTitle: 'Dari permukaan air menjadi angka debit',
					chainDesc: 'Sensor non-kontak membaca level; rating curve per-lokasi mengonversinya jadi debit, direkam onboard dan dialirkan lewat 4G ke STESY — tanpa bagian yang terendam.',
					capBadge: 'Kemampuan', capTitle: 'Ukur aliran tanpa menyentuh air',
					appBadge: 'Penerapan', appTitle: 'Untuk setiap kanal yang butuh angka riil',
					appDesc: 'Sungai, saluran irigasi, outflow bendungan, estuari, dan pos neraca air.',
					trackBadge: 'Track Record', trackTitle: 'Sudah Terpasang Di',
					ctaBadge: 'Langkah Selanjutnya', ctaTitle: 'Ukur debit Anda dengan AFMR',
					ctaDesc: 'Tim engineer kami akan menyusun rating curve yang tepat dan mengintegrasikan pos ke dashboard STESY.',
					ctaPrimary: 'Konsultasi AFMR', ctaSecondary: 'Jelajahi Produk Lain'
				}
	);

	const consultUrl = $derived(
		`https://wa.me/628112632151?text=${encodeURIComponent(
			$locale === 'EN'
				? 'Hello Beacon Marketing CS, I would like to consult about AFMR (Automatic Flow Meter Recorder).'
				: 'Halo CS Marketing Beacon, saya ingin konsultasi tentang AFMR (Automatic Flow Meter Recorder).'
		)}`
	);

	// ── Live flow channel ──
	let mounted = $state(false);
	let velocity = $state(0); // m/s
	let level = $state(0); // m
	const discharge = $derived(Math.round(velocity * level * 4.2 * 100) / 100); // m³/s (area ≈ level × width)

	onMount(() => {
		mounted = true;
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const tick = () => {
			velocity = Math.round((0.6 + Math.random() * 1.9) * 100) / 100; // 0.6–2.5 m/s
			level = Math.round((0.8 + Math.random() * 1.7) * 100) / 100; // 0.8–2.5 m
		};
		tick();
		if (reduce) return;
		const id = setInterval(tick, 2600);
		return () => clearInterval(id);
	});

	const chain = [
		{ icon: Waves, k: '01', t: $locale === 'EN' ? 'Level Sensor' : 'Sensor Level', d: $locale === 'EN' ? 'Non-contact' : 'Non-kontak' },
		{ icon: Ruler, k: '02', t: $locale === 'EN' ? 'Rating Curve' : 'Rating Curve', d: $locale === 'EN' ? 'Level → discharge' : 'Level → debit' },
		{ icon: HardDrive, k: '03', t: 'Datalogger', d: $locale === 'EN' ? 'On-board memory' : 'Memori onboard' },
		{ icon: LayoutDashboard, k: '04', t: 'STESY', d: 'Dashboard' }
	];

	const capabilities = $derived([
		{ icon: Ruler, value: '±2', unit: '%', label: $locale === 'EN' ? 'Full-scale accuracy' : 'Akurasi full-scale' },
		{ icon: Waves, value: '0.3–15', unit: 'm', label: $locale === 'EN' ? 'Measurement range' : 'Range pengukuran' },
		{ icon: Sun, value: 'Solar', unit: '', label: $locale === 'EN' ? 'Off-grid powered' : 'Mandiri tanpa PLN' },
		{ icon: Radio, value: '4G', unit: '', label: $locale === 'EN' ? 'STESY integration' : 'Integrasi STESY' }
	]);

	const applications = $derived([
		{ icon: Waves, label: $locale === 'EN' ? 'Rivers' : 'Sungai' },
		{ icon: Droplets, label: $locale === 'EN' ? 'Irrigation' : 'Irigasi' },
		{ icon: Gauge, label: $locale === 'EN' ? 'Dam Outflow' : 'Outflow Bendungan' },
		{ icon: Activity, label: $locale === 'EN' ? 'Estuaries' : 'Estuari' },
		{ icon: Factory, label: $locale === 'EN' ? 'Water Balance' : 'Neraca Air' }
	]);
</script>

<svelte:head>
	<title>AFMR — Automatic Flow Meter Recorder — Beacon Engineering</title>
	<meta name="description" content="AFMR Beacon Engineering: pencatatan debit air otomatis menggunakan sensor ultrasonik non-kontak, akurasi ±2%, terintegrasi STESY." />
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
			<span class="font-semibold" style="color: {ACCENT_SOFT};">AFMR</span>
		</nav>
	</div>
</div>

<!-- HERO -->
<section class="relative overflow-hidden" style="background: #0C0809;">
	<div class="afmr-grid absolute inset-0 pointer-events-none"></div>
	<div class="absolute -top-40 right-[-10%] w-[680px] h-[680px] rounded-full pointer-events-none" style="background: radial-gradient(circle, rgba(200,16,46,0.18) 0%, transparent 62%);"></div>
	<div class="absolute inset-x-0 top-0 h-px" style="background: linear-gradient(90deg, transparent, rgba(200,16,46,0.55), transparent);"></div>

	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
		<div class="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-10 items-center">
			<div>
				<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.18em] mb-8" style="background: rgba(200,16,46,0.1); color: #FF8095; border: 1px solid rgba(200,16,46,0.28); opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 10}px); transition: all .7s cubic-bezier(.16,1,.3,1) .05s;">
					<ShieldCheck size={13} />{copy.eyebrow}
				</div>
				<h1 class="font-heading font-extrabold tracking-tighter text-white leading-[0.98] text-5xl sm:text-6xl lg:text-[64px]" style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 18}px); transition: all .8s cubic-bezier(.16,1,.3,1) .15s;">
					{copy.title1}<br /><span class="afmr-gradient">{copy.title2}</span>
				</h1>
				<div class="mt-7 flex items-baseline gap-3" style="opacity: {mounted ? 1 : 0}; transition: opacity .8s ease .3s;">
					<span class="font-heading text-2xl font-bold" style="color: {ACCENT_SOFT};">AFMR</span>
					<span class="text-sm text-zinc-500 font-mono">Automatic Flow Meter Recorder</span>
				</div>
				<div class="afmr-lead mt-5 max-w-[46ch] text-lg leading-relaxed text-zinc-400" style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 12}px); transition: all .8s cubic-bezier(.16,1,.3,1) .4s;">
					{@html mainContent}
				</div>
				<div class="mt-10 flex flex-wrap gap-3" style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 12}px); transition: all .8s cubic-bezier(.16,1,.3,1) .5s;">
					<a href={consultUrl} target="_blank" rel="noopener" class="btn-tactile inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white" style="background: linear-gradient(135deg, #C8102E, #A50D25); box-shadow: 0 10px 30px -10px rgba(200,16,46,0.7);">
						<MessageCircle size={16} />{copy.consult}
					</a>
					<a href="/solusi/water-security" class="btn-tactile inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-zinc-200 transition-colors hover:text-white" style="border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.03);">
						{copy.other}<ArrowRight size={15} />
					</a>
				</div>
			</div>

			<!-- Live flow channel -->
			<div class="relative flex justify-center lg:justify-end" style="opacity: {mounted ? 1 : 0}; transform: scale({mounted ? 1 : 0.94}); transition: all .9s cubic-bezier(.16,1,.3,1) .35s;">
				<div class="afmr-instrument relative w-[360px] max-w-full rounded-[28px] p-6">
					<div class="flex items-center justify-between mb-6">
						<span class="font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-500">{copy.fig}</span>
						<span class="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-300">
							<span class="relative flex h-2 w-2">
								<span class="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping" style="background: {LIVE};"></span>
								<span class="relative inline-flex h-2 w-2 rounded-full" style="background: {LIVE};"></span>
							</span>{copy.live}
						</span>
					</div>

					<!-- channel -->
					<div class="afmr-channel mb-5">
						<div class="afmr-sensor"><span class="afmr-beam"></span></div>
						<div class="afmr-water" style="height: {28 + level * 16}px;">
							<span class="afmr-streak" style="top: 18%; animation-delay: 0s;"></span>
							<span class="afmr-streak" style="top: 42%; animation-delay: -0.5s;"></span>
							<span class="afmr-streak" style="top: 66%; animation-delay: -1s;"></span>
							<span class="afmr-streak" style="top: 84%; animation-delay: -1.4s;"></span>
						</div>
						<span class="afmr-disc">{discharge.toFixed(2)} <span class="text-[10px] text-zinc-400">m³/s</span></span>
					</div>

					<!-- readouts -->
					<div class="grid grid-cols-3 gap-2.5">
						<div class="afmr-readout">
							<span class="font-mono text-[8px] tracking-[0.14em] text-zinc-500">{copy.vel}</span>
							<span class="font-mono text-sm font-bold tabular-nums text-white">{velocity.toFixed(2)}<span class="text-[9px] text-zinc-500"> m/s</span></span>
						</div>
						<div class="afmr-readout">
							<span class="font-mono text-[8px] tracking-[0.14em] text-zinc-500">{copy.lvl}</span>
							<span class="font-mono text-sm font-bold tabular-nums text-white">{level.toFixed(2)}<span class="text-[9px] text-zinc-500"> m</span></span>
						</div>
						<div class="afmr-readout">
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
	<div class="afmr-grid absolute inset-0 pointer-events-none opacity-60"></div>
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
<ProductVariantDossier {variants} productName="AFMR" />

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
			<div class="afmr-grid absolute inset-0 pointer-events-none opacity-50"></div>
			<div class="absolute -top-32 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none" style="background: rgba(200,16,46,0.18);"></div>
			<div class="relative z-10 text-center lg:text-left flex-1 max-w-2xl">
				<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.2em] mb-6" style="background: rgba(200,16,46,0.16); color: #FF8095; border: 1px solid rgba(200,16,46,0.32);">
					<span class="w-1.5 h-1.5 rounded-full" style="background: {ACCENT_SOFT}; box-shadow: 0 0 10px {ACCENT_SOFT};"></span>{copy.ctaBadge}
				</span>
				<h2 class="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tighter mb-4">{copy.ctaTitle}</h2>
				<p class="text-lg text-zinc-400 font-medium">{copy.ctaDesc}</p>
			</div>
			<div class="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto shrink-0">
				<a href={consultUrl} target="_blank" rel="noopener" class="btn-tactile w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white" style="background: linear-gradient(135deg, #C8102E, #A50D25); box-shadow: 0 10px 30px -10px rgba(200,16,46,0.7);">
					<MessageCircle size={18} />{copy.ctaPrimary}
				</a>
				<a href="/solusi/water-security" class="btn-tactile w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white transition-colors hover:bg-white/5" style="border: 1px solid rgba(255,255,255,0.15);">
					<ArrowRight size={18} />{copy.ctaSecondary}
				</a>
			</div>
		</div>
	</div>
</section>

<style>
	.afmr-gradient { background: linear-gradient(100deg, #FF4D6D 0%, #C8102E 55%, #A50D25 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
	.afmr-lead :global(p) { margin: 0; }
	.afmr-grid {
		background-image: linear-gradient(rgba(200,16,46,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(200,16,46,0.07) 1px, transparent 1px);
		background-size: 38px 38px;
		mask-image: radial-gradient(120% 100% at 50% 0%, #000 30%, transparent 78%);
		-webkit-mask-image: radial-gradient(120% 100% at 50% 0%, #000 30%, transparent 78%);
	}
	.afmr-instrument {
		background: linear-gradient(180deg, rgba(200,16,46,0.05), rgba(12,8,9,0.6));
		border: 1px solid rgba(200,16,46,0.22);
		box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 40px 80px -30px rgba(0,0,0,0.8);
		backdrop-filter: blur(6px);
	}
	.afmr-channel {
		position: relative;
		height: 132px;
		border-radius: 14px;
		background: rgba(255,255,255,0.03);
		border: 1px solid rgba(200,16,46,0.22);
		overflow: hidden;
		box-shadow: inset 0 0 30px rgba(0,0,0,0.5);
		display: flex;
		align-items: flex-end;
	}
	.afmr-sensor {
		position: absolute;
		top: 8px; left: 50%;
		transform: translateX(-50%);
		width: 30px; height: 8px;
		border-radius: 3px;
		background: linear-gradient(180deg, #C8102E, #8c0c20);
		box-shadow: 0 2px 8px rgba(200,16,46,0.5);
		z-index: 3;
	}
	.afmr-beam {
		position: absolute;
		top: 100%; left: 50%;
		transform: translateX(-50%);
		width: 2px; height: 90px;
		background: linear-gradient(180deg, rgba(255,128,149,0.6), transparent);
		animation: afmr-ping 1.8s ease-in-out infinite;
	}
	@keyframes afmr-ping { 0%, 100% { opacity: 0.25; } 50% { opacity: 0.8; } }
	.afmr-water {
		position: relative;
		width: 100%;
		background: linear-gradient(180deg, rgba(255,77,109,0.28) 0%, rgba(200,16,46,0.42) 100%);
		border-top: 2px solid rgba(255,200,210,0.7);
		overflow: hidden;
		transition: height 2.2s cubic-bezier(0.25,0.8,0.3,1);
	}
	.afmr-streak {
		position: absolute;
		left: -30%;
		width: 26%; height: 2px;
		border-radius: 2px;
		background: linear-gradient(90deg, transparent, rgba(255,225,232,0.85), transparent);
		animation: afmr-flow 1.5s linear infinite;
	}
	@keyframes afmr-flow { from { transform: translateX(0); } to { transform: translateX(520%); } }
	.afmr-disc {
		position: absolute;
		top: 10px; right: 12px;
		font-family: var(--font-mono, monospace);
		font-size: 15px; font-weight: 700;
		color: #FF8095;
		z-index: 4;
	}
	.afmr-readout { display: flex; flex-direction: column; gap: 2px; border-radius: 12px; padding: 9px 11px; background: rgba(255,255,255,0.03); border: 1px solid rgba(200,16,46,0.16); }
	@media (prefers-reduced-motion: reduce) { .afmr-water { transition: none; } .afmr-streak, .afmr-beam { animation: none; } }
</style>
