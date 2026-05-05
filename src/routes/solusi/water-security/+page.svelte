<script lang="ts">
	import { ArrowRight, Check, MessageCircle, Droplets } from '@lucide/svelte';
	import Ornaments from '$lib/components/Ornaments.svelte';
	import { waterSecurityProducts as fallbackProducts } from '$lib/data/solutions';

	let { data } = $props();

	// Merge API sub_solutions with editorial metadata (icon, hook, specs, thumbnail)
	const products = $derived(
		data.solutionDetail?.sub_solutions && data.solutionDetail.sub_solutions.length > 0
			? data.solutionDetail.sub_solutions.map((s: any) => {
					const editorial = fallbackProducts.find(f => f.slug === s.slug);
					return {
						slug: s.slug,
						name: s.abbreviation || editorial?.name || s.name,
						full: s.name,
						hook: editorial?.hook ?? '',
						icon: editorial?.icon ?? Droplets,
						desc: editorial?.desc ?? '',
						specs: editorial?.specs ?? [],
						thumbnail: s.thumbnail ?? editorial?.thumbnail ?? null
					};
				})
			: fallbackProducts
	);
</script>

<svelte:head>
	<title>Water Security — Beacon Engineering</title>
	<meta name="description" content="Enam perangkat Water Security Beacon: AWLR, AWGC, AFMR, ADR, AWQR, AVWR — amankan setiap meter kubik air Indonesia." />
</svelte:head>

<!-- Hero — SKILL: Split Screen, DESIGN_VARIANCE: 8, MOTION_INTENSITY: 6 -->
<section class="relative pt-24 pb-0 lg:pt-32 bg-[#FAFAFA] border-b border-[#E5E5E5] overflow-hidden">
	<!-- Subtle Dot Grid -->
	<div class="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>
	<!-- Decorative circle top-left -->
	<div class="absolute -top-24 -left-24 w-80 h-80 rounded-full pointer-events-none opacity-[0.06]" style="border: 2px solid #C8102E;"></div>
	<!-- Warm glow behind illustration -->
	<div class="absolute top-1/2 right-0 -translate-y-1/2 w-[55%] h-full pointer-events-none opacity-[0.035] rounded-full" style="background: radial-gradient(ellipse at center, #C8102E 0%, transparent 70%);"></div>

	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- SKILL Rule 3: Split-screen — text left, illustration right -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-center">

			<!-- Left: Text -->
			<div class="flex flex-col justify-center pb-16 lg:pb-24 lg:pr-12 xl:pr-16">
				<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest mb-6 w-fit" style="background: #FBE9EC; color: #C8102E; border: 1px solid rgba(200,16,46,0.15);">
					<Droplets size={12} />
					Water Security
				</div>

				<h1 class="font-heading text-4xl md:text-5xl lg:text-[52px] xl:text-[60px] font-extrabold tracking-tighter leading-[1.06] mb-6" style="color: #1A1A1A;">
					Air adalah Hidup. <br/>
					<span style="color: #C8102E;">Dan Risiko.</span>
				</h1>

				<p class="text-base md:text-lg text-gray-600 leading-relaxed max-w-[52ch] mb-4">
					Banjir, kekeringan, jebolnya tanggul, pencemaran sungai, deformasi bendungan — semua bermula dari satu hal: data yang terlambat.
				</p>
				<p class="text-base md:text-lg font-semibold" style="color: #C8102E;">
					Enam perangkat Water Security Beacon dirancang supaya Anda tidak pernah terlambat lagi.
				</p>

				<!-- Stat strip -->
				<div class="flex items-center gap-8 mt-10 pt-8 border-t border-[#E5E5E5]">
					<div>
						<p class="font-heading text-2xl font-extrabold tabular-nums" style="color: #1A1A1A; letter-spacing: -0.03em;">6</p>
						<p class="text-xs font-medium mt-0.5" style="color: #7A7A7A;">Perangkat</p>
					</div>
					<div class="w-px h-8 bg-[#E5E5E5]"></div>
					<div>
						<p class="font-heading text-2xl font-extrabold tabular-nums" style="color: #1A1A1A; letter-spacing: -0.03em;">IP67</p>
						<p class="text-xs font-medium mt-0.5" style="color: #7A7A7A;">Water Resistant</p>
					</div>
					<div class="w-px h-8 bg-[#E5E5E5]"></div>
					<div>
						<p class="font-heading text-2xl font-extrabold tabular-nums" style="color: #1A1A1A; letter-spacing: -0.03em;">24/7</p>
						<p class="text-xs font-medium mt-0.5" style="color: #7A7A7A;">Real-time Data</p>
					</div>
				</div>
			</div>

			<!-- Right: Illustration — float animation -->
			<div class="relative flex items-center justify-center lg:justify-end -mt-8 lg:-mt-16">
				<!-- Faint dashed ring -->
				<div class="absolute inset-0 flex items-center justify-center pointer-events-none">
					<div class="w-[85%] h-[85%] rounded-full opacity-[0.07]" style="border: 1.5px dashed #C8102E;"></div>
				</div>
				<!-- Illustration -->
				<div class="ws-hero-float w-full max-w-[700px] lg:max-w-none lg:w-[145%] xl:w-[160%] lg:translate-x-12">
					<img
						src="/ilustrasi_water_security.webp"
						alt="Ilustrasi sistem monitoring Water Security Beacon Engineering"
						class="w-full h-auto object-contain select-none"
						draggable="false"
					/>
				</div>
			</div>

		</div>
	</div>
