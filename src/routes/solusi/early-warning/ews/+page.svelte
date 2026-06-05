<script lang="ts">
	import { onMount } from 'svelte';
	import {
		ArrowRight,
		MessageCircle,
		ChevronRight,
		ShieldCheck,
		Siren,
		Bell,
		Radio,
		Zap,
		Activity,
		Waves,
		HardDrive,
		LayoutDashboard,
		Droplets,
		Home,
		Mountain
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
			'<p>Sirene 117 dB yang menyala otomatis saat air naik ke level bahaya. 4 level peringatan progresif, siaga 24 jam, tidak butuh operator — karena bencana tidak pernah menunggu.</p>'
	);

	// ─── PRODUCT DATA (kept as-is — feeds ProductVariantDossier) ───
	const fallbackVariants = [
		{ name: 'BE EWS-100-WL', subtitle: 'Multi-Level Alert', desc: 'Sistem peringatan dini multi-level dengan sirene 117 dB. 4 level peringatan otomatis berbasis data water level real-time.', use: 'Kanal Irigasi, Bendungan, Spillway, Drainase',
		specs: [
			{ label: 'Level Peringatan', value: '4 Level + Sound Buzzer' },
			{ label: 'Suara Efektif', value: '117 dB' },
			{ label: 'Frekuensi', value: 'Hingga 6500 Hz' },
			{ label: 'Operasi', value: 'Siaga 24 Jam Non Stop' },
			{ label: 'Proteksi', value: 'IP65' },
			{ label: 'Komunikasi', value: '4G/LTE, GSM' },
			{ label: 'Power Supply', value: 'Solar Panel + Battery' },
			{ label: 'Trigger', value: 'Otomatis (threshold level)' },
			{ label: 'Notifikasi', value: 'SMS + Sirene + STESY' },
			{ label: 'Platform', value: 'STESY Integration' },
			{ label: 'Sensor Input', value: 'Water Level + Rainfall' },
			{ label: 'Standar', value: 'BNPB / PUPR Compatible' }
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
		{ name: 'DAS Citarum Hilir', client: 'BWS Citarum', year: '2024' },
		{ name: 'Bendungan Ciawi', client: 'BBWS Ciliwung-Cisadane', year: '2023' },
		{ name: 'Kanal Banjir Jakarta', client: 'Dinas SDA DKI', year: '2023' },
		{ name: 'Sungai Bengawan Solo', client: 'BBWS Bengawan Solo', year: '2022' }
	];
	const projects = $derived(mapTrackRecords(data.subSolutionDetail?.track_records, fallbackProjects));

	const copy = $derived(
		$locale === 'EN'
			? {
					home: 'Home', solutions: 'Solutions', parent: 'Early Warning',
					eyebrow: 'Early Warning · Alert System',
					title1: 'The first seconds', title2: 'save lives.',
					consult: 'Consult EWS', other: 'Other Solutions', live: 'ARMED',
					fig: 'FIG.10 — ALERT SIREN', alert: 'ALERT LEVEL', wl: 'WATER LEVEL', thr: 'THRESHOLD', status: 'ARMED',
					chainBadge: 'Signal Chain', chainTitle: 'From a rising level to a 117 dB siren',
					chainDesc: 'Water level and rainfall are watched continuously; cross a threshold and the controller fires the siren, an SMS, and a STESY alert at once — no operator in the loop.',
					capBadge: 'Capabilities', capTitle: 'Standing guard, 24 hours a day',
					appBadge: 'Where it works', appTitle: 'For every place a flood reaches first',
					appDesc: 'Flood-prone riverbanks, dam downstream, irrigation canals, settlements, and landslide zones.',
					trackBadge: 'Track Record', trackTitle: 'Already deployed at',
					ctaBadge: 'Next Step', ctaTitle: 'Protect your community with EWS',
					ctaDesc: 'Our engineers will design the right siren coverage and integrate it into your STESY dashboard.',
					ctaPrimary: 'Consult EWS', ctaSecondary: 'Explore Other Products',
					levels: ['NORMAL', 'ADVISORY', 'WARNING', 'DANGER']
				}
			: {
					home: 'Beranda', solutions: 'Solusi', parent: 'Early Warning',
					eyebrow: 'Early Warning · Sistem Peringatan',
					title1: 'Detik pertama', title2: 'menentukan nyawa.',
					consult: 'Konsultasi EWS', other: 'Solusi Lain', live: 'ARMED',
					fig: 'FIG.10 — SIRINE', alert: 'LEVEL PERINGATAN', wl: 'MUKA AIR', thr: 'AMBANG', status: 'SIAGA',
					chainBadge: 'Rantai Sinyal', chainTitle: 'Dari muka air yang naik ke sirine 117 dB',
					chainDesc: 'Muka air dan curah hujan dipantau terus; saat melewati ambang, kontroler memicu sirine, SMS, dan peringatan STESY sekaligus — tanpa menunggu operator.',
					capBadge: 'Kemampuan', capTitle: 'Berjaga, 24 jam sehari',
					appBadge: 'Penerapan', appTitle: 'Untuk setiap tempat yang dijangkau banjir lebih dulu',
					appDesc: 'Bantaran sungai rawan banjir, hilir bendungan, kanal irigasi, pemukiman, dan zona longsor.',
					trackBadge: 'Track Record', trackTitle: 'Sudah Terpasang Di',
					ctaBadge: 'Langkah Selanjutnya', ctaTitle: 'Lindungi warga Anda dengan EWS',
					ctaDesc: 'Tim engineer kami akan merancang cakupan sirine yang tepat dan mengintegrasikannya ke dashboard STESY.',
					ctaPrimary: 'Konsultasi EWS', ctaSecondary: 'Jelajahi Produk Lain',
					levels: ['NORMAL', 'WASPADA', 'SIAGA', 'AWAS']
				}
	);

	const consultUrl = $derived(
		`https://wa.me/628112632151?text=${encodeURIComponent(
			$locale === 'EN'
				? 'Hello Beacon Marketing CS, I would like to consult about EWS (Early Warning System).'
				: 'Halo CS Marketing Beacon, saya ingin konsultasi tentang EWS (Early Warning System).'
		)}`
	);

	// ── Live siren / alert panel ──
	let mounted = $state(false);
	let waterLevel = $state(0);
	const threshold = 4.0;
	const alertLevel = $derived(
		waterLevel < 3.2 ? 1 : waterLevel < 3.7 ? 2 : waterLevel < 4.0 ? 3 : 4
	);
	const alertLabel = $derived(copy.levels[alertLevel - 1]);

	onMount(() => {
		mounted = true;
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const tick = () => {
			waterLevel = Math.round((2.7 + Math.random() * 1.5) * 100) / 100; // 2.70–4.20 m
		};
		tick();
		if (reduce) return;
		const id = setInterval(tick, 2600);
		return () => clearInterval(id);
	});

	const chain = [
		{ icon: Waves, k: '01', t: $locale === 'EN' ? 'Sensor Input' : 'Input Sensor', d: $locale === 'EN' ? 'Level + rainfall' : 'Level + hujan' },
		{ icon: Zap, k: '02', t: $locale === 'EN' ? 'Auto-Trigger' : 'Auto-Trigger', d: $locale === 'EN' ? 'Threshold logic' : 'Logika ambang' },
		{ icon: Siren, k: '03', t: $locale === 'EN' ? 'Siren + SMS' : 'Sirine + SMS', d: '117 dB · 4G' },
		{ icon: LayoutDashboard, k: '04', t: 'STESY', d: 'Dashboard' }
	];

	const capabilities = $derived([
		{ icon: Bell, value: '4', unit: $locale === 'EN' ? 'level' : 'level', label: $locale === 'EN' ? 'Progressive alert' : 'Peringatan progresif' },
		{ icon: Siren, value: '117', unit: 'dB', label: $locale === 'EN' ? 'Effective siren' : 'Sirine efektif' },
		{ icon: Zap, value: 'Auto', unit: '', label: $locale === 'EN' ? 'Threshold trigger' : 'Pemicu ambang' },
		{ icon: ShieldCheck, value: '24/7', unit: '', label: $locale === 'EN' ? 'Always armed' : 'Selalu siaga' }
	]);

	const applications = $derived([
		{ icon: Waves, label: $locale === 'EN' ? 'Riverbanks' : 'Bantaran Sungai' },
		{ icon: ShieldCheck, label: $locale === 'EN' ? 'Dam Downstream' : 'Hilir Bendungan' },
		{ icon: Droplets, label: $locale === 'EN' ? 'Irrigation Canals' : 'Kanal Irigasi' },
		{ icon: Home, label: $locale === 'EN' ? 'Settlements' : 'Pemukiman' },
		{ icon: Mountain, label: $locale === 'EN' ? 'Landslide Zones' : 'Zona Longsor' }
	]);
</script>

<svelte:head>
	<title>EWS — Early Warning System — Beacon Engineering</title>
	<meta name="description" content="EWS Beacon Engineering: sistem peringatan dini otomatis multi-level, sirene 117 dB, integrasi STESY, siaga 24 jam." />
</svelte:head>

<div class="border-b" style="background: #100A0B; border-color: rgba(200,16,46,0.18);">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
		<nav class="flex items-center gap-1.5 text-xs font-mono" style="color: #8a767a;">
			<a href="/" class="hover:text-[#FF4D6D] transition-colors">{copy.home}</a>
			<ChevronRight size={11} />
			<a href="/solusi" class="hover:text-[#FF4D6D] transition-colors">{copy.solutions}</a>
			<ChevronRight size={11} />
			<a href="/solusi/early-warning" class="hover:text-[#FF4D6D] transition-colors">{copy.parent}</a>
			<ChevronRight size={11} />
			<span class="font-semibold" style="color: {ACCENT_SOFT};">EWS</span>
		</nav>
	</div>
</div>

<!-- HERO -->
<section class="relative overflow-hidden" style="background: #0C0809;">
	<div class="ews-grid absolute inset-0 pointer-events-none"></div>
	<div class="absolute -top-40 right-[-10%] w-[680px] h-[680px] rounded-full pointer-events-none" style="background: radial-gradient(circle, rgba(200,16,46,0.18) 0%, transparent 62%);"></div>
	<div class="absolute inset-x-0 top-0 h-px" style="background: linear-gradient(90deg, transparent, rgba(200,16,46,0.55), transparent);"></div>

	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
		<div class="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-10 items-center">
			<div>
				<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.18em] mb-8" style="background: rgba(200,16,46,0.1); color: #FF8095; border: 1px solid rgba(200,16,46,0.28); opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 10}px); transition: all .7s cubic-bezier(.16,1,.3,1) .05s;">
					<ShieldCheck size={13} />{copy.eyebrow}
				</div>
				<h1 class="font-heading font-extrabold tracking-tighter text-white leading-[0.98] text-5xl sm:text-6xl lg:text-[64px]" style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 18}px); transition: all .8s cubic-bezier(.16,1,.3,1) .15s;">
					{copy.title1}<br /><span class="ews-gradient">{copy.title2}</span>
				</h1>
				<div class="mt-7 flex items-baseline gap-3" style="opacity: {mounted ? 1 : 0}; transition: opacity .8s ease .3s;">
					<span class="font-heading text-2xl font-bold" style="color: {ACCENT_SOFT};">EWS</span>
					<span class="text-sm text-zinc-500 font-mono">Early Warning System</span>
				</div>
				<div class="ews-lead mt-5 max-w-[46ch] text-lg leading-relaxed text-zinc-400" style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 12}px); transition: all .8s cubic-bezier(.16,1,.3,1) .4s;">
					{@html mainContent}
				</div>
				<div class="mt-10 flex flex-wrap gap-3" style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 12}px); transition: all .8s cubic-bezier(.16,1,.3,1) .5s;">
					<a href={consultUrl} target="_blank" rel="noopener" class="btn-tactile inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white" style="background: linear-gradient(135deg, #C8102E, #A50D25); box-shadow: 0 10px 30px -10px rgba(200,16,46,0.7);">
						<MessageCircle size={16} />{copy.consult}
					</a>
					<a href="/solusi/early-warning" class="btn-tactile inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-zinc-200 transition-colors hover:text-white" style="border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.03);">
						{copy.other}<ArrowRight size={15} />
					</a>
				</div>
			</div>

			<!-- Live siren panel -->
			<div class="relative flex justify-center lg:justify-end" style="opacity: {mounted ? 1 : 0}; transform: scale({mounted ? 1 : 0.94}); transition: all .9s cubic-bezier(.16,1,.3,1) .35s;">
				<div class="ews-instrument relative w-[360px] max-w-full rounded-[28px] p-6">
					<div class="flex items-center justify-between mb-6">
						<span class="font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-500">{copy.fig}</span>
						<span class="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-300">
							<span class="relative flex h-2 w-2">
								<span class="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping" style="background: {LIVE};"></span>
								<span class="relative inline-flex h-2 w-2 rounded-full" style="background: {LIVE};"></span>
							</span>{copy.status}
						</span>
					</div>

					<div class="flex items-center gap-5">
						<!-- siren emblem -->
						<div class="ews-siren shrink-0">
							<span class="ews-ring" style="animation-delay: 0s;"></span>
							<span class="ews-ring" style="animation-delay: 0.9s;"></span>
							<span class="ews-ring" style="animation-delay: 1.8s;"></span>
							<div class="ews-hub"><Siren size={30} color="#FF8095" /></div>
						</div>
						<!-- alert ladder -->
						<div class="flex-1">
							<div class="font-mono text-[9px] tracking-[0.2em] text-zinc-500">{copy.alert}</div>
							<div class="font-heading text-2xl font-extrabold text-white mt-1">{alertLabel}</div>
							<div class="flex gap-1.5 mt-3">
								{#each [1, 2, 3, 4] as lv}
									<div class="ews-step" style="background: {lv <= alertLevel ? (alertLevel >= 3 ? '#FF4D6D' : '#C8102E') : 'rgba(255,255,255,0.08)'}; box-shadow: {lv <= alertLevel ? '0 0 8px rgba(200,16,46,0.6)' : 'none'};"></div>
								{/each}
							</div>
							<div class="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold" style="color: {LIVE};">
								<span class="w-1.5 h-1.5 rounded-full" style="background: {LIVE};"></span>{copy.live}
							</div>
						</div>
					</div>

					<!-- readouts -->
					<div class="grid grid-cols-2 gap-2.5 mt-5">
						<div class="ews-readout">
							<span class="font-mono text-[8px] tracking-[0.14em] text-zinc-500">{copy.wl}</span>
							<span class="font-mono text-sm font-bold tabular-nums text-white">{waterLevel.toFixed(2)}<span class="text-[9px] text-zinc-500"> m</span></span>
						</div>
						<div class="ews-readout">
							<span class="font-mono text-[8px] tracking-[0.14em] text-zinc-500">{copy.thr}</span>
							<span class="font-mono text-sm font-bold tabular-nums" style="color: {ACCENT_SOFT};">{threshold.toFixed(2)}<span class="text-[9px] text-zinc-500"> m</span></span>
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
	<div class="ews-grid absolute inset-0 pointer-events-none opacity-60"></div>
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
<ProductVariantDossier {variants} productName="EWS" />

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
			<div class="ews-grid absolute inset-0 pointer-events-none opacity-50"></div>
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
				<a href="/solusi/early-warning" class="btn-tactile w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white transition-colors hover:bg-white/5" style="border: 1px solid rgba(255,255,255,0.15);">
					<ArrowRight size={18} />{copy.ctaSecondary}
				</a>
			</div>
		</div>
	</div>
</section>

<style>
	.ews-gradient { background: linear-gradient(100deg, #FF4D6D 0%, #C8102E 55%, #A50D25 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
	.ews-lead :global(p) { margin: 0; }
	.ews-grid {
		background-image: linear-gradient(rgba(200,16,46,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(200,16,46,0.07) 1px, transparent 1px);
		background-size: 38px 38px;
		mask-image: radial-gradient(120% 100% at 50% 0%, #000 30%, transparent 78%);
		-webkit-mask-image: radial-gradient(120% 100% at 50% 0%, #000 30%, transparent 78%);
	}
	.ews-instrument {
		background: linear-gradient(180deg, rgba(200,16,46,0.05), rgba(12,8,9,0.6));
		border: 1px solid rgba(200,16,46,0.22);
		box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 40px 80px -30px rgba(0,0,0,0.8);
		backdrop-filter: blur(6px);
	}
	.ews-siren {
		position: relative;
		width: 132px; height: 132px;
		display: flex; align-items: center; justify-content: center;
	}
	.ews-ring {
		position: absolute;
		top: 50%; left: 50%;
		width: 56px; height: 56px;
		transform: translate(-50%, -50%);
		border-radius: 9999px;
		border: 2px solid rgba(200,16,46,0.55);
		animation: ews-pulse 2.7s cubic-bezier(0.16, 1, 0.3, 1) infinite;
	}
	@keyframes ews-pulse {
		0% { transform: translate(-50%, -50%) scale(0.55); opacity: 0.9; }
		70% { opacity: 0.12; }
		100% { transform: translate(-50%, -50%) scale(2.15); opacity: 0; }
	}
	.ews-hub {
		position: relative;
		width: 58px; height: 58px;
		border-radius: 9999px;
		background: rgba(12,8,9,0.9);
		border: 1px solid rgba(200,16,46,0.4);
		box-shadow: 0 0 18px rgba(200,16,46,0.45), inset 0 1px 0 rgba(255,255,255,0.08);
		display: flex; align-items: center; justify-content: center;
		z-index: 2;
	}
	.ews-step { flex: 1; height: 8px; border-radius: 4px; transition: background 1.6s ease, box-shadow 1.6s ease; }
	.ews-readout { display: flex; flex-direction: column; gap: 2px; border-radius: 12px; padding: 9px 11px; background: rgba(255,255,255,0.03); border: 1px solid rgba(200,16,46,0.16); }
	@media (prefers-reduced-motion: reduce) { .ews-ring { animation: none; opacity: 0; } .ews-step { transition: none; } }
</style>
