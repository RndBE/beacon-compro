<script lang="ts">
	import { onMount } from 'svelte';
	import { ArrowRight, Droplets, CloudSun, Siren, Gauge, MonitorPlay, HelpCircle } from '@lucide/svelte';
	import Ornaments from '$lib/components/Ornaments.svelte';

	let visible = $state(false);
	let activeNeed = $state(0);

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) visible = true;
			},
			{ threshold: 0.15 },
		);
		const el = document.getElementById('solution-finder');
		if (el) observer.observe(el);
		return () => observer.disconnect();
	});

	interface NeedItem {
		question: string;
		shortLabel: string;
		solution: string;
		solutionSlug: string;
		icon: typeof Droplets;
		color: string;
		description: string;
		products: string[];
		stat: { value: string; label: string };
	}

	const needs: NeedItem[] = [
		{
			question: 'Saya perlu memantau ketinggian air, debit, atau kualitas air sungai dan bendungan secara real-time',
			shortLabel: 'Monitoring Air',
			solution: 'Water Security',
			solutionSlug: 'water-security',
			icon: Droplets,
			color: '#0EA5E9',
			description: 'Enam perangkat telemetri presisi tinggi untuk memantau level air, debit, kualitas air, deformasi bendungan, dan kontrol pintu air — terhubung 24/7 ke dashboard STESY.',
			products: ['AWLR', 'AWGC', 'AFMR', 'ADR', 'AWQR', 'AVWR'],
			stat: { value: '6', label: 'Perangkat' },
		},
		{
			question: 'Saya butuh data curah hujan dan cuaca otomatis untuk peringatan dini atau riset iklim',
			shortLabel: 'Cuaca & Iklim',
			solution: 'Weather & Climate Intelligence',
			solutionSlug: 'weather-forecast',
			icon: CloudSun,
			color: '#6366F1',
			description: 'Stasiun cuaca otomatis dan pencatat hujan digital yang mengirim data langsung ke pusat kendali. Ideal untuk BMKG, BWS, dan institusi riset klimatologi.',
			products: ['ARR', 'AWR'],
			stat: { value: '2', label: 'Perangkat' },
		},
		{
			question: 'Saya ingin membangun sistem peringatan dini banjir, longsor, atau erupsi untuk masyarakat',
			shortLabel: 'Peringatan Dini',
			solution: 'Early Warning System',
			solutionSlug: 'early-warning',
			icon: Siren,
			color: '#DC2626',
			description: 'Sistem peringatan dini terintegrasi yang menggabungkan sensor lapangan, logika threshold otomatis, dan sirine peringatan — menyelamatkan nyawa sebelum bencana terjadi.',
			products: ['EWS'],
			stat: { value: '< 3s', label: 'Waktu Respons' },
		},
		{
			question: 'Saya perlu mengukur tekanan pipa, tekanan pori tanah, atau tekanan di struktur bangunan',
			shortLabel: 'Tekanan & Pori',
			solution: 'Pressure Measurement',
			solutionSlug: 'pressure-measurement',
			icon: Gauge,
			color: '#059669',
			description: 'Perangkat pencatat tekanan otomatis untuk monitoring piezometer, manometer, dan sensor tekanan industrial — mendeteksi anomali struktural sebelum menjadi kegagalan.',
			products: ['APLR'],
			stat: { value: 'IP67', label: 'Rating' },
		},
		{
			question: 'Saya ingin satu dashboard untuk melihat semua data telemetri dari lapangan',
			shortLabel: 'Dashboard',
			solution: 'STESY Platform',
			solutionSlug: 'stesy',
			icon: MonitorPlay,
			color: '#1A1A1A',
			description: 'Smart Telemetry System — dashboard berbasis web yang menampilkan data real-time dari seluruh perangkat Beacon. Dilengkapi alarm threshold, grafik historis, dan laporan otomatis.',
			products: ['STESY Web', 'STESY Mobile'],
			stat: { value: '24/7', label: 'Real-time' },
		},
	];

	let activeItem = $derived(needs[activeNeed]);

	// Auto-cycle setiap 6 detik saat tidak ada interaksi
	let autoTimer: ReturnType<typeof setInterval> | null = null;
	let userInteracted = $state(false);

	onMount(() => {
		autoTimer = setInterval(() => {
			if (!userInteracted) {
				activeNeed = (activeNeed + 1) % needs.length;
			}
		}, 6000);
		return () => { if (autoTimer) clearInterval(autoTimer); };
	});

	function selectNeed(index: number) {
		activeNeed = index;
		userInteracted = true;
		// Reset auto-cycle setelah 20 detik idle
		if (autoTimer) clearInterval(autoTimer);
		autoTimer = setInterval(() => {
			userInteracted = false;
		}, 20000);
	}
</script>