</section>

<!-- Products Grid -->
<section class="relative py-16 lg:py-24 bg-white overflow-hidden">
	<Ornaments />

	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="max-w-2xl mb-14 space-y-3">
			<span class="text-xs font-semibold uppercase tracking-widest" style="color: #C8102E;">6 Produk Water Security</span>
			<h2 class="font-heading text-3xl sm:text-4xl font-bold leading-[1.1]" style="color: #1A1A1A; letter-spacing: -0.025em;">Satu Ekosistem untuk Keamanan Air</h2>
		</div>

		<div class="grid md:grid-cols-2 gap-6">
			{#each products as product, i}
				<a
					href="/solusi/water-security/{product.slug}"
					class="group relative rounded-[28px] overflow-hidden min-h-[480px] flex flex-col justify-end bg-black transition-transform duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(200,16,46,0.3)]"
					style="border: 1px solid rgba(0,0,0,0.1);"
				>
					<!-- Full Image Background -->
					<img src={product.thumbnail} alt={product.name} class="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-all duration-1000 group-hover:scale-110" />
					
					<!-- Darkening Gradient for Readability -->
					<div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none"></div>

					<!-- Red Top Accent -->
					<div class="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" style="background: linear-gradient(90deg, #C8102E, transparent);"></div>

					<!-- Liquid Glass Content Panel -->
					<div class="relative z-10 m-4 p-7 rounded-[22px] transition-all duration-500 transform group-hover:-translate-y-1"
						 style="background: rgba(20, 20, 20, 0.45); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.12); box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), 0 10px 30px rgba(0,0,0,0.2);">
						
						<div class="flex items-center gap-4 mb-5">
							<div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110" style="background: rgba(200,16,46,0.2); border: 1px solid rgba(200,16,46,0.3);">
								<svelte:component this={product.icon} size={22} style="color: #FF4D6D;" />
							</div>
							<div>
								<span class="font-heading text-xl font-bold text-white tracking-tight">{product.name}</span>
								<span class="block text-[10px] uppercase tracking-widest text-white/50 mt-0.5">{product.full}</span>
							</div>
						</div>



						<!-- Mini specs -->
						<div class="flex flex-wrap gap-1.5 mb-5 mt-auto">
							{#each product.specs as spec}
								<span class="text-[10px] px-2.5 py-1 rounded-full font-medium" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.8);">{spec}</span>
							{/each}
						</div>

						<div class="flex items-center gap-2 text-sm font-semibold text-[#FF4D6D] group-hover:gap-3 transition-all mt-4">
							Lihat Detail {product.name}
							<ArrowRight size={14} />
						</div>
					</div>
				</a>
			{/each}
		</div>
	</div>
</section>

<!-- Why Beacon Water Security -->
<section class="relative py-16 lg:py-24 overflow-hidden" style="background: linear-gradient(180deg, #FAFAFA 0%, #FBE9EC 100%);">
	<Ornaments variant="dense" />

	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid lg:grid-cols-2 gap-12 items-center">
			<div class="space-y-6">
				<span class="text-xs font-semibold uppercase tracking-widest" style="color: #C8102E;">Mengapa Water Security Beacon</span>
				<h2 class="font-heading text-3xl sm:text-4xl font-bold" style="color: #1A1A1A;">Dipercaya di Infrastruktur Paling Kritis Indonesia</h2>
				<ul class="space-y-4">
					{#each ['Presisi tinggi — sensor-grade accuracy untuk standar SNI', 'Tahan iklim tropis — IP67/IP68, teruji di cuaca ekstrem Indonesia', 'Real-time 24/7 — data terkirim setiap detik ke STESY', 'After-sales lokal — tim teknis di Jogja, respons cepat', 'Terintegrasi penuh — semua perangkat tersambung ke satu dashboard', 'Hak cipta Indonesia — tidak tergantung vendor asing'] as point}
						<li class="flex items-start gap-3">
							<div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style="background: #FBE9EC;"><Check size={12} style="color: #C8102E;" /></div>
							<span class="text-sm" style="color: #3A3A3A;">{point}</span>
						</li>
					{/each}
				</ul>
			</div>
			<div class="space-y-4">
				{#each ['Bendungan Ciawi-Sukamahi — BBWS Ciliwung-Cisadane', 'Bendungan Sepaku IKN — BWS Kalimantan IV', 'Bendungan Cipanas — BWS Ciliwung-Cisadane', 'Bendungan Keureuto — BWS Sumatera I', 'DAS Bogowonto — BBWS Serayu Opak'] as project}
					<div class="flex items-center gap-3 p-4 rounded-xl bg-white" style="border: 1px solid #E5E5E5; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
						<div class="w-2 h-2 rounded-full bg-[#1B7F3A] animate-pulse-dot shrink-0"></div>
						<span class="text-sm font-medium" style="color: #1A1A1A;">{project}</span>
					</div>
				{/each}
			</div>
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
					Next Step
				</span>
				<h2 class="font-heading text-4xl sm:text-5xl font-extrabold text-white tracking-tighter mb-4">Mulai Proyek dengan Beacon</h2>
				<p class="text-lg text-zinc-400 font-medium">Tim engineer kami akan merancang arsitektur telemetri yang tepat dan menghitung kebutuhan riil proyek Anda.</p>
			</div>

			<div class="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto shrink-0">
				<a href="https://wa.me/628112850986?text=Halo%20Beacon%2C%20saya%20ingin%20konsultasi%20tentang%20Beacon%20untuk%20proyek%20saya." target="_blank" rel="noopener"
					class="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-zinc-950 bg-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] btn-tactile">
					<MessageCircle size={18} />
					Konsultasi Beacon
				</a>
				<a href="/solusi" class="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white transition-all hover:bg-zinc-800 btn-tactile" style="border: 1px solid rgba(255,255,255,0.15);">
					<ArrowRight size={18} />
					Jelajahi Produk Lain
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
		0%, 100% { transform: translateY(0px) translateX(1rem); }
		50%       { transform: translateY(-12px) translateX(1rem); }
	}

	@media (max-width: 1023px) {
		.ws-hero-float {
			transform: none !important;
		}
		@keyframes wsFloat {
			0%, 100% { transform: translateY(0px); }
			50%       { transform: translateY(-10px); }
		}
	}

	/* Live dot pulse */
	.animate-pulse-dot {
		animation: pulseDot 2s ease-in-out infinite;
	}

	@keyframes pulseDot {
		0%, 100% { opacity: 1; transform: scale(1); }
		50%       { opacity: 0.4; transform: scale(0.7); }
	}

	@media (prefers-reduced-motion: reduce) {
		.ws-hero-float,
		.animate-pulse-dot {
			animation: none !important;
		}
	}
</style>
