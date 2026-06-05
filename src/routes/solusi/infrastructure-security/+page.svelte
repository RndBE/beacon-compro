<script lang="ts">
	import {
		ArrowRight,
		MessageCircle,
		ShieldCheck,
	} from "@lucide/svelte";
	import Ornaments from "$lib/components/Ornaments.svelte";
	import { locale } from "$lib/i18n";
	import { pressureMeasurementProducts as fallbackProducts } from "$lib/data/solutions";

	let { data } = $props();
	let solutionName = $derived(data.solutionDetail?.solution?.name ?? 'Infrastructure Security');
	let solutionSlug = $derived(data.solutionDetail?.solution?.slug ?? 'infrastructure-security');
	const pageCopy = {
		ID: {
			metaDescription:
				"Infrastructure Security Beacon Engineering: proteksi aset kritis melalui instrumentasi keamanan, alarm anomali, dan telemetri lapangan terintegrasi STESY.",
			title: 'Proteksi Lapangan untuk <br /><span style="color: #059669;">Aset Kritis.</span>',
			description:
				"Instrumentasi keamanan untuk fasilitas energi, bendungan, utilitas, dan infrastruktur strategis yang harus tetap terpantau.",
			emphasis:
				"Alarm anomali, logging kondisi aset, dan integrasi STESY dari Indonesia.",
			stats: [
				{ value: "High", label: "Field Reliability" },
				{ value: "1/3", label: "Lead Time Integrasi" },
				{ value: "100%", label: "Local Support" },
			],
			heroAlt: "Ilustrasi sistem proteksi infrastruktur",
			productBadge: "Produk",
			productTitle: "Proteksi Aset Infrastruktur",
			detail: "Lihat Detail",
			ctaBadge: "Next Step",
			ctaTitle: "Mulai Proyek dengan Beacon",
			ctaDescription:
				"Tim engineer kami akan merancang arsitektur telemetri yang tepat dan menghitung kebutuhan riil proyek Anda.",
			ctaPrimary: "Konsultasi Beacon",
			ctaSecondary: "Jelajahi Produk Lain",
			waText:
				"Halo CS Marketing Beacon, saya ingin konsultasi tentang Beacon untuk proyek saya.",
		},
		EN: {
			metaDescription:
				"Beacon Engineering Infrastructure Security: protect critical assets through security instrumentation, anomaly alarms, and STESY-integrated field telemetry.",
			title: 'Field Protection for <br /><span style="color: #059669;">Critical Assets.</span>',
			description:
				"Security instrumentation for energy facilities, dams, utilities, and strategic infrastructure that must remain monitored.",
			emphasis:
				"Anomaly alarms, asset-condition logging, and STESY integration from Indonesia.",
			stats: [
				{ value: "High", label: "Field Reliability" },
				{ value: "1/3", label: "Integration Lead Time" },
				{ value: "100%", label: "Local Support" },
			],
			heroAlt: "Beacon Engineering infrastructure protection system illustration",
			productBadge: "Products",
			productTitle: "Infrastructure Asset Protection",
			detail: "View Details",
			ctaBadge: "Next Step",
			ctaTitle: "Start a Project with Beacon",
			ctaDescription:
				"Our engineers will design the right telemetry architecture and estimate the real requirements for your project.",
			ctaPrimary: "Consult Beacon",
			ctaSecondary: "Explore Other Products",
			waText:
				"Hello Beacon Marketing CS, I want to consult about Beacon for my project.",
		},
	};
	let copy = $derived(pageCopy[$locale]);
	let consultationUrl = $derived(
		`https://wa.me/628112632151?text=${encodeURIComponent(copy.waText)}`,
	);

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
						full: editorial?.full ?? s.name,
						hook: editorial?.hook ?? "",
						icon: editorial?.icon ?? ShieldCheck,
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
		content={copy.metaDescription}
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
		style="border: 2px solid #059669;"
	></div>
	<!-- Emerald glow behind illustration -->
	<div
		class="absolute top-1/2 right-0 -translate-y-1/2 w-[55%] h-full pointer-events-none opacity-[0.035] rounded-full"
		style="background: radial-gradient(ellipse at center, #059669 0%, transparent 70%);"
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
					style="background: #D1FAE5; color: #059669; border: 1px solid rgba(5,150,105,0.15);"
				>
					<ShieldCheck size={12} />
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
					{copy.description}
				</p>
				<p
					class="text-base md:text-lg font-semibold"
					style="color: #059669;"
				>
					{copy.emphasis}
				</p>

				<!-- Stat strip -->
				<div
					class="flex items-center gap-8 mt-10 pt-8 border-t border-[#E5E5E5]"
				>
					{#each copy.stats as stat, i}
					<div>
						<p
							class="font-heading text-2xl font-extrabold tabular-nums"
							style="color: #1A1A1A; letter-spacing: -0.03em;"
						>
							{stat.value}
						</p>
						<p
							class="text-xs font-medium mt-0.5"
							style="color: #7A7A7A;"
						>
							{stat.label}
						</p>
					</div>
					{#if i < copy.stats.length - 1}
						<div class="w-px h-8 bg-[#E5E5E5]"></div>
					{/if}
					{/each}
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
						style="border: 1.5px dashed #059669;"
					></div>
				</div>
				<!-- Illustration -->
				<div
					class="ws-hero-float w-full max-w-[760px] lg:max-w-none lg:w-[165%] xl:w-[185%] lg:translate-x-16 xl:translate-x-20"
				>
					<img
						src="/ilustrasi_pressure_measurement.webp"
						srcset="/images/hero-solutions/pressure_measurement-960.webp 960w, /images/hero-solutions/pressure_measurement-1280.webp 1280w, /ilustrasi_pressure_measurement.webp 1672w"
						sizes="(min-width: 1280px) 980px, (min-width: 1024px) 860px, 92vw"
						alt="{copy.heroAlt} {solutionName} Beacon Engineering"
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
			<span class="text-xs font-semibold uppercase tracking-widest" style="color: #059669;">{copy.productBadge} {solutionName}</span>
			<h2 class="font-heading text-3xl sm:text-4xl font-bold leading-[1.1]" style="color: #1A1A1A; letter-spacing: -0.025em;">{copy.productTitle}</h2>
		</div>

		<div class="grid md:grid-cols-2 gap-6">
			{#each products as product, i}
				<a
					href="/solusi/{solutionSlug}/{product.slug}"
					class="group relative rounded-[28px] overflow-hidden min-h-[480px] flex flex-col justify-end bg-zinc-100 transition-transform duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(5,150,105,0.3)]"
					style="border: 1px solid rgba(0,0,0,0.1);"
				>
					<!-- Full Image Background -->
					<img src={product.thumbnail} alt={product.name} class="absolute inset-0 w-full h-full object-cover opacity-[0.82] group-hover:opacity-[0.95] transition-all duration-1000 group-hover:scale-110" loading="lazy" decoding="async" />
					
					<!-- Darkening Gradient for Readability -->
					<div class="absolute inset-0 bg-gradient-to-t from-black/78 via-black/32 to-black/18 pointer-events-none"></div>

					<!-- Emerald Top Accent -->
					<div class="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" style="background: linear-gradient(90deg, #059669, transparent);"></div>

					<!-- Liquid Glass Content Panel -->
					<div class="relative z-10 m-4 p-7 rounded-[22px] transition-all duration-500 transform group-hover:-translate-y-1"
						 style="background: linear-gradient(180deg, rgba(52,52,52,0.78) 0%, rgba(14,14,14,0.94) 48%, rgba(0,0,0,0.98) 100%); backdrop-filter: blur(18px); border: 1px solid rgba(255,255,255,0.12); box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 18px 38px rgba(0,0,0,0.34);">
						
						<div class="flex items-center gap-4 mb-5">
							<div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110" style="background: rgba(5,150,105,0.2); border: 1px solid rgba(5,150,105,0.3);">
								<svelte:component this={product.icon} size={22} style="color: #34D399;" />
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

						<div class="flex items-center gap-2 text-sm font-semibold text-[#34D399] group-hover:gap-3 transition-all mt-4">
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
				<p class="text-lg text-zinc-400 font-medium">{copy.ctaDescription}</p>
			</div>

			<div class="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto shrink-0">
				<a href={consultationUrl} target="_blank" rel="noopener"
					class="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-zinc-950 bg-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] btn-tactile">
					<MessageCircle size={18} />
					{copy.ctaPrimary}
				</a>
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

	/* Live dot pulse for Emerald */
	.animate-pulse-emerald {
		animation: pulseEmerald 2s ease-in-out infinite;
	}

	@keyframes pulseEmerald {
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
		.animate-pulse-emerald {
			animation: none !important;
		}
	}
</style>
