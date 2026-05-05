<script lang="ts">
	import { onMount } from 'svelte';
	import { ArrowRight, ChevronRight, MessageCircle } from '@lucide/svelte';
	import { solutions as fallbackSolutions } from '$lib/data/solutions';

	let { data } = $props();

	// Merge API data with editorial metadata (icons, taglines, stats, colors)
	const solutions = $derived(
		data.apiSolutions && data.apiSolutions.length > 0
			? data.apiSolutions.map((s: any) => {
					const fallback = fallbackSolutions.find(f => f.href === `/solusi/${s.slug}`);
					return {
						icon: fallback?.icon ?? fallbackSolutions[0].icon,
						name: s.name,
						tagline: fallback?.tagline ?? s.description,
						desc: fallback?.desc ?? s.description,
						products: fallback?.products ?? [],
						href: `/solusi/${s.slug}`,
						color: s.color || fallback?.color || '#0EA5E9',
						stat: fallback?.stat ?? String(s.sub_solutions_count),
						statLabel: fallback?.statLabel ?? 'Produk',
						accent: fallback?.accent ?? 'from-sky-500/10 to-blue-500/5'
					};
				})
			: fallbackSolutions
	);

	let mounted = $state(false);
	let activePillar = $state(0);
	let mouseX = $state(0);
	let mouseY = $state(0);

	onMount(() => {
		mounted = true;
		// Auto-rotate pillars
		const interval = setInterval(() => {
			activePillar = (activePillar + 1) % solutions.length;
		}, 5000);
		return () => clearInterval(interval);
	});

	function handleCardMouse(e: MouseEvent) {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		mouseX = e.clientX - rect.left;
		mouseY = e.clientY - rect.top;
	}
</script>

<svelte:head>
	<title>Solusi — Beacon Engineering</title>
	<meta name="description" content="Lima pilar solusi telemetri Beacon Engineering: Water Security, Weather Forecast, Early Warning, Pressure Measurement, dan STESY." />
</svelte:head>

