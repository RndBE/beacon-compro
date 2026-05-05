<script lang="ts">
	import { onMount } from 'svelte';
	import { ArrowUpRight, Droplets, CloudSun, Siren, Activity, MonitorPlay } from '@lucide/svelte';
	import Ornaments from '$lib/components/Ornaments.svelte';
	import type { SolutionSummary } from '$lib/api';

	let { solutions = undefined }: { solutions?: SolutionSummary[] | null } = $props();

	let visible = $state(false);
	let activePillar = $state(0);
	
	let sectionRef: HTMLElement;
	let scrollY = $state(0);
	let innerHeight = $state(0);
	let innerWidth = $state(0);

	$effect(() => {
		// Reactive dependency to trigger re-calculation
		const currentScroll = scrollY;

		if (!sectionRef || innerWidth < 1024) return;
		const rect = sectionRef.getBoundingClientRect();
		const maxScroll = rect.height - innerHeight;
		if (maxScroll <= 0) return;
		
		let progress = -rect.top / maxScroll;
		progress = Math.max(0, Math.min(1, progress));
		
		// Buka dari kiri ke kanan (progress 0 -> index 0, progress 1 -> index 4)
		const rawIndex = progress * pillars.length;
		activePillar = Math.min(pillars.length - 1, Math.floor(rawIndex));
	});

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => { if (entries[0].isIntersecting) visible = true; },
			{ threshold: 0.01 } // Lower threshold because track is 750vh tall
		);
		const el = document.getElementById('pilar-solusi');
		if (el) observer.observe(el);
		return () => observer.disconnect();
	});

	// Icon map for each solution slug
	const iconMap: Record<string, any> = {
		'water-security': Droplets,
		'weather-forecast': CloudSun,
		'early-warning': Siren,
		'pressure-measurement': Activity,
		'stesy': MonitorPlay
	};

	// Hardcoded hooks per slug (editorial copy — not from DB)
	const hookMap: Record<string, string> = {
		'water-security': 'Amankan setiap meter kubik air. Dari ketinggian, debit, kualitas, hingga deformasi struktur penampungnya.',
		'weather-forecast': 'Cuaca tidak bisa dilawan, tapi bisa diprediksi. Stasiun cuaca otomatis untuk pertanian, bendungan, dan aviasi.',
		'early-warning': 'Detik pertama menentukan nyawa. Sistem peringatan dini multi-level untuk wilayah rawan.',
		'pressure-measurement': 'Akurasi tinggi untuk medan ekstrem — geothermal, well testing, infrastruktur kritis.',
		'stesy': 'Platform tunggal yang mengikat semua perangkat menjadi satu dashboard real-time.'
	};

	// Sub-solution abbreviation labels per solution
	const productLabelsMap: Record<string, string[]> = {
		'water-security': ['AWLR', 'AWGC', 'AFMR', 'ADR', 'AWQR', 'AVWR'],
		'weather-forecast': ['AWR', 'ARR'],
		'early-warning': ['EWS'],
		'pressure-measurement': ['APLR'],
		'stesy': ['Smart Telemetry']
	};

	// Fallback hardcoded data
	const fallbackPillars = [
		{ icon: Droplets, name: 'Water Security', hook: hookMap['water-security'], products: productLabelsMap['water-security'], cta: 'Eksplorasi', href: '/solusi/water-security', image: 'https://picsum.photos/seed/hydro1/1200/800' },
		{ icon: CloudSun, name: 'Weather Forecast', hook: hookMap['weather-forecast'], products: productLabelsMap['weather-forecast'], cta: 'Eksplorasi', href: '/solusi/weather-forecast', image: 'https://picsum.photos/seed/weather2/1200/800' },
		{ icon: Siren, name: 'Early Warning', hook: hookMap['early-warning'], products: productLabelsMap['early-warning'], cta: 'Eksplorasi', href: '/solusi/early-warning', image: 'https://picsum.photos/seed/warning3/1200/800' },
		{ icon: Activity, name: 'Pressure Measure', hook: hookMap['pressure-measurement'], products: productLabelsMap['pressure-measurement'], cta: 'Eksplorasi', href: '/solusi/pressure-measurement', image: 'https://picsum.photos/seed/pressure4/1200/800' },
		{ icon: MonitorPlay, name: 'STESY Platform', hook: hookMap['stesy'], products: productLabelsMap['stesy'], cta: 'Pelajari', href: '/solusi/stesy', image: 'https://picsum.photos/seed/dashboard5/1200/800' }
	];

	const pillars = $derived(
		solutions && solutions.length > 0
			? solutions.map((s) => ({
					icon: iconMap[s.slug] ?? Activity,
					name: s.name,
					hook: hookMap[s.slug] ?? s.description,
					products: productLabelsMap[s.slug] ?? [],
					cta: s.slug === 'stesy' ? 'Pelajari' : 'Eksplorasi',
					href: `/solusi/${s.slug}`,
					image: s.thumbnail ?? `https://picsum.photos/seed/${s.slug}/1200/800`
				}))
			: fallbackPillars
	);
