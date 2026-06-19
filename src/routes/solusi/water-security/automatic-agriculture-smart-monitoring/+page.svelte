<script lang="ts">
	import { onMount } from 'svelte';
	import {
		ArrowRight,
		MessageCircle,
		ChevronRight,
		ShieldCheck,
		Sprout,
		Leaf,
		Trees,
		Thermometer,
		Droplets,
		CloudRain,
		Activity,
		Radio,
		HardDrive,
		LayoutDashboard,
		FlaskConical
	} from '@lucide/svelte';
	import { locale } from '$lib/i18n';
	import { openChat } from '$lib/stores/chat';
	import ProductVariantDossier from '$lib/components/ProductVariantDossier.svelte';

	let { data } = $props();

	const ACCENT = '#C8102E';
	const ACCENT_SOFT = '#FF4D6D';
	const LIVE = '#1B7F3A';

	const ss = $derived(data.subSolutionDetail?.sub_solution ?? null);
	const mainContent = $derived(
		ss?.main_content?.trim() ||
			'<p>Perangkat smart agriculture memantau suhu dan kelembapan tanah secara real-time, lalu mengirimkan data ke datalogger, telemetri, dan dashboard untuk pemantauan pertanian yang lebih akurat.</p>'
	);

	// ─── PRODUCT DATA (backend products feed ProductVariantDossier) ───
	const fallbackVariants = [
		{ name: 'BE AGR-100-S3', subtitle: 'Soil Smart Station', desc: 'Stasiun smart agriculture dengan sensor suhu & kelembapan tanah multi-titik, terintegrasi telemetri ke datalogger dan dashboard STESY.', use: 'Lahan pertanian, perkebunan, riset agro',
		specs: [
			{ label: 'Parameter', value: 'Suhu & kelembapan tanah' },
			{ label: 'Range Suhu', value: '-10°C – 60°C (±0.3°C)' },
			{ label: 'Range Kelembapan', value: '0 – 100% (±2%)' },
			{ label: 'Kedalaman Sensor', value: 'Multi-level (konfigurabel)' },
			{ label: 'Proteksi', value: 'IP67' },
			{ label: 'Komunikasi', value: 'RS485 · 4G/LTE, GSM' },
			{ label: 'Power Supply', value: 'Solar Panel + Battery' },
			{ label: 'Interval Data', value: '1 – 60 menit' },
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

	const copy = $derived(
		$locale === 'EN'
			? {
					home: 'Home', solutions: 'Solutions', parent: 'Water Security',
					eyebrow: 'Water Security · Smart Agriculture',
					title1: 'Before it wilts,', title2: 'the soil tells you.',
					consult: 'Consult AASM', other: 'Other Solutions', live: 'LIVE',
					fig: 'FIG.05 — FIELD STATION', status: 'OPTIMAL',
					chainBadge: 'Signal Chain', chainTitle: 'From the root zone to your dashboard',
					chainDesc: 'Soil moisture and temperature are sampled in the field and carried over telemetry into the datalogger and dashboard — turning guesswork into data.',
					capBadge: 'Capabilities', capTitle: 'Read the field before the field shows stress',
					appBadge: 'Where it works', appTitle: 'For every plot that lives and dies by water',
					appDesc: 'Open farmland, greenhouses, plantations, agricultural research plots, and irrigation / drought-prone areas.',
					ctaBadge: 'Next Step', ctaTitle: 'Grow smarter with AASM',
					ctaDesc: 'Our engineers will map the right field-monitoring layout and integrate it into your STESY dashboard.',
					ctaPrimary: 'Consult AASM', ctaSecondary: 'Explore Other Products',
					p1: 'SOIL MOISTURE', p2: 'SOIL TEMP', p3: 'AIR HUMIDITY'
				}
			: {
					home: 'Beranda', solutions: 'Solusi', parent: 'Water Security',
					eyebrow: 'Water Security · Smart Agriculture',
					title1: 'Sebelum layu,', title2: 'tanah memberi tahu.',
					consult: 'Konsultasi AASM', other: 'Solusi Lain', live: 'LIVE',
					fig: 'FIG.05 — STASIUN LAPANGAN', status: 'OPTIMAL',
					chainBadge: 'Rantai Sinyal', chainTitle: 'Dari zona akar hingga dashboard Anda',
					chainDesc: 'Kelembapan dan suhu tanah disampel di lapangan lalu dibawa lewat telemetri ke datalogger dan dashboard — mengubah tebakan jadi data.',
					capBadge: 'Kemampuan', capTitle: 'Baca lahan sebelum lahan menunjukkan stres',
					appBadge: 'Penerapan', appTitle: 'Untuk setiap lahan yang hidup-mati oleh air',
					appDesc: 'Lahan pertanian terbuka, greenhouse, perkebunan, lahan penelitian, dan area irigasi / rawan kekeringan.',
					ctaBadge: 'Langkah Selanjutnya', ctaTitle: 'Bertani lebih cerdas dengan AASM',
					ctaDesc: 'Tim engineer kami akan merancang tata letak monitoring lahan yang tepat dan mengintegrasikannya ke dashboard STESY.',
					ctaPrimary: 'Konsultasi AASM', ctaSecondary: 'Jelajahi Produk Lain',
					p1: 'KELEMBAPAN TANAH', p2: 'SUHU TANAH', p3: 'KELEMBAPAN UDARA'
				}
	);

	// ── Live field station ──
	let mounted = $state(false);
	let moisture = $state(0); // %
	let soilTemp = $state(0); // °C
	let humidity = $state(0); // %

	onMount(() => {
		mounted = true;
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const tick = () => {
			moisture = Math.round((48 + Math.random() * 22) * 10) / 10;
			soilTemp = Math.round((25 + Math.random() * 6) * 10) / 10;
			humidity = Math.round((60 + Math.random() * 22) * 10) / 10;
		};
		tick();
		if (reduce) return;
		const id = setInterval(tick, 2300);
		return () => clearInterval(id);
	});

	const params = $derived([
		{ icon: Droplets, label: copy.p1, get: () => moisture, unit: '%', max: 100 },
		{ icon: Thermometer, label: copy.p2, get: () => soilTemp, unit: '°C', max: 50 },
		{ icon: CloudRain, label: copy.p3, get: () => humidity, unit: '%', max: 100 }
	]);

	const chain = [
		{ icon: Sprout, k: '01', t: $locale === 'EN' ? 'Soil Sensor' : 'Sensor Tanah', d: $locale === 'EN' ? 'Moisture · temp' : 'Lembap · suhu' },
		{ icon: HardDrive, k: '02', t: 'Datalogger', d: $locale === 'EN' ? 'Field logging' : 'Perekaman lapangan' },
		{ icon: Radio, k: '03', t: $locale === 'EN' ? 'Telemetry' : 'Telemetri', d: '4G/LTE' },
		{ icon: LayoutDashboard, k: '04', t: 'Dashboard', d: 'STESY' }
	];

	const capabilities = $derived([
		{ icon: Droplets, value: $locale === 'EN' ? 'Soil' : 'Tanah', unit: '', label: $locale === 'EN' ? 'Soil moisture sensing' : 'Sensor kelembapan tanah' },
		{ icon: Thermometer, value: $locale === 'EN' ? 'Temp' : 'Suhu', unit: '', label: $locale === 'EN' ? 'Soil temperature' : 'Suhu tanah' },
		{ icon: Activity, value: '24/7', unit: '', label: $locale === 'EN' ? 'Real-time stream' : 'Aliran data real-time' },
		{ icon: Radio, value: $locale === 'EN' ? 'Telemetry' : 'Telemetri', unit: '', label: $locale === 'EN' ? 'STESY integration' : 'Integrasi STESY' }
	]);

	const applications = $derived([
		{ icon: Sprout, label: $locale === 'EN' ? 'Open Farmland' : 'Lahan Terbuka' },
		{ icon: Trees, label: 'Greenhouse' },
		{ icon: Leaf, label: $locale === 'EN' ? 'Plantations' : 'Perkebunan' },
		{ icon: FlaskConical, label: $locale === 'EN' ? 'Research Plots' : 'Lahan Penelitian' },
		{ icon: Droplets, label: $locale === 'EN' ? 'Irrigation Areas' : 'Area Irigasi' }
	]);
</script>

<svelte:head>
	<title>AASM — Automatic Agriculture Smart Monitoring — Beacon Engineering</title>
	<meta name="description" content="AASM Beacon Engineering: monitoring suhu & kelembapan tanah real-time untuk pertanian presisi, terintegrasi STESY." />
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
			<span class="font-semibold" style="color: {ACCENT_SOFT};">AASM</span>
		</nav>
	</div>
</div>

<!-- HERO -->
<section class="relative overflow-hidden" style="background: #0C0809;">
	<div class="ag-grid absolute inset-0 pointer-events-none"></div>
	<div class="absolute -top-40 right-[-10%] w-[680px] h-[680px] rounded-full pointer-events-none" style="background: radial-gradient(circle, rgba(200,16,46,0.18) 0%, transparent 62%);"></div>
	<div class="absolute inset-x-0 top-0 h-px" style="background: linear-gradient(90deg, transparent, rgba(200,16,46,0.55), transparent);"></div>

	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
		<div class="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-10 items-center">
			<div>
				<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.18em] mb-8" style="background: rgba(200,16,46,0.1); color: #FF8095; border: 1px solid rgba(200,16,46,0.28); opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 10}px); transition: all .7s cubic-bezier(.16,1,.3,1) .05s;">
					<ShieldCheck size={13} />{copy.eyebrow}
				</div>
				<h1 class="font-heading font-extrabold tracking-tighter text-white leading-[0.98] text-5xl sm:text-6xl lg:text-[72px]" style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 18}px); transition: all .8s cubic-bezier(.16,1,.3,1) .15s;">
					{copy.title1}<br /><span class="ag-gradient">{copy.title2}</span>
				</h1>
				<div class="mt-7 flex items-baseline gap-3" style="opacity: {mounted ? 1 : 0}; transition: opacity .8s ease .3s;">
					<span class="font-heading text-2xl font-bold" style="color: {ACCENT_SOFT};">AASM</span>
					<span class="text-sm text-zinc-500 font-mono">Automatic Agriculture Smart Monitoring</span>
				</div>
				<div class="ag-lead mt-5 max-w-[46ch] text-lg leading-relaxed text-zinc-400" style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 12}px); transition: all .8s cubic-bezier(.16,1,.3,1) .4s;">
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

			<!-- Live field station -->
			<div class="relative flex justify-center lg:justify-end" style="opacity: {mounted ? 1 : 0}; transform: scale({mounted ? 1 : 0.94}); transition: all .9s cubic-bezier(.16,1,.3,1) .35s;">
				<div class="ag-instrument relative w-[360px] max-w-full rounded-[28px] p-6">
					<div class="flex items-center justify-between mb-6">
						<span class="font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-500">{copy.fig}</span>
						<span class="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-300">
							<span class="relative flex h-2 w-2">
								<span class="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping" style="background: {LIVE};"></span>
								<span class="relative inline-flex h-2 w-2 rounded-full" style="background: {LIVE};"></span>
							</span>{copy.live}
						</span>
					</div>

					<div class="space-y-3">
						{#each params as p}
							{@const v = p.get()}
							{@const pct = Math.min(100, (v / p.max) * 100)}
							{@const Icon = p.icon}
							<div class="ag-tile flex items-center gap-4">
								<div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background: rgba(200,16,46,0.12);">
									<Icon size={18} style="color: {ACCENT_SOFT};" />
								</div>
								<div class="flex-1">
									<div class="flex items-center justify-between mb-1.5">
										<span class="font-mono text-[10px] tracking-[0.14em] text-zinc-500">{p.label}</span>
										<span class="font-mono text-sm font-bold tabular-nums text-white">{v.toFixed(1)}<span class="text-[10px] text-zinc-500"> {p.unit}</span></span>
									</div>
									<div class="ag-track"><div class="ag-bar" style="width: {pct}%;"></div></div>
								</div>
							</div>
						{/each}
					</div>

					<div class="mt-5 ag-readout flex items-center justify-between">
						<span class="font-mono text-[9px] tracking-[0.2em] text-zinc-500">FIELD STATUS</span>
						<span class="inline-flex items-center gap-1.5 font-mono text-sm font-bold" style="color: {LIVE};">
							<span class="w-1.5 h-1.5 rounded-full" style="background: {LIVE};"></span>{copy.status}
						</span>
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
	<div class="ag-grid absolute inset-0 pointer-events-none opacity-60"></div>
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
						<span class="font-heading text-2xl font-extrabold text-white tracking-tight">{cap.value}</span>
						{#if cap.unit}<span class="text-sm font-medium text-zinc-500">{cap.unit}</span>{/if}
					</div>
					<p class="text-xs mt-2 leading-snug" style="color: #B49AA0;">{cap.label}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- PRODUCT — backend products feed this -->
<ProductVariantDossier {variants} productName="AASM" />

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

<!-- CTA -->
<section class="relative py-20 bg-[#FAFAFA]">
	<div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
		<div class="relative overflow-hidden rounded-[2.5rem] p-10 sm:p-16 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-12 group" style="background: #1A0A0D; box-shadow: 0 40px 80px -24px rgba(26,10,13,0.55);">
			<div class="ag-grid absolute inset-0 pointer-events-none opacity-50"></div>
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
	.ag-gradient { background: linear-gradient(100deg, #FF4D6D 0%, #C8102E 55%, #A50D25 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
	.ag-lead :global(p) { margin: 0; }
	.ag-grid {
		background-image: linear-gradient(rgba(200,16,46,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(200,16,46,0.07) 1px, transparent 1px);
		background-size: 38px 38px;
		mask-image: radial-gradient(120% 100% at 50% 0%, #000 30%, transparent 78%);
		-webkit-mask-image: radial-gradient(120% 100% at 50% 0%, #000 30%, transparent 78%);
	}
	.ag-instrument {
		background: linear-gradient(180deg, rgba(200,16,46,0.05), rgba(12,8,9,0.6));
		border: 1px solid rgba(200,16,46,0.22);
		box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 40px 80px -30px rgba(0,0,0,0.8);
		backdrop-filter: blur(6px);
	}
	.ag-tile { border-radius: 14px; padding: 12px; background: rgba(255,255,255,0.025); border: 1px solid rgba(200,16,46,0.14); }
	.ag-track { position: relative; height: 7px; border-radius: 9999px; background: rgba(255,255,255,0.06); overflow: hidden; }
	.ag-bar { height: 100%; border-radius: 9999px; background: linear-gradient(90deg, #C8102E, #FF4D6D); transition: width 2.2s cubic-bezier(0.25,0.8,0.3,1); }
	.ag-readout { border-radius: 12px; padding: 10px 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(200,16,46,0.16); }
	@media (prefers-reduced-motion: reduce) { .ag-bar { transition: none; } }
</style>
