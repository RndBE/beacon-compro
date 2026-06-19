<script lang="ts">
	import { onMount } from 'svelte';
	import {
		ArrowRight,
		MessageCircle,
		ChevronRight,
		ShieldCheck,
		Activity,
		Radio,
		Compass,
		Cpu,
		HardDrive,
		LayoutDashboard,
		Building2,
		Mountain,
		RadioTower,
		Waves,
		Factory,
		Waypoints,
		Construction
	} from '@lucide/svelte';
	import { locale } from '$lib/i18n';
	import { openChat } from '$lib/stores/chat';
	import ProductVariantDossier from '$lib/components/ProductVariantDossier.svelte';

	let { data } = $props();

	// Brand identity stays RED. Green is used only as the tiny "live" status dot
	// (the same #1B7F3A the rest of the site uses for online indicators).
	const ACCENT = '#C8102E';
	const ACCENT_SOFT = '#FF4D6D';
	const LIVE = '#1B7F3A';

	const ss = $derived(data.subSolutionDetail?.sub_solution ?? null);
	const mainContent = $derived(
		ss?.main_content?.trim() ||
			'<p>Sensor tilt monitoring memantau kemiringan struktur secara real-time pada dua sumbu, lalu mengirimkan data melalui RS485 untuk integrasi ke datalogger dan dashboard monitoring.</p>'
	);

	// ─── PRODUCT DATA (backend products feed ProductVariantDossier) ───
	const fallbackVariants = [
		{ name: 'BE TLR-100-2XY', subtitle: 'Biaxial Inclinometer', desc: 'Recorder tilt dua sumbu (X/Y) dengan akurasi tinggi untuk monitoring kemiringan struktur — terintegrasi RS485 ke datalogger dan STESY.', use: 'Bendungan, jembatan, tebing, struktur beton',
		specs: [
			{ label: 'Sumbu Pengukuran', value: 'Dual-axis (X & Y)' },
			{ label: 'Range', value: '±15° (±30° opsional)' },
			{ label: 'Akurasi', value: '±0.01°' },
			{ label: 'Resolusi', value: '0.001°' },
			{ label: 'Tipe Sensor', value: 'MEMS inclinometer' },
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
					home: 'Home',
					solutions: 'Solutions',
					eyebrow: 'Infrastructure Security · Structural Monitoring',
					title1: 'Before it fails,',
					title2: 'it tilts.',
					consult: 'Consult ATLR',
					other: 'Other Solutions',
					live: 'LIVE',
					fig: 'FIG.01 — BIAXIAL INCLINOMETER',
					axisX: 'AXIS X',
					axisY: 'AXIS Y',
					magnitude: 'TILT MAGNITUDE',
					chainBadge: 'Signal Chain',
					chainTitle: 'From a fraction of a degree to your dashboard',
					chainDesc:
						'Two-axis tilt is digitized at the sensor and travels over a hardened RS485 line — no analog drift — straight into the datalogger and STESY.',
					capBadge: 'Capabilities',
					capTitle: 'Built for structures that cannot move unnoticed',
					appBadge: 'Where it works',
					appTitle: 'One sensor, every critical structure',
					appDesc: 'Bridges, dams, buildings, towers, slopes, tunnels, and industrial structures.',
					ctaBadge: 'Next Step',
					ctaTitle: 'Monitor your structure with ATLR',
					ctaDesc:
						'Our engineers will map the right tilt-monitoring layout and integrate it into your STESY dashboard.',
					ctaPrimary: 'Consult ATLR',
					ctaSecondary: 'Explore Other Products'
				}
			: {
					home: 'Beranda',
					solutions: 'Solusi',
					eyebrow: 'Infrastructure Security · Structural Monitoring',
					title1: 'Sebelum runtuh,',
					title2: 'struktur miring dulu.',
					consult: 'Konsultasi ATLR',
					other: 'Solusi Lain',
					live: 'LIVE',
					fig: 'FIG.01 — INKLINOMETER BIAKSIAL',
					axisX: 'SUMBU X',
					axisY: 'SUMBU Y',
					magnitude: 'MAGNITUDO MIRING',
					chainBadge: 'Rantai Sinyal',
					chainTitle: 'Dari pecahan derajat hingga dashboard Anda',
					chainDesc:
						'Kemiringan dua sumbu didigitalkan di sensor lalu melaju lewat jalur RS485 yang tahan gangguan — tanpa drift analog — langsung ke datalogger dan STESY.',
					capBadge: 'Kemampuan',
					capTitle: 'Dirancang untuk struktur yang tak boleh bergeser diam-diam',
					appBadge: 'Penerapan',
					appTitle: 'Satu sensor, untuk setiap struktur kritis',
					appDesc: 'Jembatan, bendungan, gedung, menara, lereng, terowongan, dan struktur industri.',
					ctaBadge: 'Langkah Selanjutnya',
					ctaTitle: 'Pantau struktur Anda dengan ATLR',
					ctaDesc:
						'Tim engineer kami akan merancang tata letak tilt-monitoring yang tepat dan mengintegrasikannya ke dashboard STESY.',
					ctaPrimary: 'Konsultasi ATLR',
					ctaSecondary: 'Jelajahi Produk Lain'
				}
	);

	// ── Live biaxial readout (gentle drift, paused for reduced-motion) ──
	let tiltX = $state(0);
	let tiltY = $state(0);
	let mounted = $state(false);

	const fmt = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(3)}°`;
	const magnitude = $derived(Math.sqrt(tiltX * tiltX + tiltY * tiltY));

	onMount(() => {
		mounted = true;
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduce) {
			tiltX = 0.012;
			tiltY = -0.008;
			return;
		}
		const tick = () => {
			tiltX = Math.round((Math.random() * 0.16 - 0.08) * 1000) / 1000;
			tiltY = Math.round((Math.random() * 0.16 - 0.08) * 1000) / 1000;
		};
		tick();
		const id = setInterval(tick, 2200);
		return () => clearInterval(id);
	});

	const dotX = $derived(Math.max(-46, Math.min(46, tiltX * 560)));
	const dotY = $derived(Math.max(-46, Math.min(46, tiltY * 560)));

	const chain = [
		{ icon: Cpu, k: '01', t: $locale === 'EN' ? 'Tilt Sensor' : 'Sensor Tilt', d: $locale === 'EN' ? '2-axis MEMS' : 'MEMS 2 sumbu' },
		{ icon: Radio, k: '02', t: 'RS485', d: $locale === 'EN' ? 'Digital bus' : 'Bus digital' },
		{ icon: HardDrive, k: '03', t: 'Datalogger', d: $locale === 'EN' ? 'Edge logging' : 'Perekaman lapangan' },
		{ icon: LayoutDashboard, k: '04', t: 'STESY', d: 'Dashboard' }
	];

	const capabilities = $derived([
		{ icon: Compass, value: '2', unit: $locale === 'EN' ? 'axis' : 'sumbu', label: $locale === 'EN' ? 'Biaxial X / Y tilt' : 'Kemiringan biaksial X / Y' },
		{ icon: Activity, value: '24/7', unit: '', label: $locale === 'EN' ? 'Real-time stream' : 'Aliran data real-time' },
		{ icon: Radio, value: 'RS485', unit: '', label: $locale === 'EN' ? 'Digital, drift-free' : 'Digital, anti-drift' },
		{ icon: LayoutDashboard, value: 'STESY', unit: '', label: $locale === 'EN' ? 'Native integration' : 'Integrasi penuh' }
	]);

	const applications = $derived([
		{ icon: Waypoints, label: $locale === 'EN' ? 'Bridges' : 'Jembatan' },
		{ icon: Waves, label: $locale === 'EN' ? 'Dams' : 'Bendungan' },
		{ icon: Building2, label: $locale === 'EN' ? 'Buildings' : 'Gedung' },
		{ icon: RadioTower, label: $locale === 'EN' ? 'Towers' : 'Menara' },
		{ icon: Mountain, label: $locale === 'EN' ? 'Slopes' : 'Lereng' },
		{ icon: Construction, label: $locale === 'EN' ? 'Tunnels' : 'Terowongan' },
		{ icon: Factory, label: $locale === 'EN' ? 'Industrial' : 'Struktur Industri' }
	]);
</script>

<svelte:head>
	<title>ATLR — Automatic Tilt Level Recorder — Beacon Engineering</title>
	<meta
		name="description"
		content="ATLR Beacon Engineering: inklinometer biaksial untuk monitoring kemiringan struktur real-time via RS485, terintegrasi STESY."
	/>
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
			<span class="font-semibold" style="color: {ACCENT_SOFT};">ATLR</span>
		</nav>
	</div>
</div>

<!-- ════════ HERO — dark blueprint instrument panel (red identity) ════════ -->
<section class="atlr-hero relative overflow-hidden" style="background: #0C0809;">
	<div class="atlr-grid absolute inset-0 pointer-events-none"></div>
	<div class="absolute -top-40 right-[-10%] w-[680px] h-[680px] rounded-full pointer-events-none" style="background: radial-gradient(circle, rgba(200,16,46,0.18) 0%, transparent 62%);"></div>
	<div class="absolute inset-x-0 top-0 h-px" style="background: linear-gradient(90deg, transparent, rgba(200,16,46,0.55), transparent);"></div>

	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
		<div class="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-10 items-center">
			<!-- Left: editorial -->
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
					<span class="atlr-gradient">{copy.title2}</span>
				</h1>

				<div
					class="mt-7 flex items-baseline gap-3"
					style="opacity: {mounted ? 1 : 0}; transition: opacity .8s ease .3s;"
				>
					<span class="font-heading text-2xl font-bold" style="color: {ACCENT_SOFT};">ATLR</span>
					<span class="text-sm text-zinc-500 font-mono">Automatic Tilt Level Recorder</span>
				</div>

				<div
					class="atlr-lead mt-5 max-w-[46ch] text-lg leading-relaxed text-zinc-400"
					style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 12}px); transition: all .8s cubic-bezier(.16,1,.3,1) .4s;"
				>
					{@html mainContent}
				</div>

				<div
					class="mt-10 flex flex-wrap gap-3"
					style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : 12}px); transition: all .8s cubic-bezier(.16,1,.3,1) .5s;"
				>
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

			<!-- Right: live biaxial inclinometer -->
			<div
				class="relative flex justify-center lg:justify-end"
				style="opacity: {mounted ? 1 : 0}; transform: scale({mounted ? 1 : 0.94}); transition: all .9s cubic-bezier(.16,1,.3,1) .35s;"
			>
				<div class="atlr-instrument relative w-[340px] max-w-full rounded-[28px] p-6">
					<div class="flex items-center justify-between mb-5">
						<span class="font-mono text-[10px] font-bold tracking-[0.22em] text-zinc-500">{copy.fig}</span>
						<span class="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-300">
							<span class="relative flex h-2 w-2">
								<span class="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping" style="background: {LIVE};"></span>
								<span class="relative inline-flex h-2 w-2 rounded-full" style="background: {LIVE};"></span>
							</span>
							{copy.live}
						</span>
					</div>

					<!-- the dial -->
					<div class="atlr-dial relative mx-auto aspect-square w-[240px] rounded-full">
						<div class="atlr-ring atlr-ring-1"></div>
						<div class="atlr-ring atlr-ring-2"></div>
						<div class="atlr-ring atlr-ring-3"></div>
						<div class="atlr-cross-h"></div>
						<div class="atlr-cross-v"></div>
						<div class="atlr-center"></div>
						<div
							class="atlr-bubble"
							style="transform: translate(calc(-50% + {dotX}px), calc(-50% + {dotY}px));"
						>
							<div class="atlr-bubble-core"></div>
						</div>
						<span class="atlr-tick" style="top:6px; left:50%; transform:translateX(-50%);">Y+</span>
						<span class="atlr-tick" style="bottom:6px; left:50%; transform:translateX(-50%);">Y−</span>
						<span class="atlr-tick" style="left:8px; top:50%; transform:translateY(-50%);">X−</span>
						<span class="atlr-tick" style="right:8px; top:50%; transform:translateY(-50%);">X+</span>
					</div>

					<!-- readouts -->
					<div class="grid grid-cols-2 gap-2.5 mt-6">
						<div class="atlr-readout">
							<span class="font-mono text-[9px] tracking-[0.2em] text-zinc-500">{copy.axisX}</span>
							<span class="font-mono text-lg font-bold tabular-nums" style="color: {ACCENT_SOFT};">{fmt(tiltX)}</span>
						</div>
						<div class="atlr-readout">
							<span class="font-mono text-[9px] tracking-[0.2em] text-zinc-500">{copy.axisY}</span>
							<span class="font-mono text-lg font-bold tabular-nums" style="color: {ACCENT_SOFT};">{fmt(tiltY)}</span>
						</div>
					</div>

					<!-- magnitude bar -->
					<div class="mt-3 atlr-readout">
						<div class="flex items-center justify-between mb-2">
							<span class="font-mono text-[9px] tracking-[0.2em] text-zinc-500">{copy.magnitude}</span>
							<span class="font-mono text-[11px] font-bold tabular-nums text-zinc-300">{magnitude.toFixed(3)}°</span>
						</div>
						<div class="h-1.5 rounded-full overflow-hidden" style="background: rgba(255,255,255,0.07);">
							<div class="h-full rounded-full atlr-mag" style="width: {Math.min(100, magnitude / 0.113 * 100)}%; background: linear-gradient(90deg, #C8102E, #FF4D6D);"></div>
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
				<div class="atlr-chain-step group relative rounded-2xl p-6 bg-white transition-all duration-300 hover:-translate-y-1" style="border: 1px solid #E5E5E5;">
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

<!-- ════════ CAPABILITIES band (dark, red identity) ════════ -->
<section class="relative py-20 lg:py-24 overflow-hidden" style="background: #130A0C;">
	<div class="atlr-grid absolute inset-0 pointer-events-none opacity-60"></div>
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

<!-- ════════ PRODUCT — backend products feed this ════════ -->
<ProductVariantDossier {variants} productName="ATLR" />

<!-- ════════ APPLICATIONS ════════ -->
<section class="relative py-20 lg:py-28 bg-[#FAFAFA] overflow-hidden">
	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="max-w-2xl mb-14">
			<span class="font-mono text-xs font-bold uppercase tracking-[0.2em]" style="color: {ACCENT};">{copy.appBadge}</span>
			<h2 class="font-heading text-3xl sm:text-4xl font-bold mt-3 leading-[1.12]" style="color: #1A1A1A; letter-spacing: -0.02em;">{copy.appTitle}</h2>
			<p class="text-base leading-relaxed mt-4" style="color: #5C5C5C;">{copy.appDesc}</p>
		</div>
		<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
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

<!-- ════════ CTA ════════ -->
<section class="relative py-20 bg-[#FAFAFA]">
	<div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
		<div class="relative overflow-hidden rounded-[2.5rem] p-10 sm:p-16 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-12 group" style="background: #1A0A0D; box-shadow: 0 40px 80px -24px rgba(26,10,13,0.55);">
			<div class="atlr-grid absolute inset-0 pointer-events-none opacity-50"></div>
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
	.atlr-gradient {
		background: linear-gradient(100deg, #FF4D6D 0%, #C8102E 55%, #A50D25 100%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}

	.atlr-lead :global(p) {
		margin: 0;
	}

	/* blueprint grid (red) */
	.atlr-grid {
		background-image:
			linear-gradient(rgba(200, 16, 46, 0.07) 1px, transparent 1px),
			linear-gradient(90deg, rgba(200, 16, 46, 0.07) 1px, transparent 1px);
		background-size: 38px 38px;
		mask-image: radial-gradient(120% 100% at 50% 0%, #000 30%, transparent 78%);
		-webkit-mask-image: radial-gradient(120% 100% at 50% 0%, #000 30%, transparent 78%);
	}

	/* instrument card */
	.atlr-instrument {
		background: linear-gradient(180deg, rgba(200, 16, 46, 0.05), rgba(12, 8, 9, 0.6));
		border: 1px solid rgba(200, 16, 46, 0.22);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.06),
			0 40px 80px -30px rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(6px);
	}

	.atlr-dial {
		background: radial-gradient(circle at 50% 42%, rgba(200, 16, 46, 0.1), rgba(12, 8, 9, 0.2));
		border: 1px solid rgba(200, 16, 46, 0.22);
		box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.55);
	}
	.atlr-ring {
		position: absolute;
		border-radius: 9999px;
		border: 1px solid rgba(200, 16, 46, 0.16);
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
	.atlr-ring-1 { width: 78%; height: 78%; }
	.atlr-ring-2 { width: 52%; height: 52%; }
	.atlr-ring-3 { width: 26%; height: 26%; border-color: rgba(200, 16, 46, 0.3); }
	.atlr-cross-h,
	.atlr-cross-v {
		position: absolute;
		background: rgba(200, 16, 46, 0.16);
	}
	.atlr-cross-h { top: 50%; left: 8%; right: 8%; height: 1px; transform: translateY(-50%); }
	.atlr-cross-v { left: 50%; top: 8%; bottom: 8%; width: 1px; transform: translateX(-50%); }
	.atlr-center {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 56px;
		height: 56px;
		border-radius: 9999px;
		border: 1px dashed rgba(200, 16, 46, 0.42);
		transform: translate(-50%, -50%);
	}
	.atlr-bubble {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 26px;
		height: 26px;
		border-radius: 9999px;
		background: radial-gradient(circle at 35% 30%, rgba(255, 77, 109, 0.55), rgba(200, 16, 46, 0.25));
		border: 1px solid rgba(255, 128, 149, 0.7);
		box-shadow: 0 0 18px rgba(200, 16, 46, 0.7);
		transition: transform 2s cubic-bezier(0.25, 0.8, 0.3, 1);
		display: grid;
		place-items: center;
	}
	.atlr-bubble-core {
		width: 6px;
		height: 6px;
		border-radius: 9999px;
		background: #ffe1e6;
	}
	.atlr-tick {
		position: absolute;
		font-family: var(--font-mono, monospace);
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.1em;
		color: rgba(255, 128, 149, 0.7);
	}
	.atlr-readout {
		display: flex;
		flex-direction: column;
		gap: 2px;
		border-radius: 12px;
		padding: 10px 12px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(200, 16, 46, 0.16);
	}
	.atlr-mag { transition: width 2s cubic-bezier(0.25, 0.8, 0.3, 1); }

	@media (prefers-reduced-motion: reduce) {
		.atlr-bubble,
		.atlr-mag { transition: none; }
	}
</style>
