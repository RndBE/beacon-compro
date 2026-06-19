<script lang="ts">
	import {
		ArrowRight,
		Check,
		MessageCircle,
		Cloud,
		Thermometer,
		CloudRain,
	} from "@lucide/svelte";
	import Ornaments from "$lib/components/Ornaments.svelte";
	import { weatherForecastProducts as fallbackProducts } from "$lib/data/solutions";
	import { locale } from "$lib/i18n";
	import { openChat } from '$lib/stores/chat';

	let { data } = $props();
	let solutionName = $derived(data.solutionDetail?.solution?.name ?? 'Weather & Climate Intelligence');
	let solutionSlug = $derived(data.solutionDetail?.solution?.slug ?? 'weather-climate-intelligence');
	const pageCopy = {
		ID: {
			metaDesc: "Stasiun cuaca otomatis AWR dan ARR dari Beacon Engineering untuk prediksi cuaca presisi tinggi di Indonesia.",
			title: 'Cuaca Tidak Bisa Dilawan, <br /><span style="color: #6366F1;">Tapi Bisa Diprediksi.</span>',
			desc: "Banjir, kekeringan, hingga risiko penerbangan berawal dari ketidakpastian cuaca.",
			emphasis: "Stasiun cuaca otomatis dari Beacon meresolusi prediksi menjadi presisi.",
			stats: [{ value: "2", label: "Perangkat Utama" }, { value: "WMO", label: "Standard Compliant" }, { value: "24/7", label: "Data Transmisi" }],
			heroAlt: "Ilustrasi sistem stasiun cuaca otomatis Beacon Engineering",
			productBadge: "Produk",
			productTitle: "Stasiun Cuaca & Curah Hujan Otomatis",
			detail: "Lihat Detail",
			ctaBadge: "Next Step",
			ctaTitle: "Mulai Proyek dengan Beacon",
			ctaDesc: "Tim engineer kami akan merancang arsitektur telemetri yang tepat dan menghitung kebutuhan riil proyek Anda.",
			ctaPrimary: "Konsultasi Beacon",
			ctaSecondary: "Jelajahi Produk Lain",
			whatsappText: "Halo CS Sales Beacon, saya ingin konsultasi tentang Beacon untuk proyek saya.",
		},
		EN: {
			metaDesc: "Beacon Engineering automatic weather stations AWR and ARR for high-precision weather prediction in Indonesia.",
			title: 'Weather Cannot Be Stopped, <br /><span style="color: #6366F1;">But It Can Be Predicted.</span>',
			desc: "Floods, droughts, and aviation risks all begin with weather uncertainty.",
			emphasis: "Beacon automatic weather stations turn prediction into precision.",
			stats: [{ value: "2", label: "Core Devices" }, { value: "WMO", label: "Standard Compliant" }, { value: "24/7", label: "Data Transmission" }],
			heroAlt: "Beacon Engineering automatic weather station system illustration",
			productBadge: "Products",
			productTitle: "Automatic Weather & Rainfall Stations",
			detail: "View Details",
			ctaBadge: "Next Step",
			ctaTitle: "Start a Project with Beacon",
			ctaDesc: "Our engineering team will design the right telemetry architecture and calculate your project’s real requirements.",
			ctaPrimary: "Consult Beacon",
			ctaSecondary: "Explore Other Products",
			whatsappText: "Hello Beacon Marketing CS, I would like to consult about Beacon for my project.",
		},
	};
	const copy = $derived(pageCopy[$locale]);

	const products = $derived(
		data.solutionDetail?.sub_solutions &&
			data.solutionDetail.sub_solutions.length > 0
			? data.solutionDetail.sub_solutions.map((s: any) => {
					const editorial = fallbackProducts.find(
						(f) => f.slug === s.slug,
					);
					return {
						slug: s.slug,
						name: s.abbreviation || editorial?.name || s.name,
						full: s.name,
						hook: editorial?.hook ?? "",
						icon: editorial?.icon ?? Cloud,
						desc: editorial?.desc ?? "",
						specs: editorial?.specs ?? [],
						thumbnail:
							s.thumbnail ?? editorial?.thumbnail ?? null,
					};
				})
			: fallbackProducts,
	);
</script>

<svelte:head>
	<title>{solutionName} — Beacon Engineering</title>
	<meta
		name="description"
		content={copy.metaDesc}
	/>
</svelte:head>

<!-- Hero — SKILL: Split Screen, DESIGN_VARIANCE: 8, MOTION_INTENSITY: 6 -->
<section
	class="relative pt-24 pb-0 lg:pt-32 bg-[#FAFAFA] border-b border-[#E5E5E5] overflow-hidden"