</script>

<svelte:window bind:scrollY bind:innerHeight bind:innerWidth />

<section id="pilar-solusi" class="relative py-24 lg:py-0 bg-white">
	<!-- Ornaments in own clipping container so they don't bleed -->
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<Ornaments variant="default" />
	</div>

	<!-- Spacer top (desktop only — mobile uses py-24) -->
	<div class="hidden lg:block h-24 lg:h-32"></div>

	<!-- Desktop Sticky Track / Mobile Normal Wrapper -->
	<div class="w-full relative" style={innerWidth >= 1024 ? `height: ${pillars.length * 100}vh;` : ""} bind:this={sectionRef}>
		
		<!-- Sticky Container on Desktop -->
		<div class="w-full lg:sticky lg:top-0 lg:h-[100dvh] lg:flex lg:flex-col lg:justify-center relative z-10">
			
			<div class="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 w-full">

				<!-- Left-Aligned Header -->
				<div class="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
					<div class="max-w-2xl space-y-6">
						<div class="flex items-center gap-3">
							<div class="w-8 h-[1px] bg-[#C8102E]"></div>
							<span class="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-[#C8102E]">
								Infrastructure Defense
							</span>
						</div>
						<h2 class="font-heading text-4xl md:text-5xl lg:text-[56px] font-bold text-zinc-950 leading-[1.05] tracking-tight">
							Lima Pilar Keamanan <br/><span class="text-transparent bg-clip-text" style="background-image: linear-gradient(135deg, #1A1A1A 0%, #737373 100%);">Untuk Nusantara.</span>
						</h2>
					</div>
					<div class="max-w-md pb-2">
						<p class="text-base text-zinc-600 leading-relaxed font-medium">
							Dari pemantauan debit air ekstrem hingga peringatan dini presisi tinggi — arsitektur telemetri kami dirancang untuk memitigasi risiko tanpa kompromi.
						</p>
					</div>
				</div>

				<!-- Accordion Desktop -->
				<div class="hidden lg:flex gap-4 h-[60vh] min-h-[500px] lg:min-h-[600px] w-full">
					{#each pillars as pillar, i}
						{@const Icon = pillar.icon}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
							style="
								flex: {activePillar === i ? 6 : 1};
								opacity: {visible ? 1 : 0};
								transform: translateY({visible ? 0 : 40}px);
								transition: flex 0.8s cubic-bezier(0.16,1,0.3,1), opacity 0.8s ease-out {i * 0.1}s, transform 0.8s ease-out {i * 0.1}s, box-shadow 0.4s ease;
							"
							onmouseenter={() => activePillar = i}
							onclick={() => activePillar = i}
						>
							<!-- Background Image -->
							<div class="absolute inset-0 bg-zinc-900">
								<img 
									src={pillar.image} 
									alt={pillar.name} 
									class="w-full h-full object-cover transition-all duration-[1200ms] ease-out {activePillar === i ? 'opacity-90 scale-105' : 'opacity-40 scale-100 grayscale'}"
								/>
							</div>

							<!-- Gradients & Overlays -->
							<div class="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-900/20 to-zinc-950/90 transition-opacity duration-700 {activePillar === i ? 'opacity-100' : 'opacity-80'}"></div>
							<div class="absolute inset-0 bg-[#C8102E]/20 mix-blend-multiply transition-opacity duration-700 {activePillar === i ? 'opacity-0' : 'opacity-100'}"></div>

							<!-- Collapsed State (Vertical Text) -->
							<div
								class="absolute inset-0 flex flex-col items-center justify-end pb-12 transition-all duration-500"
								style="opacity: {activePillar === i ? 0 : 1}; pointer-events: {activePillar === i ? 'none' : 'auto'}; transform: translateY({activePillar === i ? '20px' : '0'});"
							>
								<span class="text-sm font-medium text-white/80 tracking-widest [writing-mode:vertical-lr] rotate-180 mb-8 whitespace-nowrap">{pillar.name}</span>
								<div class="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-md bg-white/5">
									<Icon size={18} class="text-white/70" />
								</div>
							</div>

							<!-- Expanded State (Content) -->
							<div
								class="absolute inset-0 p-10 flex flex-col justify-end transition-all duration-700 delay-100"
								style="opacity: {activePillar === i ? 1 : 0}; pointer-events: {activePillar === i ? 'auto' : 'none'}; transform: translateY({activePillar === i ? '0' : '30px'});"
							>
								<div class="max-w-xl">
									<div class="flex items-center gap-4 mb-6">
										<div class="w-12 h-12 rounded-2xl bg-[#C8102E] flex items-center justify-center text-white shadow-lg shadow-[#C8102E]/30">
											<Icon size={24} />
										</div>
										<h3 class="font-heading text-3xl font-bold text-white tracking-tight">{pillar.name}</h3>
									</div>
									
									<p class="text-lg text-zinc-300 leading-relaxed mb-8 font-medium">
										{pillar.hook}
									</p>
									
									<div class="flex items-center justify-between">
										<div class="flex flex-wrap gap-2">
											{#each pillar.products as prod}
												<span class="text-xs px-3 py-1.5 rounded-md font-mono bg-white/10 text-white backdrop-blur-md border border-white/10">
													{prod}
												</span>
											{/each}
										</div>
										
										<a
											href={pillar.href}
											class="group/btn flex items-center gap-2 text-sm font-semibold text-white bg-white/10 hover:bg-white border border-white/20 hover:text-zinc-950 px-5 py-2.5 rounded-full backdrop-blur-md transition-all duration-300"
										>
											{pillar.cta}
											<ArrowUpRight size={16} class="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
										</a>
									</div>
								</div>
							</div>
							
							<!-- Inner Liquid Glass Border -->
							<div class="absolute inset-0 rounded-3xl border border-white/10 pointer-events-none shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"></div>
						</div>
					{/each}
				</div>

				<!-- Mobile Bento Grid -->
				<div class="lg:hidden grid grid-cols-1 gap-4 mt-8">
					{#each pillars as pillar, i}
						{@const Icon = pillar.icon}
						<a
							href={pillar.href}
							class="group relative rounded-3xl overflow-hidden bg-zinc-900 aspect-[4/3] flex flex-col justify-end p-6"
							style="
								opacity: {visible ? 1 : 0};
								transform: translateY({visible ? 0 : 30}px);
								transition: opacity 0.6s ease-out {i * 0.1}s, transform 0.6s ease-out {i * 0.1}s;
							"
						>
							<!-- Background Image -->
							<div class="absolute inset-0">
								<img 
									src={pillar.image} 
									alt={pillar.name} 
									class="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700 ease-out"
								/>
							</div>
							
							<div class="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-900/40 to-transparent pointer-events-none"></div>

							<div class="relative z-10">
								<div class="w-10 h-10 rounded-xl bg-[#C8102E] flex items-center justify-center text-white shadow-lg mb-4">
									<Icon size={20} />
								</div>
								<h3 class="font-heading text-2xl font-bold text-white mb-2">{pillar.name}</h3>
								<p class="text-sm text-zinc-300 line-clamp-2 mb-4 font-medium">{pillar.hook}</p>
								
								<div class="flex flex-wrap gap-1.5">
									{#each pillar.products.slice(0, 3) as prod}
										<span class="text-[10px] px-2 py-1 rounded border border-white/20 text-white/90 bg-white/10 backdrop-blur-sm">
											{prod}
										</span>
									{/each}
								</div>
							</div>
							
							<!-- Inner Border -->
							<div class="absolute inset-0 rounded-3xl border border-white/10 pointer-events-none"></div>
						</a>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- Spacer bottom (desktop only) -->
	<div class="hidden lg:block h-24 lg:h-32"></div>
</section>
