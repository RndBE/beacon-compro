<script lang="ts">
	import { onMount } from 'svelte';
	import {
		ArrowRight,
		MessageCircle,
		ChevronRight,
		ShieldCheck,
		Waves,
		Activity,
		Radio,
		Bell,
		HardDrive,
		LayoutDashboard,
		Droplets,
		Layers,
		FlaskConical,
		Factory,
		Gauge
	} from '@lucide/svelte';
	import { locale } from '$lib/i18n';
	import ProductVariantDossier from '$lib/components/ProductVariantDossier.svelte';

	let { data } = $props();

	const ACCENT = '#C8102E';
	const ACCENT_SOFT = '#FF4D6D';
	const LIVE = '#1B7F3A';

	const ss = $derived(data.subSolutionDetail?.sub_solution ?? null);
	const mainContent = $derived(
		ss?.main_content?.trim() ||
			'<p>Sludge level monitoring memantau ketinggian lumpur secara real-time pada sedimentasi, wastewater treatment, clarifier, dan pengolahan air, dengan data terintegrasi ke datalogger, alarm, dan dashboard monitoring.</p>'
	);

	// ─── PRODUCT DATA (backend products feed ProductVariantDossier) ───
	const fallbackVariants = [
		{ name: 'BE SLR-100-U70', subtitle: 'Ultrasonic Sludge Probe', desc: 'Recorder level lumpur ultrasonik untuk memantau ketinggian selimut lumpur secara real-time di clarifier, IPAL, dan kolam sedimentasi — terintegrasi RS485 ke datalogger dan STESY.', use: 'IPAL, clarifier, kolam sedimentasi, WTP',
		specs: [
			{ label: 'Tipe Sensor', value: 'Ultrasonic non-contact' },
			{ label: 'Range Pengukuran', value: '0 – 6 m' },
			{ label: 'Akurasi', value: '±0.5% F.S.' },
			{ label: 'Resolusi', value: '1 mm' },
			{ label: 'Alarm', value: 'High-level threshold' },
			{ label: 'Proteksi', value: 'IP68' },
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
					eyebrow: 'Water Security · Sludge Monitoring',
					title1: 'Before it fills,', title2: "it's already read.",
					consult: 'Consult ASLR', other: 'Other Solutions', live: 'LIVE',
					fig: 'FIG.04 — SLUDGE LEVEL', level: 'SLUDGE LEVEL', fill: 'FILL', status: 'NORMAL', alarm: 'ALARM',
					chainBadge: 'Signal Chain', chainTitle: 'From the basin floor to your dashboard',
					chainDesc: 'The sludge blanket is tracked continuously and streamed over RS485 into the datalogger, alarm, and STESY — so desludging happens on time, not too late.',
					capBadge: 'Capabilities', capTitle: 'Know the blanket before it breaks through',
					appBadge: 'Where it works', appTitle: 'For every basin that must not overflow with sludge',
					appDesc: 'Wastewater plants, clarifiers, sedimentation ponds, water treatment plants, and industrial effluent.',
					ctaBadge: 'Next Step', ctaTitle: 'Monitor your basins with ASLR',
					ctaDesc: 'Our engineers will map the right sludge-level layout and integrate it into your STESY dashboard.',
					ctaPrimary: 'Consult ASLR', ctaSecondary: 'Explore Other Products'
				}
			: {
					home: 'Beranda', solutions: 'Solusi', parent: 'Water Security',
					eyebrow: 'Water Security · Monitoring Lumpur',
					title1: 'Sebelum penuh,', title2: 'terbaca lebih dulu.',
					consult: 'Konsultasi ASLR', other: 'Solusi Lain', live: 'LIVE',
					fig: 'FIG.04 — LEVEL LUMPUR', level: 'LEVEL LUMPUR', fill: 'TERISI', status: 'NORMAL', alarm: 'ALARM',
					chainBadge: 'Rantai Sinyal', chainTitle: 'Dari dasar kolam hingga dashboard Anda',
					chainDesc: 'Selimut lumpur dipantau terus-menerus dan dialirkan lewat RS485 ke datalogger, alarm, dan STESY — agar penyedotan tepat waktu, bukan terlambat.',
					capBadge: 'Kemampuan', capTitle: 'Tahu selimut lumpur sebelum jebol',
					appBadge: 'Penerapan', appTitle: 'Untuk setiap kolam yang tak boleh meluap lumpur',
					appDesc: 'IPAL, clarifier, kolam sedimentasi, WTP, dan pengolahan limbah industri.',
					ctaBadge: 'Langkah Selanjutnya', ctaTitle: 'Pantau kolam Anda dengan ASLR',
					ctaDesc: 'Tim engineer kami akan merancang tata letak monitoring level lumpur yang tepat dan mengintegrasikannya ke dashboard STESY.',
					ctaPrimary: 'Konsultasi ASLR', ctaSecondary: 'Jelajahi Produk Lain'
				}
	);

	const consultUrl = $derived(
		`https://wa.me/628112632151?text=${encodeURIComponent(
			$locale === 'EN'
				? 'Hello Beacon Marketing CS, I would like to consult about ASLR (Automatic Sludge Level Recorder).'
				: 'Halo CS Marketing Beacon, saya ingin konsultasi tentang ASLR (Automatic Sludge Level Recorder).'
		)}`
	);

	// ── Live sludge tank ──
	let mounted = $state(false);
	let level = $state(0); // percent fill
	const depth = $derived((level / 100) * 6); // metres (tank depth 6 m)

	onMount(() => {
		mounted = true;
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const r = () => Math.round((42 + Math.random() * 26) * 10) / 10; // 42–68 %
		level = r();
		if (reduce) return;
		const id = setInterval(() => { level = r(); }, 2400);
		return () => clearInterval(id);
	});

	const chain = [
		{ icon: Waves, k: '01', t: $locale === 'EN' ? 'Level Sensor' : 'Sensor Level', d: $locale === 'EN' ? 'Sludge blanket' : 'Selimut lumpur' },
		{ icon: HardDrive, k: '02', t: 'Datalogger', d: $locale === 'EN' ? 'Edge logging' : 'Perekaman lapangan' },
		{ icon: Radio, k: '03', t: $locale === 'EN' ? 'Transmission' : 'Transmisi', d: 'RS485 · 4G/LTE' },
		{ icon: LayoutDashboard, k: '04', t: 'STESY', d: 'Dashboard' }
	];

	const capabilities = $derived([
		{ icon: Activity, value: '24/7', unit: '', label: $locale === 'EN' ? 'Real-time level' : 'Level real-time' },
		{ icon: Gauge, value: '0–6', unit: 'm', label: $locale === 'EN' ? 'Measurement depth' : 'Kedalaman ukur' },
		{ icon: Bell, value: $locale === 'EN' ? 'Alarm' : 'Alarm', unit: '', label: $locale === 'EN' ? 'High-level threshold' : 'Ambang level tinggi' },
		{ icon: Radio, value: 'RS485', unit: '', label: $locale === 'EN' ? 'STESY integration' : 'Integrasi STESY' }
	]);

	const applications = $derived([
		{ icon: Droplets, label: 'IPAL' },
		{ icon: Waves, label: 'Clarifier' },
		{ icon: Layers, label: $locale === 'EN' ? 'Sedimentation Ponds' : 'Kolam Sedimentasi' },
		{ icon: FlaskConical, label: 'WTP' },
		{ icon: Factory, label: $locale === 'EN' ? 'Industrial Effluent' : 'Limbah Industri' }
	]);
</script>

<svelte:head>
	<title>ASLR — Automatic Sludge Level Recorder — Beacon Engineering</title>
	<meta name="description" content="ASLR Beacon Engineering: monitoring ketinggian lumpur real-time untuk IPAL, clarifier, dan WTP, terintegrasi STESY." />
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
			<span class="font-semibold" style="color: {ACCENT_SOFT};">ASLR</span>
		</nav>
	</div>
</div>

<!-- HERO -->
<section class="relative overflow-hidden" style="background: #0C0809;">
	<div class="sl-grid absolute inset-0 pointer-events-none"></div>
	<div class="absolute -top-40 right-[-10%] w-[680px] h-[680px] rounded-full pointer-events-none" style="background: radial-gradient(circle, rgba(200,16,46,0.18) 0%, transparent 62%);"></div>
	<div class="absolute inset-x-0 top-0 h-px" style="background: linear-gradient(90deg, transparent, rgba(200,16,46,0.55), transparent);"></div>

	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
		<div class="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-10 items-center">
			<div>
				<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.18em] mb-8" style="background: rgba(200,16,46,0.1); color: #FF8095; border: 1px solid rgba(200,16,46,0.28); opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 10}px); transition: all .7s cubic-bezier(.16,1,.3,1) .05s;">
					<ShieldCheck size={13} />{copy.eyebrow}
				</div>
				<h1 class="font-heading font-extrabold tracking-tighter text-white leading-[0.98] text-5xl sm:text-6xl lg:text-[72px]" style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 18}px); transition: all .8s cubic-bezier(.16,1,.3,1) .15s;">
					{copy.title1}<br /><span class="sl-gradient">{copy.title2}</span>
				</h1>
				<div class="mt-7 flex items-baseline gap-3" style="opacity: {mounted ? 1 : 0}; transition: opacity .8s ease .3s;">
					<span class="font-heading text-2xl font-bold" style="color: {ACCENT_SOFT};">ASLR</span>
					<span class="text-sm text-zinc-500 font-mono">Automatic Sludge Level Recorder</span>
				</div>
				<div class="sl-lead mt-5 max-w-[46ch] text-lg leading-relaxed text-zinc-400" style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 12}px); transition: all .8s cubic-bezier(.16,1,.3,1) .4s;">
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

			<!-- Live sludge tank -->
			<div class="relative flex justify-center lg:justify-end" style="opacity: {mounted ? 1 : 0}; transform: scale({mounted ? 1 : 0.94}); transition: all .9s cubic-bezier(.16,1,.3,1) .35s;">
				<div class="sl-instrument relative w-[360px] max-w-full rounded-[28px] p-6">
					<div class="flex items-center justify-between mb-6">
						<span class="font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-500">{copy.fig}</span>
						<span class="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-300">
							<span class="relative flex h-2 w-2">
								<span class="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping" style="background: {LIVE};"></span>
								<span class="relative inline-flex h-2 w-2 rounded-full" style="background: {LIVE};"></span>
							</span>{copy.live}
						</span>
					</div>

					<div class="flex items-stretch gap-5">
						<!-- tank -->
						<div class="sl-tank">
							<div class="sl-alarm"><span class="sl-alarm-label">{copy.alarm}</span></div>
							<div class="sl-sludge" style="height: {level}%;"><div class="sl-surface"></div></div>
							{#each [25, 50, 75] as g}
								<div class="sl-grad" style="bottom: {g}%;"></div>
							{/each}
						</div>
						<!-- readouts -->
						<div class="flex-1 flex flex-col justify-center gap-3">
							<div class="sl-readout">
								<span class="font-mono text-[9px] tracking-[0.2em] text-zinc-500">{copy.level}</span>
								<span class="font-mono text-xl font-bold tabular-nums" style="color: {ACCENT_SOFT};">{depth.toFixed(2)} <span class="text-xs text-zinc-500">m</span></span>
							</div>
							<div class="sl-readout">
								<span class="font-mono text-[9px] tracking-[0.2em] text-zinc-500">{copy.fill}</span>
								<span class="font-mono text-xl font-bold tabular-nums text-white">{level.toFixed(1)}<span class="text-xs text-zinc-500"> %</span></span>
							</div>
							<div class="sl-readout">
								<span class="font-mono text-[9px] tracking-[0.2em] text-zinc-500">STATUS</span>
								<span class="inline-flex items-center gap-1.5 font-mono text-sm font-bold" style="color: {LIVE};">
									<span class="w-1.5 h-1.5 rounded-full" style="background: {LIVE};"></span>{copy.status}
								</span>
							</div>
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
	<div class="sl-grid absolute inset-0 pointer-events-none opacity-60"></div>
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

<!-- PRODUCT — backend products feed this -->
<ProductVariantDossier {variants} productName="ASLR" />

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
			<div class="sl-grid absolute inset-0 pointer-events-none opacity-50"></div>
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
	.sl-gradient { background: linear-gradient(100deg, #FF4D6D 0%, #C8102E 55%, #A50D25 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
	.sl-lead :global(p) { margin: 0; }
	.sl-grid {
		background-image: linear-gradient(rgba(200,16,46,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(200,16,46,0.07) 1px, transparent 1px);
		background-size: 38px 38px;
		mask-image: radial-gradient(120% 100% at 50% 0%, #000 30%, transparent 78%);
		-webkit-mask-image: radial-gradient(120% 100% at 50% 0%, #000 30%, transparent 78%);
	}
	.sl-instrument {
		background: linear-gradient(180deg, rgba(200,16,46,0.05), rgba(12,8,9,0.6));
		border: 1px solid rgba(200,16,46,0.22);
		box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 40px 80px -30px rgba(0,0,0,0.8);
		backdrop-filter: blur(6px);
	}
	.sl-tank {
		position: relative;
		width: 116px;
		min-height: 210px;
		border-radius: 14px;
		background: rgba(255,255,255,0.03);
		border: 1px solid rgba(200,16,46,0.22);
		overflow: hidden;
		box-shadow: inset 0 0 30px rgba(0,0,0,0.5);
	}
	.sl-sludge {
		position: absolute;
		left: 0; right: 0; bottom: 0;
		background: linear-gradient(180deg, #FF4D6D 0%, #C8102E 55%, #8c0c20 100%);
		transition: height 2.2s cubic-bezier(0.25,0.8,0.3,1);
	}
	.sl-surface {
		position: absolute;
		top: 0; left: 0; right: 0;
		height: 3px;
		background: rgba(255,200,210,0.85);
		box-shadow: 0 0 12px rgba(255,77,109,0.9);
	}
	.sl-grad { position: absolute; left: 0; width: 7px; height: 1px; background: rgba(255,255,255,0.18); }
	.sl-alarm {
		position: absolute;
		left: 0; right: 0; top: 16%;
		border-top: 1px dashed rgba(255,128,149,0.75);
		z-index: 5;
	}
	.sl-alarm-label {
		position: absolute;
		right: 4px; top: -13px;
		font-family: var(--font-mono, monospace);
		font-size: 8px; font-weight: 700; letter-spacing: 0.14em;
		color: rgba(255,128,149,0.85);
	}
	.sl-readout { display: flex; flex-direction: column; gap: 2px; border-radius: 12px; padding: 10px 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(200,16,46,0.16); }
	@media (prefers-reduced-motion: reduce) { .sl-sludge { transition: none; } }
</style>