<!-- Hero — SKILL: Asymmetric, gradient text, animated ornaments -->
<section class="relative min-h-[85dvh] flex flex-col justify-center overflow-hidden bg-[#FAFAFA] border-b border-[#E5E5E5]">
	<!-- Subtle Grid Pattern -->
	<div class="absolute inset-0 z-0 opacity-[0.03]" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>
	<!-- Animated ambient orbs -->
	<div class="absolute top-[15%] right-[12%] w-[300px] h-[300px] rounded-full pointer-events-none animate-breathe" style="background: radial-gradient(circle, rgba(200,16,46,0.06) 0%, transparent 70%);"></div>
	<div class="absolute bottom-[20%] left-[8%] w-[200px] h-[200px] rounded-full pointer-events-none animate-breathe" style="animation-delay: 2s; background: radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 70%);"></div>

	<!-- Floating geometric ornaments -->
	<div class="absolute top-[20%] right-[6%] w-12 h-12 rotate-12 pointer-events-none opacity-[0.06] animate-float" style="border: 2px solid #C8102E; border-radius: 12px;"></div>
	<div class="absolute bottom-[25%] right-[15%] w-6 h-6 pointer-events-none opacity-[0.05]" style="background: #C8102E; border-radius: 50%;"></div>
	<div class="absolute top-[45%] left-[3%] w-8 h-8 rotate-45 pointer-events-none opacity-[0.04]" style="border: 2px solid #C8102E;"></div>

	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
		<div class="grid lg:grid-cols-12 gap-8 items-center">
			<!-- Left: Text — 7 cols -->
			<div class="lg:col-span-7 lg:pr-12">
				<span
					class="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest mb-8"
					style="
						background: rgba(255,255,255,0.65); backdrop-filter: blur(12px);
						color: #C8102E; border: 1px solid rgba(200,16,46,0.12);
						box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);
						opacity: {mounted ? 1 : 0};
						transform: translateY({mounted ? 0 : 12}px);
						transition: all 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s;
					"
				>
					<span class="w-2 h-2 rounded-full bg-[#1B7F3A] animate-pulse-dot"></span>
					Ekosistem Solusi
				</span>

				<h1
					class="font-heading text-4xl sm:text-5xl lg:text-[64px] font-extrabold leading-[1.04] mb-7"
					style="
						letter-spacing: -0.04em; color: #1A1A1A;
						opacity: {mounted ? 1 : 0};
						transform: translateY({mounted ? 0 : 20}px);
						transition: all 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s;
					"
				>
					Lima Pilar<br/>Pertahanan untuk<br/><span class="gradient-text-animated">Indonesia</span>
				</h1>

				<p
					class="text-lg leading-relaxed max-w-[50ch] mb-10"
					style="
						color: #5C5C5C;
						opacity: {mounted ? 1 : 0};
						transform: translateY({mounted ? 0 : 16}px);
						transition: all 0.8s cubic-bezier(0.16,1,0.3,1) 0.35s;
					"
				>
					Dari pemantauan ketinggian air bendungan hingga peringatan dini bencana — solusi Beacon dirancang untuk skenario nyata di lapangan.
				</p>

				<!-- Quick nav pills -->
				<div
					class="flex flex-wrap gap-2"
					style="
						opacity: {mounted ? 1 : 0};
						transform: translateY({mounted ? 0 : 12}px);
						transition: all 0.8s cubic-bezier(0.16,1,0.3,1) 0.45s;
					"
				>
					{#each solutions as sol, i}
						<button
							class="group flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-300 btn-tactile"
							style="
								background: {activePillar === i ? sol.color : 'rgba(255,255,255,0.65)'};
								color: {activePillar === i ? 'white' : '#5C5C5C'};
								border: 1px solid {activePillar === i ? sol.color : 'rgba(229,229,229,0.6)'};
								backdrop-filter: blur(8px);
								box-shadow: {activePillar === i ? `0 4px 14px ${sol.color}30` : 'none'};
							"
							onclick={() => activePillar = i}
						>
							<svelte:component this={sol.icon} size={13} />
							{sol.name}
						</button>
					{/each}
				</div>
			</div>

			<!-- Right: Active Pillar Preview — 5 cols -->
			<div class="lg:col-span-5 hidden lg:block">
				{#each solutions as sol, i}
					{#if activePillar === i}
						<div
							class="rounded-[28px] p-8 glass-premium relative overflow-hidden"
							style="
								border: 1px solid rgba(229,229,229,0.5);
								box-shadow: 0 20px 60px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.25);
								animation: scaleIn 0.5s cubic-bezier(0.16,1,0.3,1);
							"
						>
							<!-- Number watermark -->
							<span class="absolute -top-4 -right-2 font-heading text-[120px] font-extrabold leading-none pointer-events-none tabular-nums" style="color: {sol.color}; opacity: 0.06;">
								0{i + 1}
							</span>

							<div class="relative z-10">
								<div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style="background: {sol.color}12;">
									<svelte:component this={sol.icon} size={26} style="color: {sol.color};" />
								</div>

								<h3 class="font-heading text-2xl font-bold mb-1" style="color: #1A1A1A;">{sol.name}</h3>
								<p class="text-sm font-medium mb-4" style="color: {sol.color};">{sol.tagline}</p>
								<p class="text-sm leading-relaxed mb-6" style="color: #5C5C5C;">{sol.desc}</p>

								<!-- Products -->
								<div class="flex flex-wrap gap-1.5 mb-6">
									{#each sol.products as prod}
										<span class="text-[10px] px-2.5 py-1 rounded-full font-medium" style="background: {sol.color}10; color: {sol.color}; border: 1px solid {sol.color}20;">{prod}</span>
									{/each}
								</div>

								<!-- Stat + CTA -->
								<div class="flex items-center justify-between">
									<div>
										<span class="font-heading text-3xl font-extrabold tabular-nums" style="color: {sol.color};">{sol.stat}</span>
										<span class="text-[11px] uppercase tracking-wider font-medium ml-1.5" style="color: #9A9A9A;">{sol.statLabel}</span>
									</div>
									<a href={sol.href} class="flex items-center gap-2 text-sm font-semibold btn-tactile px-4 py-2 rounded-[12px] transition-all" style="background: {sol.color}; color: white; box-shadow: 0 4px 12px {sol.color}30;">
										Eksplor <ArrowRight size={14} />
									</a>
								</div>
							</div>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</div>

</section>

<!-- Solutions Deep Dive — SKILL: Spotlight cards with hover glow -->
<section class="py-20 lg:py-28 bg-white relative overflow-hidden">
	<!-- Subtle grid texture -->
	<div class="absolute inset-0 pointer-events-none opacity-[0.015]" style="background-image: radial-gradient(#C8102E 0.5px, transparent 0.5px); background-size: 24px 24px;"></div>

	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Section header -->
		<div class="max-w-2xl mb-16">
			<span class="text-xs font-semibold uppercase tracking-widest" style="color: #C8102E;">Ekosistem Lengkap</span>
			<h2 class="font-heading text-3xl sm:text-4xl lg:text-[44px] font-bold mt-3 leading-[1.1]" style="letter-spacing: -0.03em; color: #1A1A1A;">
				Dari Sensor ke Dashboard,<br/>Semuanya Kami Tangani.
			</h2>
			<p class="text-base leading-relaxed mt-4 max-w-[50ch]" style="color: #5C5C5C;">
				Setiap pilar saling terhubung dalam satu ekosistem. Pilih sesuai kebutuhan, integrasikan di satu platform.
			</p>
		</div>

		<!-- Card grid — SKILL: Asymmetric bento, NOT equal columns -->
		<div class="grid md:grid-cols-2 gap-5">
			{#each solutions as sol, i}
				<a
					href={sol.href}
					class="group relative rounded-[24px] p-8 lg:p-10 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 {i === 4 ? 'md:col-span-2' : ''}"
					style="
						background: white; border: 1px solid #E5E5E5;
						opacity: {mounted ? 1 : 0};
						transform: translateY({mounted ? 0 : 32}px);
						transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1) {0.6 + i * 0.1}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) {0.6 + i * 0.1}s, box-shadow 0.4s, border-color 0.4s;
					"
					onmousemove={handleCardMouse}
				>
					<!-- Spotlight glow on hover -->
					<div
						class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[24px]"
						style="background: radial-gradient(400px circle at {mouseX}px {mouseY}px, {sol.color}08, transparent 70%);"
					></div>

					<!-- Top accent line -->
					<div class="absolute top-0 left-8 right-8 h-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 origin-left scale-x-0 group-hover:scale-x-100" style="background: linear-gradient(90deg, {sol.color}, {sol.color}30);"></div>

					<!-- Number watermark -->
					<span class="absolute top-4 right-6 font-heading text-[80px] font-extrabold leading-none pointer-events-none tabular-nums opacity-[0.03] group-hover:opacity-[0.06] transition-opacity" style="color: {sol.color};">
						0{i + 1}
					</span>

					<div class="relative z-10 {i === 4 ? 'grid md:grid-cols-2 gap-8 items-center' : ''}">
						<div>
							<!-- Icon + Title row -->
							<div class="flex items-start gap-4 mb-5">
								<div class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300" style="background: {sol.color}10;">
									<svelte:component this={sol.icon} size={26} style="color: {sol.color};" />
								</div>
								<div>
									<h3 class="font-heading text-xl lg:text-2xl font-bold group-hover:text-[#C8102E] transition-colors" style="color: #1A1A1A;">{sol.name}</h3>
									<p class="text-sm font-medium mt-0.5" style="color: {sol.color};">{sol.tagline}</p>
								</div>
							</div>

							<p class="text-sm leading-relaxed mb-5 max-w-[48ch]" style="color: #5C5C5C;">{sol.desc}</p>

							<!-- Product tags -->
							<div class="flex flex-wrap gap-1.5 mb-6">
								{#each sol.products as prod}
									<span class="text-[10px] px-2.5 py-1 rounded-full font-medium" style="background: {sol.color}08; color: {sol.color}; border: 1px solid {sol.color}15;">{prod}</span>
								{/each}
							</div>
						</div>

						<div class="{i === 4 ? '' : 'flex items-center justify-between'}">
							<!-- Stat block -->
							<div class="{i === 4 ? 'flex items-center gap-8 mb-6' : ''}">
								<div>
									<span class="font-heading text-3xl lg:text-4xl font-extrabold tabular-nums leading-none" style="color: {sol.color};">{sol.stat}</span>
									<span class="block text-[10px] uppercase tracking-widest font-medium mt-1" style="color: #9A9A9A;">{sol.statLabel}</span>
								</div>
							</div>

							<span class="flex items-center gap-2 text-sm font-semibold btn-tactile px-5 py-2.5 rounded-xl transition-all" style="background: {sol.color}; color: white; box-shadow: 0 4px 14px {sol.color}40;">
								Pelajari <ArrowRight size={16} />
							</span>
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
