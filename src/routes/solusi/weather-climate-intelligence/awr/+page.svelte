<script lang="ts">
	import { onMount } from 'svelte';
	import {
		ArrowRight,
		MessageCircle,
		ChevronRight,
		ShieldCheck,
		Cloud,
		CloudSun,
		Sun,
		Wind,
		Thermometer,
		Droplets,
		Gauge,
		Activity,
		Radio,
		HardDrive,
		LayoutDashboard,
		Waves
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
			'<p>Automatic Weather Recorder (AWR) adalah perangkat telemetri untuk pemantauan cuaca otomatis dan berkelanjutan.</p>'
	);

	// ─── PRODUCT DATA (kept as-is — feeds ProductVariantDossier) ───
	const fallbackVariants: any[] = [
		{ name: 'BW-700', subtitle: 'Full AWS Station', desc: 'Stasiun cuaca otomatis lengkap dengan 7+ parameter. Tiang met-tower, sensor suite, data logger, dan panel surya — siap pasang.', use: 'Bandara, pertanian skala besar, BMKG, bendungan',
		specs: [
			{ label: 'Suhu Udara', value: '-40°C – +60°C (±0.3°C)' }, { label: 'Kelembaban Relatif', value: '0 – 100% RH (±2%)' },
			{ label: 'Tekanan Udara', value: '300 – 1100 hPa (±0.5)' }, { label: 'Kec. Angin', value: '0 – 60 m/s (±0.3 m/s)' },
			{ label: 'Arah Angin', value: '0 – 360° (±3°)' }, { label: 'Radiasi Matahari', value: '0 – 1500 W/m² (±5%)' },
			{ label: 'Curah Hujan', value: '0 – 500 mm/jam (±0.2mm)' }, { label: 'Interval Data', value: '1 – 60 menit' },
			{ label: 'Komunikasi', value: '4G/LTE, GSM, Satellite' }, { label: 'Power Supply', value: 'Solar Panel + Battery' },
			{ label: 'Platform', value: 'STESY Integration' }, { label: 'Standar', value: 'WMO / BMKG Compatible' }
		] },
		{ name: 'BW-710', subtitle: 'Compact AWS', desc: 'Stasiun cuaca kompak dengan parameter esensial: suhu, kelembaban, curah hujan, dan angin. Form factor mini untuk instalasi cepat.', use: 'Perkebunan, pos hujan, sekolah lapang, riset',
		specs: [
			{ label: 'Suhu Udara', value: '-40°C – +60°C (±0.3°C)' }, { label: 'Kelembaban Relatif', value: '0 – 100% RH (±2%)' },
			{ label: 'Tekanan Udara', value: '300 – 1100 hPa (±0.5)' }, { label: 'Kec. Angin', value: '0 – 60 m/s (±0.3 m/s)' },
			{ label: 'Arah Angin', value: '0 – 360° (±3°)' }, { label: 'Radiasi Matahari', value: '0 – 1500 W/m² (±5%)' },
			{ label: 'Curah Hujan', value: '0 – 500 mm/jam (±0.2mm)' }, { label: 'Interval Data', value: '1 – 60 menit' },
			{ label: 'Komunikasi', value: '4G/LTE, GSM, Satellite' }, { label: 'Power Supply', value: 'Solar Panel + Battery' },
			{ label: 'Platform', value: 'STESY Integration' }, { label: 'Standar', value: 'WMO / BMKG Compatible' }
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
		{ name: 'BMKG Stasiun Tangerang', client: 'BMKG', year: '2023' },
		{ name: 'Perkebunan Sawit Kaltim', client: 'PT Sawit Nusantara', year: '2024' },
		{ name: 'Bendungan Margatiga', client: 'BWS Mesuji-Sekampung', year: '2023' },
		{ name: 'IKN Area Sepaku', client: 'OIKN', year: '2024' }
	];
	const projects = $derived(mapTrackRecords(data.subSolutionDetail?.track_records, fallbackProjects));

	const copy = $derived(
		$locale === 'EN'
			? {
					home: 'Home', solutions: 'Solutions', parent: 'Weather & Climate Intelligence',
					eyebrow: 'Weather & Climate · Weather Station',
					title1: 'Weather moves fast,', title2: 'your data moves faster.',
					consult: 'Consult AWR', other: 'Other Solutions', live: 'LIVE',
					fig: 'FIG.07 — WEATHER STATION', wind: 'WIND', temp: 'TEMP', hum: 'HUMIDITY', pres: 'PRESSURE', sol: 'SOLAR',
					chainBadge: 'Signal Chain', chainTitle: 'From seven sensors to one dashboard',
					chainDesc: 'A full sensor suite is sampled every minute and streamed over RS485 / 4G into the datalogger and STESY — climate-grade data, live.',
					capBadge: 'Capabilities', capTitle: 'The whole sky, on one screen',
					appBadge: 'Where it works', appTitle: 'For everyone who plans around the weather',
					appDesc: 'Dam surroundings, irrigation areas, and climatology & meteorology stations.',
					trackBadge: 'Track Record', trackTitle: 'Already deployed at',
					ctaBadge: 'Next Step', ctaTitle: 'Read your climate with AWR',
					ctaDesc: 'Our engineers will design the right weather-station setup and integrate it into your STESY dashboard.',
					ctaPrimary: 'Consult AWR', ctaSecondary: 'Explore Other Products'
				}
			: {
					home: 'Beranda', solutions: 'Solusi', parent: 'Weather & Climate Intelligence',
					eyebrow: 'Weather & Climate · Stasiun Cuaca',
					title1: 'Cuaca berubah cepat,', title2: 'data Anda lebih cepat.',
					consult: 'Konsultasi AWR', other: 'Solusi Lain', live: 'LIVE',
					fig: 'FIG.07 — STASIUN CUACA', wind: 'ANGIN', temp: 'SUHU', hum: 'KELEMBAPAN', pres: 'TEKANAN', sol: 'RADIASI',
					chainBadge: 'Rantai Sinyal', chainTitle: 'Dari tujuh sensor ke satu dashboard',
					chainDesc: 'Sensor suite lengkap disampel tiap menit dan dialirkan lewat RS485 / 4G ke datalogger dan STESY — data sekelas klimatologi, live.',
					capBadge: 'Kemampuan', capTitle: 'Seluruh langit, dalam satu layar',
					appBadge: 'Penerapan', appTitle: 'Untuk semua yang merencanakan lewat cuaca',
					appDesc: 'Wilayah sekitar bendungan, area irigasi, serta stasiun klimatologi & meteorologi.',
					trackBadge: 'Track Record', trackTitle: 'Sudah Terpasang Di',
					ctaBadge: 'Langkah Selanjutnya', ctaTitle: 'Baca iklim Anda dengan AWR',
					ctaDesc: 'Tim engineer kami akan merancang setup stasiun cuaca yang tepat dan mengintegrasikannya ke dashboard STESY.',
					ctaPrimary: 'Konsultasi AWR', ctaSecondary: 'Jelajahi Produk Lain'
				}
	);

	const consultUrl = $derived(
		`https://wa.me/628112632151?text=${encodeURIComponent(
			$locale === 'EN'
				? 'Hello Beacon Marketing CS, I would like to consult about AWR (Automatic Weather Recorder).'
				: 'Halo CS Marketing Beacon, saya ingin konsultasi tentang AWR (Automatic Weather Recorder).'
		)}`
	);

	// ── Live weather station ──
	let mounted = $state(false);
	let windDir = $state(45);
	let windSpeed = $state(0);
	let temp = $state(0);
	let humidity = $state(0);
	let pressure = $state(0);
	let solar = $state(0);

	const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
	const dirLabel = $derived(COMPASS[Math.round(windDir / 45) % 8]);

	onMount(() => {
		mounted = true;
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const tick = () => {
			windDir = Math.round(Math.random() * 360);
			windSpeed = Math.round((0.6 + Math.random() * 7) * 10) / 10;
			temp = Math.round((25 + Math.random() * 9) * 10) / 10;
			humidity = Math.round(58 + Math.random() * 32);
			pressure = Math.round((1006 + Math.random() * 9) * 10) / 10;
			solar = Math.round(180 + Math.random() * 720);
		};
		tick();
		if (reduce) return;
		const id = setInterval(tick, 2400);
		return () => clearInterval(id);
	});

	const readouts = $derived([
		{ icon: Thermometer, label: copy.temp, get: () => `${temp.toFixed(1)}`, unit: '°C' },
		{ icon: Droplets, label: copy.hum, get: () => `${humidity}`, unit: '%' },
		{ icon: Gauge, label: copy.pres, get: () => `${pressure.toFixed(0)}`, unit: 'hPa' },
		{ icon: Sun, label: copy.sol, get: () => `${solar}`, unit: 'W/m²' }
	]);

	const chain = [
		{ icon: Cloud, k: '01', t: $locale === 'EN' ? 'Sensor Suite' : 'Sensor Suite', d: $locale === 'EN' ? '7+ parameters' : '7+ parameter' },
		{ icon: HardDrive, k: '02', t: 'Datalogger', d: $locale === 'EN' ? 'Field logging' : 'Perekaman lapangan' },
		{ icon: Radio, k: '03', t: $locale === 'EN' ? 'Transmission' : 'Transmisi', d: 'RS485 · 4G/Sat' },
		{ icon: LayoutDashboard, k: '04', t: 'STESY', d: 'Dashboard' }
	];

	const capabilities = $derived([
		{ icon: Cloud, value: '7+', unit: $locale === 'EN' ? 'param' : 'param', label: $locale === 'EN' ? 'Multi-parameter' : 'Multi-parameter' },
		{ icon: ShieldCheck, value: 'WMO', unit: '', label: $locale === 'EN' ? 'BMKG compatible' : 'Kompatibel BMKG' },
		{ icon: Activity, value: '24/7', unit: '', label: $locale === 'EN' ? 'Real-time stream' : 'Aliran data real-time' },
		{ icon: Sun, value: 'Solar', unit: '', label: $locale === 'EN' ? 'Off-grid powered' : 'Mandiri tanpa PLN' }
	]);

	const applications = $derived([
		{ icon: Waves, label: $locale === 'EN' ? 'Dam Surroundings' : 'Sekitar Bendungan' },
		{ icon: Droplets, label: $locale === 'EN' ? 'Irrigation Areas' : 'Area Irigasi' },
		{ icon: Cloud, label: $locale === 'EN' ? 'Climatology Stations' : 'Stasiun Klimatologi' },
		{ icon: CloudSun, label: $locale === 'EN' ? 'Meteorology Stations' : 'Stasiun Meteorologi' }
	]);
</script>

<svelte:head>
	<title>AWR — Automatic Weather Recorder — Beacon Engineering</title>
	<meta name="description" content="AWR Beacon Engineering: stasiun cuaca otomatis multi-parameter sesuai standar WMO/BMKG, real-time, terintegrasi STESY." />
</svelte:head>

<div class="border-b" style="background: #100A0B; border-color: rgba(200,16,46,0.18);">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
		<nav class="flex items-center gap-1.5 text-xs font-mono" style="color: #8a767a;">
			<a href="/" class="hover:text-[#FF4D6D] transition-colors">{copy.home}</a>
			<ChevronRight size={11} />
			<a href="/solusi" class="hover:text-[#FF4D6D] transition-colors">{copy.solutions}</a>
			<ChevronRight size={11} />
			<a href="/solusi/weather-climate-intelligence" class="hover:text-[#FF4D6D] transition-colors">{copy.parent}</a>
			<ChevronRight size={11} />
			<span class="font-semibold" style="color: {ACCENT_SOFT};">AWR</span>
		</nav>
	</div>
</div>

<!-- HERO -->
<section class="relative overflow-hidden" style="background: #0C0809;">
	<div class="awr-grid absolute inset-0 pointer-events-none"></div>
	<div class="absolute -top-40 right-[-10%] w-[680px] h-[680px] rounded-full pointer-events-none" style="background: radial-gradient(circle, rgba(200,16,46,0.18) 0%, transparent 62%);"></div>
	<div class="absolute inset-x-0 top-0 h-px" style="background: linear-gradient(90deg, transparent, rgba(200,16,46,0.55), transparent);"></div>

	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
		<div class="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-10 items-center">
			<div>
				<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.18em] mb-8" style="background: rgba(200,16,46,0.1); color: #FF8095; border: 1px solid rgba(200,16,46,0.28); opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 10}px); transition: all .7s cubic-bezier(.16,1,.3,1) .05s;">
					<ShieldCheck size={13} />{copy.eyebrow}
				</div>
				<h1 class="font-heading font-extrabold tracking-tighter text-white leading-[0.98] text-5xl sm:text-6xl lg:text-[64px]" style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 18}px); transition: all .8s cubic-bezier(.16,1,.3,1) .15s;">
					{copy.title1}<br /><span class="awr-gradient">{copy.title2}</span>
				</h1>
				<div class="mt-7 flex items-baseline gap-3" style="opacity: {mounted ? 1 : 0}; transition: opacity .8s ease .3s;">
					<span class="font-heading text-2xl font-bold" style="color: {ACCENT_SOFT};">AWR</span>
					<span class="text-sm text-zinc-500 font-mono">Automatic Weather Recorder</span>
				</div>
				<div class="awr-lead mt-5 max-w-[46ch] text-lg leading-relaxed text-zinc-400" style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 12}px); transition: all .8s cubic-bezier(.16,1,.3,1) .4s;">
					{@html mainContent}
				</div>
				<div class="mt-10 flex flex-wrap gap-3" style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 12}px); transition: all .8s cubic-bezier(.16,1,.3,1) .5s;">
					<a href={consultUrl} target="_blank" rel="noopener" class="btn-tactile inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white" style="background: linear-gradient(135deg, #C8102E, #A50D25); box-shadow: 0 10px 30px -10px rgba(200,16,46,0.7);">
						<MessageCircle size={16} />{copy.consult}
					</a>
					<a href="/solusi/weather-climate-intelligence" class="btn-tactile inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-zinc-200 transition-colors hover:text-white" style="border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.03);">
						{copy.other}<ArrowRight size={15} />
					</a>
				</div>
			</div>

			<!-- Live weather station -->
			<div class="relative flex justify-center lg:justify-end" style="opacity: {mounted ? 1 : 0}; transform: scale({mounted ? 1 : 0.94}); transition: all .9s cubic-bezier(.16,1,.3,1) .35s;">
				<div class="awr-instrument relative w-[360px] max-w-full rounded-[28px] p-6">
					<div class="flex items-center justify-between mb-5">
						<span class="font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-500">{copy.fig}</span>
						<span class="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-300">
							<span class="relative flex h-2 w-2">
								<span class="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping" style="background: {LIVE};"></span>
								<span class="relative inline-flex h-2 w-2 rounded-full" style="background: {LIVE};"></span>
							</span>{copy.live}
						</span>
					</div>

					<div class="flex items-center gap-5">
						<!-- wind compass -->
						<div class="awr-compass shrink-0">
							<span class="awr-card awr-n">N</span>
							<span class="awr-card awr-e">E</span>
							<span class="awr-card awr-s">S</span>
							<span class="awr-card awr-w">W</span>
							<div class="awr-needle-wrap" style="transform: translateX(-50%) rotate({windDir}deg);">
								<div class="awr-needle"></div>
							</div>
							<div class="awr-hub">
								<span class="font-heading text-lg font-extrabold leading-none text-white tabular-nums">{windSpeed.toFixed(1)}</span>
								<span class="font-mono text-[8px] text-zinc-400">m/s</span>
							</div>
						</div>
						<!-- wind label -->
						<div class="flex-1">
							<div class="font-mono text-[9px] tracking-[0.2em] text-zinc-500">{copy.wind}</div>
							<div class="font-heading text-2xl font-extrabold text-white mt-1">{dirLabel}</div>
							<div class="font-mono text-xs text-zinc-500 tabular-nums">{windDir}°</div>
							<div class="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold" style="color: {LIVE};">
								<span class="w-1.5 h-1.5 rounded-full" style="background: {LIVE};"></span>ONLINE
							</div>
						</div>
					</div>

					<!-- parameter readouts -->
					<div class="grid grid-cols-2 gap-2.5 mt-5">
						{#each readouts as r}
							{@const Icon = r.icon}
							<div class="awr-readout flex items-center gap-2.5">
								<Icon size={16} style="color: {ACCENT_SOFT};" class="shrink-0" />
								<div class="min-w-0">
									<div class="font-mono text-[8px] tracking-[0.14em] text-zinc-500">{r.label}</div>
									<div class="font-mono text-sm font-bold tabular-nums text-white truncate">{r.get()}<span class="text-[9px] text-zinc-500"> {r.unit}</span></div>
								</div>
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
	<div class="awr-grid absolute inset-0 pointer-events-none opacity-60"></div>
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
<ProductVariantDossier {variants} productName="AWR" />

<!-- APPLICATIONS -->
<section class="relative py-20 lg:py-28 bg-[#FAFAFA] overflow-hidden">
	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="max-w-2xl mb-14">
			<span class="font-mono text-xs font-bold uppercase tracking-[0.2em]" style="color: {ACCENT};">{copy.appBadge}</span>
			<h2 class="font-heading text-3xl sm:text-4xl font-bold mt-3 leading-[1.12]" style="color: #1A1A1A; letter-spacing: -0.02em;">{copy.appTitle}</h2>
			<p class="text-base leading-relaxed mt-4" style="color: #5C5C5C;">{copy.appDesc}</p>
		</div>
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
			<div class="awr-grid absolute inset-0 pointer-events-none opacity-50"></div>
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
				<a href="/solusi/weather-climate-intelligence" class="btn-tactile w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white transition-colors hover:bg-white/5" style="border: 1px solid rgba(255,255,255,0.15);">
					<ArrowRight size={18} />{copy.ctaSecondary}
				</a>
			</div>
		</div>
	</div>
</section>

<style>
	.awr-gradient { background: linear-gradient(100deg, #FF4D6D 0%, #C8102E 55%, #A50D25 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
	.awr-lead :global(p) { margin: 0; }
	.awr-grid {
		background-image: linear-gradient(rgba(200,16,46,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(200,16,46,0.07) 1px, transparent 1px);
		background-size: 38px 38px;
		mask-image: radial-gradient(120% 100% at 50% 0%, #000 30%, transparent 78%);
		-webkit-mask-image: radial-gradient(120% 100% at 50% 0%, #000 30%, transparent 78%);
	}
	.awr-instrument {
		background: linear-gradient(180deg, rgba(200,16,46,0.05), rgba(12,8,9,0.6));
		border: 1px solid rgba(200,16,46,0.22);
		box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 40px 80px -30px rgba(0,0,0,0.8);
		backdrop-filter: blur(6px);
	}
	.awr-compass {
		position: relative;
		width: 132px; height: 132px;
		border-radius: 9999px;
		background: radial-gradient(circle at 50% 45%, rgba(200,16,46,0.08), rgba(12,8,9,0.3));
		border: 1px solid rgba(200,16,46,0.22);
		box-shadow: inset 0 0 26px rgba(0,0,0,0.5);
	}
	.awr-card { position: absolute; font-family: var(--font-mono, monospace); font-size: 9px; font-weight: 700; color: rgba(255,128,149,0.7); }
	.awr-n { top: 5px; left: 50%; transform: translateX(-50%); }
	.awr-s { bottom: 5px; left: 50%; transform: translateX(-50%); }
	.awr-e { right: 6px; top: 50%; transform: translateY(-50%); }
	.awr-w { left: 6px; top: 50%; transform: translateY(-50%); }
	.awr-needle-wrap {
		position: absolute;
		left: 50%; bottom: 50%;
		width: 3px; height: 44px;
		transform-origin: bottom center;
		transition: transform 2.2s cubic-bezier(0.34, 1.2, 0.4, 1);
	}
	.awr-needle {
		width: 100%; height: 100%;
		border-radius: 3px 3px 0 0;
		background: linear-gradient(180deg, #FF4D6D 0%, #C8102E 70%, transparent 100%);
		box-shadow: 0 0 10px rgba(200,16,46,0.8);
	}
	.awr-hub {
		position: absolute;
		left: 50%; top: 50%;
		transform: translate(-50%, -50%);
		width: 52px; height: 52px;
		border-radius: 9999px;
		background: rgba(12,8,9,0.85);
		border: 1px solid rgba(200,16,46,0.3);
		display: flex; flex-direction: column; align-items: center; justify-content: center;
	}
	.awr-readout { border-radius: 12px; padding: 9px 11px; background: rgba(255,255,255,0.03); border: 1px solid rgba(200,16,46,0.16); }
	@media (prefers-reduced-motion: reduce) { .awr-needle-wrap { transition: none; } }
</style>