<section id="solution-finder" class="relative py-20 lg:py-28 bg-[#FAFAFA] overflow-hidden">
	<Ornaments />

	<div class="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">

		<!-- Header — Left-aligned per SKILL Rule 3 (DESIGN_VARIANCE: 8) -->
		<div
			class="max-w-2xl mb-14 lg:mb-16"
			style="
				opacity: {visible ? 1 : 0};
				transform: translateY({visible ? 0 : 24}px);
				transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
			"
		>
			<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-5" style="background: #FBE9EC; color: #C8102E; border: 1px solid rgba(200,16,46,0.12);">
				<HelpCircle size={12} />
				Panduan Solusi
			</div>
			<h2 class="font-heading text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tighter leading-[1.08]" style="color: #1A1A1A;">
				Pilih Berdasarkan <span style="color: #C8102E;">Kebutuhan Anda</span>
			</h2>
			<p class="mt-4 text-base text-zinc-500 leading-relaxed max-w-[52ch]">
				Klik masalah atau kebutuhan yang paling sesuai — kami tunjukkan solusi dan perangkat yang tepat.
			</p>
		</div>

		<!-- Split layout: Need list (5 cols) + Solution reveal (7 cols) -->
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">

			<!-- Left: Interactive Need Buttons -->
			<div class="lg:col-span-5 flex flex-col gap-2.5">
				{#each needs as need, i}
					<button
						class="group w-full text-left p-4 sm:p-5 rounded-2xl transition-all duration-300 outline-none cursor-pointer border active:scale-[0.98]"
						style="
							opacity: {visible ? 1 : 0};
							transform: translateX({visible ? 0 : -20}px);
							transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1) {i * 0.08}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) {i * 0.08}s, background 0.3s, border-color 0.3s, box-shadow 0.3s;
							background: {activeNeed === i ? 'white' : 'transparent'};
							border-color: {activeNeed === i ? need.color + '30' : '#E5E5E5'};
							box-shadow: {activeNeed === i ? `0 8px 24px -8px ${need.color}18` : 'none'};
						"
						onclick={() => selectNeed(i)}
					>
						<div class="flex items-start gap-3.5">
							<!-- Indicator dot -->
							<div
								class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300"
								style="
									background: {activeNeed === i ? need.color + '14' : '#F4F4F5'};
									border: 1px solid {activeNeed === i ? need.color + '25' : '#E5E5E5'};
								"
							>
								<svelte:component this={need.icon} size={15} style="color: {activeNeed === i ? need.color : '#A1A1AA'}; transition: color 0.3s;" />
							</div>
							<div class="flex-1 min-w-0">
								<span
									class="text-[10px] font-bold uppercase tracking-widest block mb-1 transition-colors duration-300"
									style="color: {activeNeed === i ? need.color : '#A1A1AA'};"
								>
									{need.shortLabel}
								</span>
								<p
									class="text-sm leading-snug transition-colors duration-300"
									style="color: {activeNeed === i ? '#1A1A1A' : '#71717A'}; font-weight: {activeNeed === i ? '600' : '400'};"
								>
									{need.question}
								</p>
							</div>
							<!-- Arrow indicator -->
							<div
								class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 transition-all duration-300"
								style="
									background: {activeNeed === i ? need.color : 'transparent'};
									opacity: {activeNeed === i ? 1 : 0};
									transform: translateX({activeNeed === i ? 0 : -8}px);
								"
							>
								<ArrowRight size={12} style="color: white;" />
							</div>
						</div>
					</button>
				{/each}
			</div>

			<!-- Right: Solution Reveal Card -->
			<div class="lg:col-span-7 relative">
				{#each needs as need, i}
					{#if activeNeed === i}
						<div
							class="sf-card rounded-[24px] overflow-hidden bg-white relative"
							style="
								border: 1px solid {need.color}20;
								box-shadow: 0 20px 40px -15px {need.color}12, 0 4px 16px rgba(0,0,0,0.04);
							"
						>
							<!-- Top accent bar -->
							<div class="h-[3px] w-full" style="background: linear-gradient(90deg, {need.color}, {need.color}40);"></div>

							<div class="p-7 sm:p-9 lg:p-10">
								<!-- Solution header -->
								<div class="flex items-center gap-4 mb-6">
									<div
										class="w-12 h-12 rounded-2xl flex items-center justify-center"
										style="background: {need.color}10; border: 1px solid {need.color}20;"
									>
										<svelte:component this={need.icon} size={22} style="color: {need.color};" />
									</div>
									<div>
										<h3 class="font-heading text-xl sm:text-2xl font-bold tracking-tight" style="color: #1A1A1A;">
											{need.solution}
										</h3>
										<span class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Solusi Beacon</span>
									</div>
								</div>

								<!-- Description -->
								<p class="text-[15px] text-zinc-600 leading-relaxed mb-7 max-w-[55ch]">
									{need.description}
								</p>

								<!-- Product badges -->
								<div class="mb-7">
									<span class="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-3">Perangkat Tersedia</span>
									<div class="flex flex-wrap gap-2">
										{#each need.products as product}
											<span
												class="px-3 py-1.5 rounded-lg text-xs font-semibold"
												style="background: {need.color}08; color: {need.color}; border: 1px solid {need.color}15;"
											>
												{product}
											</span>
										{/each}
									</div>
								</div>

								<!-- Bottom: stat + CTA -->
								<div class="flex items-center justify-between pt-6" style="border-top: 1px solid #F4F4F5;">
									<div class="flex items-center gap-3">
										<span class="font-heading text-3xl font-extrabold tabular-nums tracking-tighter" style="color: {need.color};">{need.stat.value}</span>
										<span class="text-xs font-medium text-zinc-400 uppercase tracking-wider">{need.stat.label}</span>
									</div>
									<a
										href="/solusi/{need.solutionSlug}"
										class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:gap-3 active:scale-[0.97]"
										style="background: {need.color}; box-shadow: 0 4px 12px -2px {need.color}40;"
									>
										Lihat Solusi
										<ArrowRight size={14} />
									</a>
								</div>
							</div>

							<!-- Subtle background pattern -->
							<div class="absolute top-0 right-0 w-[300px] h-[300px] pointer-events-none opacity-[0.03]" style="background: radial-gradient(circle, {need.color} 0%, transparent 70%);"></div>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	.sf-card {
		animation: sfReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	@keyframes sfReveal {
		from {
			opacity: 0;
			transform: translateY(16px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.sf-card {
			animation: none;
		}
	}
</style>