>
	<!-- Subtle Dot Grid -->
	<div
		class="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
		style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"
	></div>
	<!-- Decorative circle top-left -->
	<div
		class="absolute -top-24 -left-24 w-80 h-80 rounded-full pointer-events-none opacity-[0.06]"
		style="border: 2px solid #6366F1;"
	></div>
	<!-- Cold glow behind illustration -->
	<div
		class="absolute top-1/2 right-0 -translate-y-1/2 w-[55%] h-full pointer-events-none opacity-[0.035] rounded-full"
		style="background: radial-gradient(ellipse at center, #6366F1 0%, transparent 70%);"
	></div>

	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- SKILL Rule 3: Split-screen — text left, illustration right -->
		<div
			class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-center"
		>
			<!-- Left: Text -->
			<div
				class="flex flex-col justify-center pb-16 lg:pb-24 lg:pr-12 xl:pr-16"
			>
				<div
					class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest mb-6 w-fit"
					style="background: #EEF2FF; color: #6366F1; border: 1px solid rgba(99,102,241,0.15);"
				>
					<Cloud size={12} />
					{solutionName}
				</div>

				<h1
					class="font-heading text-4xl md:text-5xl lg:text-[52px] xl:text-[60px] font-extrabold tracking-tighter leading-[1.06] mb-6"
					style="color: #1A1A1A;"
				>
					{@html copy.title}
				</h1>

				<p
					class="text-base md:text-lg text-gray-600 leading-relaxed max-w-[52ch] mb-4"
				>
					{copy.desc}
				</p>
				<p
					class="text-base md:text-lg font-semibold"
					style="color: #6366F1;"
				>
					{copy.emphasis}
				</p>

				<!-- Stat strip -->
				<div
					class="flex items-center gap-8 mt-10 pt-8 border-t border-[#E5E5E5]"
				>
					<div>
						<p
							class="font-heading text-2xl font-extrabold tabular-nums"
							style="color: #1A1A1A; letter-spacing: -0.03em;"
						>
							{copy.stats[0].value}
						</p>
						<p
							class="text-xs font-medium mt-0.5"
							style="color: #7A7A7A;"
						>
							{copy.stats[0].label}
						</p>
					</div>
					<div class="w-px h-8 bg-[#E5E5E5]"></div>
					<div>
						<p
							class="font-heading text-2xl font-extrabold tabular-nums"
							style="color: #1A1A1A; letter-spacing: -0.03em;"
						>
							{copy.stats[1].value}
						</p>
						<p
							class="text-xs font-medium mt-0.5"
							style="color: #7A7A7A;"
						>
							{copy.stats[1].label}
						</p>
					</div>
					<div class="w-px h-8 bg-[#E5E5E5]"></div>
					<div>
						<p
							class="font-heading text-2xl font-extrabold tabular-nums"
							style="color: #1A1A1A; letter-spacing: -0.03em;"
						>
							{copy.stats[2].value}
						</p>
						<p
							class="text-xs font-medium mt-0.5"
							style="color: #7A7A7A;"
						>
							{copy.stats[2].label}
						</p>
					</div>
				</div>
			</div>

			<!-- Right: Illustration — float animation -->
			<div
				class="relative flex items-center justify-center lg:justify-end -mt-8 lg:-mt-16"
			>
				<!-- Faint dashed ring -->
				<div
					class="absolute inset-0 flex items-center justify-center pointer-events-none"
				>
					<div
						class="w-[85%] h-[85%] rounded-full opacity-[0.07]"
						style="border: 1.5px dashed #6366F1;"
					></div>
				</div>
				<!-- Illustration -->
				<div
					class="ws-hero-float w-full max-w-[760px] lg:max-w-none lg:w-[165%] xl:w-[185%] lg:translate-x-16 xl:translate-x-20"
				>
					<img
						src="/ilustrasi_weather_forecast.webp"
						srcset="/images/hero-solutions/weather_forecast-960.webp 960w, /images/hero-solutions/weather_forecast-1280.webp 1280w, /ilustrasi_weather_forecast.webp 1672w"
						sizes="(min-width: 1280px) 980px, (min-width: 1024px) 860px, 92vw"
						alt={copy.heroAlt}
						class="w-full h-auto object-contain select-none"
						width="1672"
						height="941"
						draggable="false"
						loading="eager"
						decoding="async"
						fetchpriority="high"
					/>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="relative py-16 lg:py-24 bg-white overflow-hidden">
	<Ornaments variant="dense" />
	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="max-w-2xl mb-14 space-y-3">
			<span class="text-xs font-semibold uppercase tracking-widest" style="color: #6366F1;">{copy.productBadge} {solutionName}</span>
			<h2 class="font-heading text-3xl sm:text-4xl font-bold leading-[1.1]" style="color: #1A1A1A; letter-spacing: -0.025em;">{copy.productTitle}</h2>
		</div>

		<div class="grid md:grid-cols-2 gap-6">
			{#each products as product, i}
				<a
					href="/solusi/{solutionSlug}/{product.slug}"
					class="group relative rounded-[28px] overflow-hidden min-h-[480px] flex flex-col justify-end bg-zinc-100 transition-transform duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.3)]"
					style="border: 1px solid rgba(0,0,0,0.1);"
				>
					<!-- Full Image Background -->
					<img src={product.thumbnail} alt={product.name} class="absolute inset-0 w-full h-full object-cover opacity-[0.82] group-hover:opacity-[0.95] transition-all duration-1000 group-hover:scale-110" loading="lazy" decoding="async" />
					
					<!-- Darkening Gradient for Readability -->
					<div class="absolute inset-0 bg-gradient-to-t from-black/78 via-black/32 to-black/18 pointer-events-none"></div>

					<!-- Indigo Top Accent -->
					<div class="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" style="background: linear-gradient(90deg, #6366F1, transparent);"></div>

					<!-- Liquid Glass Content Panel -->
					<div class="relative z-10 m-4 p-7 rounded-[22px] transition-all duration-500 transform group-hover:-translate-y-1"
						 style="background: linear-gradient(180deg, rgba(52,52,52,0.78) 0%, rgba(14,14,14,0.94) 48%, rgba(0,0,0,0.98) 100%); backdrop-filter: blur(18px); border: 1px solid rgba(255,255,255,0.12); box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 18px 38px rgba(0,0,0,0.34);">
						
						<div class="flex items-center gap-4 mb-5">
							<div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110" style="background: rgba(99,102,241,0.2); border: 1px solid rgba(99,102,241,0.3);">
								<svelte:component this={product.icon} size={22} style="color: #818CF8;" />
							</div>
							<div>
								<span class="font-heading text-xl font-bold text-white tracking-tight">{product.name}</span>
								<span class="block text-[10px] uppercase tracking-widest text-white/50 mt-0.5">{product.full}</span>
							</div>
						</div>

						<!-- Mini specs -->
						<div class="flex flex-wrap gap-1.5 mb-5 mt-auto">
							{#each product.specs as spec}
								<span class="text-[10px] px-2.5 py-1 rounded-full font-medium" style="background: rgba(255,255,255,0.09); border: 1px solid rgba(255,255,255,0.18); color: rgba(255,255,255,0.88);">{spec}</span>
							{/each}
						</div>

						<div class="flex items-center gap-2 text-sm font-semibold text-[#818CF8] group-hover:gap-3 transition-all mt-4">
							{copy.detail} {product.name}
							<ArrowRight size={14} />
						</div>
					</div>
				</a>
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
					{copy.ctaBadge}
				</span>
				<h2 class="font-heading text-4xl sm:text-5xl font-extrabold text-white tracking-tighter mb-4">{copy.ctaTitle}</h2>
				<p class="text-lg text-zinc-400 font-medium">{copy.ctaDesc}</p>
			</div>

			<div class="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto shrink-0">
				<button type="button" onclick={openChat}
					class="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-zinc-950 bg-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] btn-tactile">
					<MessageCircle size={18} />
					{copy.ctaPrimary}
				</button>
				<a href="/solusi" class="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white transition-all hover:bg-zinc-800 btn-tactile" style="border: 1px solid rgba(255,255,255,0.15);">
					<ArrowRight size={18} />
					{copy.ctaSecondary}
				</a>
			</div>
		</div>
	</div>
</section>

<style>
	/* SKILL MOTION_INTENSITY: 6 — Hero illustration gentle float */
	.ws-hero-float {
		animation: wsFloat 6s ease-in-out infinite;
		will-change: transform;
	}

	@keyframes wsFloat {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-12px);
		}
	}

	@media (max-width: 1023px) {
		.ws-hero-float {
			transform: none !important;
		}
		@keyframes wsFloat {
			0%,
			100% {
				transform: translateY(0px);
			}
			50% {
				transform: translateY(-10px);
			}
		}
	}

	/* Live dot pulse for Indigo */
	.animate-pulse-indigo {
		animation: pulseIndigo 2s ease-in-out infinite;
	}

	@keyframes pulseIndigo {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.4;
			transform: scale(0.7);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.ws-hero-float,
		.animate-pulse-indigo {
			animation: none !important;
		}
	}
</style>
